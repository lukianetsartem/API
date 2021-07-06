const mongoose = require('mongoose')

const productSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    productType: {type: String, required: true},
    name: {type: String, required: true},
    price: {type: Number, required: true},
    oldPrice: {type: Number, required: false},
    description: {type: String, required: true},
    inStock: {type: Number, required: true},
    color: {type: String, required: true},
    productParams: {
        height: {type: Number, required: true},
        width: {type: Number, required: true},
        depth: {type: Number, required: true},
        weight: {type: Number, required: true},
        size: {type: Number, required: true},
    },
    details: {
        assembly: {type: String, required: true},
        fabricComposition: {type: String, required: true},
        foamType: {type: String, required: true},
        care: {type: String, required: true},
    },
    productPhotos: {
        modelPhoto: {type: String, required: true},
        interiorPhoto: {type: String, required: true},
        sizePhoto: {type: String, required: true},
        additionalPhotos: {type: Array, required: false},
        houseProudPhotos: {type: Array, required: false},
    },
    productStory: {
        storyHeader: {type: String, required: true},
        storyText: {type: String, required: true},
    }
})

module.exports = mongoose.model('Product', productSchema)