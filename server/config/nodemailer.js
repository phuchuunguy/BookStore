const nodemailer = require('nodemailer')
const { google } = require('googleapis')
require('dotenv').config()

const OAuth2 = google.auth.OAuth2

const OAuth2Client = new OAuth2(
    process.env.GOOGLE_GMAIL_CLIENT_ID,
    process.env.GOOGLE_GMAIL_CLIENT_SECRET,
    process.env.GOOGLE_GMAIL_REDIRECT_URI
)

OAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_GMAIL_REFRESH_TOKEN
})

const accessToken = new Promise((resolve, reject) => {
    OAuth2Client.getAccessToken((err, token) => {
        if (err) reject(err)
        resolve(token)
    })
})

const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        type: 'OAuth2',
        user: 'project.php.nhncomputer@gmail.com',
        clientId: process.env.GOOGLE_GMAIL_CLIENT_ID,
        accessToken,
        clientSecret: process.env.GOOGLE_GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_GMAIL_REFRESH_TOKEN
    }
})

module.exports = { transporter }