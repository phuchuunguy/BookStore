const Order = require('../models/orders.model')
const User = require('../models/users.model')
const Voucher = require('../models/vouchers.model')
const Book = require('../models/books.model')
const { Op } = require('sequelize');
const { sequelize } = require('../db');

const orderService = {
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
        // Convert MongoDB $in query to Sequelize
        if (where.user && where.user.$in) {
            where.userId = { [Op.in]: where.user.$in };
            delete where.user;
        }
        
        return await Promise.all([
            Order.count({ where }),
            Order.findAll({
                where,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'fullName', 'email']
                    },
                    {
                        model: Voucher,
                        as: 'voucher',
                        required: false
                    }
                ],
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order: order.length > 0 ? order : [['createdAt', 'DESC']]
            })
        ]);
    },
    getById: async(id) => {
        const order = await Order.findByPk(id, {
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'fullName', 'email']
                },
                {
                    model: Voucher,
                    as: 'voucher',
                    required: false
                }
            ]
        });
        
        // Populate products manually since they're stored as JSON
        if (order && order.products) {
            const productIds = order.products.map(p => p.product).filter(Boolean);
            if (productIds.length > 0) {
                const books = await Book.findAll({
                    where: { id: { [Op.in]: productIds } }
                });
                const bookMap = {};
                books.forEach(book => {
                    bookMap[book.id] = book.toJSON();
                });
                order.products = order.products.map(p => ({
                    ...p,
                    product: bookMap[p.product] || null
                }));
            }
        }
        
        // Populate tracking.user
        if (order && order.tracking) {
            const userIds = order.tracking.map(t => t.user).filter(Boolean);
            if (userIds.length > 0) {
                const users = await User.findAll({
                    where: { id: { [Op.in]: userIds } },
                    attributes: ['id', 'fullName']
                });
                const userMap = {};
                users.forEach(user => {
                    userMap[user.id] = user.toJSON();
                });
                order.tracking = order.tracking.map(t => ({
                    ...t,
                    user: userMap[t.user] || null
                }));
            }
        }
        
        return order;
    },
    create: async({ userId, products, delivery, voucherId, cost, method, paymentId }) => {
        return await Order.create({
            userId,
            products,
            delivery,
            voucherId,
            cost,
            method,
            paymentId
        });
    },
    updatePaymentStatusByPaymentId: async(paymentId, { paymentStatus, method }) => {
        const order = await Order.findOne({ where: { paymentId } });
        if (order) {
            await order.update({ paymentStatus, method });
            return order;
        }
        return null;
    },
    updateStatus: async(id, { orderStatus, paymentStatus }) => {
        const order = await Order.findByPk(id);
        if (order) {
            await order.update({ orderStatus, paymentStatus });
            return order;
        }
        return null;
    },
    updatePaymentId: async(orderId, { paymentId }) => {
        const order = await Order.findByPk(orderId);
        if (order) {
            await order.update({ paymentId });
            return order;
        }
        return null;
    },
    addTracking: async (orderId, { status, time, userId }) => {
        const order = await Order.findByPk(orderId);
        if (order) {
            const tracking = order.tracking || [];
            tracking.push({ status, time, user: userId });
            await order.update({ tracking });
            return order;
        }
        return null;
    },
    // Thống kê - sử dụng raw SQL cho các aggregation phức tạp
    getTotalRevenue: async() => {
        const [results] = await sequelize.query(`
            SELECT SUM(JSON_EXTRACT(cost, '$.total') - JSON_EXTRACT(cost, '$.shippingFee')) as revenue
            FROM orders
        `);
        return results;
    },
    getRevenueWeek: async(query) => {
        const { start, end } = query;
        const [results] = await sequelize.query(`
            SELECT 
                DATE(createdAt) as _id,
                SUM(JSON_EXTRACT(cost, '$.total') - JSON_EXTRACT(cost, '$.shippingFee')) as revenue
            FROM orders
            WHERE createdAt >= :start AND createdAt <= :end
            GROUP BY DATE(createdAt)
            ORDER BY _id ASC
        `, {
            replacements: { start, end }
        });
        return results;
    },
    getRevenueLifeTime: async() => {
        const [results] = await sequelize.query(`
            SELECT 
                DATE(createdAt) as _id,
                SUM(JSON_EXTRACT(cost, '$.total') - JSON_EXTRACT(cost, '$.shippingFee')) as revenue
            FROM orders
            GROUP BY DATE(createdAt)
            ORDER BY _id ASC
        `);
        return results;
    },
    getOrderCountLifeTime: async() => {
        const [results] = await sequelize.query(`
            SELECT 
                DATE(createdAt) as _id,
                COUNT(*) as total
            FROM orders
            GROUP BY DATE(createdAt)
            ORDER BY _id ASC
        `);
        return results;
    },
    getBestSeller: async() => {
        // Sử dụng raw query để xử lý JSON array products
        const [results] = await sequelize.query(`
            SELECT 
                JSON_EXTRACT(products, '$[*].product') as product_ids,
                JSON_EXTRACT(products, '$[*].quantity') as quantities
            FROM orders
        `);
        
        // Xử lý kết quả để tính tổng số lượng bán cho mỗi sách
        const productCounts = {};
        results.forEach(row => {
            const productIds = JSON.parse(row.product_ids || '[]');
            const quantities = JSON.parse(row.quantities || '[]');
            productIds.forEach((productId, index) => {
                if (productId) {
                    productCounts[productId] = (productCounts[productId] || 0) + (quantities[index] || 0);
                }
            });
        });
        
        // Lấy top 5 sách bán chạy nhất
        const sortedProducts = Object.entries(productCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);
        
        const topProductIds = sortedProducts.map(([id]) => parseInt(id));
        const books = await Book.findAll({
            where: { id: { [Op.in]: topProductIds } }
        });
        
        return sortedProducts.map(([id, count]) => {
            const book = books.find(b => b.id === parseInt(id));
            return {
                _id: parseInt(id),
                count: count,
                product: book ? [book.toJSON()] : []
            };
        });
    },
}

module.exports = orderService
