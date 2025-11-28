const bcrypt = require('bcrypt');
const userService = require('../services/user.service')
const { transporter } = require('../config/nodemailer')
const { cloudinary } = require('../config/cloudinary')

const { RoleEnum } = require('../utils/enum')

const usersController = {
    getAll: async(req, res) => {
        try {
            const page = req.query.page ? parseInt(req.query.page) : 1
            const limit = req.query.limit ? parseInt(req.query.limit) : 0
            const sort = req.query.sort ? req.query.sort : { createdAt: -1 }
            const { query } = req.query

            // Parse query if it's a JSON string
            let queryObj = {};
            if (query) {
                try {
                    queryObj = typeof query === 'string' ? JSON.parse(query) : query;
                } catch (err) {
                    queryObj = query;
                }
            }

            // Convert Mongo-style $or/$regex to Sequelize Op.like
            const { Op } = require('sequelize');
            const where = {};
            if (queryObj) {
                // role or other direct fields
                Object.keys(queryObj).forEach(key => {
                    if (key !== '$or') where[key] = queryObj[key];
                });

                if (queryObj['$or'] && Array.isArray(queryObj['$or'])) {
                    where[Op.or] = queryObj['$or'].map(cond => {
                        const field = Object.keys(cond)[0];
                        const valueObj = cond[field];
                        if (valueObj && valueObj['$regex']) {
                            const regex = valueObj['$regex'];
                            return { [field]: { [Op.like]: `%${regex}%` } };
                        }
                        return cond;
                    });
                }
            }

            const [count, data] = await userService.getAll({query: where, page, limit, sort})
            const totalPage = Math.ceil(count / limit)

            res.status(200).json({
                message: 'success',
                error: 0,
                count,
                data,
                pagination: {
                    page,
                    limit,
                    totalPage
                }
            })
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getById: async(req, res) => {
        try {
            const { userId } = req.params
            const data = await userService.getById(userId)
            if (data) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                    
                })
            } else {
                return res.status(404).json({
                    message: 'Không tìm thấy user!',
                    error: 1,
                    data
                })
            }
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getAddress: async(req, res) => {
        try {
            const { userId } = req.params
            const data = await userService.getAddressByUserId(userId)
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                    
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy user!',
                    error: 1,
                    data
                })
            }
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    getCart: async(req, res) => {
        try {
            const { userId } = req.params
            const data = await userService.getCartByUserId(userId)
            if (data) {
                res.status(200).json({
                    message: 'success',
                    error: 0,
                    data
                    
                })
            } else {
                res.status(200).json({
                    message: 'Không tìm thấy user!',
                    error: 1,
                    data
                })
            }
        } catch (error) {
            res.json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    createStaff: async(req, res) => {
        try {
            const { email, fullName, phoneNumber } = req.body

            const checkEmail = await userService.getByEmail(email)
            if (checkEmail)  return res.status(400).json({ message: 'Email đã tồn tại!', error: 1 })
            
            const password = (Math.floor(Math.random() * 9999999) + 100000).toString()
            const hash = await bcrypt.hash(password, 10)

            await userService.createStaff({email, fullName, phoneNumber, password: hash, role: RoleEnum.Staff, status: 1})

            const resultSendMail = await transporter.sendMail({
                from: '"BOOKSTORE" <project.php.nhncomputer@gmail.com>',
                to: email,
                subject: `[BOOKSTORE] Thông tin tài khoản nhân viên của bạn`,
                html: ` <h3>Xin chào ${fullName},</h3>
                        <h3>Chúc mừng bạn vừa được cấp tài khoản quyền nhân viên tại Bookstore!</h3>
                        <p>Username : ${email}</p>
                        <p>Password : ${password}</p>`
            })
            res.status(201).json({
                message: 'success',
                error: 0,
            })
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    addAddress: async(req, res) => {
        try {
            const { userId } = req.params
            const { address } = req.body
            const addressId = Date.now().toString() + Math.random().toString(36).substr(2, 9)

            await userService.addAddressByUserId(userId, { addressId, address })

            return res.status(200).json({
                message: 'success',
                error: 0,
                data: {
                    ...address,
                    id: addressId
                }
            })
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    addToCart: async (req, res) =>{
        try {
            const { productId } = req.body
            const { userId } = req.params
            const { data } = await userService.addToCart(userId, productId)
            return res.status(200).json({
                message: 'success',
                error: 0,
                data
            })
        } catch (err) {
            return res.status(500).json({message: err.message, error: 1})
        }
    },
    updateCart: async (req, res) =>{
        try {
            const { cart } = req.body
            const { userId } = req.params
            const data = await userService.updateCart(userId, cart)
            return res.status(200).json({
                message: 'success',
                error: 0,
                data
            })
        } catch (err) {
            return res.status(500).json({message: err.message, error: 1})
        }
    },
    updateStatus: async (req, res) =>{
        try {
            const { status } = req.body
            const { userId } = req.params
            const data = await userService.updateStatus(userId, { status })
            return res.status(200).json({
                message: 'success',
                error: 0,
                data
            })
        } catch (err) {
            return res.status(500).json({message: err.message, error: 1})
        }
    },
    updateProfileById: async(req, res) => {
        try {
            const { userId } = req.params
            const result = await userService.updateProfileById(userId, req.body)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy user có id:${userId}`,
                    error: 1,
                    data: result
                })
            }
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    updateAvatar: async (req, res) =>{
        try {
            const { avatar } = req.body
            const { userId } = req.params
            const { avatar: { publicId } } = await userService.getById(userId)
            if  (publicId) {
                await cloudinary.uploader.destroy(publicId)
            }
            const data = await userService.updateAvatar(userId, { avatar })
            return res.status(200).json({
                message: 'success',
                error: 0,
                data
            })
        } catch (err) {
            return res.status(500).json({message: err.message, error: 1})
        }
    },
    updateDefaultAddressById: async(req, res) => {
        try {
            const { userId, addressId } = req.params
            const result = await userService.updateDefaultAddressById(userId, addressId)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            }
            return res.status(400).json({
                message: `Không tìm thấy!`,
                error: 1,
            })
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    deleteAddressById: async(req, res) => {
        try {
            const { userId, addressId } = req.params
            const result = await userService.deleteAddressById(userId, addressId)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            }
            res.status(400).json({
                message: `Không tìm thấy!`,
                error: 1,
            })
            
        } catch (error) {
            res.status(400).json({
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            })
        }
    },
    deleteById: async(req, res) => {
        try {
            const { userId } = req.params
            const result = await userService.deleteById(userId)
            if (result) {
                return res.status(200).json({
                    message: 'success',
                    error: 0,
                    data: result
                })
            } else {
                return res.status(400).json({
                    message: `Không tìm thấy user có id:${userId}`,
                    error: 1,
                    data: result
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

module.exports = usersController
