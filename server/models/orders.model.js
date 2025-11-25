const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const { methodEnum, orderStatusEnum, paymentStatusEnum } = require('../utils/enum');

const Order = sequelize.define('Order', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    products: {
        type: DataTypes.JSON,
        defaultValue: []
    },
    delivery: {
        type: DataTypes.JSON,
        allowNull: false
    },
    voucherId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'vouchers',
            key: 'id'
        }
    },
    cost: {
        type: DataTypes.JSON,
        defaultValue: {
            subTotal: 0,
            shippingFee: 0,
            discount: 0,
            total: 0
        }
    },
    method: {
        type: DataTypes.JSON,
        defaultValue: {
            code: methodEnum?.cash?.code,
            text: methodEnum?.cash?.text
        }
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    paymentStatus: {
        type: DataTypes.JSON,
        defaultValue: {
            code: paymentStatusEnum?.unPaid?.code,
            text: paymentStatusEnum?.unPaid?.text
        }
    },
    orderStatus: {
        type: DataTypes.JSON,
        defaultValue: {
            code: orderStatusEnum?.awaitingCheckPayment?.code,
            text: orderStatusEnum?.awaitingCheckPayment?.text
        }
    },
    tracking: {
        type: DataTypes.JSON,
        defaultValue: []
    }
}, {
    tableName: 'orders',
    timestamps: true
});

module.exports = Order;
