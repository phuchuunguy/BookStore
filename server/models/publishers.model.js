const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Publisher = sequelize.define('Publisher', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    tableName: 'publishers',
    timestamps: true
});

module.exports = Publisher;
