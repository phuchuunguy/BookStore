const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');

const Author = sequelize.define('Author', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'authors',
    timestamps: true
});

module.exports = Author;
