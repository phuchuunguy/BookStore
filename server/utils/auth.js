const jwt = require('jsonwebtoken');

const generateAccessToken = (data) => {
    return jwt.sign(data, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
}

const generateRefreshToken  = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: '7d' })
}

const generateVerifyCode = (data) => {
    return jwt.sign(data, process.env.JWT_ACCESS_TOKEN_SECRET, { expiresIn: '15m' })
}


module.exports = { generateAccessToken, generateRefreshToken, generateVerifyCode }