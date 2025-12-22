import { useEffect, useState, useMemo } from "react"; // Thêm useMemo
import { Container, Row, Col, Table, Breadcrumb, NavLink } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { swalInfo } from "../../helper/swal";
import { useSelector, useDispatch } from "react-redux";

import CartItem from "../../components/Shop/CartItem";

import format from "../../helper/format";
import styles from "./Cart.module.css";

import userApi from "../../api/userApi"
import voucherApi from "../../api/voucherApi"
import { updateVoucher } from "../../redux/actions/cart"

import { setCart } from "../../redux/actions/cart";

function Cart() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cartData = useSelector((state) => state.cart)
  const currentUser = useSelector((state) => state.auth)
  const { voucher } = cartData
  const [voucherInput, setVoucherInput] = useState(voucher?.code || "")

  useEffect(() => {
    setVoucherInput(voucher?.code || "")
  }, [voucher])

  // --- 1. TÍNH TOÁN CÁC CHỈ SỐ DỰA TRÊN SẢN PHẨM ĐƯỢC CHỌN ---
  
  // Lọc ra các sản phẩm đang được tích chọn (checked === true)
  const selectedItems = useMemo(() => {
    return cartData.list.filter(item => item.checked);
  }, [cartData.list]);

  // Tính tổng tiền hàng (Tạm tính) của các sản phẩm được chọn
  const selectedSubTotal = useMemo(() => {
    return selectedItems.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
  }, [selectedItems]);

  // Tính số tiền được giảm giá thực tế trên các sản phẩm được chọn
  const currentDiscount = useMemo(() => {
    if (!voucher || !voucher.value) return 0;
    
    // Nếu tổng tiền chọn nhỏ hơn mức tối thiểu của voucher -> Không giảm
    if (voucher.minimum && selectedSubTotal < voucher.minimum) return 0;

    // Giả sử logic voucher: by === 'percent' (phần trăm) hoặc tiền mặt
    // Bạn cần điều chỉnh logic này khớp với backend của bạn
    // Ví dụ đơn giản: voucher.value là số tiền giảm trực tiếp
    // Nếu là %: return (selectedSubTotal * voucher.value) / 100;
    
    // Ở đây tôi giả định voucher.value là tiền mặt, cần check logic reducer của bạn
    // Nếu reducer của bạn đã xử lý logic 'by' rồi, bạn có thể phải tính lại ở đây:
    let discountAmount = 0;
    if(voucher.by === "percent") { // Ví dụ
        discountAmount = (selectedSubTotal * voucher.value) / 100;
    } else {
        discountAmount = voucher.value;
    }

    // Tiền giảm không được vượt quá tổng tiền
    return discountAmount > selectedSubTotal ? selectedSubTotal : discountAmount;
  }, [voucher, selectedSubTotal]);

  // Tính tổng thanh toán cuối cùng
  const finalTotal = selectedSubTotal - currentDiscount;

  const isAllChecked = useMemo(() => {
    return cartData.list.length > 0 && cartData.list.every((item) => item.checked);
  }, [cartData.list]);

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const newList = cartData.list.map((item) => ({
      ...item,
      checked: isChecked,
    }));
    
    // Cập nhật Redux (và API sẽ tự update nhờ useEffect ở dưới)
    dispatch(setCart(newList)); 
  };

  const handleCheckItem = (productId, isChecked) => {
    const newList = cartData.list.map((item) => 
      item.product.id === productId ? { ...item, checked: isChecked } : item
    );
    dispatch(setCart(newList));
  };

  useEffect(() => {
    const addToCart = async() => {
      try {
        const { list } = cartData
        const newList = list.map(item => {
            // Cần lưu cả trạng thái checked xuống DB nếu muốn giữ trạng thái khi F5
            return { product: item?.product.id, quantity: item?.quantity, checked: item?.checked } 
        })
        await userApi.updateCart(currentUser.userId, {cart: newList})
      } catch (error) {
        console.log(error)
      }
    }
    if (currentUser && currentUser.userId) {
      addToCart()
    } else {
      navigate({pathname: "/"})
    }

  }, [cartData, currentUser, navigate])

  const handleNavigateToCheckout = (e) => {
    if (!currentUser.userId) {
      e.preventDefault()
      swalInfo("Bạn cần đăng nhập để thực hiện thanh toán!")
      return;
    }
    // --- 2. CHECK SẢN PHẨM ĐƯỢC CHỌN ---
    if (selectedItems.length === 0) {
        e.preventDefault();
        swalInfo("Vui lòng chọn ít nhất một sản phẩm để thanh toán!");
    }
  }

  const handleApplyVoucher = async () => {
    try {
        if (!voucherInput) {
        dispatch(updateVoucher({
          id: "",
          code: "",
          value: 0,
          by: "",
          minimum: 0,
        }));
        return
      }
      if (voucherInput === cartData?.voucher?.code) return 
      const { data: voucherData } = await voucherApi.getByCode(voucherInput)
      const { minimum, id, value, by, start, end } = voucherData

      if (!id) {
        swalInfo("Thông báo", { text: "Voucher này không tồn tại!", confirmButtonColor: "#17a2b8" });
        dispatch(updateVoucher({
          id: "",
          code: "",
          value: 0,
          by: ""
        }))
        return
      }

      // --- 3. CHECK VOUCHER VỚI TỔNG TIỀN ĐÃ CHỌN ---
      // Thay cartData.subTotal bằng selectedSubTotal
      if (selectedSubTotal < minimum) {
        swalInfo("Thông báo", { text: `Giá trị các sản phẩm được chọn cần tối thiểu ${format.formatPrice(minimum)} để áp dụng!`, confirmButtonColor: "#17a2b8" });
        return
      }

      const now = new Date()
      if (!(now >= new Date(start) && now <= new Date(end))) {
        swalInfo("Thông báo", { text: "Thời gian không phù hợp!", confirmButtonColor: "#17a2b8" });
        return
      }
    
      dispatch(
        updateVoucher({
          id: id,
          code: voucherInput,
          value: value,
          by: by,
          minimum: minimum,
        })
      );
    } catch (error) {
      console.log(error)
      swalInfo("Thông báo", { text: "Có lỗi xảy ra khi áp dụng voucher", confirmButtonColor: "#dc3545" });
    }
  }

  return (
    <div className="main">
      <Container>
        <Breadcrumb>
          <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item active linkAs={NavLink} linkProps={{ to: "/gio-hang" }}>Giỏ hàng</Breadcrumb.Item>
        </Breadcrumb>
        {cartData.list.length > 0 ? (
          <Row >
            <Col xl={9}>
              <div className={styles.cartLeft}>
                <Table hover style={{ backgroundColor: "white" }}>
                  <thead style={{ backgroundColor: "#343a40", color: "#ECF0F1", textAlign: "center" }}>
                    <tr>
                      <th style={{ width: '100px', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                            <input 
                                type="checkbox" 
                                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                                checked={isAllChecked}
                                onChange={handleSelectAll}
                            />
                            <span>Tất cả</span>
                        </div>
                      </th>
                      <th>Sản phẩm</th>
                      <th>Đơn giá</th>
                      <th>Số lượng</th>
                      <th>Thành tiền</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartData.list.map((item) => (
                      <CartItem
                        key={item.product.id}
                        productId={item.product.id}
                        name={item.product.name}
                        imageUrl={item.product.imageUrl}
                        price={item.product.price}
                        quantity={item.quantity}
                        totalPriceItem={item.totalPriceItem}
                        checked={item.checked} // Đảm bảo CartItem có xử lý sự kiện toggle check
                        onCheck={handleCheckItem}
                      ></CartItem>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Col>
            <Col xl={3}>
              <div className={styles.cartRight}>
                <div className={styles.voucher}>
                    <div className={styles.voucherGroup}>
                      <input type="text" className="form-control" placeholder="Nhập mã giảm giá" value={voucherInput}  onChange={(e) => setVoucherInput(e.target.value)} />
                      <button type="button" onClick={handleApplyVoucher}>Áp dụng</button>
                    </div>
                </div>
                <div className={styles.cartInfo}>
                  <div className="d-flex justify-content-between p-2" style={{borderBottom: "1px solid #ece9e9"}}>
                    <p>Tạm tính ({selectedItems.length} sản phẩm)</p>
                    {/* 4. HIỂN THỊ CÁC GIÁ TRỊ ĐÃ TÍNH TOÁN */}
                    <p>{format.formatPrice(selectedSubTotal)}</p>
                  </div>
                  <div className="d-flex justify-content-between align-items-center p-2" style={{borderBottom: "1px solid #ece9e9"}}>
                    <p>Giảm giá</p>
                    {cartData?.voucher?.code && <p className={styles.voucherCode}>{cartData?.voucher?.code}</p>}
                    <p>-{format.formatPrice(currentDiscount)}</p>
                  </div>
                  <div className="d-flex justify-content-between p-2" style={{borderBottom: "1px solid #ece9e9"}}>
                    <p>Thành tiền</p>
                    <p>{format.formatPrice(finalTotal)}</p>
                  </div>
                </div>
                {/* 5. LOGIC LINK THANH TOÁN */}
                <Link to="/thanh-toan" onClick={handleNavigateToCheckout}>
                  <button className={styles.btnCheckout}>
                    Tiến hành thanh toán ({selectedItems.length})
                  </button>
                </Link>
              </div>
            </Col>
          </Row>
        ) : 
        <Row>
          <Col xl={12}>
            <div className={styles.empty}>
              <img src="https://www.hanoicomputer.vn/template/july_2021/images/tk-shopping-img.png" alt="" />
              <p>Không có sản phẩm nào trong giỏ hàng của bạn!</p>
              <Link to="/" className={`bookstore-btn ${styles.backHome}`}>Tiếp tục mua sắm</Link>
            </div>
          </Col>
        </Row>}
      </Container>
    </div>
  );
}

export default Cart;