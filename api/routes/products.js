const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const checkAuth = require('../middleware/checkAuth')
const Product = require('../models/product')

router.get('/', (req, res, next) => {
    Product.find()
        .exec()
        .then(result => {
            const response = {
                count: result.length,
                resultCode: 0,
                products: result.map(result => result),
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/products/`
                }
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.status(500).json({
                resultCode: 1,
                error: err
            })
        })
})

router.post('/',(req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        productType: req.body.productType,
        name: req.body.name,
        price: req.body.price,
        salePrice: req.body.salePrice,
        description: req.body.description,
        inStock: req.body.inStock,
        productParams: {
            height: req.body.height,
            width: req.body.width,
            depth: req.body.depth,
            weight: req.body.weight,
            size: req.body.size,
        },
        details: {
            assembly: req.body.assembly,
            fabricComposition: req.body.fabricComposition,
            foamType: req.body.foamType,
            care: req.body.care,
        },
        productPhotos: {
            modelPhoto: req.body.modelPhoto,
            interiorPhoto: req.body.interiorPhoto,
            sizePhoto: req.body.sizePhoto,
            additionalPhotos: req.body.additionalPhotos,
            houseProudPhotos: req.body.houseProudPhotos,
        },
        productStory: {
            storyHeader: req.body.storyHeader,
            storyText: req.body.storyText,
        }
    })
    product.save()
        .then(result => {
            res.status(201).json({
                createdProduct: {
                    product: result,
                    resultCode: 0,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/products/${result._id}`
                    }
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                resultCode: 1,
                error: err
            })
        })
})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
        .exec()
        .then(result => {
            result ? res.status(200).json({
                    product: result,
                    resultCode: 0,
                    request: {
                        type: 'GET',
                        url: `http://localost:3000/products/${result._id}`
                    }
                })
                : res.status(404).json({
                    message: 'No valid entry found for provided ID'
                })
        })
        .catch(err => {
            res.status(500).json({
                resultCode: 1,
                error: err
            })
        })
})

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId
    const updateOps = {} // Object with new product properties
    for (const ops of req.body) { // Iterate through array of product properties
        updateOps[ops.propertyName] = ops.value // propertyName - name of product property, that you want to edit, value - him value
    }
    Product.update(
        {_id: id},
        {$set: updateOps})
        .exec()
        .then(result => {
            res.status(200).json({
                product: result,
                message: 'Product has been updated',
                resultCode: 0,
                value: updateOps,
                request: {
                    type: 'PATCH',
                    url: `http://localost:3000/products/${result._id}`
                }
            })
        }).catch(err => {
        res.status(500).json({
            resultCode: 1,
            error: err
        })
    })
})

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product has been deleted',
                resultCode: 0,
                request: {
                    type: 'DELETE',
                    url: `http://localost:3000/products/${result._id}`
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                resultCode: 1,
                error: err
            })
        })
})

module.exports = router