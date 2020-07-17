const express = require('express')
const router = express.Router()

const productController = require('../controllers/product');

router.get('/', productController.getProducts)

router.get('/:productId', productController.getProductById)

router.post('/', productController.createProduct)

router.patch('/:productId', productController.updateProduct)

router.delete('/:productId', productController.deleteProduct)


module.exports = router