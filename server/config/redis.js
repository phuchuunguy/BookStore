const Redis = require("ioredis")

// Đảm bảo load biến môi trường nếu file này chạy độc lập
// require('dotenv').config(); 

const redisClient = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    
    // Sửa: Nếu biến môi trường rỗng thì gán undefined để ioredis không cố đăng nhập
    username: process.env.REDIS_USER || undefined, 
    password: process.env.REDIS_PASSWORD || undefined,

    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    commandTimeout: 2000,
    
    // QUAN TRỌNG: Xóa hoặc comment dòng này khi chạy ở Local (Docker)
    // tls: true, 
});

redisClient.on('connect', () => {
    console.log('Redis connected successfully!');
});

redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});

module.exports = redisClient;