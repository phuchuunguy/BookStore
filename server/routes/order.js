const express = require('express')
const router = express.Router()

const orderController = require('../controllers/orders.controller')

// Import middleware mới
const { verifyToken, verifyTokenAndStaff } = require('../middlewares/auth')

// 1. Xem danh sách đơn hàng (Dành cho trang Admin quản lý) -> Dùng verifyTokenAndStaff
router.get('/', verifyToken, orderController.getAll)

// 2. Xem chi tiết đơn hàng (Admin/Staff xem để xử lý)
router.get('/:id', verifyToken, orderController.getById)

// 3. Thanh toán MoMo (Webhook của MoMo gọi vào, không cần Token)
router.post("/thanhtoan/momo/verify", orderController.verifyMoMo)
router.post('/thanhtoan/momo', orderController.getPayUrlMoMo)

// 4. Tạo đơn hàng (Khách hàng đã đăng nhập) -> Dùng verifyToken
router.post('/', verifyToken, orderController.create)

// 5. Cập nhật trạng thái đơn hàng (Duyệt đơn/Hủy đơn) -> Chỉ Staff/Admin
router.put('/:id/order-status', verifyTokenAndStaff, orderController.updateOrderStatus)

// 6. Cập nhật Payment ID (Khi thanh toán xong) -> Khách hàng hoặc System gọi
router.put('/:id/paymentid', verifyToken, orderController.updatePaymentId)

// router.delete('/:id', orderController.deleteById)

module.exports = router;