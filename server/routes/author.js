const express = require('express')
const router = express.Router()

const authorController = require('../controllers/authors.controller')

// Import middleware mới
const { verifyTokenAndStaff } = require('../middlewares/auth')

// Public (Ai cũng xem được)
router.get('/', authorController.getAll)
router.get('/:id', authorController.getById)

// Protected (Chỉ Staff/Admin)
router.post('/', verifyTokenAndStaff, authorController.create)
router.put('/:id', verifyTokenAndStaff, authorController.updateById)
router.delete('/:id', verifyTokenAndStaff, authorController.deleteById)

module.exports = router;