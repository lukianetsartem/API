const mongoose = require('mongoose')
const Product = require('../models/product')
const User = require('../models/user')

exports.getProducts = (req, res, next) => {
    Product.find()
        .exec()
        .then(result => {
            res.status(200).json({
                count: result.length,
                resultCode: 0,
                products: result.map(result => result)
            })
        })
        .catch(err => {
            res.status(500).json({
                resultCode: 1,
                error: err
            })
        })
}

exports.createProduct = (req, res, next) => {
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
}

exports.getProductById = (req, res, next) => {
    const id = req.params.productId
    Product.findById(id)
        .exec()
        .then(result => {
            result ? res.status(200).json({
                    product: result,
                    resultCode: 0,
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
}

exports.updateProduct = (req, res, next) => {
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
            })
        }).catch(err => {
        res.status(500).json({
            resultCode: 1,
            error: err
        })
    })
}

exports.deleteProduct = (req, res, next) => {
    const id = req.params.productId
    Product.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'Product has been deleted',
                resultCode: 0,
            })
        })
        .catch(err => {
            res.status(500).json({
                resultCode: 1,
                error: err
            })
        })
}

exports.addToCart = (req, res, next) => {
    const user = req.session.user[0]._id

    if (req.session.isLoggedIn) {
        User.findOne({_id: user})
            .then(user => {
                let counter = 0
                let cart = user.cart.items
                const newProduct = {productId: req.params.productId, quantity: 1}
                cart.find(product => {
                    product.productId == newProduct.productId
                        ? product.quantity++ && counter++ : undefined
                })
                counter === 0 && cart.push(newProduct)
                user.save()
                    .then(() => {
                        res.status(200).json({
                            cart: user.cart.items,
                            resultCode: 0,
                        })
                    })
            })
    } else {
        res.status(401).json({
            message: 'Auth failed',
            resultCode: 1,
        })
    }
}

exports.removeFromCart = (req, res, next) => {
    const user = req.session.user[0]._id
    const productId = req.params.productId

    if (req.session.isLoggedIn) {
        User.findOne({_id: user})
            .then(user => {
                let cart = user.cart.items
                user.cart.items = cart.filter(product => product.productId != productId)
                user.save()
                    .then(newUser => {
                        res.status(200).json({
                            newUser: newUser,
                            resultCode: 0,
                        })
                    })
            })
    } else {
        return res.status(401).json({
            message: 'Auth failed',
            resultCode: 1,
        })
    }
}

exports.addToWishList = (req, res, next) => {
    const user = req.session.user[0]._id

    if (req.session.isLoggedIn) {
        User.findOne({_id: user})
            .then(user => {
                let counter = 0
                let wishList = user.wishList.items
                const newProduct = {productId: req.params.productId}
                wishList.find(product => {
                    product.productId == newProduct.productId
                        ? counter += 1
                        : undefined
                })
                counter === 0 && wishList.push(newProduct)
                user.save()
                    .then(() => {
                        res.status(200).json({
                            wishList: user.wishList.items,
                            resultCode: 0,
                        })
                    })
            })
    } else {
        res.status(401).json({
            message: 'Auth failed',
            resultCode: 1,
        })
    }
}

exports.removeFromWishList = (req, res, next) => {
    const user = req.session.user[0]._id
    const productId = req.params.productId

    if (req.session.isLoggedIn) {
        User.findOne({_id: user})
            .then(user => {
                let wishList = user.wishList.items
                user.wishList.items = wishList.filter(product => product.productId != productId)
                user.save()
                    .then(() => {
                        res.status(200).json({
                            wishList: user.wishList.items,
                            resultCode: 0,
                        })
                    })
            })
    } else {
        return res.status(401).json({
            message: 'Auth failed',
            resultCode: 1,
        })
    }
}