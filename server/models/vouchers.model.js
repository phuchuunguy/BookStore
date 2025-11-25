const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Voucher = sequelize.define('Voucher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    minimum: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    by: {
        type: DataTypes.STRING,
        allowNull: true
    },
    value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    start: {
        type: DataTypes.DATE,
        allowNull: true
    },
    end: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'vouchers',
    timestamps: true
});

module.exports = Voucher;
