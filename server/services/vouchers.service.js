const Voucher = require('../models/vouchers.model')
const { Op } = require('sequelize');

const voucherService = {
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
            Voucher.count({ where }),
            Voucher.findAll({
                where,
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order: order.length > 0 ? order : [['createdAt', 'DESC']]
            })
        ]);
    },
    getById: async(id) => {
        return await Voucher.findByPk(id);
    },
    getByCode: async(code) => {
        return await Voucher.findOne({ where: { code } });
    },
    create: async({name, code, by, value, start, end, minimum}) => {
        return await Voucher.create({name, code, by, value, start, end, minimum});
    },
    updateById: async(id, {name, start, end}) => {
        const voucher = await Voucher.findByPk(id);
        if (voucher) {
            await voucher.update({ name, start, end });
            return voucher;
        }
        return null;
    },
    updateUsedQuantity: async(id, value) => {
        const voucher = await Voucher.findByPk(id);
        if (voucher) {
            // Note: Sequelize doesn't have $inc, so we need to increment manually
            const currentValue = voucher.used_quantity || 0;
            await voucher.update({ used_quantity: currentValue + value });
            return voucher;
        }
        return null;
    },
    deleteById: async(id) => {
        return await Voucher.destroy({ where: { id } });
    }
}

module.exports = voucherService
