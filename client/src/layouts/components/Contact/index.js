import React from "react";
import { useForm, ValidationError } from "@formspree/react";
import styles from "./Contact.module.css";
// Import Icons
import { FaEnvelope, FaLocationDot, FaPhone, FaClock } from "react-icons/fa6";

// --- DỮ LIỆU CẤU HÌNH ---
const contactInfo = [
  {
    icon: FaLocationDot,
    title: "Địa chỉ tiệm sách",
    description: "Số 2 Vương Thừa Vũ, Thanh Xuân, Hà Nội",
    link: "https://www.google.com/maps/place/2+P.+V%C6%B0%C6%A1ng+Th%E1%BB%ABa+V%C5%A9,+Ng%C3%A3+T%C6%B0+S%E1%BB%9F,+Thanh+Xu%C3%A2n,+H%C3%A0+N%E1%BB%99i+100000,+Vi%E1%BB%87t+Nam/@21.0017892,105.8175866,17z/data=!3m1!4b1!4m6!3m5!1s0x3135adda26c5f2f9:0x9f6636f3e6bd2def!8m2!3d21.0017843!4d105.8224575!16s%2Fg%2F11s4kcd10p?hl=vi&entry=ttu&g_ep=EgoyMDI1MTEyMy4xIKXMDSoASAFQAw%3D%3D",
  },
  {
    icon: FaPhone,
    title: "Hotline hỗ trợ",
    description: "0397 639 062",
    link: "tel:0397 639 062",
  },
  {
    icon: FaEnvelope,
    title: "Email liên hệ",
    description: "d2p.bookstore@gmail.com",
    link: "mailto:d2p.bookstore@gmail.com",
  },
  {
    icon: FaClock,
    title: "Giờ mở cửa",
    description: "08:00 - 21:00 (Thứ 2 - CN)",
    link: null,
  },
];

const formFields = [
  { name: "name", type: "text", placeholder: "Họ và tên của bạn *" },
  { name: "email", type: "email", placeholder: "Email liên hệ *" },
  { name: "phone", type: "tel", placeholder: "Số điện thoại *" },
  { name: "subject", type: "text", placeholder: "Tiêu đề liên hệ" },
  { name: "message", type: "textarea", placeholder: "Nội dung cần tư vấn... *" },
];

const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.77175992683!2d105.8224575!3d21.001784300000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135adda26c5f2f9%3A0x9f6636f3e6bd2def!2zMiBQLiBWxrDGoW5nIFRo4burYSBWxaksIE5nw6MgVMawIFPhu58sIFRoYW5oIFh1w6JuLCBIw6AgTuG7mWkgMTAwMDAw!5e0!3m2!1svi!2s!4v1764641666542!5m2!1svi!2s";

const Contact = () => {
  // Logic Formspree
  const [state, handleSubmit] = useForm("FORM_ID"); // Thay FORM_ID của bạn

  return (
    <div className={styles.pageWrapper}>
      
      {/* 1. HEADER PAGE (Tiêu đề trang) */}
      <div className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.pageTitle}>Liên hệ với D2P BookStore</h1>
          <p className={styles.pageDesc}>
            Chúng mình luôn sẵn sàng lắng nghe và hỗ trợ ba mẹ chọn sách tốt nhất cho bé.
          </p>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className={styles.container}>
        <div className={styles.contentGrid}>
          
          {/* CỘT TRÁI: THÔNG TIN */}
          <div className={styles.leftColumn}>
            <h2 className={styles.sectionTitle}>Thông tin liên lạc</h2>
            <p className={styles.sectionDesc}>
              Đừng ngần ngại liên hệ với D2P BookStore nếu bạn cần tư vấn sách, kiểm tra đơn hàng hoặc hợp tác.
            </p>
            
            <div className={styles.infoList}>
              {contactInfo.map((item, index) => (
                <div key={index} className={styles.infoItem}>
                  <div className={styles.iconBox}>
                    <item.icon />
                  </div>
                  <div className={styles.infoContent}>
                    <h3 className={styles.infoTitle}>{item.title}</h3>
                    {item.link ? (
                      <a href={item.link} className={styles.infoLink} target="_blank" rel="noopener noreferrer">{item.description}</a>
                    ) : (
                      <p className={styles.infoText}>{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CỘT PHẢI: FORM */}
          <div className={styles.rightColumn}>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>Gửi tin nhắn</h3>
              
              {state.succeeded ? (
                <div className={styles.successMessage}>
                  <div className={styles.checkIcon}>✓</div>
                  <h4>Đã gửi thành công!</h4>
                  <p>Cảm ơn bạn, chúng mình sẽ phản hồi sớm nhất.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={styles.formGroup}>
                  {formFields.map((field, index) => (
                    <div key={index} className={styles.inputWrapper}>
                      {field.type === "textarea" ? (
                        <textarea
                          name={field.name}
                          placeholder={field.placeholder}
                          className={styles.formInput}
                          rows={4}
                          required={field.name !== "subject"}
                        />
                      ) : (
                        <input
                          type={field.type}
                          name={field.name}
                          placeholder={field.placeholder}
                          className={styles.formInput}
                          required={field.name !== "subject"}
                        />
                      )}
                      <ValidationError prefix={field.name} field={field.name} errors={state.errors} />
                    </div>
                  ))}

                  <button type="submit" disabled={state.submitting} className={styles.submitBtn}>
                    Gửi đi
                    <span className={styles.btnIcon}>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9L9 1M9 1H1M9 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 9L9 1M9 1H1M9 1V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 3. MAP SECTION */}
      <div className={styles.mapSection}>
        <iframe
          src={mapUrl}
          title="Google Map"
          className={styles.mapFrame}
          allowFullScreen=""
          loading="lazy"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;