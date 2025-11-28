const express = require('express')
const router = express.Router()

const analyticsController = require('../controllers/analytics.controller')

// CHỈ ADMIN MỚI ĐƯỢC XEM DOANH THU
const { verifyTokenAndAdmin } = require('../middlewares/auth')

router.get('/revenue/all', verifyTokenAndAdmin, analyticsController.getTotalRevenue)
router.get('/revenue/week', verifyTokenAndAdmin, analyticsController.getRevenueWeek)
router.get('/revenue/lifetime', verifyTokenAndAdmin, analyticsController.getRevenueLifeTime)
router.get('/ordercount/lifetime', verifyTokenAndAdmin, analyticsController.getOrderCountLifeTime)
router.get('/product/bestseller', verifyTokenAndAdmin, analyticsController.getBestSeller)

module.exports = router;