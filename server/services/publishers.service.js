const Publisher = require('../models/publishers.model')
const Book = require('../models/books.model')

const publisherService = {
    getAll: async({page, limit}) => {
        return await Publisher.findAll({
            order: [['createdAt', 'DESC']]
        });
    },
    getById: async(id) => {
        return await Publisher.findByPk(id);
    },
    create: async({name}) => {
        return await Publisher.create({name});
    },
    updateById: async(id, {name}) => {
        const publisher = await Publisher.findByPk(id);
        if (publisher) {
            await publisher.update({ name });
            return publisher;
        }
        return null;
    },
    deleteById: async(id) => {
        // Khi xóa 1 NXB => Cần update lại các sách có NXB cần xóa = null
        await Book.update({ publisherId: null }, { where: { publisherId: id } });
        return await Publisher.destroy({ where: { id } });
    }
}

module.exports = publisherService
