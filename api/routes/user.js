const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'This email already exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10, (err, hash) => {
                    if (err) {
                        return res.status(500).json({
                            error: err
                        })
                    } else {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            login: req.body.login,
                            email: req.body.email,
                            password: hash,
                        })
                        user.save()
                            .then(result => {
                                res.status(201).json({
                                    message: 'User created',
                                    user: result,
                                    resultCode: 0
                                })
                            })
                            .catch(err => {
                                res.status(500).json({
                                    resultCode: 1,
                                    error: err
                                })
                            })
                    }
                })
            }
        })
})

router.post('/login', (req, res, next) => {
    User.find({login: req.body.login})
        .exec()
        .then(user => {
            if (user.length < 1) {
                return res.status(404).json({
                    message: 'User doesn\'t exist'
                })
            }
            bcrypt.compare(req.body.password, user[0].password, (err, result) => {
                if (err) {
                    return res.status(401).json({
                        message: 'Auth failed'
                    })
                } else if (result) {
                    const token = jwt.sign(
                        {
                            email: user[0].email,
                            userId: user[0]._id
                        },
                        'SnyGacB9cq3qT3zqO1Ee3mOaUEK349rRCbC',
                        {
                            expiresIn: "1h"
                        }
                    )
                    return res.status(200).json({
                        message: 'Auth successful',
                        token: token
                    })
                }
            })
        })
})

router.delete('/:userId', (req, res, next) => {
    User.remove({_id: req.params.userId})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User has been deleted'
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
})

module.exports = router