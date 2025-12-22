import React, { useState } from "react";
import { AiFillCopy, AiOutlineShoppingCart } from "react-icons/ai";
import moment from "moment";
import styles from "./DiscountItem.module.css";
import format from "../../../helper/format";
import logo from "../../../assets/images/logo.png";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { updateVoucher } from "../../../redux/actions/cart";
import { useNavigate } from "react-router-dom";

const DiscountItem = ({ item }) => {
  const cartData = useSelector((state) => state.cart)
  const dispatch = useDispatch();
  const navigate = useNavigate()


  const [copied, setCopied] = useState(false);

  const copyClipboard = (value) => {
    navigator.clipboard.writeText(value);
    
    // --- THAY ĐỔI DUY NHẤT TẠI ĐÂY ---
    if (!copied) {
      Swal.fire({
        icon: 'success',
        title: 'Đã sao chép!',
        text: 'Mã giảm giá đã lưu vào bộ nhớ tạm',
        showConfirmButton: false,
        timer: 1200
      });
    }
    // ---------------------------------
    
    setCopied(true);
  };

  const handleUseNow = ({ code, minimum, id, value, by, start, end }) => {
    try {
      const voucherId = id || "";
      if (cartData?.list.length <= 0) {
        Swal.fire({
          title: "Thông báo",
          text: "Giỏ hàng của bạn đang rỗng!",
          icon: "info",
          confirmButtonColor: "#17a2b8",
        });
        return;
      }
      if (!code) {
        dispatch(
          updateVoucher({
            id: "",
            code: "",
            value: 0,
            by: "",
            minimum: 0,
          })
        );
        navigate({ pathname: '/gio-hang' });
        return;
      }
      if (code === cartData?.voucher?.code) {
        navigate({ pathname: '/gio-hang' });
        return;
      }
      if (cartData.subTotal < minimum) {
        Swal.fire({
          title: "Thông báo",
          text: `Giá trị đơn hàng cần tối thiểu ${format.formatPrice(minimum)} để áp dụng!`,
          icon: "info",
          confirmButtonColor: "#17a2b8",
        });
        return;
      }
      const now = new Date();
      if (!(now >= new Date(start) && now <= new Date(end))) {
        Swal.fire({
          title: "Thông báo",
          text: "Thời gian không phù hợp!",
          icon: "info",
          confirmButtonColor: "#17a2b8",
        });
        return;
      }
      dispatch(
        updateVoucher({
          id: voucherId,
          code: code,
          value: value,
          by: by,
          minimum: minimum,
        })
      );
      navigate({ pathname: '/gio-hang' });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className={`d-flex ${styles.discount_item}`}>
      <div className={styles.discount_item_left}>
        <img src={logo} alt="" />
      </div>
      <div className={styles.discount_item_right}>
        <div>
          <div className={styles.info}>
            <h6>
              Giảm {item.by === "percent" ? (
                `${format.formatVoucher(item.value)}%`
              )
              : format.formatPrice(item.value)} Đơn tối thiểu{" "}
              {format.formatPrice(item.minimum)}
            </h6>
            <p>
              Từ {moment(item?.start).format('DD-MM-yyyy')} Đến {moment(item?.end).format('DD-MM-yyyy')}
            </p>
          </div>
          <div className={styles.actions}>
            <button
              className={!copied ? "" : styles.unactive}
              onClick={() => copyClipboard(item.code)}
            >
              <AiFillCopy />
              {!copied ? "Copy" : "Đã copy"}
            </button>
            <button onClick={() => handleUseNow(item)}>
              <AiOutlineShoppingCart />
              Dùng ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountItem;