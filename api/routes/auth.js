const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth')

router.post('/signup', authController.signup)

router.post('/signin', authController.signin)

router.post('/reset-password', authController.editPassword)

router.post('/data', authController.resetUserData)

router.get('/data/:token', authController.getDetails)

router.post('/address', authController.setAddress)

router.get('/address/:token', authController.getAddress)

module.exports = router