import React from "react";
// Import file CSS module
import styles from './AboutUs.module.css';

const AboutUs = () => {
  const myMumBook = "https://cdn1.fahasa.com/media/catalog/product/g/o/goc_san_va_khoang_troi___hat_gao_lang_ta_1_2018_09_24_09_35_22.JPG";
  const iPrayedForYouBook = "https://product.hstatic.net/200000343865/product/tu-quai-bong-gao_eb493e38058a48f496c56783e528ea63_grande.jpg";
  const hideSeekBooks = "https://docsach24.co/filemanager/data-images/V%C4%83n%20H%E1%BB%8Dc%20Vi%E1%BB%87t%20Nam/tuyen-tap-truyen-ngan-vu-trong-phung.jpg"; 

  // Hàm xử lý khi ảnh lỗi
  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = "https://via.placeholder.com/300x400?text=Book+Image";
  };

  return (
    <div className={styles.container}>
      
      {/* --- Phần 1: Chúng mình là ai? --- */}
      <section className={styles.section}>
        <div className={styles.imageCol}>
          <img 
            src={myMumBook} 
            alt="Bìa sách My Mum" 
            className={styles.bookImageVertical}
            onError={handleImageError}
          />
        </div>
        <div className={styles.textCol}>
          <h2 className={styles.heading}>Chúng mình là ai?</h2>
          <p className={styles.paragraph}>
            D2P BookStore là tiệm sách ngoại văn trực tuyến được thành lập tháng 12/2025 bởi D2P chúng mình và có tình yêu với những trang sách giấy từ mọi đất nước.
          </p>
          <p className={styles.paragraph}>
            Chúng mình luôn mong muốn tìm được những cuốn sách ngoại văn thật hay, thật đẹp và đảm bảo chất lượng chuẩn cho các con và gia đình. Chính vì vậy, tiệm sách ngoại văn D2P BookStore đã ra đời.
          </p>
        </div>
      </section>

      {/* --- Phần 2: Sứ mệnh (Đảo ngược vị trí) --- */}
      <section className={`${styles.section} ${styles.reverse}`}>
        <div className={styles.imageCol}>
          <img 
            src={iPrayedForYouBook} 
            alt="Bìa sách I Prayed For You" 
            className={styles.bookImageSquare}
            onError={handleImageError}
          />
        </div>
        <div className={styles.textCol}>
          <h2 className={styles.heading}>Sứ mệnh của chúng mình là gì?</h2>
          <p className={styles.paragraph}>
            Với tâm niệm trao đi những gì tốt đẹp nhất,  D2P BookStore đảm bảo 100% các đầu sách ngoại văn của tiệm là sách gốc nhập khẩu từ các nhà xuất bản uy tín từ các nước trên thế giới như Anh, Mỹ, Nhật, ... cam kết nói không với sách fake.
          </p>
          <p className={styles.paragraph}>
            Chúng mình mong muốn được lan toả niềm yêu thích đọc sách ngoại văn cho trẻ em ở khắp Việt Nam, cùng các em khám phá, mở rộng nguồn tri thức vô tận của nhân loại để một ngày vững bước hội nhập vào thế giới tương lai.
          </p>
        </div>
      </section>

      {/* --- Phần 3: Lợi ích --- */}
      <section className={styles.sectionLast}>
        
        
        <div className={styles.benefitContainer}>
          <div className={styles.imageCol}>
             <img 
              src={hideSeekBooks} 
              alt="Loạt sách Hide & Seek" 
              className={styles.bookImageGroup}
              onError={handleImageError}
            />
          </div>
          
          <div className={styles.textCol}>
            <h2 className={`${styles.heading} ${styles.centerHeading}`}>
          Lợi ích khi mua sách ở  D2P BookStore là gì?
        </h2>
            <ul className={styles.benefitList}>
              <li><strong>Đầu sách chất lượng:</strong> luôn có sách mới, chất lượng và đa dạng về thể loại cho các lứa tuổi.</li>
              <li><strong>Mức giá cạnh tranh:</strong> Luôn có mức chiết khấu cao.</li>
              <li><strong>Ưu đãi đặc biệt:</strong> Nhiều chiết khấu hấp dẫn cho các đơn hàng.</li>
              <li><strong>Đóng gói cẩn thận:</strong> Đảm bảo an toàn cho sản phẩm trong quá trình vận chuyển.</li>
              <li><strong>Giao hàng toàn quốc:</strong> Nhanh chóng và đảm bảo trong vòng 1-5 ngày làm việc.</li>
              <li><strong>Miễn phí giao hàng:</strong> Cho đơn hàng từ 390,000 VNĐ ở Hà Nội và hỗ trợ 20,000 VNĐ cho các đơn hàng ở tỉnh thành khác.</li>
              <li><strong>Thanh toán an toàn và tiện lợi:</strong> Hệ thống bảo mật cao, đảm bảo uy tín trong mọi giao dịch.</li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutUs;