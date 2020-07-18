const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

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
                            cart: {items: []}
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
            bcrypt
                .compare(password, user[0].password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        req.session.save()
                        return res.status(200).json({
                            message: 'Auth successful',
                            resultCode: 0,
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

exports.logout = (req, res, next) => {
    req.session.destroy(err => {
        err ? console.log(err)
            : res.status(200).json({
                message: 'Logout successful',
                resultCode: 0,
            })
    })
}

exports.resetPassword = (req, res, next) => {
    const password = req.body.password
    const newPassword = req.body.newPassword
    const userId = req.body.userId

    User.findOne({_id: userId})
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
                    })
                })
        })
}

exports.resetUserData = (req, res, next) => {
    const firstName = req.body.firstName
    const lastName = req.body.lastName
    const password = req.body.password
    const email = req.body.email
    const userId = req.body.userId

    User.findOne({_id: userId})
        .then(user => {
            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        user.firstName = firstName
                        user.lastName = lastName
                        user.email = email
                        user.save()
                            .then(result => {
                            return res.status(200).json({
                                result: result,
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

exports.getUserData = (req, res, next) => {
    if(req.session.isLoggedIn) {
        return res.status(200).json({
            user: req.session.user[0],
            resultCode: 0
        })
    } else {
        return res.status(401).json({
            message: "Auth failed",
            resultCode: 1
        })
    }
}