const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Product = require('../models/product')

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id')
        .exec()
        .then(result => {
            const response = {
                count: result.length,
                products: result.map(result => {
                    return {
                        name: result.name,
                        price: result.price,
                        _id: result._id,
                        request: {
                            type: 'GET',
                            url: `http://localhost:3000/products/${result._id}`
                        }
                    }
                })
            }
            res.status(200).json(response)
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.post('/', (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
    })
    product.save()
        .then(result => {
            res.status(201).json({
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/products/${result._id}`
                    }
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
        .select('name price _id')
        .exec()
        .then(result => {
            result ? res.status(200).json({
                    product: result,
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
                request: {
                    type: 'PATCH',
                    url: `http://localost:3000/products/${result._id}`
                }
            })
        }).catch(err => {
        res.status(500).json({
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
                request: {
                    type: 'DELETE',
                    url: `http://localost:3000/products/${result._id}`
                }
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router