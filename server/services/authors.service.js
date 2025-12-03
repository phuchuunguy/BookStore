const Author = require('../models/authors.model')
const Book = require('../models/books.model')
const { Op } = require('sequelize');
const Sequelize = require('sequelize');
const { sequelize } = require('../db');

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
        // Tìm sách có author trong authorIds JSON array (MySQL JSON_CONTAINS)
        const books = await Book.findAll({
            where: Sequelize.literal(`JSON_CONTAINS(CAST(authorIds AS JSON), CAST('${parseInt(id)}' AS JSON))`)
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
        // Sử dụng transaction để đảm bảo atomic: cập nhật sách rồi xóa tác giả
        const t = await sequelize.transaction();
        try {
            // Tìm tất cả sách chứa authorId
            const books = await Book.findAll({
                where: Sequelize.literal(`JSON_CONTAINS(CAST(authorIds AS JSON), CAST('${parseInt(id)}' AS JSON))`),
                transaction: t,
                lock: t.LOCK.UPDATE
            });

            for (const book of books) {
                const authorIds = book.authorIds || [];
                const updatedAuthorIds = authorIds.filter(aid => aid !== parseInt(id));
                await book.update({ authorIds: updatedAuthorIds }, { transaction: t });
            }

            const result = await Author.destroy({ where: { id }, transaction: t });
            await t.commit();
            return result;
        } catch (error) {
            await t.rollback();
            throw error;
        }
    }
}

module.exports = authorService
