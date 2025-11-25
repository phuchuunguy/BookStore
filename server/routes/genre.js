const express = require('express')
const router = express.Router()

const genreController = require('../controllers/genres.controller')
const { verifyToken, checkRole } = require('../middlewares/auth')
const { RoleEnum } = require('../utils/enum')

router.get('/', genreController.getAll)
router.get('/:id', genreController.getById)
router.get('/slug/:slug', genreController.getBySlug)
router.post('/', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), genreController.create)
router.put('/:id', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), genreController.updateById)
router.delete('/:id', verifyToken, checkRole([RoleEnum.Staff, RoleEnum.Admin]), genreController.deleteById)


module.exports = router;
