const express = require('express')
const router = express.Router()

const publisherController = require('../controllers/publishers.controller')

// Import middleware mới
const { verifyTokenAndStaff } = require('../middlewares/auth')

// Ai cũng xem được
router.get('/', publisherController.getAll)
router.get('/:id', publisherController.getById)

// Bảo vệ các route này: Chỉ Staff/Admin mới được làm
router.post('/', verifyTokenAndStaff, publisherController.create)
router.put('/:id', verifyTokenAndStaff, publisherController.updateById)
router.delete('/:id', verifyTokenAndStaff, publisherController.deleteById)

module.exports = router;