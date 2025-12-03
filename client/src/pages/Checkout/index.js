import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Form, Modal, NavLink, Breadcrumb, Badge } from "react-bootstrap";
import { FaCheck } from "react-icons/fa"

import PayItem from "../../components/Shop/PayItem";
import AddressSelect from "../../components/AddressSelect";
import PayPal from "../../components/PayPal"

import { useFormik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'
import format from "../../helper/format";

import axios from "axios";
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";

import methodData from "./methodData"

import { destroy } from "../../redux/actions/cart"
import styles from "./Payment.module.css";

// URL API GHN Test
const GHN_API_BASE = "https://dev-online-gateway.ghn.vn/shiip/public-api/v2";

export default function Checkout() {

  const [addressList, setAddressList] = useState([]);

  const cartData = useSelector((state) => state.cart);
  const currentUser = useSelector((state) => state.auth);

  const [defaultAddress, setDefaultAddress] = useState("");
  // shippingAddress là địa chỉ CHÍNH THỨC sẽ dùng để giao hàng
  const [shippingAddress, setShippingAddress] = useState(null);

  const [serviceList, setServiceList] = useState([])
  const [serviceId, setServiceId] = useState(null)

  const [showModalPayPal, setShowModalPayPal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [loadingService, setLoadingService] = useState(false)

  const [shippingFee, setShippingFee] = useState(0)
  const [leadTime, setLeadTime] = useState(0)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  // 1. Kiểm tra đăng nhập
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!currentUser.userId || !token) {
      navigate({ pathname: '/' })
    }
  }, [navigate, currentUser, cartData])

  // 2. Lấy danh sách địa chỉ đã lưu
  useEffect(() => {
    const fetchDataAddress = async () => {
      try {
        const { data } = await userApi.getAllAddressById(currentUser.userId);
        const addressData = data.address || [];
        
        // Tìm địa chỉ mặc định
        const defaultAddr = addressData.find(item => item?.isDefault) || addressData[0];
        
        if (defaultAddr) {
            setDefaultAddress({ ...defaultAddr, fullAddress: defaultAddr.address });
            setShippingAddress({ ...defaultAddr, fullAddress: defaultAddr.address }); // Mặc định chọn cái đầu tiên
        }

        setAddressList([...addressData, { address: "Địa chỉ mới", id: "-1" }]);
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser.userId) {
      fetchDataAddress();
    }
  }, [currentUser]);

  // Formik quản lý thông tin người nhận
  const formik = useFormik({
    initialValues: {
      fullName: currentUser?.fullName || "",
      email: currentUser?.email || "",
      phoneNumber: currentUser?.phoneNumber || "",
      addressId: defaultAddress?.id || "-1", // Dùng ID để quản lý radio button
      method: 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      fullName: Yup.string().required("Vui lòng nhập họ tên!"),
      email: Yup.string().email("Email không hợp lệ").required("Vui lòng nhập email!"),
      phoneNumber: Yup.string().required("Vui lòng nhập số điện thoại!"),
    }),
    onSubmit: async (values) => {
      // KIỂM TRA ĐỊA CHỈ TRƯỚC KHI SUBMIT
      if (!shippingAddress || !shippingAddress.fullAddress) {
        return Swal.fire({
          title: "Lỗi!",
          text: "Vui lòng chọn hoặc nhập địa chỉ giao hàng!",
          icon: "error",
        });
      }

      const { email, fullName, phoneNumber, method } = values;
      const { list } = cartData;

      const products = list.map(item => ({
        product: item?.product.id,
        imageUrl: item?.product?.imageUrl,
        name: item?.product?.name,
        quantity: item?.quantity,
        price: item?.product.price,
        totalItem: item?.totalPriceItem
      }));

      const paymentId = uuidv4();
      
      const body = {
        userId: currentUser?.userId,
        products,
        delivery: {
          fullName,
          email,
          phoneNumber,
          address: shippingAddress.fullAddress, // Lấy từ state shippingAddress chuẩn
        },
        voucherId: cartData?.voucher?.id,
        cost: {
          subTotal: cartData?.subTotal,
          shippingFee: shippingFee,
          discount: cartData?.discount,
          total: cartData?.total + shippingFee,
        },
        method: {
          code: +method,
          text: methodData.find(item => item?.value === +method)?.name
        }, 
        paymentId
      };

      try {
        setLoading(true);
        if (+method === 1) { // MoMo
             const { payUrl } = await orderApi.getPayUrlMoMo({ amount: body.cost.total, paymentId });
             await orderApi.create(body);
             await userApi.updateCart(currentUser?.userId, {cart: []});
             window.location.href = payUrl;
        } else { // COD hoặc khác
             await orderApi.create(body);
             await userApi.updateCart(currentUser?.userId, {cart: []});
             Swal.fire({
               title: "Thành công!",
               text: "Đặt hàng thành công!",
               icon: "success",
               confirmButtonColor: "#28a745",
             });
             dispatch(destroy());
             navigate({ pathname: '/don-hang' });
        }
      } catch (error) {
        console.log(error);
        Swal.fire({
          title: "Lỗi!",
          text: "Đặt hàng thất bại, vui lòng thử lại!",
          icon: "error",
        });
      } finally {
        setLoading(false);
      }
    },
  });

  // Xử lý khi chọn từ AddressSelect (Địa chỉ mới)
  const handleNewAddressChange = useCallback((data) => {
    // data: { province, district, ward, address }
    if (data.province && data.district && data.ward && data.address) {
        const full = `${data.address}, ${data.ward.wardName}, ${data.district.districtName}, ${data.province.provinceName}`;
        setShippingAddress({
            fullAddress: full,
            provinceId: data.province.provinceId,
            districtId: data.district.districtId,
            wardId: data.ward.wardId,
            address: data.address
        });
    } else {
        // Nếu xóa bớt thông tin thì reset để tránh lỗi
        // setShippingAddress(null); 
    }
  }, []);

  const handleChangeRadio = (e) => {
    const id = e.target.value;
    formik.setFieldValue("addressId", id);

    if (id !== "-1") {
      // Chọn địa chỉ có sẵn
      const addr = addressList.find(item => item.id == id); // Dùng == cho chắc ăn (chuỗi/số)
      if (addr) {
          setShippingAddress({ ...addr, fullAddress: addr.address });
      }
    } else {
      // Chọn "Địa chỉ mới" -> Reset shippingAddress để chờ nhập từ AddressSelect
      setShippingAddress(null);
    }
  };

  // 3. Lấy Dịch vụ vận chuyển (GHN)
  useEffect(() => {
    if (!shippingAddress?.districtId) return;

    const getService = async () => {
      try {
        setLoadingService(true);
        const result = await fetch(
          `${GHN_API_BASE}/shipping-order/available-services?to_district=${shippingAddress.districtId}&from_district=${process.env.REACT_APP_GHN_FROM_DISTRICT_ID}&shop_id=${process.env.REACT_APP_GHN_SHOP_ID}`, 
          {
            method: "GET",
            headers: { 'token': process.env.REACT_APP_GHN_TOKEN },
          }
        );
        const { data } = await result.json();
        setServiceList(data || []);
        if (data && data.length > 0) {
          setServiceId(data[0].service_id);
        }
        setLoadingService(false);
      } catch (error) {
        setLoadingService(false);
        console.log("Lỗi lấy dịch vụ ship:", error);
      }
    };
    getService();
  }, [shippingAddress]);

  // 4. Tính phí Ship & Thời gian giao
  useEffect(() => {
    if (!shippingAddress?.districtId || !shippingAddress?.wardId || !serviceId) return;

    const calculateShipping = async () => {
      try {
        setLoading(true);
        
        // Gọi API tính phí
        const feeRes = await axios.post(`${GHN_API_BASE}/shipping-order/fee`, {
          service_id: serviceId,
          insurance_value: cartData?.total,
          coupon: null,
          from_district_id: +process.env.REACT_APP_GHN_FROM_DISTRICT_ID,
          to_ward_code: shippingAddress.wardId, // Ward ID của GHN có thể là string
          to_district_id: shippingAddress.districtId,
          weight: 200,
          length: 30,
          width: 20,
          height: 5
        }, {
          headers: { 'token': process.env.REACT_APP_GHN_TOKEN, 'shopid': process.env.REACT_APP_GHN_SHOP_ID }
        });

        if (feeRes.data?.data?.total) {
            setShippingFee(feeRes.data.data.total);
        }

        // Gọi API tính thời gian
        const timeRes = await axios.post(`${GHN_API_BASE}/shipping-order/leadtime`, {
            service_id: serviceId,
            from_district_id: +process.env.REACT_APP_GHN_FROM_DISTRICT_ID,
            from_ward_code: process.env.REACT_APP_GHN_FROM_WARD_CODE,
            to_ward_code: shippingAddress.wardId,
            to_district_id: shippingAddress.districtId,
        }, {
            headers: { 'token': process.env.REACT_APP_GHN_TOKEN, 'shopid': process.env.REACT_APP_GHN_SHOP_ID }
        });

        if (timeRes.data?.data?.leadtime) {
            setLeadTime(timeRes.data.data.leadtime);
        }

        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log("Lỗi tính phí ship:", error);
      }
    };

    calculateShipping();
  }, [serviceId, shippingAddress, cartData]);

  // Điều kiện để nút Đặt hàng sáng lên
  const canSubmit = !loading && 
                    formik.values.fullName && 
                    formik.values.phoneNumber && 
                    shippingAddress?.fullAddress;

  return (
    <div className="main">
      <Container>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item active>Thanh toán</Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.payment_body}>
          <Row>
            <Col xl={7}>
              <div className={styles.payment_info}>
                <h4>THÔNG TIN NHẬN HÀNG</h4>
                
                {/* Các ô input Họ tên, Email, SĐT giữ nguyên logic formik */}
                <div className={`form-group ${styles.formGroup}`}>
                  <label className={styles.formLabel}>Họ và tên</label>
                  <input type="text" id="fullName" name="fullName" className="form-control"
                    value={formik.values.fullName} onChange={formik.handleChange} 
                  />
                </div>
                <div className={`form-group ${styles.formGroup}`}>
                  <label className={styles.formLabel}>Email</label>
                  <input type="email" id="email" name="email" className="form-control"
                    value={formik.values.email} onChange={formik.handleChange} 
                  />
                </div>
                <div className={`form-group ${styles.formGroup}`}>
                  <label className={styles.formLabel}>Số điện thoại</label>
                  <input type="text" id="phoneNumber" name="phoneNumber" className="form-control"
                    value={formik.values.phoneNumber} onChange={formik.handleChange} 
                  />
                </div>

                {/* Phần chọn địa chỉ */}
                <div>
                  <div className={styles.shippingAddress} style={{background: '#f8f9fa', padding: '10px', marginBottom: '10px'}}>
                    <b>Địa chỉ giao hàng:</b> {shippingAddress?.fullAddress || "Vui lòng chọn địa chỉ bên dưới"}
                    {shippingAddress?.fullAddress && <FaCheck color="green" style={{marginLeft: 5}}/>}
                  </div>

                  {addressList.map((item) => (
                    <div key={item.id} className="mb-2">
                      <input
                        type="radio"
                        name="addressId" // Sửa name để khớp formik
                        id={`addr-${item.id}`}
                        value={item.id}
                        checked={String(item.id) === String(formik.values.addressId)}
                        onChange={handleChangeRadio}
                        style={{marginRight: 8}}
                      />
                      <label htmlFor={`addr-${item.id}`}>{item.address}</label>
                    </div>
                  ))}

                  {/* Nếu chọn địa chỉ mới (-1) thì hiện form nhập */}
                  {String(formik.values.addressId) === "-1" && (
                      <div className="mt-3 p-3 border rounded">
                          <h6>Nhập địa chỉ mới:</h6>
                          <AddressSelect onChange={handleNewAddressChange} />
                      </div>
                  )}
                </div>
              </div>
            </Col>

            <Col xl={5}>
              <div className={styles.payment_form}>
                <h4>ĐƠN HÀNG CỦA BẠN</h4>
                {/* ... (Phần hiển thị sản phẩm giữ nguyên) ... */}
                
                {cartData?.list.map((item) => (
                    <PayItem item={item?.product} key={item?.product?.id} quantity={item?.quantity} totalPriceItem={item?.totalPriceItem} />
                ))}

                <div className="border-top pt-2 mt-2">
                    <div className="d-flex justify-content-between">
                        <span>Tạm tính:</span>
                        <span>{format.formatPrice(cartData?.subTotal)}</span>
                    </div>
                    <div className="d-flex justify-content-between">
                        <span>Phí vận chuyển:</span>
                        <span>{shippingFee > 0 ? `+${format.formatPrice(shippingFee)}` : 'Đang tính...'}</span>
                    </div>
                    <div className="d-flex justify-content-between text-danger fw-bold mt-2">
                        <span>TỔNG CỘNG:</span>
                        <span>{format.formatPrice(cartData?.total + shippingFee)}</span>
                    </div>
                </div>

                {/* Hiển thị Dịch vụ GHN (Nếu có) */}
                {serviceList.length > 0 && (
                    <div className="mt-3">
                        <h6>Đơn vị vận chuyển (GHN):</h6>
                        {serviceList.map(s => (
                            <div key={s.service_id}>
                                <input type="radio" checked={serviceId === s.service_id} readOnly /> {s.short_name}
                            </div>
                        ))}
                        {leadTime > 0 && <small className="text-muted">Giao dự kiến: {moment.unix(leadTime).format("DD/MM/YYYY")}</small>}
                    </div>
                )}

                <h4 className="mt-4">PHƯƠNG THỨC THANH TOÁN</h4>
                <div>
                  {methodData.map(method => (
                    <div key={method.value} className="mb-2">
                      <input type="radio" name="method" value={method.value} id={`method-${method.value}`} 
                        checked={parseInt(formik.values.method) === method.value} 
                        onChange={formik.handleChange} 
                        style={{marginRight: 8}}
                      /> 
                      <label htmlFor={`method-${method.value}`}>{method.name}</label>
                    </div>
                  ))}
                </div>

                {/* Hiển thị PayPal component khi chọn PayPal */}
                {parseInt(formik.values.method) === 2 && (
                  <div className="mt-3">
                    <PayPal amount={cartData?.total + shippingFee} onSuccess={() => {}} />
                  </div>
                )}

                {/* Ẩn nút đặt hàng khi chọn PayPal */}
                {parseInt(formik.values.method) !== 2 && (
                  <button 
                      type="button" 
                      className="bookstore-btn mt-3 w-100 btn btn-danger" 
                      onClick={formik.handleSubmit} 
                      disabled={!canSubmit} // Nút chỉ sáng khi đủ thông tin
                      style={{ opacity: !canSubmit ? 0.6 : 1 }}
                  >
                    {loading ? "ĐANG XỬ LÝ..." : "ĐẶT HÀNG"}
                  </button>
                )}
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}