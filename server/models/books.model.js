const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const { createSlug } = require('../utils/slug');

const Book = sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bookId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    pages: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    size: {
        type: DataTypes.STRING,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    discount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    imageUrl: {
        type: DataTypes.STRING,
        defaultValue: 'https://itbook.store/img/books/9781617294136.png'
    },
    publicId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    genreIds: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    authorIds: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    publisherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'publishers',
            key: 'id'
        }
    }
}, {
    tableName: 'books',
    timestamps: true,
    hooks: {
        beforeValidate: (book) => {
            if (book.name && !book.slug) {
                book.slug = createSlug(book.name);
            }
        },
        beforeUpdate: (book) => {
            if (book.changed('name')) {
                book.slug = createSlug(book.name);
            }
        }
    }
});

module.exports = Book;
