const User = require('../models/users.model')
const Book = require('../models/books.model')
const { Op } = require('sequelize');

const userService = {
    getAll: async({query, page, limit, sort}) => {
        const offset = (page - 1) * limit;
        const order = [];
        
        // Convert sort object to Sequelize order format
        if (sort) {
            Object.keys(sort).forEach(key => {
                order.push([key, sort[key] === 1 ? 'ASC' : 'DESC']);
            });
        }
        
        const where = query || {};
        
        return Promise.all([
            User.count({ where }),
            User.findAll({
                where,
                offset: limit > 0 ? offset : undefined,
                limit: limit > 0 ? limit : undefined,
                order: order.length > 0 ? order : [['createdAt', 'DESC']]
            })
        ]);
    },
    create: async({email, fullName, avatar, service, serviceId, status}) => {
        return await User.create({
            email, fullName, avatar, service, serviceId, status
        });
    },
    getById: async(id) => {
        return await User.findByPk(id);
    },
    getByEmailRegister: async(email) => {
        return await User.findOne({
            where: {
                email: email,
                serviceId: { [Op.is]: null }
            }
        });
    },
    getByEmail: async(email) => {
        return await User.findOne({ where: { email } });
    },
    getByServiceId: async(serviceId) => {
        return await User.findOne({ where: { serviceId } });
    },
    getAddressByUserId: async(userId) => {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'address']
        });
        return user ? { address: user.address || [] } : null;
    },
    getCartByUserId: async(userId) => {
        const user = await User.findByPk(userId, {
            attributes: ['id', 'cart']
        });
        
        if (!user || !user.cart || user.cart.length === 0) {
            return { cart: [] };
        }
        
        // Populate products trong cart
        const productIds = user.cart.map(item => item.product).filter(Boolean);
        const books = await Book.findAll({
            where: { id: { [Op.in]: productIds } }
        });
        
        const bookMap = {};
        books.forEach(book => {
            bookMap[book.id] = book.toJSON();
        });
        
        const cart = user.cart.map(item => ({
            ...item,
            product: bookMap[item.product] || null
        }));
        
        return { cart };
    },
    addAddressByUserId: async(userId, { addressId, address }) => {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        const addresses = user.address || [];
        addresses.push({ ...address, _id: addressId });
        await user.update({ address: addresses });
        return user;
    },
    register: async({email, fullName, password}) => {
        return await User.create({email, password, fullName});
    },
    createStaff: async({email, fullName, password, phoneNumber, role, status}) => {
        return await User.create({email, password, fullName, phoneNumber, role, status});
    },
    handleResetPassword: async(userId, {password}) => {
        const user = await User.findByPk(userId);
        if (user) {
            await user.update({ password });
            return user;
        }
        return null;
    },
    addToCart: async (userId, productId) => {
        try {
            const user = await User.findByPk(userId);
            if (!user) return { error: 1, message: 'User not found' };
            
            const cart = user.cart || [];
            // Kiểm tra xem sản phẩm đã có trong cart chưa
            const existingItem = cart.find(item => item.product === parseInt(productId));
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({ product: parseInt(productId), quantity: 1 });
            }
            
            await user.update({ cart });
            return { data: user };
        } catch (error) {
            return {
                message: `Có lỗi xảy ra! ${error.message}`,
                error: 1,
            };
        }
    },
    updateCart: async (userId, cart) => {
        const user = await User.findByPk(userId);
        if (user) {
            await user.update({ cart });
            return user;
        }
        return null;
    },
    updateStatus: async (userId, {status}) => {
        const user = await User.findByPk(userId);
        if (user) {
            await user.update({ status });
            return user;
        }
        return null;
    },
    updateProfileById: async(userId, {fullName, gender, birthday, phoneNumber}) => {
        const user = await User.findByPk(userId);
        if (user) {
            await user.update({ fullName, gender, birthday, phoneNumber });
            return user;
        }
        return null;
    },
    updateAvatar: async (userId, {avatar}) => {
        const user = await User.findByPk(userId);
        if (user) {
            await user.update({ avatar });
            return user;
        }
        return null;
    },
    updateDefaultAddressById: async(userId, addressId) => {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        const addresses = user.address || [];
        
        // Set tất cả addresses về isDefault = false
        addresses.forEach(addr => {
            addr.isDefault = false;
        });
        
        // Set address được chọn về isDefault = true
        const targetAddress = addresses.find(addr => addr._id === addressId);
        if (targetAddress) {
            targetAddress.isDefault = true;
        }
        
        await user.update({ address: addresses });
        return user;
    },
    deleteAddressById: async(userId, addressId) => {
        const user = await User.findByPk(userId);
        if (!user) return null;
        
        const addresses = (user.address || []).filter(addr => addr._id !== addressId);
        await user.update({ address: addresses });
        return user;
    },
    deleteById: async(userId) => {
        return await User.destroy({ where: { id: userId } });
    }
}

module.exports = userService
