const { Sequelize } = require('sequelize');

// Tạo kết nối MySQL
const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'bookstore',
    process.env.MYSQL_USER || 'root',
    process.env.MYSQL_PASSWORD || '',
    {
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        dialect: 'mysql',
        logging: false, // <<< TẮT LOG SQL TẠI ĐÂY
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: false,
            freezeTableName: false
        }
    }
);

// Hàm kết nối database
const connectMySQL = async () => {
    try {
        await sequelize.authenticate();
        console.log("Kết nối MySQL thành công!");
        
        if (process.env.SYNC_DB === 'true') {
            await sequelize.sync({ alter: true });
            console.log("Đã đồng bộ models với database!");
        }
    } catch (error) {
        console.log("Kết nối MySQL thất bại!" + error.message);
        process.exit(1);
    }
};

module.exports = { sequelize, connectMySQL };
