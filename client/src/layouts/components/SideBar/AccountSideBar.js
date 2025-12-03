import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import PreviewImage from "../../../components/PreviewImage";
import { updateAvatar } from "../../../redux/actions/auth";
import userApi from "../../../api/userApi";
import { getAvatarUrl } from "../../../helper/avatar";
import { roleEnum } from "./routes";

import styles from "./AccountSideBar.module.css";

function AccountSideBar() {
  const dispatch = useDispatch();
  const { userId, fullName, avatar, role } = useSelector((state) => state.auth);

  const [file, setFile] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) return toast.info("Chưa chọn file!", { autoClose: 2000 });

    if (!["image/png", "image/gif", "image/jpeg"].includes(file.type)) {
      return toast.info("File không đúng định dạng!", { autoClose: 2000 });
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      const response = await userApi.updateAvatar(userId, formData);

      const updatedAvatar = response?.data?.avatar || response?.avatar;

      if (updatedAvatar) {
        dispatch(updateAvatar(updatedAvatar));
      }

      setLoading(false);
      setShowModal(false);

      toast.success("Cập nhật avatar thành công!");
    } catch (error) {
      setLoading(false);
      console.log("Error update avatar:", error);
      toast.error("Cập nhật avatar thất bại!");
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

            {file &&
              ["image/png", "image/gif", "image/jpeg"].includes(file.type) && (
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

      {/* Avatar + Tên */}
      <div
        className="d-flex align-items-center"
        onClick={() => setShowModal(true)}
        style={{ cursor: "pointer" }}
      >
        <img
          src={file ? URL.createObjectURL(file) : getAvatarUrl(avatar)}
          alt="Avatar"
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            objectFit: "cover",
            marginRight: 10,
          }}
        />

        <span className={styles.sideBarTitle}>{fullName}</span>
      </div>

      {/* Menu */}
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

        {Number(role) === roleEnum.Customer && (
          <>
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
          </>
        )}
      </ul>
    </div>
  );
}

export default AccountSideBar;
