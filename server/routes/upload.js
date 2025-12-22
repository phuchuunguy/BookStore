const express = require('express')
const router = express.Router()
const multer = require('multer')
const uploadController = require('../controllers/upload.controller')

const storage = multer.memoryStorage()
const upload = multer({ storage })

router.post('/', upload.single('file'), uploadController.uploadImage)

module.exports = router
