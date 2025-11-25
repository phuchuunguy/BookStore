const Book = require('../models/books.model')
const Order = require('../models/orders.model')
const Author = require('../models/authors.model')
const Genre = require('../models/genres.model')
const Publisher = require('../models/publishers.model')
const { Op } = require('sequelize');
const { sequelize } = require('../db');

const bookService = {
    getAll: async({query, page, limit, sort}) => {
        const offset = (page - 1) * limit;
        const order = [];
        
        // Convert sort object to Sequelize order format
        if (sort) {
            Object.keys(sort).forEach(key => {
                order.push([key, sort[key] === 1 ? 'ASC' : 'DESC']);
            });
        }
        
        const where = query || {};
        
        return await Promise.all([
            Book.count({ where }),
            Book.findAll({
                where,
                include: [
                    {
                        model: Publisher,
                        as: 'publisher',
                        required: false
                    }
                ],
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order: order.length > 0 ? order : [['createdAt', 'DESC']]
            }).then(async (books) => {
                // Populate genre và author từ JSON arrays
                const allGenreIds = [];
                const allAuthorIds = [];
                books.forEach(book => {
                    if (book.genreIds) allGenreIds.push(...book.genreIds);
                    if (book.authorIds) allAuthorIds.push(...book.authorIds);
                });
                
                const genres = await Genre.findAll({
                    where: { id: { [Op.in]: [...new Set(allGenreIds)] } }
                });
                const authors = await Author.findAll({
                    where: { id: { [Op.in]: [...new Set(allAuthorIds)] } }
                });
                
                const genreMap = {};
                const authorMap = {};
                genres.forEach(g => genreMap[g.id] = g.toJSON());
                authors.forEach(a => authorMap[a.id] = a.toJSON());
                
                return books.map(book => {
                    const bookJson = book.toJSON();
                    bookJson.genre = (bookJson.genreIds || []).map(id => genreMap[id]).filter(Boolean);
                    bookJson.author = (bookJson.authorIds || []).map(id => authorMap[id]).filter(Boolean);
                    return bookJson;
                });
            })
        ]);
    },
    getByBookId: async(bookId) => {
        const book = await Book.findOne({
            where: { bookId },
            include: [
                {
                    model: Publisher,
                    as: 'publisher',
                    required: false
                }
            ]
        });
        
        if (book) {
            const bookJson = book.toJSON();
            // Populate genre và author
            if (bookJson.genreIds && bookJson.genreIds.length > 0) {
                const genres = await Genre.findAll({
                    where: { id: { [Op.in]: bookJson.genreIds } }
                });
                bookJson.genre = genres.map(g => g.toJSON());
            } else {
                bookJson.genre = [];
            }
            
            if (bookJson.authorIds && bookJson.authorIds.length > 0) {
                const authors = await Author.findAll({
                    where: { id: { [Op.in]: bookJson.authorIds } }
                });
                bookJson.author = authors.map(a => a.toJSON());
            } else {
                bookJson.author = [];
            }
            
            return bookJson;
        }
        return null;
    },
    getById: async(id) => {
        const book = await Book.findByPk(id, {
            include: [
                {
                    model: Publisher,
                    as: 'publisher',
                    required: false
                }
            ]
        });
        
        if (book) {
            const bookJson = book.toJSON();
            // Populate genre và author
            if (bookJson.genreIds && bookJson.genreIds.length > 0) {
                const genres = await Genre.findAll({
                    where: { id: { [Op.in]: bookJson.genreIds } }
                });
                bookJson.genre = genres.map(g => g.toJSON());
            } else {
                bookJson.genre = [];
            }
            
            if (bookJson.authorIds && bookJson.authorIds.length > 0) {
                const authors = await Author.findAll({
                    where: { id: { [Op.in]: bookJson.authorIds } }
                });
                bookJson.author = authors.map(a => a.toJSON());
            } else {
                bookJson.author = [];
            }
            
            return bookJson;
        }
        return null;
    },
    getBySlug: async(slug) => {
        const book = await Book.findOne({
            where: { slug },
            include: [
                {
                    model: Publisher,
                    as: 'publisher',
                    required: false
                }
            ]
        });
        
        if (book) {
            const bookJson = book.toJSON();
            // Populate genre và author
            if (bookJson.genreIds && bookJson.genreIds.length > 0) {
                const genres = await Genre.findAll({
                    where: { id: { [Op.in]: bookJson.genreIds } }
                });
                bookJson.genre = genres.map(g => g.toJSON());
            } else {
                bookJson.genre = [];
            }
            
            if (bookJson.authorIds && bookJson.authorIds.length > 0) {
                const authors = await Author.findAll({
                    where: { id: { [Op.in]: bookJson.authorIds } }
                });
                bookJson.author = authors.map(a => a.toJSON());
            } else {
                bookJson.author = [];
            }
            
            return bookJson;
        }
        return null;
    },
    checkIsOrdered: async(id) => {
        // Kiểm tra xem sách có trong đơn hàng nào không
        const [results] = await sequelize.query(`
            SELECT DISTINCT JSON_EXTRACT(products, '$[*].product') as product_ids
            FROM orders
        `);
        
        const allProductIds = [];
        results.forEach(row => {
            const productIds = JSON.parse(row.product_ids || '[]');
            allProductIds.push(...productIds);
        });
        
        return allProductIds.includes(parseInt(id)) ? [{ _id: parseInt(id) }] : [];
    },
    search: async({key, page, limit}) => {
        const offset = (page - 1) * limit;
        
        // Tìm sách theo tên hoặc tên tác giả
        const books = await Book.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.like]: `%${key}%` } }
                ]
            },
            include: [
                {
                    model: Publisher,
                    as: 'publisher',
                    required: false
                }
            ],
            offset: limit > 0 ? offset : undefined,
            limit: limit > 0 ? limit : undefined
        });
        
        // Lọc thêm theo tên tác giả
        const allAuthorIds = [];
        books.forEach(book => {
            if (book.authorIds) allAuthorIds.push(...book.authorIds);
        });
        
        const authors = await Author.findAll({
            where: {
                id: { [Op.in]: [...new Set(allAuthorIds)] },
                name: { [Op.like]: `%${key}%` }
            }
        });
        
        const matchingAuthorIds = authors.map(a => a.id);
        const filteredBooks = books.filter(book => {
            if (book.name.toLowerCase().includes(key.toLowerCase())) return true;
            if (book.authorIds && book.authorIds.some(id => matchingAuthorIds.includes(id))) return true;
            return false;
        });
        
        // Populate authors và genres
        const genreIds = [];
        const authorIds = [];
        filteredBooks.forEach(book => {
            if (book.genreIds) genreIds.push(...book.genreIds);
            if (book.authorIds) authorIds.push(...book.authorIds);
        });
        
        const genres = await Genre.findAll({
            where: { id: { [Op.in]: [...new Set(genreIds)] } }
        });
        const allAuthors = await Author.findAll({
            where: { id: { [Op.in]: [...new Set(authorIds)] } }
        });
        
        const genreMap = {};
        const authorMap = {};
        genres.forEach(g => genreMap[g.id] = g.toJSON());
        allAuthors.forEach(a => authorMap[a.id] = a.toJSON());
        
        return filteredBooks.map(book => {
            const bookJson = book.toJSON();
            bookJson.genre = (bookJson.genreIds || []).map(id => genreMap[id]).filter(Boolean);
            bookJson.author = (bookJson.authorIds || []).map(id => authorMap[id]).filter(Boolean);
            return bookJson;
        });
    },
    create: async(body) => {
        const { bookId, name, year, genre, author, publisher, description,
            pages, size, price, discount, imageUrl, publicId } = body;
        
        // Convert genre và author arrays to IDs
        const genreIds = Array.isArray(genre) ? genre.map(g => parseInt(g)) : [];
        const authorIds = Array.isArray(author) ? author.map(a => parseInt(a)) : [];
        const publisherId = publisher ? parseInt(publisher) : null;
        
        return await Book.create({
            bookId,
            name,
            year,
            genreIds,
            authorIds,
            publisherId,
            description,
            pages,
            size,
            price,
            discount,
            imageUrl,
            publicId
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
        
        if (genre) {
            updateData.genreIds = Array.isArray(genre) ? genre.map(g => parseInt(g)) : [];
        }
        if (author) {
            updateData.authorIds = Array.isArray(author) ? author.map(a => parseInt(a)) : [];
        }
        if (publisher) {
            updateData.publisherId = parseInt(publisher);
        }
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

module.exports = bookService
