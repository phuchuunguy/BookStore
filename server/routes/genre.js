const express = require('express')
const router = express.Router()

const genreController = require('../controllers/genres.controller')

// Import middleware mới
const { verifyTokenAndStaff } = require('../middlewares/auth')

// --- PUBLIC ROUTES (Ai cũng xem được) ---
router.get('/', genreController.getAll)
router.get('/:id', genreController.getById)
router.get('/slug/:slug', genreController.getBySlug)

// --- PROTECTED ROUTES (Chỉ Staff/Admin) ---
// Thay thế checkRole cũ bằng verifyTokenAndStaff
router.post('/', verifyTokenAndStaff, genreController.create)
router.put('/:id', verifyTokenAndStaff, genreController.updateById)
router.delete('/:id', verifyTokenAndStaff, genreController.deleteById)

module.exports = router;