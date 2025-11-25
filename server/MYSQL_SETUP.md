# Hướng dẫn cấu hình MySQL cho Bookstore

## 1. Cài đặt MySQL

Đảm bảo bạn đã cài đặt MySQL trên máy của mình. Nếu chưa có, có thể tải từ: https://dev.mysql.com/downloads/mysql/

## 2. Tạo Database

Tạo database mới cho ứng dụng:

```sql
CREATE DATABASE bookstore CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

## 3. Cấu hình biến môi trường

Thêm các biến sau vào file `.env` của bạn:

```env
# MySQL Configuration
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_DATABASE=bookstore
MYSQL_USER=root
MYSQL_PASSWORD=your_password_here

# Optional: Set to 'true' để tự động đồng bộ models với database (chỉ dùng trong development)
SYNC_DB=false
```

## 4. Cài đặt dependencies

Chạy lệnh sau để cài đặt các package mới:

```bash
cd server
npm install
```

## 5. Chạy ứng dụng

Khi chạy ứng dụng lần đầu, nếu `SYNC_DB=true`, Sequelize sẽ tự động tạo các bảng trong database.

Hoặc bạn có thể chạy migration thủ công bằng cách:

```javascript
// Trong file db.js, tạm thời thay đổi:
await sequelize.sync({ force: true }); // CẢNH BÁO: Sẽ xóa tất cả dữ liệu hiện có!
```

## 6. Lưu ý quan trọng

- **JSON Columns**: Một số dữ liệu được lưu dưới dạng JSON trong MySQL (như `address`, `cart` trong User, `products` trong Order). MySQL 5.7+ hỗ trợ JSON type.

- **Relationships**: 
  - Book có quan hệ Many-to-One với Publisher
  - Order có quan hệ Many-to-One với User và Voucher
  - Book có quan hệ Many-to-Many với Genre và Author (được lưu dưới dạng JSON arrays: `genreIds`, `authorIds`)

- **Migrations**: Trong production, nên sử dụng Sequelize migrations thay vì `sync()` để quản lý schema tốt hơn.

## 7. Kiểm tra kết nối

Khi khởi động server, bạn sẽ thấy thông báo "Kết nối MySQL thành công!" nếu mọi thứ hoạt động đúng.

