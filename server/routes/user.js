const express = require('express')
const router = express.Router()

const userController = require('../controllers/users.controller')
// Multer
const multer = require('multer')
const upload = multer({ storage: multer.memoryStorage() })

// Import các middleware mới đã sửa ở bước trước
const { 
    verifyTokenAndUserAuthorization, // Cho phép: Chính chủ + Staff + Admin
    verifyTokenAndStaff,             // Cho phép: Staff + Admin
    verifyTokenAndAdmin              // Cho phép: Chỉ Admin
} = require('../middlewares/auth')


// --- 1. QUẢN LÝ USER (Dành cho Admin/Staff) ---

// Lấy tất cả user (Chỉ Staff/Admin được xem)
router.get('/', verifyTokenAndStaff, userController.getAll)

// Tạo nhân viên mới (Chỉ Admin được tạo)
router.post('/staff', verifyTokenAndAdmin, userController.createStaff)

// Cập nhật trạng thái hoạt động/khóa (Chỉ Admin)
router.put('/:userId/status', verifyTokenAndAdmin, userController.updateStatus)

// Xóa tài khoản (Chỉ Admin)
router.delete('/:userId', verifyTokenAndAdmin, userController.deleteById)


// --- 2. THÔNG TIN CÁ NHÂN (Dành cho User tự quản lý hoặc Admin hỗ trợ) ---
// Sử dụng 'verifyTokenAndUserAuthorization' để User tự xem/sửa được của mình

// Lấy thông tin chi tiết 1 user
router.get('/:userId', verifyTokenAndUserAuthorization, userController.getById)

// Cập nhật thông tin cá nhân
router.put('/:userId', verifyTokenAndUserAuthorization, userController.updateProfileById)

// Cập nhật Avatar
router.put('/:userId/avatar', verifyTokenAndUserAuthorization, upload.single('file'), userController.updateAvatar)


// --- 3. QUẢN LÝ ĐỊA CHỈ (User tự làm được) ---

router.get('/:userId/address', verifyTokenAndUserAuthorization, userController.getAddress)

router.post('/:userId/address', verifyTokenAndUserAuthorization, userController.addAddress)

router.patch('/:userId/address/status/:addressId', verifyTokenAndUserAuthorization, userController.updateDefaultAddressById)

router.delete('/:userId/address/:addressId', verifyTokenAndUserAuthorization, userController.deleteAddressById)


// --- 4. QUẢN LÝ GIỎ HÀNG (User tự làm được - QUAN TRỌNG ĐỂ MUA HÀNG) ---

// Xem giỏ hàng
router.get('/:userId/cart', verifyTokenAndUserAuthorization, userController.getCart)

// Thêm vào giỏ hàng
router.post('/:userId/addtocart', verifyTokenAndUserAuthorization, userController.addToCart)

// Cập nhật giỏ hàng (Tăng/giảm số lượng)
router.put('/:userId/cart', verifyTokenAndUserAuthorization, userController.updateCart)


module.exports = router;