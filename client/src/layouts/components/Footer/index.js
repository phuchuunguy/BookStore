import { Container, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom"; 
import { useState } from "react"; 
import { IoPaperPlane, IoLogoFacebook, IoLogoYoutube, IoLogoInstagram } from "react-icons/io5";
import { swalInfo } from "../../../helper/swal";
// import Swal from "sweetalert2"; // Đã bỏ import Swal vì không dùng nữa

import styles from "./Footer.module.css";

function Footer() {
  const [email, setEmail] = useState(""); 
  const navigate = useNavigate(); 

  const handleSubscribe = () => {
    // Sử dụng trim() để xóa khoảng trắng thừa
    if (email && email.trim()) {
      
      // --- LOGIC CŨ: Chuyển hướng ngay lập tức ---
      // Lưu ý: Đảm bảo đường dẫn này khớp với App.js (/dang-ki hoặc /dang-ky)
      const registerPath = "/dang-ki"; 
      
      navigate(`${registerPath}?email=${encodeURIComponent(email.trim())}`);
      
    } else {
      // Dùng SweetAlert2 cho UX thống nhất
      swalInfo("Vui lòng nhập email để nhận thông tin nhé!");
    }
  };

  return (
    <footer className={styles.footer}>
      <Container>
        <Row>
          <Col xl={3} xs={12}>
            <div className={styles.footerGroup}>
              <Link to='/'>
                <h1 className={`${styles.bookstoreHighlight} me-5`}>BookStore</h1>
              </Link>
              <p>Số 2 vương Thừa Vũ - Thanh Xuân - Hà Nội</p>
              <p>Design By D2P</p>
            </div>
          </Col>
          <Col xl={6} xs={12}>
            <div className={styles.footerGroup}>
<<<<<<< Updated upstream
                <Row>
                  <Col xl={4} xs={6}>
                    <div className={styles.footerBoxLink}>
                        <p className={styles.title}>SẢN PHẨM</p>
                        <li>
                            {/* Khi bấm vào đây, nó sẽ nhảy sang trang Product và tự tích vào ô Văn học (ID 12) */}
                            <Link to="/san-pham?genre=12">Văn học</Link>
                        </li>
                        <li>
                            <Link to="/san-pham?genre=8">Tâm lý - Kỹ năng sống</Link>
                        </li>
                        <li>
                            <Link to="/san-pham?genre=14">Công nghệ thông tin</Link>
                        </li>
                        <li>
                            <Link to="/san-pham?genre=9">Kinh tế</Link>
                        </li>
                        <li>
                            <Link to="/san-pham?genre=10">Sách giáo khoa</Link>
                        </li>
                    </div>
                  </Col>
                  <Col xl={4} xs={4} className={styles.cateList}>
                    <div className={styles.footerBoxLink}>
                        <p className={styles.title}>DANH MỤC</p>
                        <Link to="/">Trang chủ</Link>
                        <Link to="/gioi-thieu">Giới thiệu</Link>
                        <Link to="/lien-he">Liên hệ</Link>
                        <Link to="/san-pham">Danh mục sản phẩm</Link>
                    </div>
                  </Col>
                  <Col xl={4} xs={6}>
                    <div className={styles.footerBoxLink}>
                        <p className={styles.title}>CHÍNH SÁCH</p>
                        <Link to="/chinh-sach-doi-tra">Chính sách đổi trả</Link>
                        <Link to="/chinh-sach-van-chuyen">Chính sách vận chuyển</Link>
                        <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
                        <Link to="/dieu-khoan-dich-vu">Điều khoản dịch vụ</Link>
                    </div>
                  </Col>
                </Row>
=======
              <Row>
                <Col xl={4} xs={6}>
                  <div className={styles.footerBoxLink}>
                    <p className={styles.title}>SẢN PHẨM</p>
                    <Link to="/san-pham/the-loai/van-hoc">Văn học</Link>
                    <Link to="/san-pham/the-loai/tam-ly-ky-nang-song">Tâm lý - Kỹ năng sống</Link>
                    <Link to="/san-pham/the-loai/cong-nghe-thong-tin">Công nghệ thông tin</Link>
                    <Link to="/san-pham/the-loai/kinh-te">Kinh tế</Link>
                    <Link to="/san-pham/the-loai/sach-giao-khoa">Sách giáo khoa</Link>
                  </div>
                </Col>
                <Col xl={4} xs={4} className={styles.cateList}>
                  <div className={styles.footerBoxLink}>
                    <p className={styles.title}>DANH MỤC</p>
                    <Link to="/">Trang chủ</Link>
                    <Link to="/gioi-thieu">Giới thiệu</Link>
                    <Link to="/lien-he">Liên hệ</Link>
                    <Link to="/san-pham">Danh mục sản phẩm</Link>
                  </div>
                </Col>
                <Col xl={4} xs={6}>
                  <div className={styles.footerBoxLink}>
                    <p className={styles.title}>CHÍNH SÁCH</p>
                    <Link to="/chinh-sach-doi-tra">Chính sách đổi trả</Link>
                    <Link to="/chinh-sach-van-chuyen">Chính sách vận chuyển</Link>
                    <Link to="/chinh-sach-bao-mat">Chính sách bảo mật</Link>
                    <Link to="/dieu-khoan-dich-vu">Điều khoản dịch vụ</Link>
                  </div>
                </Col>
              </Row>
>>>>>>> Stashed changes
            </div>
          </Col>
          <Col xl={3} xs={12}>
            <div className={styles.footerGroup}>
              <p className={styles.title}>ĐĂNG KÝ</p>
              <p>Đăng ký để nhận được được thông tin mới nhất từ chúng tôi.</p>
              <div className={`form-group ${styles.formGroup}`}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Email..." 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)} 
                  // Bắt sự kiện Enter để gửi luôn cho tiện
                  onKeyDown={(e) => e.key === 'Enter' && handleSubscribe()}
                />
                <button 
                  className={`bookstore-btn ${styles.subscribeBtn}`}
                  onClick={handleSubscribe} 
                  type="button"
                >
                  <IoPaperPlane />
                </button>
              </div>
              <div className={styles.boxSocial}>
                <button className={`bookstore-btn ${styles.bookstoreBtn}`}><IoLogoFacebook /></button>
                <button className={`bookstore-btn ${styles.bookstoreBtn}`}><IoLogoYoutube /></button>
                <button className={`bookstore-btn ${styles.bookstoreBtn}`}><IoLogoInstagram /></button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </footer>
  );
}

export default Footer;