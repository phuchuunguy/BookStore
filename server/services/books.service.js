const Book = require('../models/books.model')
const Order = require('../models/orders.model')
const Author = require('../models/authors.model')
const Genre = require('../models/genres.model')
const Publisher = require('../models/publishers.model')
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { sequelize } = require('../db'); // Kiểm tra lại đường dẫn này (../db hay ../config/db)

// Hàm phụ trợ: Chuyển chuỗi JSON thành Mảng an toàn
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
    getAll: async({query, page, limit, sort}) => {
        const offset = (page - 1) * limit;
        const order = [];
        
        if (sort) {
            Object.keys(sort).forEach(key => {
                order.push([key, sort[key] === 1 || sort[key] === '1' ? 'ASC' : 'DESC']);
            });
        }
        
        // --- XỬ LÝ QUERY ---
        const where = { ...query };

        // 1. Dọn dẹp rác (Lọc bỏ chuỗi rỗng)
        Object.keys(where).forEach(key => {
            if (where[key] && where[key]['$in']) {
                let values = where[key]['$in'];
                if (!Array.isArray(values)) values = [values];
                const validValues = values.filter(v => v && v !== '');
                if (validValues.length === 0) delete where[key];
                else where[key]['$in'] = validValues;
            }
        });

        // 2. Xử lý Logic lọc GENRE (SỬA LẠI: ÉP KIỂU JSON TUYỆT ĐỐI)
        if (where.genre && where.genre['$in']) {
            const gIds = where.genre['$in'];
            if (gIds.length > 0) {
                const jsonConditions = gIds.map(id => {
                    // Ép cột genreIds về dạng JSON và ép ID tìm kiếm về dạng JSON (Số)
                    // Câu lệnh này nghĩa là: Tìm số 1 trong mảng [1, 2]
                    return `JSON_CONTAINS(CAST(Book.genreIds AS JSON), CAST('${id}' AS JSON))`;
                }).join(' OR ');

                where[Op.and] = [
                    ...(where[Op.and] || []),
                    Sequelize.literal(`(${jsonConditions})`)
                ];
            }
            delete where.genre; 
        }

        try {
            const count = await Book.count({ where });

            const rawBooks = await Book.findAll({
                where,
                include: [{ model: Publisher, as: 'publisher', required: false }],
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order: order.length > 0 ? order : [['createdAt', 'DESC']],
                nest: true,
                logging: console.log 
            });

            if (rawBooks.length === 0) return [0, []];

            const allGenreIds = [];
            const allAuthorIds = [];
            
            rawBooks.forEach(book => {
                allGenreIds.push(...safeParseJSON(book.genreIds));
                allAuthorIds.push(...safeParseJSON(book.authorIds));
            });
            
            const genres = await Genre.findAll({ where: { id: { [Op.in]: [...new Set(allGenreIds)] } }, raw: true });
            const authors = await Author.findAll({ where: { id: { [Op.in]: [...new Set(allAuthorIds)] } }, raw: true });
            
            const genreMap = {};
            const authorMap = {};
            genres.forEach(g => genreMap[g.id] = g);
            authors.forEach(a => authorMap[a.id] = a);
            
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
    
    getByBookId: async(bookId) => {
        const book = await Book.findOne({
            where: { bookId },
            include: [{ model: Publisher, as: 'publisher', required: false }]
        });
        
        if (book) {
            const bookJson = book.toJSON();
            const gIds = safeParseJSON(bookJson.genreIds);
            const aIds = safeParseJSON(bookJson.authorIds);

            if (gIds.length > 0) {
                bookJson.genre = await Genre.findAll({ where: { id: { [Op.in]: gIds } }, raw: true });
            } else { bookJson.genre = []; }
            
            if (aIds.length > 0) {
                bookJson.author = await Author.findAll({ where: { id: { [Op.in]: aIds } }, raw: true });
            } else { bookJson.author = []; }
            
            return bookJson;
        }
        return null;
    },

    getById: async(id) => {
        const book = await Book.findByPk(id, {
            include: [{ model: Publisher, as: 'publisher', required: false }]
        });
        
        if (book) {
            const bookJson = book.toJSON();
            const gIds = safeParseJSON(bookJson.genreIds);
            const aIds = safeParseJSON(bookJson.authorIds);

            if (gIds.length > 0) {
                bookJson.genre = await Genre.findAll({ where: { id: { [Op.in]: gIds } }, raw: true });
            } else { bookJson.genre = []; }
            
            if (aIds.length > 0) {
                bookJson.author = await Author.findAll({ where: { id: { [Op.in]: aIds } }, raw: true });
            } else { bookJson.author = []; }
            
            return bookJson;
        }
        return null;
    },

    getBySlug: async(slug) => {
        const book = await Book.findOne({
            where: { slug },
            include: [{ model: Publisher, as: 'publisher', required: false }]
        });
        
        if (book) {
            const bookJson = book.toJSON();
            const gIds = safeParseJSON(bookJson.genreIds);
            const aIds = safeParseJSON(bookJson.authorIds);

            if (gIds.length > 0) {
                bookJson.genre = await Genre.findAll({ where: { id: { [Op.in]: gIds } }, raw: true });
            } else { bookJson.genre = []; }
            
            if (aIds.length > 0) {
                bookJson.author = await Author.findAll({ where: { id: { [Op.in]: aIds } }, raw: true });
            } else { bookJson.author = []; }
            
            return bookJson;
        }
        return null;
    },

    checkIsOrdered: async(id) => {
        const [results] = await sequelize.query(`
            SELECT DISTINCT JSON_EXTRACT(products, '$[*].product') as product_ids
            FROM orders
        `);
        const allProductIds = [];
        results.forEach(row => {
            const productIds = safeParseJSON(row.product_ids);
            allProductIds.push(...productIds);
        });
        return allProductIds.includes(parseInt(id)) ? [{ id: parseInt(id) }] : [];
    },

    search: async({key, page, limit}) => {
        const offset = (page - 1) * limit;
        
        const books = await Book.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${key}%` } }
                ]
            },
            include: [{ model: Publisher, as: 'publisher', required: false }],
            offset: limit > 0 ? offset : undefined,
            limit: limit > 0 ? limit : undefined
        });
        
        const allAuthorIds = [];
        books.forEach(book => {
            const aIds = safeParseJSON(book.authorIds);
            allAuthorIds.push(...aIds);
        });
        
        const authors = await Author.findAll({
            where: {
                id: { [Op.in]: [...new Set(allAuthorIds)] },
                name: { [Op.like]: `%${key}%` }
            },
            raw: true
        });
        
        const matchingAuthorIds = authors.map(a => a.id);
        const filteredBooks = books.filter(book => {
            if (book.name.toLowerCase().includes(key.toLowerCase())) return true;
            const aIds = safeParseJSON(book.authorIds);
            if (aIds.some(id => matchingAuthorIds.includes(id))) return true;
            return false;
        });
        
        const genreIds = [];
        const authorIds = [];
        filteredBooks.forEach(book => {
            const gIds = safeParseJSON(book.genreIds);
            const aIds = safeParseJSON(book.authorIds);
            genreIds.push(...gIds);
            authorIds.push(...aIds);
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
        genres.forEach(g => genreMap[g.id] = g);
        allAuthors.forEach(a => authorMap[a.id] = a);
        
        return filteredBooks.map(book => {
            const bookJson = book.toJSON();
            const gIds = safeParseJSON(bookJson.genreIds);
            const aIds = safeParseJSON(bookJson.authorIds);
            
            bookJson.genre = gIds.map(id => genreMap[id]).filter(Boolean);
            bookJson.author = aIds.map(id => authorMap[id]).filter(Boolean);
            return bookJson;
        });
    },

    create: async(body) => {
        const { bookId, name, year, genre, author, publisher, description,
            pages, size, price, discount, imageUrl, publicId } = body;
        
        // Chuyển về mảng trước khi lưu, Sequelize sẽ tự stringify nếu cần
        const genreIds = safeParseJSON(genre).map(g => parseInt(g));
        const authorIds = safeParseJSON(author).map(a => parseInt(a));
        const publisherId = publisher ? parseInt(publisher) : null;
        
        return await Book.create({
            bookId, name, year, genreIds, authorIds, publisherId,
            description, pages, size, price, discount, imageUrl, publicId
        });
    },

    updateById: async(id, body) => {
        const { name, year, genre, author, publisher, description,
            pages, size, price, discount, imageUrl, publicId } = body;
        
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

    deleteById: async(id) => {
        return await Book.destroy({ where: { id } });
    }
}

module.exports = bookService;