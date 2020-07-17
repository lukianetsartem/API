const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const User = require('../models/user')

exports.postSignup = (req, res, next) => {
    User.find({email: req.body.email} || {login: req.body.login})
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
                            login: req.body.login,
                            firstName: req.body.firstName,
                            lastName: req.body.lastName,
                            email: req.body.email,
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

exports.postSignin = (req, res, next) => {
    User.find({login: req.body.login})
        .then(user => {
            if (!user) {
                return res.status(404).json({
                    message: 'User doesn\'t exist'
                })
            }
            bcrypt
                .compare(req.body.password, user[0].password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        req.session.save()
                        res.status(200).json({
                            message: 'Auth successful',
                            resultCode: 0,
                        })
                    }
                })
                .catch(err => {
                    return res.status(401).json({
                        message: 'Auth failed',
                        error: err
                    })
                })
        })
}
