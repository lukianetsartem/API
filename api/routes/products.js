const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './uploads/')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    // reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/img') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

const upload = multer(
    {
        storage: storage,
        limits: {
            fileSize: 1024 * 1024 * 5
        },
        fileFilter: fileFilter
    }
)

const Product = require('../models/product')

router.get('/', (req, res, next) => {
    Product.find()
        .select('name price _id productImage')
        .exec()
        .then(result => {
            const response = {
                count: result.length,
                resultCode: 0,
                products: result.map(result => {
                    return {
                        name: result.name,
                        price: result.price,
                        _id: result._id,
                        productImage: result.productImage,
                    }
                }),
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

router.post('/', upload.single('productImage'), (req, res, next) => {
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        productImage: req.file.path
    })
    product.save()
        .then(result => {
            res.status(201).json({
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    _id: result._id,
                    resultCode: 0,
                    request: {
                        type: 'GET',
                        url: `http://localhost:3000/products/${result._id}`
                    }
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

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
        .select('name price _id productImage')
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