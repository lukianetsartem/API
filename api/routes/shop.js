const express = require('express')
const router = express.Router()

const productController = require('../controllers/shop')

// Products routes

router.get('/products', productController.getProducts)

router.get('/products/:name', productController.getProductByName)

router.post('/products', productController.createProduct)

router.delete('/products/:productId', productController.deleteProduct)

// Cart routes

router.get('/cart/:token', productController.getCart)

router.post('/cart/add', productController.addToCart)

router.post('/cart/quantity', productController.changeQuantity)

router.post('/cart/remove', productController.removeFromCart)

// Wish list routes

router.get('/wishlist/:token', productController.getWishList)

router.post('/wishlist/add', productController.addToWishList)

router.post('/wishlist/edit', productController.editWishList)

module.exports = router