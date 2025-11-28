const Order = require('../models/orders.model')
const User = require('../models/users.model')
const Voucher = require('../models/vouchers.model')
const Book = require('../models/books.model')
const { Op } = require('sequelize');
const { sequelize } = require('../db');

const safeParseJSON = (data) => {
    if (!data) return null;
    if (typeof data === 'object') return data;
    try { return JSON.parse(data); } catch (error) { return data; }
}

const safeParseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try { return JSON.parse(data); } catch (error) { return []; }
}

const orderService = {
    getAll: async({query, page, limit, sort}) => {
        const offset = (page - 1) * limit;
        const order = [];
        if (sort) {
            Object.keys(sort).forEach(key => {
                order.push([key, sort[key] === 1 ? 'ASC' : 'DESC']);
            });
        }
        const where = query || {};
        if (where.user && where.user.$in) {
            where.userId = { [Op.in]: where.user.$in };
            delete where.user;
        }
        
        const { count, rows } = await Order.findAndCountAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'fullName', 'email'] },
                { model: Voucher, as: 'voucher', required: false }
            ],
            offset: limit > 0 ? offset : undefined,
            limit: limit > 0 ? limit : undefined,
            order: order.length > 0 ? order : [['createdAt', 'DESC']]
        });

        // Parse JSON trước khi trả về
        const formattedOrders = rows.map(order => {
            const orderData = order.toJSON();
            orderData.products = safeParseJSON(orderData.products);
            orderData.address = safeParseJSON(orderData.address);
            orderData.cost = safeParseJSON(orderData.cost);
            orderData.delivery = safeParseJSON(orderData.delivery);
            orderData.method = safeParseJSON(orderData.method);

            orderData.orderStatus = safeParseJSON(orderData.orderStatus);
            orderData.paymentStatus = safeParseJSON(orderData.paymentStatus);

            return orderData;
        });

        return [count, formattedOrders];
    },

    getById: async(id) => {
        const order = await Order.findByPk(id, {
            include: [{ model: User, as: 'user' }, { model: Voucher, as: 'voucher', required: false }]
        });
        if (!order) return null;
        
        const orderData = order.toJSON();
        // Parse toàn bộ JSON
        orderData.products = safeParseJSON(orderData.products);
        orderData.address = safeParseJSON(orderData.address);
        orderData.cost = safeParseJSON(orderData.cost);
        orderData.delivery = safeParseJSON(orderData.delivery);
        orderData.method = safeParseJSON(orderData.method);
        orderData.tracking = safeParseJSON(orderData.tracking);

        orderData.orderStatus = safeParseJSON(orderData.orderStatus);
        orderData.paymentStatus = safeParseJSON(orderData.paymentStatus);

        // Populate sách
        if (orderData.products.length > 0) {
            const productIds = orderData.products.map(p => p.product || p.id || p._id).filter(Boolean);
            if (productIds.length > 0) {
                const books = await Book.findAll({ where: { id: { [Op.in]: productIds } } });
                const bookMap = {};
                books.forEach(b => bookMap[b.id] = b.toJSON());
                
                orderData.products = orderData.products.map(p => ({
                    ...p,
                    product: bookMap[p.product || p.id || p._id] || null
                }));
            }
        }
        return orderData;
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
            // 1. Giải mã dữ liệu tracking cũ (từ Chuỗi -> Mảng)
            let currentTracking = [];
            try {
                // Nếu là chuỗi thì parse, nếu là mảng thì giữ nguyên, nếu null thì mảng rỗng
                const trackingData = order.tracking;
                if (typeof trackingData === 'string') {
                    currentTracking = JSON.parse(trackingData);
                } else if (Array.isArray(trackingData)) {
                    currentTracking = trackingData;
                }
            } catch (e) {
                currentTracking = [];
            }

            // 2. Thêm trạng thái mới vào mảng
            currentTracking.push({ status, time, user: userId });

            // 3. Lưu lại vào DB (Sequelize tự stringify nếu cần)
            await order.update({ tracking: currentTracking });
            return order;
        }
        return null;
    },

    // Thống kê - sử dụng raw SQL cho các aggregation phức tạp
   getTotalRevenue: async() => {
        const orders = await Order.findAll({ raw: true });
        const total = orders.reduce((sum, order) => {
            const cost = safeParseJSON(order.cost);
            return sum + (cost?.total || 0) - (cost?.shippingFee || 0);
        }, 0);
        return [{ revenue: total }]; // Trả về mảng 1 phần tử để khớp frontend
    },

    getRevenueWeek: async(query) => {
        const { start, end } = query;
        const orders = await Order.findAll({
            where: {
                createdAt: { [Op.between]: [new Date(start), new Date(end)] }
            },
            raw: true
        });

        // Nhóm theo ngày (YYYY-MM-DD)
        const revenueMap = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0]; // Lấy ngày YYYY-MM-DD
            const cost = safeParseJSON(order.cost);
            const revenue = (cost?.total || 0) - (cost?.shippingFee || 0);
            
            revenueMap[date] = (revenueMap[date] || 0) + revenue;
        });

        // Chuyển về mảng object
        const result = Object.keys(revenueMap).map(date => ({
            date: date,
            revenue: revenueMap[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date));

        return result;
    },

    getRevenueLifeTime: async() => {
        // Logic tương tự getRevenueWeek nhưng lấy toàn bộ
        const orders = await Order.findAll({ raw: true });
        const revenueMap = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            const cost = safeParseJSON(order.cost);
            const revenue = (cost?.total || 0) - (cost?.shippingFee || 0);
            revenueMap[date] = (revenueMap[date] || 0) + revenue;
        });
        return Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] })).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    getOrderCountLifeTime: async() => {
        const orders = await Order.findAll({ raw: true });
        const countMap = {};
        orders.forEach(order => {
            const date = order.createdAt.toISOString().split('T')[0];
            countMap[date] = (countMap[date] || 0) + 1;
        });
        return Object.keys(countMap).map(date => ({ date, total: countMap[date] })).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    getBestSeller: async() => {
        try {
            // 1. Lấy tất cả đơn hàng (chỉ lấy cột products)
            const orders = await Order.findAll({
                attributes: ['products'],
                raw: true
            });
            
            const productCounts = {};

            // 2. Duyệt qua từng đơn hàng để đếm thủ công
            orders.forEach(row => {
                const products = safeParseJSON(row.products); // Parse từ chuỗi sang mảng
                
                if (Array.isArray(products)) {
                    products.forEach(item => {
                        // Lấy ID sách (hỗ trợ nhiều format lưu trữ)
                        const bookId = item.product || item.id || item._id;
                        const qty = parseInt(item.qty || item.quantity || 1);

                        if (bookId) {
                            productCounts[bookId] = (productCounts[bookId] || 0) + qty;
                        }
                    });
                }
            });
            
            // 3. Sắp xếp giảm dần
            const sortedProducts = Object.entries(productCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5); // Lấy Top 5
            
            if (sortedProducts.length === 0) return [];

            const topProductIds = sortedProducts.map(([id]) => parseInt(id));
            
            // 4. Lấy thông tin sách chi tiết
            const books = await Book.findAll({
                where: { id: { [Op.in]: topProductIds } },
                raw: true
            });
            
            // 5. Map kết quả trả về
            return sortedProducts.map(([id, count]) => {
                const book = books.find(b => b.id === parseInt(id));
                return {
                    id: parseInt(id),
                    count: count,
                    product: book ? [book] : [] // Trả về mảng chứa object sách
                };
            });
        } catch (error) {
            console.log("Service BestSeller Error:", error);
            return [];
        }
    },
}

module.exports = orderService
