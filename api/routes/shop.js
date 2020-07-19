const express = require('express')
const router = express.Router()

const productController = require('../controllers/shop')

// Products routes

router.get('/products', productController.getProducts)

router.get('/products/:productId', productController.getProductById)

router.post('/products', productController.createProduct)

router.patch('/products/:productId', productController.updateProduct)

router.delete('/products/:productId', productController.deleteProduct)

// Cart routes

router.post('/cart/:productId', productController.addToCart)

router.delete('/cart/:productId', productController.removeFromCart)

// Wish list routes

router.post('/wishlist/:productId', productController.addToWishList)

router.delete('/wishlist/:productId', productController.removeFromWishList)

module.exports = router