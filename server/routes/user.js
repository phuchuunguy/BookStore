const express = require('express')
const router = express.Router()

const userController = require('../controllers/users.controller')
const { verifyToken, checkRole } = require('../middlewares/auth')
const { RoleEnum } = require('../utils/enum')


router.get('/', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), userController.getAll)
router.get('/:userId', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), userController.getById)
router.get('/:userId/address', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), userController.getAddress)
router.get('/:userId/cart', userController.getCart)

router.post('/:userId/address', verifyToken, checkRole([RoleEnum.Customer]), userController.addAddress)
router.post('/staff', verifyToken, checkRole([RoleEnum.Admin]), userController.createStaff)

router.post('/:userId/addtocart', verifyToken, checkRole([RoleEnum.Customer]), userController.addToCart)
router.put('/:userId/cart', verifyToken, checkRole([RoleEnum.Customer]), userController.updateCart)
router.put('/:userId/status', verifyToken, checkRole([RoleEnum.Admin]), userController.updateStatus)
router.put('/:userId/avatar', verifyToken, userController.updateAvatar)

router.patch('/:userId/address/status/:addressId', verifyToken, checkRole([RoleEnum.Customer]), userController.updateDefaultAddressById)

router.put('/:userId', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), userController.updateProfileById)

router.delete('/:userId', verifyToken, checkRole([RoleEnum.Admin]), userController.deleteById)
router.delete('/:userId/address/:addressId', verifyToken, checkRole([RoleEnum.Customer]), userController.deleteAddressById)


module.exports = router;
