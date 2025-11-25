const Redis = require("ioredis")

const redisClient = new Redis({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
    username: process.env.REDIS_USER,
    password: process.env.REDIS_PASSWORD,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    commandTimeout: 2000,
    tls: true,
});

module.exports = redisClient