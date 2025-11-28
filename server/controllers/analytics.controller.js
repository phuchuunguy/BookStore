const orderService = require('../services/orders.service')

const analyticsController = {
    getTotalRevenue: async(req, res) => {
        try {
            const data = await orderService.getTotalRevenue()
            // Data trả về thường là mảng [{ revenue: 1000... }]
            res.status(200).json({
                message: 'success',
                error: 0,
                data, 
            })
        } catch (error) {
            console.error("Lỗi getTotalRevenue:", error); // In lỗi ra Terminal để dễ sửa
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    getRevenueWeek: async(req, res) => {
        try {
            // req.query chứa { start: '...', end: '...' }
            const data = await orderService.getRevenueWeek(req.query)
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            console.error("Lỗi getRevenueWeek:", error);
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    getRevenueLifeTime: async(req, res) => {
        try {
            const data = await orderService.getRevenueLifeTime()
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            console.error("Lỗi getRevenueLifeTime:", error);
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    getOrderCountLifeTime: async(req, res) => {
        try {
            const data = await orderService.getOrderCountLifeTime()
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            console.error("Lỗi getOrderCountLifeTime:", error);
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    getBestSeller: async(req, res) => {
        try {
            // Hàm này bên Service đã được sửa để xử lý JSON products
            const data = await orderService.getBestSeller()
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
            })
        } catch (error) {
            console.error("Lỗi getBestSeller:", error);
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
}

module.exports = analyticsController