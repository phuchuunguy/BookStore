const express = require('express')
const router = express.Router()

const orderController = require('../controllers/orders.controller')
const { verifyToken, checkRole } = require('../middlewares/auth')
const { RoleEnum } = require('../utils/enum')

router.get('/', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), orderController.getAll)
router.get('/:id', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), orderController.getById)

router.post("/thanhtoan/momo/verify", orderController.verifyMoMo)
router.post('/thanhtoan/momo', orderController.getPayUrlMoMo)
router.post('/', orderController.create)

router.put('/:id/order-status', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), orderController.updateOrderStatus)
router.put('/:id/paymentid', verifyToken, orderController.updatePaymentId)
// router.delete('/:id', orderController.deleteById)

module.exports = router;
