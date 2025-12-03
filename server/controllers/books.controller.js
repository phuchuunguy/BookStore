const bookService = require('../services/books.service')
const redis = require('../config/redis')
const { cloudinary } = require('../config/cloudinary')

const bookController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 0
            const sort = req.query.sort ? req.query.sort : { createdAt: -1 }
            
            // --- XỬ LÝ QUAN TRỌNG TẠI ĐÂY ---
            // Frontend gửi lên: ?query={"genre":{"$in":["1"]}} (Dạng chuỗi)
            // Backend cần đổi nó thành Object để dùng được.
            let queryObj = {};
            if (req.query.query) {
                try {
                    // Nếu là chuỗi thì Parse, nếu là Object rồi thì giữ nguyên
                    queryObj = typeof req.query.query === 'string' 
                        ? JSON.parse(req.query.query) 
                        : req.query.query;
                    
                } catch (err) {
                    console.log('Lỗi parse query params:', err.message);
                    queryObj = {}; // Nếu lỗi format thì coi như không lọc
                }
            }
            // --------------------------------

            // Tạo Key Redis dựa trên Object đã được làm sạch
            const key = `Book::${JSON.stringify({queryObj, page, limit, sort})}`

            let count, data, totalPage

            try {
                const cache = await redis.get(key)

                if (cache) {
                    const json = JSON.parse(cache)
                    count = json.count
                    data = json.data
                } else {
                    // Truyền queryObj (đã là Object) vào Service
                    const [countNum, bookList] = await bookService.getAll({query: queryObj, page, limit, sort})
                    count = countNum
                    data = bookList
                    // Lưu vào Redis
                    redis.setex(key, 600, JSON.stringify({count, data}))
                }

            } catch (error) {
                // Nếu Redis lỗi hoặc Service lỗi, gọi trực tiếp Service để lấy data (Fallback)
                console.log('Cache/Service error, fetching direct:', error.message)
                const [countNum, bookList] = await bookService.getAll({query: queryObj, page, limit, sort})
                count = countNum
                data = bookList
            }

            totalPage = Math.ceil(count / (limit || 1)) // Tránh chia cho 0 nếu limit = 0
            
            res.status(200).json({
                message: 'success',
                error: 0,
                data,
                count,
                pagination: {
                    page,
                    limit,
                    totalPage,
                }
            })
        } catch (error) {
            console.error("Controller Global Error:", error);
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    getByBookId: async(req, res) => {
        try {
            const { bookId } = req.params
            const data = await bookService.getByBookId(bookId) 

            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy sách!',
                    error: 1,
                    data
                })
            }
        } catch (error) {
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    getById: async(req, res) => {
        try {
            const { id } = req.params
           const data = await bookService.getById(id)

            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                res.status(404).json({
                    message: 'Không tìm thấy sách!',
                    error: 1,
                    data
                })
            }
        } catch (error) {
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    getBySlug: async(req, res) => {
        try {
            const { slug } = req.params
            let response
            const key = `Book::${slug}`

            try {
                const cache = await redis.get(key)
                if (cache) {
                    response = JSON.parse(cache).response
                } else {
                    response = await bookService.getBySlug(slug)
                    redis.setex(key, 600, JSON.stringify({response}))
                }
            } catch (error) {
                response = await bookService.getBySlug(slug)
                console.log('Redis error::::' + error.message)
            }

            if (response) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: response
                })
            } else {
                res.status(404).json({
                    message: 'Không tìm thấy sách!',
                    error: 1,
                    data: response
                })
            }
        } catch (error) {
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    checkIsOrdered: async(req, res) => {
        try {
            const { bookId } = req.params
            const data = await bookService.checkIsOrdered(bookId)

            if (data.length > 0) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy!',
                    error: 1,
                    data
                })
            }
        } catch (error) {
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    searchBook: async(req, res) => {
        try {
            const { key } = req.query
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 0
            const data = await bookService.search({key, page, limit})

            res.status(200).json({
                message: 'success',
                error: 0,
                data
            })
          
        } catch (error) {
            res.status(500).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    create: async(req, res) => {
        try {
            const { bookId } = req.body
            const isExist = await bookService.getByBookId(bookId)
            if (isExist) return res.status(400).json({message: "bookId đã tồn tại!", error: 1}) 
            const data = await bookService.create(req.body)
            
            // Xóa cache khi có dữ liệu mới để user thấy ngay
            const keys = await redis.keys('Book::*')
            if (keys.length > 0) redis.del(keys)

            return res.status(201).json({
                message: 'success',
                error: 0,
                data
            })
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    updateById: async(req, res) => {
        try {
            const { id } = req.params
            const { imageUrl, publicId } = req.body
            let data = null
            if (imageUrl && publicId) {
                const { data: bookUpdate } = await bookService.getById(id)
                const publicIdDelete = bookUpdate.publicId
                if (publicIdDelete) {
                    await cloudinary.uploader.destroy(publicIdDelete)
                }
                data = await bookService.updateById(id, req.body)
            } else {
                data = await bookService.updateById(id, req.body)
            }
         
            if (data) {
                // Xóa cache khi update
                const keys = await redis.keys('Book::*')
                if (keys.length > 0) redis.del(keys)
                
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                return res.status(404).json({
                    message: `Không tìm thấy sách có id:${id}`,
                    error: 1,
                    data
                })
            }
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },

    deleteById: async(req, res) => {
        try {
            const { id } = req.params
            // Lấy thông tin sách trước khi xóa để có `publicId` (dùng cho Cloudinary)
            const bookInfo = await bookService.getById(id)
            if (!bookInfo) {
                return res.status(404).json({
                    message: `Không tìm thấy sách có id:${id}`,
                    error: 1,
                    data: null
                })
            }

            const isOrdered = await bookService.checkIsOrdered(id)
            if (isOrdered.length > 0) return res.status(400).json({message: 'Sản phẩm đã được mua!',error: 1})

            const data = await bookService.deleteById(id)
            if (data) {
                // Xóa file trên Cloudinary nếu có
                if (bookInfo.publicId) {
                    try {
                        await cloudinary.uploader.destroy(bookInfo.publicId)
                    } catch (err) {
                        console.log('Cloudinary destroy error:', err.message)
                    }
                }

                // Xóa cache khi xóa
                const keys = await redis.keys('Book::*')
                if (keys.length > 0) redis.del(keys)

                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                })
            } else {
                return res.status(404).json({
                    message: `Không tìm thấy sách có id:${id}`,
                    error: 1,
                    data
                })
            }
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    }
}

module.exports = bookController