const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)

const app = express()

const MONGODB_URL = `mongodb+srv://admin:J4aI2d@storedb-onq18.mongodb.net/storeDB?retryWrites=true&w=majority`
const store = new MongoDBStore({
    uri: MONGODB_URL,
    collection: 'sessions'
})

const shopRoutes = require('./api/routes/shop')
const authRoutes = require('./api/routes/auth')

mongoose.connect(
    MONGODB_URL,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
)
mongoose.Promise = global.Promise

app.use(morgan("dev"))
app.use(express('uploads'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(
    session(
        {
            secret: 'secret',
            resave: false,
            saveUninitialized: false,
            store: store
        }
    )
)

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    )
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({})
    }
    next()
})

app.use("/shop", shopRoutes)
app.use("/auth", authRoutes)

app.use((req, res, next) => {
    const error = new Error("Not found")
    error.status = 404
    next(error)
})

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    })
})

module.exports = app