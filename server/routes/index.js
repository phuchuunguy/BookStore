
const genreRouter = require('./genre.js')
const publisherRouter = require('./publisher')
const authorRouter = require('./author')
const bookRouter = require('./book')
const userRouter = require('./user')
const authRouter = require('./auth')

const orderRouter = require('./order')
const voucherRouter = require('./voucher')
const analyticRouter = require('./analytics')

function routes(app) {
    
    app.use('/api/v1/genres', genreRouter)
    app.use('/api/v1/publishers', publisherRouter)
    app.use('/api/v1/authors', authorRouter)
    app.use('/api/v1/books', bookRouter)
    app.use('/api/v1/users', userRouter)
    app.use('/api/v1/auth', authRouter)

    app.use('/api/v1/orders', orderRouter)
    app.use('/api/v1/vouchers', voucherRouter)
    app.use('/api/v1/analytics', analyticRouter)


    app.use('*', function(req, res) {
        res.status(404).json({
            error: 404,
            message: 'Not Found'
        })
    })
   
}

module.exports = routes