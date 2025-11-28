const express = require('express')
const router = express.Router()

const bookController = require('../controllers/books.controller')

// Import middleware mới
const { verifyTokenAndStaff } = require('../middlewares/auth')

// --- PUBLIC ROUTES (Khách hàng xem thoải mái) ---
router.get('/', bookController.getAll)
router.get('/search', bookController.searchBook)
router.get('/bookId/:bookId', bookController.getByBookId) // Tìm theo mã sách (BK-001)
router.get('/slug/:slug', bookController.getBySlug)       // Tìm theo slug
router.get('/:id', bookController.getById)                // Tìm theo ID (1, 2)

// Check xem sách đã có đơn hàng chưa (để chặn xóa) - Thường dùng cho Admin nhưng để GET public cũng được
router.get('/is-ordered/:bookId', bookController.checkIsOrdered)

// --- PROTECTED ROUTES (Quản lý kho sách - Chỉ Staff/Admin) ---
router.post('/', verifyTokenAndStaff, bookController.create)
router.put('/:id', verifyTokenAndStaff, bookController.updateById)
router.delete('/:id', verifyTokenAndStaff, bookController.deleteById)

module.exports = router;