const express = require('express')
const morgan = require('morgan')
const app = express()

const productRoutes = require('./api/routes/products')
const orderRoutes = require('./api/routes/orders')

app.use('/products', productRoutes)
app.use('/orders', orderRoutes)

module.exports = app