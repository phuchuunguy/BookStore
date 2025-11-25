const { DataTypes } = require('sequelize');
const { sequelize } = require('../db');
const { createSlug } = require('../utils/slug');

const Genre = sequelize.define('Genre', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    slug: {
        type: DataTypes.STRING,
        unique: true
    }
}, {
    tableName: 'genres',
    timestamps: true,
    hooks: {
        beforeValidate: (genre) => {
            if (genre.name && !genre.slug) {
                genre.slug = createSlug(genre.name);
            }
        },
        beforeUpdate: (genre) => {
            if (genre.changed('name')) {
                genre.slug = createSlug(genre.name);
            }
        }
    }
});

module.exports = Genre;
