const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = (req, res, next) => {
    const login = req.body.login
    const email = req.body.email

    User.find({email: email} || {login: login})
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: 'This email already exists'
                })
            } else {
                bcrypt.hash(req.body.password, 10)
                    .then(hashedPassword => {
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            login: login,
                            email: email,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            password: hashedPassword,
                            promotions: req.body.promotions,
                            admin: false,
                            address: {
                                firstName: null,
                                lastName: null,
                                address: null,
                                town: null,
                                country: null,
                                postcode: null,
                                telephone: null,
                            },
                            card: {
                                number: null,
                                name: null,
                                expiryDate: null,
                                cvv: null,
                            },
                            cart: {items: []},
                            wishList: {items: []},
                        })
                        return user.save()
                    })
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

exports.signin = (req, res, next) => {
    const login = req.body.login
    const password = req.body.password

    User.find({login: login})
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'User doesn\'t exist'
                })
            }
            bcrypt.compare(password, user[0].password)
                .then(doMatch => {
                    if (doMatch) {
                        const token = jwt.sign({
                            id: user[0]._id,
                        }, 'secret', {
                            expiresIn: "60 days"
                        })
                        return res.status(200).json({
                            message: 'Auth successful',
                            token: token,
                            resultCode: 0,
                        })
                    } else if (!doMatch) {
                        return res.status(401).json({
                            message: 'Incorrect password',
                            resultCode: 1,
                        })
                    }
                })
                .catch(err => {
                    return res.status(500).json({
                        error: err,
                        resultCode: 1,
                    })
                })
        })
}

exports.editPassword = (req, res, next) => {
    const password = req.body.data.currentPassword
    const newPassword = req.body.data.newPassword

    const token = req.body.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        bcrypt.hash(newPassword, 10)
                            .then(hashedPassword => {
                                user.password = hashedPassword
                                return user.save()
                            })
                            .then(result => {
                                return res.status(200).json({
                                    user: result,
                                    message: 'Password reset success',
                                    resultCode: 0,
                                })
                            })
                    } else {
                        return res.status(401).json({
                            message: 'Incorrect password',
                            resultCode: 1,
                        })
                    }
                })
                .catch(err => {
                    return res.status(500).json({
                        error: err,
                        resultCode: 1,
                        id: id
                    })
                })
        })
}

/*

 */

exports.resetUserData = (req, res, next) => {
    const firstName = req.body.details.firstName
    const lastName = req.body.details.lastName
    const password = req.body.details.password
    const email = req.body.details.email

    const token = req.body.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        user.firstName = firstName
                        user.lastName = lastName
                        user.email = email
                        user.save()
                            .then(() => {
                                return res.status(200).json({
                                    details: {
                                        firstName: user.firstName,
                                        lastName: user.lastName,
                                        email: user.email,
                                    },
                                    message: 'Change user data success',
                                    resultCode: 0,
                                })
                            })
                    } else {
                        return res.status(401).json({
                            message: 'Incorrect password',
                            resultCode: 1,
                        })
                    }
                })
                .catch(err => {
                    return res.status(500).json({
                        error: err,
                        resultCode: 1,
                    })
                })
        })
}

exports.getDetails = (req, res, next) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            return res.status(200).json({
                details: {
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
                resultCode: 0
            })
        })
        .catch(err => {
            return res.status(500).json({
                error: err,
                resultCode: 1,
            })
        })
}


exports.setAddress = (req, res, next) => {
    const address = req.body.data
    console.log(address)
    const token = req.body.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            user.address.firstName = address.firstName
            user.address.lastName = address.lastName
            user.address.address = address.address
            user.address.town = address.town
            user.address.country = address.country
            user.address.postcode = address.postcode
            user.address.telephone = address.telephone
            user.save()
                .then(newUser => {
                    console.log(newUser.address)
                    return res.status(200).json({
                        message: 'Address saved',
                        address: user.address,
                        resultCode: 0
                    })
                })
                .catch(err => {
                    return res.status(500).json({
                        error: err,
                        resultCode: 1,
                    })
                })
        })
}

exports.getAddress = (req, res, next) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

    console.log(id)
    User.findOne({_id: id})
        .then(user => {
            return res.status(200).json({
                address: user.address,
                resultCode: 0
            })
        })
        .catch(err => {
            return res.status(500).json({
                error: err,
                resultCode: 1,
            })
        })
}