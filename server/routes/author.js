const express = require('express')
const router = express.Router()

const authorController = require('../controllers/authors.controller')
const { verifyToken, checkRole } = require('../middlewares/auth')
const { RoleEnum } = require('../utils/enum')

router.get('/', authorController.getAll)
router.get('/:id', authorController.getById)
router.post('/',  verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), authorController.create)
router.put('/:id',  verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), authorController.updateById)
router.delete('/:id',  verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), authorController.deleteById)


module.exports = router;
