import React, { useRef, useState } from "react";
// 1. Bỏ Formspree, thay bằng EmailJS
import emailjs from "@emailjs/browser";
import Swal from "sweetalert2"; // Dùng lại cái popup đẹp hôm nọ

import styles from "./Contact.module.css";
// Import Icons
import { FaEnvelope, FaLocationDot, FaPhone, FaClock } from "react-icons/fa6";

// --- DỮ LIỆU CẤU HÌNH ---
const contactInfo = [
  {
    icon: FaLocationDot,
    title: "Địa chỉ tiệm sách",
    description: "Số 2 Vương Thừa Vũ, Thanh Xuân, Hà Nội",

    link: "https://www.google.com/maps/place/2+P.+V%C6%B0%C6%A1ng+Th%E1%BB%ABa+V%C5%A9,+Kh%C6%B0%C6%A1ng+Trung,+Thanh+Xu%C3%A2n,+H%C3%A0+N%E1%BB%99i",

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

const mapUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3724.695896336494!2d105.82006137596918!3d21.004801188600055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ac81a5c6c0e9%3A0x6b772412803730e1!2zMiBQLiBWxrDGoW5nIFRo4burYSBWxaksIEtoxrDGoW5nIFRydW5nLCBUaGFuaCBYdcOibiwgSMOgIE7huqlp!5e0!3m2!1svi!2svn!4v1701500000000!5m2!1svi!2svn";


const Contact = () => {
  const form = useRef(); // Tạo tham chiếu đến thẻ <form>
  const [loading, setLoading] = useState(false);

  const sendEmail = (e) => {
    e.preventDefault(); // Chặn load lại trang
    setLoading(true);

    // --- CẤU HÌNH EMAILJS ---
    // Bạn lấy 3 mã này trên trang web EmailJS điền vào đây nhé
    const SERVICE_ID = "service_z9pnsuh";   // Ví dụ: service_x29vk4d
    const TEMPLATE_ID = "template_qnkxuw8"; // Ví dụ: template_8dn2s9a
    const PUBLIC_KEY = "lA4HRSJX-X6bmKfN5";   // Ví dụ: 5d8_s8d7s9d7s

    emailjs
      .sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
        publicKey: PUBLIC_KEY,
      })
      .then(
        () => {
          setLoading(false);
          // Gửi thành công -> Hiện Popup đẹp
          Swal.fire({
            title: "Đã gửi thành công!",
            text: "BookStore đã nhận được tin nhắn và sẽ phản hồi bạn sớm nhất.",
            icon: "success",
            confirmButtonColor: "#28a745",
          });
          e.target.reset(); // Xóa trắng form sau khi gửi
        },
        (error) => {
          setLoading(false);
          console.log("FAILED...", error.text);
          // Gửi thất bại -> Báo lỗi
          Swal.fire({
            title: "Opps, có lỗi rồi!",
            text: "Vui lòng kiểm tra lại kết nối hoặc thử lại sau nhé.",
            icon: "error",
          });
        }
      );
  };

  return (
    <div className={styles.pageWrapper}>
      {/* 1. HEADER PAGE */}
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
                      <a
                        href={item.link}
                        className={styles.infoLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.description}
                      </a>
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

              <form ref={form} onSubmit={sendEmail} className={styles.formGroup}>
                {formFields.map((field, index) => (
                  <div key={index} className={styles.inputWrapper}>
                    {field.type === "textarea" ? (
                      <textarea
                        name={field.name} // Quan trọng: Phải khớp với biến trong Template EmailJS
                        placeholder={field.placeholder}
                        className={styles.formInput}
                        rows={4}
                        required={field.name !== "subject"}
                      />
                    ) : (
                      <input
                        type={field.type}
                        name={field.name} // Quan trọng
                        placeholder={field.placeholder}
                        className={styles.formInput}
                        required={field.name !== "subject"}
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  {loading ? "Đang gửi..." : "Gửi đi"}
                  <span className={styles.btnIcon}>
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M1 9L9 1M9 1H1M9 1V9"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </button>
              </form>
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