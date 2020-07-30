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

router.get('/cart', productController.getCart)

router.post('/cart/:productId', productController.addToCart)

router.delete('/cart/:productId', productController.removeFromCart)

// Wish list routes

router.get('/wishlist/:token', productController.getWishList)

router.post('/wishlist/add', productController.addToWishList)

router.post('/wishlist/edit', productController.editWishList)

module.exports = router