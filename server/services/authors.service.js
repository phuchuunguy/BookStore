const Author = require('../models/authors.model')
const Book = require('../models/books.model')
const { Op } = require('sequelize');

const authorService = {
    getAll: async({page, limit, sort}) => {
        const offset = (page - 1) * limit;
        const order = [];
        
        // Convert sort object to Sequelize order format
        if (sort) {
            Object.keys(sort).forEach(key => {
                order.push([key, sort[key] === 1 ? 'ASC' : 'DESC']);
            });
        }
        
        return await Promise.all([
            Author.count(),
            Author.findAll({
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order: order.length > 0 ? order : [['createdAt', 'DESC']]
            })
        ]);
    },
    getById: async(id) => {
        const author = await Author.findByPk(id);
        // Tìm sách có author trong authorIds JSON array
        const books = await Book.findAll({
            where: {
                authorIds: {
                    [Op.contains]: [parseInt(id)]
                }
            }
        });
        return [author, books];
    },
    create: async({name, year}) => {
        return await Author.create({name, year});
    },
    updateById: async(id, {name, year}) => {
        const author = await Author.findByPk(id);
        if (author) {
            await author.update({ name, year });
            return author;
        }
        return null;
    },
    deleteById: async(id) => {
        // Khi xóa 1 tác giả => Cần update lại các sách có tác giả cần xóa
        const books = await Book.findAll({
            where: {
                authorIds: {
                    [Op.contains]: [parseInt(id)]
                }
            }
        });
        
        for (const book of books) {
            const authorIds = book.authorIds || [];
            const updatedAuthorIds = authorIds.filter(aid => aid !== parseInt(id));
            await book.update({ authorIds: updatedAuthorIds });
        }
        
        return await Author.destroy({ where: { id } });
    }
}

module.exports = authorService
