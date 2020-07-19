const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth')

router.post('/signup', authController.signup)

router.post('/signin', authController.signin)

router.post('/logout', authController.logout)

router.post('/reset-password', authController.resetPassword)

router.post('/data', authController.resetUserData)

router.get('/data', authController.getUserData)

module.exports = router