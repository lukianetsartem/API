const express = require('express')
const router = express.Router()

const authController = require('../controllers/auth')

router.post('/signup', authController.signup)

router.post('/signin', authController.signin)

router.post('/reset-password', authController.editPassword)

router.post('/data', authController.editUserData)

router.get('/data/:token', authController.getUserData)

router.post('/address', authController.setAddress)

router.get('/address/:token', authController.getAddress)

router.post('/style', authController.setStyle)

router.get('/style/:token', authController.getStyle)

router.delete('/style/:token', authController.deleteStyle)

module.exports = router