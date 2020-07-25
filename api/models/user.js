const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    login: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/ },
    password: { type: String, required: true },
    promotions: { type: Boolean, required: true },
    admin: { type: Boolean, required: true },
    address: {
        firstName: { type: String, required: false },
        lastName: { type: String, required: false },
        address: { type: String, required: false },
        town: { type: String, required: false },
        country: { type: String, required: false },
        postcode: { type: String, required: false },
        telephone: { type: String, required: false },
    },
    card: {
        number: { type: String, required: false },
        name: { type: String, required: false },
        expiryDate: { type: String, required: false },
    },
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: { type: Number, required: true }
            }
        ]
    },
    wishList: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                }
            }
        ]
    }
})

module.exports = mongoose.model('User', userSchema)