const express = require('express')
const router = express.Router()

const publisherController = require('../controllers/publishers.controller')


router.get('/', publisherController.getAll)
router.get('/:id', publisherController.getById)
router.post('/', publisherController.create)
router.put('/:id', publisherController.updateById)
router.delete('/:id', publisherController.deleteById)


module.exports = router;
