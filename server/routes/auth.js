const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth.controller')

// Import middleware xác thực cơ bản
const { verifyToken } = require('../middlewares/auth')

// Các route đăng nhập/đăng ký (Public)
router.post('/google', authController.loginWithGoogle)
router.post('/facebook', authController.loginWithFacebook)
router.post('/register', authController.register)
router.post('/login-bookstore', authController.loginBookStore)
router.post('/forgot-password', authController.handleForgotPassword)
router.patch('/reset-password', authController.handleResetPassword)
router.post('/refresh-token', authController.handleRefreshToken)

// Các route xác thực email
router.get('/verify-email', authController.verifyEmail)
router.get('/send-verification-email/:email', authController.sendVerificationEmail)

// Các route cần đăng nhập (Protected)
router.get('/me', verifyToken, authController.getCurrentUser)
router.get('/logout', verifyToken, authController.handleLogout)

module.exports = router;