const express = require('express')
const router = express.Router()

const productController = require('../controllers/shop')

router.get('/products', productController.getProducts)

router.get('/products/:productId', productController.getProductById)

router.post('/products', productController.createProduct)

router.patch('/products/:productId', productController.updateProduct)

router.delete('/products/:productId', productController.deleteProduct)

module.exports = router