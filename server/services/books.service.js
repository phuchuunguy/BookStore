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
    getAll: async ({ query = {}, page = 1, limit = 0, sort = {} }) => {
        const offset = (page - 1) * limit;

        // SORTING
        const order = [];
        Object.keys(sort).forEach(key => {
            order.push([key, sort[key] === 1 ? 'ASC' : 'DESC']);
        });
        order.push(['id', 'DESC']);
        if (order.length === 0) order.push([
            ['createdAt', 'DESC'],
            ['id', 'DESC']
        ]
        );
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

        // If admin/frontend passed a 'name' filter as plain string, treat it as a substring search
        // so typing partial words (e.g., 'mắt') will match book names containing that substring.
        if (where.name && typeof where.name === 'string') {
            const q = where.name.trim();
            delete where.name;
            const slugKey = createSlug(q);

            where[Op.and] = [
                ...(where[Op.and] || []),
                {
                    [Op.or]: [
                        { name: { [Op.like]: `%${q}%` } },
                        { slug: { [Op.like]: `%${slugKey}%` } }
                    ]
                }
            ];
        }

        try {
            const count = await Book.count({ where });
            const rawBooks = await Book.findAll({
                where,
                include: [{ model: Publisher, as: 'publisher', required: false }],
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order,
                nest: true,
            });

            if (rawBooks.length === 0) return [count, []];
            const allGenreIds = [];
            const allAuthorIds = [];

            rawBooks.forEach(book => {
                allGenreIds.push(...safeParseJSON(book.genreIds));
                allAuthorIds.push(...safeParseJSON(book.authorIds));
            });
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

   search: async ({ key, page = 1, limit = 0 }) => {
    const offset = (page - 1) * limit;
    const q = key ? key.trim() : '';

    if (!q) return [0, []];

    const slugKey = createSlug(q);

    const books = await Book.findAll({
        where: {
            [Op.or]: [
                { name: { [Op.like]: `%${q}%` } },          // có dấu
                { slug: { [Op.like]: `%${slugKey}%` } }    // không dấu
            ]
        },
        include: [
            { model: Publisher, as: 'publisher', required: false }
        ],
        offset: limit > 0 ? offset : undefined,
        limit: limit > 0 ? limit : undefined,
        order: [['id', 'DESC']]
    });

    if (books.length === 0) return [0, []];

    // Lấy author + genre
    const genreIds = [];
    const authorIds = [];

    books.forEach(book => {
        genreIds.push(...safeParseJSON(book.genreIds));
        authorIds.push(...safeParseJSON(book.authorIds));
    });

    const [genres, authors] = await Promise.all([
        Genre.findAll({
            where: { id: { [Op.in]: [...new Set(genreIds)] } },
            raw: true
        }),
        Author.findAll({
            where: { id: { [Op.in]: [...new Set(authorIds)] } },
            raw: true
        })
    ]);

    const genreMap = {};
    const authorMap = {};

    genres.forEach(g => genreMap[g.id] = g);
    authors.forEach(a => authorMap[a.id] = a);

    const processed = books.map(book => {
        const json = book.toJSON();

        const gIds = safeParseJSON(json.genreIds);
        const aIds = safeParseJSON(json.authorIds);

        json.genre = gIds.map(id => genreMap[id]).filter(Boolean);
        json.author = aIds.map(id => authorMap[id]).filter(Boolean);

        return json;
    });

    return [processed.length, processed];
},

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

    create: async (body) => {
        const {
            bookId, name, year, genre, author,
            publisher, description, pages, size,
            price, discount, imageUrl, publicId, quantity,
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
            publicId,
            quantity: parseInt(quantity) || 0,
        });
    },

    updateById: async (id, body) => {
        const {
            name, year, genre, author, publisher,
            description, pages, size, price, discount,
            imageUrl, publicId, quantity,
        } = body;

        const book = await Book.findByPk(id);
        if (!book) return null;

        const updateData = {
            name, year, description, pages, size, price, discount,
            quantity: parseInt(quantity) || 0,
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

    sumAllStock: async () => {
        try {
            // Hàm sum của Sequelize giúp cộng tổng cột 'quantity'
            const total = await Book.sum('quantity');
            return total || 0;
        } catch (error) {
            console.log(error);
            return 0;
        }
    },

    deleteById: async (id) => {
        return await Book.destroy({ where: { id } });
    },
};

module.exports = bookService;
