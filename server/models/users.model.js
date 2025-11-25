const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        set(value) {
            this.setDataValue('email', value ? value.toLowerCase() : null);
        }
    },
    service: {
        type: DataTypes.STRING,
        allowNull: true
    },
    serviceId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true
    },
    fullName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.INTEGER,
        defaultValue: 0 // 0: Nam, 1: Nữ
    },
    birthday: {
        type: DataTypes.STRING,
        allowNull: true
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar: {
        type: DataTypes.JSON,
        defaultValue: {
            url: 'https://res.cloudinary.com/dbynglvwk/image/upload/v1650182653/NHANLAPTOP/istockphoto-666545204-612x612_yu3gcq.jpg',
            publicId: null
        }
    },
    address: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    cart: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    role: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    status: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    }
}, {
    tableName: 'users',
    timestamps: true,
    indexes: [
        {
            fields: ['email', 'serviceId']
        }
    ]
});

module.exports = User;
