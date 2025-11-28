const express = require('express')
const router = express.Router()

const voucherController = require('../controllers/vouchers.controller')

// Import middleware mới
const { verifyTokenAndStaff } = require('../middlewares/auth')

// Ai cũng xem được
router.get('/', voucherController.getAll)
router.get('/:id', voucherController.getById)
router.get('/code/:code', voucherController.getByCode)

// Chỉ Nhân viên hoặc Admin mới được Thêm/Sửa/Xóa
router.post('/', verifyTokenAndStaff, voucherController.create)
router.put('/:id', verifyTokenAndStaff, voucherController.updateById)
router.delete('/:id', verifyTokenAndStaff, voucherController.deleteById)

module.exports = router;