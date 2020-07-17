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
    }
})

module.exports = mongoose.model('User', userSchema)