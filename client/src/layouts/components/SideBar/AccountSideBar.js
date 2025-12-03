import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";

import PreviewImage from "../../../components/PreviewImage";
import { updateAvatar } from "../../../redux/actions/auth";
import userApi from "../../../api/userApi";
import { getAvatarUrl } from "../../../helper/avatar";

import styles from "./AccountSideBar.module.css";

function AccountSideBar() {
  const dispatch = useDispatch();
  const { userId, fullName, avatar } = useSelector((state) => state.auth);

  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return Swal.fire({
      title: "Thông báo",
      text: "Chưa chọn file!",
      icon: "info",
      confirmButtonColor: "#17a2b8",
    });
    if (!["image/png", "image/gif", "image/jpeg"].includes(file.type)) {
      return Swal.fire({
        title: "Thông báo",
        text: "File không đúng định dạng!",
        icon: "info",
        confirmButtonColor: "#17a2b8",
      });
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await userApi.updateAvatar(userId, formData);
      // Response có cấu trúc: { message, error, data: user }
      // axiosClient interceptor trả về res.data, nên response = { message, error, data: user }
      // user có avatar: { url, publicId }
      const updatedAvatar = response?.data?.avatar || response?.avatar;
      if (updatedAvatar) {
        dispatch(updateAvatar(updatedAvatar));
      }
      setLoading(false);
      setShowModal(false);
      Swal.fire({
        title: "Thành công!",
        text: "Cập nhật avatar thành công!",
        icon: "success",
        confirmButtonColor: "#28a745",
      });
    } catch (error) {
      setLoading(false);
      console.log("Error update avatar:", error);
      Swal.fire({
        title: "Lỗi!",
        text: "Cập nhật avatar thất bại!",
        icon: "error",
      });
    }
  };

  return (
    <div className={styles.accountSideBar}>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật ảnh đại diện</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <input
              required
              className="form-control"
              type="file"
              accept="image/png, image/gif, image/jpeg"
              onChange={(e) => setFile(e.target.files[0])}
            />
            {file && ["image/png", "image/gif", "image/jpeg"].includes(file.type) && (
              <div style={{ width: 200, marginTop: 10 }}>
                <PreviewImage file={file} />
              </div>
            )}
            <Button disabled={loading} className="mt-2" type="submit">
              {loading ? "Đang lưu..." : "Lưu"}
            </Button>
          </form>
        </Modal.Body>
      </Modal>

      <div className="d-flex align-items-center" onClick={() => setShowModal(true)} style={{ cursor: "pointer" }}>
        <img 
          src={getAvatarUrl(avatar)} 
          alt="Avatar" 
          style={{ width: 50, height: 50, borderRadius: "50%", objectFit: "cover", marginRight: 10 }}
        />
        <span className={styles.sideBarTitle}>{fullName}</span>
      </div>

      <ul className={styles.navList}>
        <li className={styles.navItem}>
          <NavLink
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : null].join(" ")
            }
            to="/tai-khoan"
          >
            Thông tin tài khoản
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : null].join(" ")
            }
            to="/don-hang"
          >
            Đơn hàng
          </NavLink>
        </li>
        <li className={styles.navItem}>
          <NavLink
            className={({ isActive }) =>
              [styles.navLink, isActive ? styles.active : null].join(" ")
            }
            to="/dia-chi"
          >
            Địa chỉ
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default AccountSideBar;
