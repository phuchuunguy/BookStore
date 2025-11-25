const Genre = require('../models/genres.model')
const Book = require('../models/books.model')
const { Op } = require('sequelize');

const genreService = {
    getAll: async({page, limit}) => {
        return await Genre.findAll({
            order: [['createdAt', 'DESC']]
        });
    },
    getById: async(id) => {
        return await Genre.findByPk(id);
    },
    getBySlug: async(slug) => {
        return await Genre.findOne({ where: { slug } });
    },
    create: async({name}) => {
        return await Genre.create({name});
    },
    updateById: async(id, {name}) => {
        const genre = await Genre.findByPk(id);
        if (genre) {
            await genre.update({ name });
            return genre;
        }
        return null;
    },
    deleteById: async(id) => {
        // Khi xóa 1 thể loại => Cần update lại các sách có thể loại cần xóa
        const books = await Book.findAll({
            where: {
                genreIds: {
                    [Op.contains]: [parseInt(id)]
                }
            }
        });
        
        for (const book of books) {
            const genreIds = book.genreIds || [];
            const updatedGenreIds = genreIds.filter(gid => gid !== parseInt(id));
            await book.update({ genreIds: updatedGenreIds });
        }
        
        return await Genre.destroy({ where: { id } });
    }
}

module.exports = genreService
