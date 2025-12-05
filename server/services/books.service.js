const Book = require('../models/books.model');
const Order = require('../models/orders.model');
const Author = require('../models/authors.model');
const Genre = require('../models/genres.model');
const Publisher = require('../models/publishers.model');
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { sequelize } = require('../db');
const { createSlug } = require('../utils/slug');

// Hàm phụ: parse JSON an toàn
const safeParseJSON = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;

    if (typeof data === 'string') {
        try {
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }
    return [];
};

const bookService = {

    // =============================
    //           GET ALL
    // =============================
    getAll: async ({ query = {}, page = 1, limit = 0, sort = {} }) => {
        const offset = (page - 1) * limit;

        // SORTING
        const order = [];
        Object.keys(sort).forEach(key => {
            order.push([key, sort[key] === 1 ? 'ASC' : 'DESC']);
        });
        if (order.length === 0) order.push(['createdAt', 'DESC']);

        // WHERE CLEAN
        const where = { ...query };

        Object.keys(where).forEach(key => {
            if (where[key] && where[key]['$in']) {
                let values = where[key]['$in'];
                if (!Array.isArray(values)) values = [values];

                const validValues = values.filter(v => v && v !== '');
                if (validValues.length === 0) delete where[key];
                else where[key]['$in'] = validValues;
            }
        });

        // HANDLE GENRE FILTER (JSON)
        if (where.genre && where.genre['$in']) {
            const gIds = where.genre['$in'];

            const jsonConditions = gIds.map(id =>
                `JSON_CONTAINS(CAST(Book.genreIds AS JSON), CAST('${id}' AS JSON))`
            ).join(' OR ');

            where[Op.and] = [
                ...(where[Op.and] || []),
                Sequelize.literal(`(${jsonConditions})`)
            ];

            delete where.genre;
        }

        try {
            const count = await Book.count({ where });

            // RAW BOOKS QUERY
            const rawBooks = await Book.findAll({
                where,
                include: [{ model: Publisher, as: 'publisher', required: false }],
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order,
                nest: true,
            });

            if (rawBooks.length === 0) return [count, []];

            // COLLECT GENRE + AUTHOR IDS
            const allGenreIds = [];
            const allAuthorIds = [];

            rawBooks.forEach(book => {
                allGenreIds.push(...safeParseJSON(book.genreIds));
                allAuthorIds.push(...safeParseJSON(book.authorIds));
            });

            // FETCH GENRES + AUTHORS
            const genres = await Genre.findAll({
                where: { id: { [Op.in]: [...new Set(allGenreIds)] } },
                raw: true
            });

            const authors = await Author.findAll({
                where: { id: { [Op.in]: [...new Set(allAuthorIds)] } },
                raw: true
            });

            const genreMap = {};
            const authorMap = {};

            genres.forEach(g => (genreMap[g.id] = g));
            authors.forEach(a => (authorMap[a.id] = a));

            // MAP BOOKS
            const processedBooks = rawBooks.map(book => {
                const bookJson = book.toJSON();

                const gIds = safeParseJSON(bookJson.genreIds);
                const aIds = safeParseJSON(bookJson.authorIds);

                bookJson.genre = gIds.map(id => genreMap[id]).filter(Boolean);
                bookJson.author = aIds.map(id => authorMap[id]).filter(Boolean);

                return bookJson;
            });

            return [count, processedBooks];
        } catch (error) {
            console.error("Lỗi Service:", error);
            throw error;
        }
    },

    // =============================
    //       GET BY BOOK ID
    // =============================
    getByBookId: async (bookId) => {
        const book = await Book.findOne({
            where: { bookId },
            include: [{ model: Publisher, as: 'publisher', required: false }]
        });

        if (!book) return null;

        const json = book.toJSON();
        const gIds = safeParseJSON(json.genreIds);
        const aIds = safeParseJSON(json.authorIds);

        json.genre = gIds.length > 0
            ? await Genre.findAll({ where: { id: { [Op.in]: gIds } }, raw: true })
            : [];

        json.author = aIds.length > 0
            ? await Author.findAll({ where: { id: { [Op.in]: aIds } }, raw: true })
            : [];

        return json;
    },

    // =============================
    //          GET BY ID
    // =============================
    getById: async (id) => {
        const book = await Book.findByPk(id, {
            include: [{ model: Publisher, as: 'publisher', required: false }]
        });

        if (!book) return null;

        const json = book.toJSON();
        const gIds = safeParseJSON(json.genreIds);
        const aIds = safeParseJSON(json.authorIds);

        json.genre = gIds.length > 0
            ? await Genre.findAll({ where: { id: { [Op.in]: gIds } }, raw: true })
            : [];

        json.author = aIds.length > 0
            ? await Author.findAll({ where: { id: { [Op.in]: aIds } }, raw: true })
            : [];

        return json;
    },

    // =============================
    //        GET BY SLUG
    // =============================
    getBySlug: async (slug) => {
        const book = await Book.findOne({
            where: { slug },
            include: [{ model: Publisher, as: 'publisher', required: false }]
        });

        if (!book) return null;

        const json = book.toJSON();
        const gIds = safeParseJSON(json.genreIds);
        const aIds = safeParseJSON(json.authorIds);

        json.genre = gIds.length > 0
            ? await Genre.findAll({ where: { id: { [Op.in]: gIds } }, raw: true })
            : [];

        json.author = aIds.length > 0
            ? await Author.findAll({ where: { id: { [Op.in]: aIds } }, raw: true })
            : [];

        return json;
    },

    // =============================
    //         CHECK ORDERED
    // =============================
    checkIsOrdered: async (id) => {
        const [results] = await sequelize.query(`
            SELECT DISTINCT JSON_EXTRACT(products, '$[*].product') AS product_ids
            FROM orders
        `);

        const allIds = [];
        results.forEach(r => {
            const ids = safeParseJSON(r.product_ids);
            allIds.push(...ids);
        });

        return allIds.includes(parseInt(id))
            ? [{ id: parseInt(id) }]
            : [];
    },

    // =============================
    //            SEARCH
    // =============================
    search: async ({ key, page, limit }) => {
        const offset = (page - 1) * limit;
        const q = key ? key.trim() : '';
        const normalized = q ? createSlug(q) : '';

        const books = await Book.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { slug: { [Op.like]: `%${normalized}%` } }
                ]
            },
            include: [{ model: Publisher, as: 'publisher', required: false }],
            offset: limit > 0 ? offset : undefined,
            limit: limit > 0 ? limit : undefined
        });

        const allAuthorIds = [];
        books.forEach(book => {
            allAuthorIds.push(...safeParseJSON(book.authorIds));
        });

        const authors = await Author.findAll({
            where: {
                id: { [Op.in]: [...new Set(allAuthorIds)] },
                name: { [Op.like]: `%${q}%` }
            },
            raw: true
        });

        const matchAuthorIds = authors.map(a => a.id);

        // Filter lại
        const filtered = books.filter(book => {
            const name = book.name || '';
            const slug = book.slug ? book.slug : createSlug(name);
            const aIds = safeParseJSON(book.authorIds);

            return (
                name.toLowerCase().includes(q.toLowerCase()) ||
                slug.includes(normalized) ||
                aIds.some(id => matchAuthorIds.includes(id))
            );
        });

        const genreIds = [];
        const authorIds = [];

        filtered.forEach(book => {
            genreIds.push(...safeParseJSON(book.genreIds));
            authorIds.push(...safeParseJSON(book.authorIds));
        });

        const genres = await Genre.findAll({
            where: { id: { [Op.in]: [...new Set(genreIds)] } },
            raw: true
        });

        const allAuthors = await Author.findAll({
            where: { id: { [Op.in]: [...new Set(authorIds)] } },
            raw: true
        });

        const genreMap = {};
        const authorMap = {};

        genres.forEach(g => (genreMap[g.id] = g));
        allAuthors.forEach(a => (authorMap[a.id] = a));

        const processed = filtered.map(book => {
            const json = book.toJSON();
            const gIds = safeParseJSON(json.genreIds);
            const aIds = safeParseJSON(json.authorIds);

            json.genre = gIds.map(id => genreMap[id]).filter(Boolean);
            json.author = aIds.map(id => authorMap[id]).filter(Boolean);

            return json;
        });

        return [processed.length, processed];
    },

    // =============================
    //      SEARCH SUGGEST
    // =============================
    searchSuggest: async ({ key, page, limit }) => {
        const offset = (page - 1) * limit;
        const q = key ? key.trim() : '';
        const normalized = key ? createSlug(q) : '';

        const books = await Book.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${q}%` } },
                    { slug: { [Op.like]: `%${normalized}%` } }
                ]
            },
            attributes: ['id', 'bookId', 'name', 'slug', 'imageUrl', 'price'],
            offset: limit > 0 ? offset : undefined,
            limit: limit > 0 ? limit : undefined,
            order: [['id', 'DESC']]
        });

        return books.map(b => ({
            id: b.id,
            bookId: b.bookId,
            name: b.name,
            slug: b.slug,
            imageUrl: b.imageUrl,
            price: b.price
        }));
    },

    // =============================
    //           CREATE
    // =============================
    create: async (body) => {
        const {
            bookId, name, year, genre, author,
            publisher, description, pages, size,
            price, discount, imageUrl, publicId
        } = body;

        return await Book.create({
            bookId,
            name,
            year,
            genreIds: safeParseJSON(genre).map(g => parseInt(g)),
            authorIds: safeParseJSON(author).map(a => parseInt(a)),
            publisherId: publisher ? parseInt(publisher) : null,
            description,
            pages,
            size,
            price,
            discount,
            imageUrl,
            publicId
        });
    },

    // =============================
    //           UPDATE
    // =============================
    updateById: async (id, body) => {
        const {
            name, year, genre, author, publisher,
            description, pages, size, price, discount,
            imageUrl, publicId
        } = body;

        const book = await Book.findByPk(id);
        if (!book) return null;

        const updateData = {
            name, year, description, pages, size, price, discount
        };

        if (genre) updateData.genreIds = safeParseJSON(genre).map(g => parseInt(g));
        if (author) updateData.authorIds = safeParseJSON(author).map(a => parseInt(a));
        if (publisher) updateData.publisherId = parseInt(publisher);

        if (imageUrl && publicId) {
            updateData.imageUrl = imageUrl;
            updateData.publicId = publicId;
        }

        await book.update(updateData);
        return book;
    },

    // =============================
    //           DELETE
    // =============================
    deleteById: async (id) => {
        return await Book.destroy({ where: { id } });
    },
};

module.exports = bookService;
