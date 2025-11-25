const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth.controller')
const { verifyToken } = require('../middlewares/auth')


router.post('/google', authController.loginWithGoogle)
router.post('/facebook', authController.loginWithFacebook)


router.get('/verify-email', authController.verifyEmail)
router.get('/send-verification-email/:email', authController.sendVerificationEmail)

router.post('/register', authController.register)
router.post('/login-bookstore', authController.loginBookStore)
router.post('/forgot-password', authController.handleForgotPassword)
router.patch('/reset-password', authController.handleResetPassword)

router.post('/refresh-token', authController.handleRefreshToken)
router.get('/me', verifyToken, authController.getCurrentUser)
router.get('/logout', verifyToken, authController.handleLogout)


module.exports = router;
