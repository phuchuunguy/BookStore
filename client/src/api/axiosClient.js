import axios from 'axios'
import jwt_decode from 'jwt-decode'
import { toast } from 'react-toastify';

const axiosClient = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// Instance riêng để gọi refresh token (tránh lặp vô tận)
const jwtAxios = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

// --- 1. XỬ LÝ TRƯỚC KHI GỬI REQUEST (Tự động Refresh Token) ---
axiosClient.interceptors.request.use(async (config) => {
  const accessToken = localStorage.getItem('accessToken');
  
  if (accessToken) {
    const date = new Date()
    // Giải mã token để xem hạn sử dụng
    const decodedToken = jwt_decode(accessToken)
    
    // Nếu token đã hết hạn
    if (decodedToken.exp < date.getTime() / 1000) {
      try {
        // Gọi API lấy token mới
        const res = await jwtAxios.post(`auth/refresh-token/`);
        const newAccessToken = res.data.token
        
        if (newAccessToken) {
          localStorage.setItem('accessToken', newAccessToken)
          config.headers.Authorization = `Bearer ${newAccessToken}`;
        }
      } catch (error) {
        // Nếu Refresh Token cũng hết hạn hoặc lỗi -> Đăng xuất luôn
        localStorage.removeItem('accessToken')
        localStorage.removeItem('user')
        window.location.href = '/dang-nhap'
      }
    } else {
      // Token còn hạn thì gắn vào Header
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// --- 2. XỬ LÝ KHI NHẬN PHẢN HỒI (Tự động Đăng xuất nếu lỗi quyền) ---
axiosClient.interceptors.response.use(
  (res) => res.data, 
  (error) => {
    // Lấy thông báo lỗi từ Server (nếu có)
    const message = error.response?.data?.message || "Có lỗi xảy ra!";
    
    // Nếu Server trả về 401 (Chưa đăng nhập) hoặc 403 (Cấm truy cập)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        // Xóa sạch dữ liệu đăng nhập
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Chuyển hướng về trang đăng nhập
        window.location.href = '/dang-nhap';
        
        // Không cần toast lỗi ở đây vì chuyển trang rồi, hoặc toast nhẹ
        // toast.error("Phiên đăng nhập hết hạn!");
    } else {
        // Các lỗi khác (500, 400...) thì hiện thông báo
        toast.error(message, { autoClose: 2000 });
    }

    return Promise.reject(error)
  }
)

export default axiosClient;