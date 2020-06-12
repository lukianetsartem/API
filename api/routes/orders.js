const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Order = require('../models/order')

router.get('/', (req, res, next) => {
    Order.find()
        .select("product quantity _id")
        .populate('product')
        .exec()
        .then(result => {
            res.status(200).json({
                count: result.length,
                resultCode: 0,
                orders: result.map(res => {
                    return {
                        _id: res._id,
                        product: res.product,
                        quantity: res.quantity,
                    }
                }),
                request: {
                    type: 'GET',
                    url: `http://localhost:3000/orders/`
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

router.post('/', (req, res, next) => {
    const order = new Order({
        _id: mongoose.Types.ObjectId(),
        product: req.body.productId,
        quantity: req.body.quantity
    })
    order
        .save()
        .then(result => {
            res.status(201).json({
                message: 'Order stored',
                resultCode: 0,
                createdOrder: {
                    _id: result._id,
                    product: result.product,
                    quantity: result.quantity,
                    resultCode: 0,
                    request: {
                        type: "POST",
                        src: `http://localhost:3000/orders/${result._id}`
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


router.get('/:orderId', (req, res, next) => {
    Order.findById(req.params.orderId)
        .exec()
        .then(order => {
            if(!order) {
                return res.status(404).json({
                    message: "Order not found"
                })
            }
            res.status(200).json({
                order: order,
                resultCode: 0,
                request: {
                    type: "GET",
                    src: `http://localhost:3000/orders/${order._id}`
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

router.delete('/:orderId', (req, res, next) => {
    Order.remove({ _id: req.params.orderId })
        .exec()
        .then(result => {
            res.status(200).json({
                message: "Order has been deleted",
                resultCode: 0,
                request: {
                    type: "DELETE",
                    url: `https://localhost:3000/orders/${req.params.orderId}`,
                    body: {
                        orderId: req.params.orderId,
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

module.exports = router