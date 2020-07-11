const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1]
        req.userData = jwt.verify(token, "SnyGacB9cq3qT3zqO1Ee3mOaUEK349rRCbC")
        next()
    } catch (error) {
        return res.status(401).json({
            message: 'Auth failed'
        })
    }
}