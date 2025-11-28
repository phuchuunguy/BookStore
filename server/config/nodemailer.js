const nodemailer = require('nodemailer')
require('dotenv').config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        // Lấy email từ file .env
        user: process.env.EMAIL_USER, 
        // Lấy mật khẩu ứng dụng (16 ký tự) từ file .env
        pass: process.env.EMAIL_PASSWORD 
    }
})

// Kiểm tra kết nối ngay lập tức để biết config đúng hay sai
transporter.verify((error, success) => {
    if (error) {
        console.log("Lỗi kết nối Email:", error);
    } else {
        console.log("Kết nối Email thành công! Sẵn sàng gửi mail.");
    }
});

module.exports = { transporter }