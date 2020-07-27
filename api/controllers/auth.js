const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

exports.signup = (req, res) => {
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
                            cart: {items: []},
                            wishList: {items: []},
                            address: {
                                firstName: null,
                                lastName: null,
                                address: null,
                                town: null,
                                country: null,
                                postcode: null,
                                telephone: null,
                            },
                            style: {
                                firstCategory: {
                                    name: null,
                                    percent: null,
                                },
                                secondCategory: {
                                    name: null,
                                    percent: null,
                                }
                            },
                            card: {
                                number: null,
                                name: null,
                                expiryDate: null,
                                cvv: null,
                            },
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

exports.signin = (req, res) => {
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

exports.editPassword = (req, res) => {
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

exports.editUserData = (req, res) => {
    const firstName = req.body.data.firstName
    const lastName = req.body.data.lastName
    const password = req.body.data.password
    const email = req.body.data.email

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
                                    data: {
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

exports.getUserData = (req, res) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            return res.status(200).json({
                data: {
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


exports.setAddress = (req, res) => {
    const address = req.body.data

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
                .then(() => {
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

exports.getAddress = (req, res) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

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

exports.setStyle = (req, res) => {
    if (req.body.data.length === 7) {
        // Style categories
        const scandinavian = "Scandinavian"
        const industrial = "Industrial"
        const modern = "Modern"
        const retro = "Retro"

        // Sorting data by categories
        const filter = (category) => {
            return req.body.data.filter(i => i === category)
        }
        const data = {
            scandinavianArr: filter(scandinavian),
            industrialArr: filter(industrial),
            modernArr: filter(modern),
            retroArr: filter(retro),
        }
        // Sort from highest to lowest
        const sorted = [
            data.scandinavianArr.length,
            data.industrialArr.length,
            data.modernArr.length,
            data.retroArr.length
        ].sort((a, b) => b - a)
        // Sorted data values
        const dataValues = Object.values(data)

        let result = {
            firstCategory: {
                name: '',
                percent: 0
            },
            secondCategory: {
                name: '',
                percent: 0
            }
        }

        // Result filling
        let firstLength = 0
        let secondLength = 0
        for (const category of dataValues) {
            // If item highest in data, return him into result
            if (category.length === sorted[0]) {
                result.firstCategory.name = category[0]
                firstLength = category.length
            }
            // If item second by highest in data, return him into result
            if (category.length === sorted[1] && result.secondCategory.name === '') {
                result.secondCategory.name = category[0]
                secondLength = category.length
            }
        }
        // Calculating percent of categories
        result.firstCategory.percent = Math.floor(100 / (firstLength + secondLength) * firstLength)
        result.secondCategory.percent = Math.floor(100 / (firstLength + secondLength) * secondLength)

        const token = req.body.token
        const id = jwt.verify(token, 'secret').id

        const resultPhotos = [
            'https://images.prismic.io/made/fa3f86daa56da84a06a92480557a4442b579798f_039_planche.jpg?auto=compress,format',
            'https://images.prismic.io/made/e37af85a183dedc597a5faae3e43fb49f3bf324e_29_planche.jpg?auto=compress,format',
            'https://images.prismic.io/made/411bb3e8443caa168f5fa06a182a50b5e3213a21_169_planche.jpg?auto=compress,format',
            'https://images.prismic.io/made/e646a2aa236dcbae2915ec9282bc1887d2c6a01e_178_planche.jpg?auto=compress,format',
            'https://images.prismic.io/made/6cc27f361471f39acee6d1c7733f58620db41a12_071_planche.jpg?auto=compress,format',
            'https://images.prismic.io/made/eefd87b19c037c33b7f215971bda6876a98c33cf_091_planche.jpg?auto=compress,format',
        ]

        User.findOne({_id: id})
            .then(user => {
                user.style = result
                user.save()
                res.status(200).json({
                    message: 'Style analysis succeed',
                    style: user.style,
                    resultPhotos: resultPhotos,
                    resultCode: 0,
                })
            })
            .catch(err => {
                res.status(500).json({
                    resultCode: 1,
                    error: err
                })
            })
    } else {
        return res.status(400).json({
            message: 'Not enough data, to analyse client style',
            resultCode: 1,
        })
    }
}

exports.getStyle = (req, res, next) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

    const resultPhotos = [
        'https://images.prismic.io/made/fa3f86daa56da84a06a92480557a4442b579798f_039_planche.jpg?auto=compress,format',
        'https://images.prismic.io/made/e37af85a183dedc597a5faae3e43fb49f3bf324e_29_planche.jpg?auto=compress,format',
        'https://images.prismic.io/made/411bb3e8443caa168f5fa06a182a50b5e3213a21_169_planche.jpg?auto=compress,format',
        'https://images.prismic.io/made/e646a2aa236dcbae2915ec9282bc1887d2c6a01e_178_planche.jpg?auto=compress,format',
        'https://images.prismic.io/made/6cc27f361471f39acee6d1c7733f58620db41a12_071_planche.jpg?auto=compress,format',
        'https://images.prismic.io/made/eefd87b19c037c33b7f215971bda6876a98c33cf_091_planche.jpg?auto=compress,format',
    ]

    User.findOne({_id: id})
        .then(user => {
            res.status(200).json({
                style: user.style,
                analysePhotos: photos,
                resultPhotos: resultPhotos,
                resultCode: 0,
            })
        })
        .catch(err => {
            res.status(500).json({
                resultCode: 1,
                error: err
            })
        })

    const photos = [
        {
            photo: 'https://images.prismic.io/made/a2697b4b1a211c857d7c490f4ca8da3ea65dcae0_36294.jpg?auto=compress,format',
            category: 'Industrial'
        },
        {
            photo: 'https://images.prismic.io/made/4c324a7898937c633f17e44da8b3d3a2fee3832b_madecommaster_2019-01-09_3112583546.jpeg?auto=compress,format',
            category: 'Industrial'
        },
        {
            photo: 'https://images.prismic.io/made/b4c0d0b468ac3a4ba597f11c5901bb06fe1090cc_f91f221d97893adba7aa7bf1d0045237589aec60__mg_9396.jpg?auto=compress,format',
            category: 'Industrial'
        },
        {
            photo: 'https://images.prismic.io/made/8292f1ae6ffbc8455e334b0b73b8ab37b33da42f_madecommaster_2019-01-09_3112567690.jpeg?auto=compress,format',
            category: 'Industrial'
        },
        {
            photo: 'https://images.prismic.io/made/0a60055bc96462de4736db474fea3e228041b3f5_32483.jpg?auto=compress,format',
            category: 'Industrial'
        },
        {
            photo: 'https://images.prismic.io/made/d171665d38ed6794e72ead09cb8133807768267c_35192.jpg?auto=compress,format',
            category: 'Modern'
        },
        {
            photo: 'https://images.prismic.io/made/9be2dd1488686370ee9ede46c943d9f34d14b73d_34655.jpg?auto=compress,format',
            category: 'Modern'
        },
        {
            photo: 'https://images.prismic.io/made/508e3fb1c8fb5962d3f4b0554b7d695570eb78e0_1906.jpg?auto=compress,format',
            category: 'Modern'
        },
        {
            photo: 'https://images.prismic.io/made/7e1a31388448d8531139d6070bf904dc5424b24e_eccb469fd25d7fcc2fd79c2f872493325c002a19_catesthill_hometour_finals0f9a5239.jpg?auto=compress,format',
            category: 'Modern'
        },
        {
            photo: 'https://images.prismic.io/made/8c36429a025b3de273bb5ac59b9fefe17322d685_01-retro-living.jpg?auto=compress,format',
            category: 'Modern'
        },

        {
            photo: 'https://images.prismic.io/made/035bb21c03be8abd5d9c9abe14bfc78a79ff1f92_merve.ayhan245_2019-02-25_3148354420.jpg?auto=compress,format',
            category: 'Scandinavian'
        },
        {
            photo: 'https://images.prismic.io/made/fa0dc1dcfd02cb16c0c90392f13779c393f7d9ad_bodieandfou_2019-03-03_3152807236.jpg?auto=compress,format',
            category: 'Scandinavian'
        },
        {
            photo: 'https://images.prismic.io/made/ec45e6900e95cb3e026e2f32f2280126b085b277_31d33831b08f9f0faeab8afc415365949fef38b6_anders_170520_459_ma.jpg?auto=compress,format',
            category: 'Scandinavian'
        },
        {
            photo: 'https://images.prismic.io/made/9723055cee9a476a995f6d2c8ce9b370589b2f3d_hej.mia_2018-10-12_3049341554.jpg?auto=compress,format',
            category: 'Scandinavian'
        },
        {
            photo: 'https://images.prismic.io/made/17cf06190bd712c28d5e7c58d4ed89fc9f408ab4_32255.jpg?auto=compress,format',
            category: 'Scandinavian'
        },
        {
            photo: 'https://images.prismic.io/made/81bd6ab7b953551bc9cca95fd8b37f52829beb08_926.jpg?auto=compress,format',
            category: 'Retro',
        },
        {
            photo: 'https://images.prismic.io/made/3c791c11845e78946d945ab837e5b9868023577c_b914484a35dc8f626935149c182bd7395463dd5a_portrait16.jpg?auto=compress,format',
            category: 'Retro',
        },
        {
            photo: 'https://images.prismic.io/made/f222eb18c6c260aac838ed7260521cc2e6a5666c_044e8daa52bfe46b58e97be519d025608cd427ea_17.jpg?auto=compress,format',
            category: 'Retro',
        }
    ]
}

exports.deleteStyle = (req, res) => {
    const token = req.params.token
    const id = jwt.verify(token, 'secret').id

    User.findOne({_id: id})
        .then(user => {
            user.style = {
                firstCategory: {
                    name: null,
                    percent: null,
                },
                secondCategory: {
                    name: null,
                    percent: null,
                }
            }
            user.save()
            res.status(200).json({
                message: 'Style zeroed',
                style: user.style,
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