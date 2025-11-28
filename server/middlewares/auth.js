const jwt = require('jsonwebtoken');

// --- 1. Middleware xác thực Token (Cổng bảo vệ đầu tiên) ---
const verifyToken = (req, res, next) => {
    // Hỗ trợ lấy token từ cả 2 kiểu header:
    // 1. req.headers.token (Cách bạn đang dùng ở frontend cũ)
    // 2. req.headers.authorization = "Bearer <token>" (Cách chuẩn quốc tế)
    const token = req.headers.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    if (!token) {
        return res.status(401).json({ message: 'Bạn chưa đăng nhập (Thiếu Token)!' });
    }

    jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã hết hạn!' });
        }
        
        // Giải mã token thành công -> Lưu vào request để dùng sau
        // Chuẩn hóa: Dùng 'id' thay vì 'userId' để code gọn hơn
        req.user = {
            id: user.userId || user.id, // Đảm bảo lấy đúng ID dù token lưu key nào
            role: user.role || 0        // Mặc định là 0 (Customer) nếu không có role
        };
        next();
    });
};

// --- 2. Cho phép: CHÍNH CHỦ hoặc QUẢN LÝ (Staff/Admin) ---
// Dùng cho: Xem thông tin cá nhân, Sửa giỏ hàng, Đặt hàng
// Logic: Nếu ID trên URL khớp với ID trong Token -> Cho qua.
//        Hoặc nếu là Staff (1) / Admin (2) -> Cho qua.
const verifyTokenAndUserAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        // Lấy ID trên đường dẫn (URL), hỗ trợ cả :id và :userId
        const paramId = req.params.id || req.params.userId;

        // So sánh lỏng (==) để chuỗi "3" bằng số 3
        if (req.user.id == paramId || req.user.role >= 1) {
            next();
        } else {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập dữ liệu của người khác!' });
        }
    });
};

// --- 3. Chỉ cho phép: STAFF hoặc ADMIN (Role >= 1) ---
// Dùng cho: Trang quản lý đơn hàng, Quản lý sản phẩm
const verifyTokenAndStaff = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role >= 1) { // 1=Staff, 2=Admin
            next();
        } else {
            return res.status(403).json({ message: 'Chỉ Nhân viên hoặc Admin mới được truy cập!' });
        }
    });
};

// --- 4. Chỉ cho phép: ADMIN (Role = 2) ---
// Dùng cho: Xóa User, Thống kê doanh thu, Quản lý nhân viên
const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.role === 2) { // 2=Admin (theo Enum của bạn)
            next();
        } else {
            return res.status(403).json({ message: 'Chỉ Admin mới được thực hiện thao tác này!' });
        }
    });
};

module.exports = {
    verifyToken,
    verifyTokenAndUserAuthorization,
    verifyTokenAndStaff,
    verifyTokenAndAdmin
};