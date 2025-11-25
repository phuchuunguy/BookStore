import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Modal, Button } from "react-bootstrap"
import { useDispatch, useSelector } from "react-redux";
import { toast } from 'react-toastify';
import axios from "axios";

import PreviewImage from  "../../../components/PreviewImage"

import { updateAvatar } from "../../../redux/actions/auth"
import userApi from "../../../api/userApi";

import styles from "./AccountSideBar.module.css";

function AccountSideBar() {
  const dispatch = useDispatch();

  const [file, setFile] = useState({});

  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userId, fullName, avatar } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!["image/png", "image/gif", "image/jpeg"].includes(file?.type)) {
      return toast.info("File không đúng định dạng!", { autoClose: 2000 });
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "fti6du11");
      setLoading(true);
      const {
        data: { secure_url, public_id },
      } = await axios.post(
        "https://api.cloudinary.com/v1_1/dbynglvwk/image/upload",
        formData
      );
      if (secure_url && public_id) {
        const avatar = {
          url: secure_url,
          publicId: public_id,
        };
        await userApi.updateAvatar(userId, { avatar });
        dispatch(updateAvatar(avatar));
      }
      setLoading(false);
      setShowModal(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
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
            {["image/png", "image/gif", "image/jpeg"].includes(file?.type) && (
              <div style={{ width: 200 }}>
                <PreviewImage file={file} />
              </div>
            )}
            <Button disabled={loading} className="mt-2" type="submit">
              Lưu
            </Button>
          </form>
        </Modal.Body>
      </Modal>
      <div className="d-flex align-items-center" onClick={() => setShowModal(true)}>
        <img src={avatar?.url} alt="Ảnh lỗi" />
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
