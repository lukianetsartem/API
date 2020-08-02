const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const Product = require('../models/product')
const User = require('../models/user')

exports.getProducts = (req, res) => {
    Product.find()
        .exec()
        .then(result => {
            res.status(200).json({
                count: result.length,
                products: result.map(result => {
                    return {
                        productParams: result.productParams,
                        details: result.details,
                        productPhotos: result.productPhotos,
                        productStory: result.productStory,
                        _id: result._id,
                        productType: result.productType,
                        name: result.name,
                        price: result.price,
                        oldPrice: result.oldPrice,
                        description: result.description,
                        inStock: result.inStock,
                        productLink: result.description
                            .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                            .replace(/\s{2,}/g, " ")
                            .split(' ')
                            .join('-')
                            .toLowerCase()
                    }
                })
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.createProduct = (req, res) => {
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
                    product: result
                }
            })
        })
        .catch(err => {
            console.log(err)
            res.status(500).json({
                error: err
            })
        })
}

exports.getProductByName = (req, res) => {
    const name = req.params.name
    Product.find()
        .then(result => {
            let product = {}
            result.forEach(item => {
                const productLink = item.description.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                    .replace(/\s{2,}/g, " ")
                    .split(' ')
                    .join('-')
                    .toLowerCase()
                if (productLink === name) {
                    product = item
                }
            })
            if (product._id) {
                res.status(200).json({
                    product: product
                })
            } else {
                res.status(404).json({
                    message: 'Product doesn\'t found'
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.deleteProduct = (req, res) => {
    const id = req.params.productId
    Product.remove({_id: id})
        .exec()
        .then(() => {
            res.status(200).json({
                message: 'Product has been deleted'
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.getCart = (req, res) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            const idList = user.cart.items.map(item => item.productId)
            Promise.all(idList
                .map(id => {
                    return Product.findById(id).then(
                        product => {
                            const quantity = user.cart.items
                                .filter(item => item.productId.toString() === product._id.toString())[0].quantity

                            return {
                                modelPhoto: product.productPhotos.modelPhoto,
                                description: product.description,
                                productLink: product.description
                                    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                                    .replace(/\s{2,}/g, " ")
                                    .split(' ')
                                    .join('-')
                                    .toLowerCase(),
                                productType: product.productType,
                                oldPrice: product.oldPrice,
                                price: product.price,
                                quantity: quantity,
                                id: product._id,
                            }
                        }
                    )
                })).then(cart => {
                res.status(200).json({
                    cart: cart,
                    resultCode: 0,
                })
            })
        }).catch(err => {
        res.status(500).json({
            error: err
        })
    })
}

exports.addToCart = (req, res) => {
    const token = req.body.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            let counter = 0
            let cart = user.cart.items
            const newProduct = {
                productId: req.body.data,
                quantity: 1
            }

            cart.find(product => {
                product.productId.toString() === newProduct.productId
                    ? product.quantity++ && counter++ : undefined
            })
            counter === 0 && cart.push(newProduct)
            user.save()
                .then(() => {
                    res.status(200).json({
                        cart: user.cart.items
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.removeFromCart = (req, res) => {
    const token = req.body.token
    const id = jwt.verify(token, 'secret').id
    const productId = req.body.data

    User.findOne({_id: id})
        .then(user => {
            let cart = user.cart.items
            user.cart.items = cart.filter(product => product.productId.toString() !== productId)
            user.save()
                .then(newUser => {
                    res.status(200).json({
                        newUser: newUser
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.changeQuantity = (req, res) => {
    const token = req.body.token
    const productId = req.body.data
    const reduce = req.body.reduce
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            let cartItem = user.cart.items.filter(product => product.productId.toString() === productId)[0]
            reduce ?
                cartItem.quantity = cartItem.quantity - 1
                : cartItem.quantity = cartItem.quantity + 1

            user.save()
            res.status(200).json({
                cartItem: user.cart.items
            })
        })
}


exports.getWishList = (req, res) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            const idList = user.wishList.items.map(item => item.productId)
            Promise.all(idList
                .map(id => Product.findById(id).then(
                    product => {
                        return {
                            modelPhoto: product.productPhotos.interiorPhoto,
                            description: product.description,
                            productLink: product.description
                                .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
                                .replace(/\s{2,}/g, " ")
                                .split(' ')
                                .join('-')
                                .toLowerCase(),
                            productType: product.productType,
                            oldPrice: product.oldPrice,
                            price: product.price,
                            id: product._id,
                        }
                    }
                )))
                .then(wishList => {
                    res.status(200).json({
                        wishList: wishList
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}


exports.addToWishList = (req, res) => {
    const product = req.body.data
    const token = req.body.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            let counter = 0
            let wishList = user.wishList.items
            const newProduct = {productId: product}
            wishList.find(product => {
                product.productId.toString() === newProduct.productId
                    ? counter += 1
                    : undefined
            })
            counter === 0 && wishList.push(newProduct)
            user.save()
                .then(() => {
                    res.status(200).json({
                        wishList: user.wishList.items
                    })
                })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.editWishList = (req, res) => {
    const receivedData = req.body.data
    const token = req.body.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            const wishList = user.wishList.items
                .map(item => item.productId.toString())
            const newWishList = user.wishList.items
                .map(item => item.productId.toString())
                .concat(receivedData)
                .filter(item => receivedData.indexOf(item) < 0 || wishList.indexOf(item) < 0)
            const result = user.wishList.items
                .filter(item => newWishList.indexOf(item.productId) >= 0)

            user.wishList.items = result
            user.save()
            res.status(200).json({
                wishList: user.wishList.items
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}