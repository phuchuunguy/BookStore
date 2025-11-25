const User = require('./users.model');
const Book = require('./books.model');
const Order = require('./orders.model');
const Author = require('./authors.model');
const Genre = require('./genres.model');
const Publisher = require('./publishers.model');
const Voucher = require('./vouchers.model');

// Định nghĩa các quan hệ (Associations)

// Book - Publisher (Many-to-One)
Book.belongsTo(Publisher, {
    foreignKey: 'publisherId',
    as: 'publisher'
});
Publisher.hasMany(Book, {
    foreignKey: 'publisherId',
    as: 'books'
});

// Order - User (Many-to-One)
Order.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user'
});
User.hasMany(Order, {
    foreignKey: 'userId',
    as: 'orders'
});

// Order - Voucher (Many-to-One)
Order.belongsTo(Voucher, {
    foreignKey: 'voucherId',
    as: 'voucher'
});
Voucher.hasMany(Order, {
    foreignKey: 'voucherId',
    as: 'orders'
});

// Book - Genre (Many-to-Many) - sử dụng JSON array trong Book model
// Book - Author (Many-to-Many) - sử dụng JSON array trong Book model

module.exports = {
    User,
    Book,
    Order,
    Author,
    Genre,
    Publisher,
    Voucher
};

