const express = require('express')
const router = express.Router()

const voucherController = require('../controllers/vouchers.controller')
const { verifyToken, checkRole } = require('../middlewares/auth')
const { RoleEnum } = require('../utils/enum')

router.get('/', voucherController.getAll)
router.get('/:id', voucherController.getById)
router.get('/code/:code', voucherController.getByCode)
router.post('/', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), voucherController.create)
router.put('/:id', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), voucherController.updateById)
router.delete('/:id', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), voucherController.deleteById)


module.exports = router;
