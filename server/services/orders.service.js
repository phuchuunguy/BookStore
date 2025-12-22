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

    create: async (data) => {
        const transaction = await sequelize.transaction(); // Bắt đầu giao dịch
        try {
            const orderData = { ...data };
            if (!orderData.voucherId) orderData.voucherId = null;

            // 1. Lấy danh sách sản phẩm khách đặt
            const products = orderData.products; // Mảng [{ product: ID, quantity: 2 }, ...]
            
            // 2. Vòng lặp kiểm tra và trừ kho
            for (const item of products) {
                // Lấy ID sách (tùy cấu trúc object của bạn là product hay id)
                const bookId = item.product || item.id || item._id;
                const qty = parseInt(item.quantity || item.qty || 1);

                // Tìm sách trong kho
                const book = await Book.findByPk(bookId, { transaction });

                if (!book) {
                    throw new Error(`Sách có ID ${bookId} không tồn tại!`);
                }

                // Kiểm tra xem còn đủ hàng không
                if (book.quantity < qty) {
                    throw new Error(`Sách "${book.name}" chỉ còn lại ${book.quantity} cuốn, không đủ để bán!`);
                }

                // --- QUAN TRỌNG: TRỪ SỐ LƯỢNG TRONG KHO ---
                await book.decrement('quantity', { by: qty, transaction });
                // -------------------------------------------
            }

            // 3. Tạo đơn hàng
            const order = await Order.create(orderData, { transaction });

            // 4. Nếu mọi thứ Ok -> Lưu thay đổi vào DB
            await transaction.commit();
            return order;

        } catch (error) {
            // Nếu có lỗi (ví dụ hết hàng) -> Hoàn tác, không trừ kho, không tạo đơn
            await transaction.rollback();
            throw error;
        }
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
       const transaction = await sequelize.transaction();
        try {
            const order = await Order.findByPk(id, { transaction });
            if (!order) throw new Error("Đơn hàng không tìm thấy!");

            const oldStatus = safeParseJSON(order.orderStatus)?.code;
            const newStatus = orderStatus.code; // Code mới từ frontend gửi lên
            const products = safeParseArray(order.products);

            // LOGIC HOÀN KHO: Nếu chuyển sang "Đã hủy" (Code 6)
            if (newStatus === 6 && oldStatus !== 6) {
                for (const item of products) {
                    const bookId = item.product || item.id || item._id;
                    const qty = parseInt(item.quantity || item.qty || 1);
                    // Cộng lại số lượng vào kho
                    await Book.increment('quantity', { by: qty, where: { id: bookId }, transaction });
                }
            }

            // LOGIC TRỪ LẠI KHO: Nếu Admin lỡ tay Hủy nhầm, giờ chuyển lại trạng thái khác (Khác 6)
            if (oldStatus === 6 && newStatus !== 6) {
                for (const item of products) {
                    const bookId = item.product || item.id || item._id;
                    const qty = parseInt(item.quantity || item.qty || 1);
                    
                    // Kiểm tra xem còn đủ hàng để khôi phục đơn không
                    const book = await Book.findByPk(bookId, { transaction });
                    if (book.quantity < qty) {
                        throw new Error(`Không thể khôi phục đơn! Sách "${book.name}" đã hết hàng.`);
                    }
                    // Trừ lại kho
                    await Book.decrement('quantity', { by: qty, where: { id: bookId }, transaction });
                }
            }

            await order.update({ orderStatus, paymentStatus }, { transaction });
            await transaction.commit();
            return order;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    },

    cancelOrder: async (userId, orderId) => {
        const transaction = await sequelize.transaction();
        try {
            const order = await Order.findByPk(orderId, { transaction });
            
            if (!order) throw new Error("Đơn hàng không tồn tại!");
            if (order.userId !== userId) throw new Error("Bạn không có quyền hủy đơn hàng này!");

            const currentStatus = safeParseJSON(order.orderStatus);
            const currentCode = currentStatus?.code || 0;

            // Chỉ cho hủy khi đơn mới (0) hoặc đã xác nhận (1)
            if (currentCode >= 3) {
                throw new Error("Đơn hàng đang được xử lý hoặc vận chuyển, không thể hủy!");
            }

            // HOÀN KHO
            const products = safeParseArray(order.products);
            for (const item of products) {
                const bookId = item.product || item.id || item._id;
                const qty = parseInt(item.quantity || item.qty || 1);
                await Book.increment('quantity', { by: qty, where: { id: bookId }, transaction });
            }

            // Cập nhật trạng thái
            const cancelStatus = { code: 6, text: "Đã hủy bởi Khách hàng" };
            
            let tracking = safeParseArray(order.tracking);
            tracking.push({
                status: "Khách hàng hủy đơn",
                time: new Date(),
                user: userId
            });

            await order.update({ 
                orderStatus: cancelStatus,
                tracking: tracking
            }, { transaction });

            await transaction.commit();
            return order;

        } catch (error) {
            await transaction.rollback();
            throw error;
        }
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
            // Chỉ tính đơn đã thanh toán hoặc thành công (Tùy logic bạn, ở đây mình tính hết trừ đơn hủy)
            const status = safeParseJSON(order.orderStatus);
            if (status?.code === 6) return sum; // Bỏ qua đơn hủy

            return sum + (cost?.total || 0) - (cost?.shippingFee || 0);
        }, 0);
        return [{ revenue: total }];
    },

    getRevenueWeek: async(query) => {
        const { start, end } = query;
        const orders = await Order.findAll({
            where: { createdAt: { [Op.between]: [new Date(start), new Date(end)] } },
            raw: true
        });
        const revenueMap = {};
        orders.forEach(order => {
            const status = safeParseJSON(order.orderStatus);
            if (status?.code === 6) return; // Bỏ qua đơn hủy

            const date = order.createdAt.toISOString().split('T')[0];
            const cost = safeParseJSON(order.cost);
            const revenue = (cost?.total || 0) - (cost?.shippingFee || 0);
            revenueMap[date] = (revenueMap[date] || 0) + revenue;
        });
        return Object.keys(revenueMap).map(date => ({ date, revenue: revenueMap[date] })).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    getRevenueLifeTime: async() => {
        const orders = await Order.findAll({ raw: true });
        const revenueMap = {};
        orders.forEach(order => {
            const status = safeParseJSON(order.orderStatus);
            if (status?.code === 6) return;

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
            const status = safeParseJSON(order.orderStatus);
            if (status?.code === 6) return; // Có thể đếm hoặc không tùy bạn

            const date = order.createdAt.toISOString().split('T')[0];
            countMap[date] = (countMap[date] || 0) + 1;
        });
        return Object.keys(countMap).map(date => ({ date, total: countMap[date] })).sort((a, b) => new Date(a.date) - new Date(b.date));
    },

    getBestSeller: async() => {
        const orders = await Order.findAll({ attributes: ['products', 'orderStatus'], raw: true });
        const productCounts = {};

        orders.forEach(row => {
            const status = safeParseJSON(row.orderStatus);
            if (status?.code === 6) return; // Không tính đơn hủy vào best seller

            const products = safeParseArray(row.products);
            products.forEach(item => {
                const bookId = item.product || item.id || item._id;
                const qty = parseInt(item.qty || item.quantity || 1);
                if (bookId) productCounts[bookId] = (productCounts[bookId] || 0) + qty;
            });
        });

        const sortedProducts = Object.entries(productCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
        const topProductIds = sortedProducts.map(([id]) => parseInt(id));
        const books = await Book.findAll({ where: { id: { [Op.in]: topProductIds } } });

        // Collect all author IDs referenced by these books (authorIds is stored as JSON)
        const allAuthorIds = new Set();
        const bookMap = {};
        books.forEach(b => {
            const bookObj = b.toJSON();
            // authorIds may be stored as array or stringified JSON
            let aIds = [];
            try {
                if (Array.isArray(bookObj.authorIds)) aIds = bookObj.authorIds;
                else if (typeof bookObj.authorIds === 'string') aIds = JSON.parse(bookObj.authorIds);
            } catch (e) {
                aIds = [];
            }
            bookMap[bookObj.id] = { book: bookObj, authorIds: aIds };
            aIds.forEach(id => {
                if (id) allAuthorIds.add(parseInt(id));
            })
        });

        // Fetch all authors referenced
        let authors = [];
        if (allAuthorIds.size > 0) {
            const Author = require('../models/authors.model');
            authors = await Author.findAll({ where: { id: { [Op.in]: Array.from(allAuthorIds) } } });
        }
        const authorMap = {};
        authors.forEach(a => { authorMap[a.id] = a.toJSON(); });

        return sortedProducts.map(([id, count]) => {
            const parsedId = parseInt(id);
            const entry = bookMap[parsedId];
            if (!entry) return { id: parsedId, count, product: [] };
            const bookData = { ...entry.book };
            // attach author objects as `author` array to match frontend expectation
            bookData.author = (entry.authorIds || []).map(aid => authorMap[aid]).filter(Boolean);
            return { id: parsedId, count, product: [bookData] };
        });
    }
}

module.exports = orderService
