import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Container, Row, Col, Form, Modal, NavLink, Breadcrumb, Button, Badge } from "react-bootstrap";
import { FaCheck } from "react-icons/fa"

import PayItem from "../../components/Shop/PayItem";
import AddressSelect from "../../components/AddressSelect";
import PayPal from "../../components/PayPal"

import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from 'react-toastify';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment'
import format from "../../helper/format";

import axios from "axios";
import orderApi from "../../api/orderApi";
import userApi from "../../api/userApi";

import methodData from "./methodData"

import { destroy } from "../../redux/actions/cart"
import styles from "./Payment.module.css";


export default function Checkout() {

  const [addressList, setAddressList] = useState([]);

  const cartData = useSelector((state) => state.cart);
  const currentUser = useSelector((state) => state.auth);

  const [defaultAddress, setDefaultAddress] = useState("");
  const [newAddress, setNewAddress] = useState({})
  const [shippingAddress, setShippingAddress] = useState({});

  const [serviceList, setServiceList] = useState([])
  const [serviceId, setServiceId] = useState("")

  const [showModalPayPal, setShowModalPayPal] = useState(false);
  const [loading, setLoading] = useState(false)
  const [loadingService, setLoadingService] = useState(false)

  const [shippingFee, setShippingFee] = useState(0)
  const [leadTime, setLeadTime] = useState(0)

  const navigate = useNavigate()
  const dispatch = useDispatch()

   
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!currentUser.userId || !token) {
      navigate({ pathname: '/' })
    }
  }, [navigate, currentUser, cartData])

  useEffect(() => {
    // Call API lấy danh sách địa chỉ
    const fetchDataAddress = async () => {
      try {
        const { data } = await userApi.getAllAddressById(currentUser.userId);
        const addressData = data.address;
        if (addressData.length > 0) {
          const result = addressData.filter((item) => item?.isDefault === true);
          if (result.length > 0) {
            setDefaultAddress({...result[0], fullAddress: result[0]?.address})
            setNewAddress({...result[0], fullAddress: result[0]?.address})
          }
          else {
            setDefaultAddress({...addressData[0], fullAddress: addressData[0]?.address});
            setNewAddress({...addressData[0], fullAddress: addressData[0]?.address});
          }
        }
        setAddressList([...addressData, { address: "Địa chỉ khác", _id: "-1" }]);
      } catch (error) {
        console.log(error);
      }
    };

    if (currentUser.userId) {
      fetchDataAddress();
    }
  }, [currentUser]);

  const formik = useFormik({
    initialValues: {
      fullName: currentUser && currentUser.fullName ? currentUser.fullName : "",
      email: currentUser && currentUser.email ? currentUser.email : "",
      phoneNumber:
        currentUser && currentUser.phoneNumber ? currentUser.phoneNumber : "",
      address: defaultAddress,
      method: 0,
    },
    enableReinitialize: true,
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: Yup.object({
      fullName: Yup.string().required("Không được bỏ trống trường này!"),
      email: Yup.string()
        .email("Invalid email")
        .required("Không được bỏ trống trường này!"),
      phoneNumber: Yup.string().required("Không được bỏ trống trường này!"),
    }),
    onSubmit: async () => {
      const { email, fullName, phoneNumber, address, method } = formik.values;
      const { list } = cartData
      const products = list.map(item => {
        return {
          product: item?.product._id,
          imageUrl: item?.product?.imageUrl,
          name: item?.product?.name,
          quantity: item?.quantity,
          price: item?.product.price,
          totalItem: item?.totalPriceItem
        }
      })
      
      if (address?._id === "-1" && shippingAddress?.address === "") {
        return alert("Vui lòng điền đầy đủ thông tin!")
      }
      if (shippingAddress?.fullAddress === "") {
        return
      }
      const paymentId = uuidv4()
      const body = {
        userId: currentUser && currentUser.userId ? currentUser.userId : "",
        products,
        delivery: {
          fullName,
          email,
          phoneNumber,
          address: shippingAddress?.fullAddress,
        },
        voucherId: cartData?.voucher?._id,
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
      }
      switch (+method) {
        case 0: 
        {
          try {
            setLoading(true)
            await orderApi.create(body)
            await userApi.updateCart(currentUser?.userId, {cart: []})
            toast.success("Đặt mua hàng thành công!", {autoClose: 2000})
            setLoading(false)
            dispatch(destroy())
            navigate({ pathname: '/don-hang' })
          } catch (error) {
            setLoading(false)
          }
          break
        }
        case 1:
          {
            try {
              setLoading(true)
              const { payUrl } = await orderApi.getPayUrlMoMo({ amount: cartData?.total , paymentId })
              await orderApi.create(body)
              await userApi.updateCart(currentUser?.userId, {cart: []})
              setLoading(false)
              window.location.href = payUrl

            } catch (error) {
              setLoading(false)
              console.log(error)
            }
            break
          }
        case 2: 
        {
          // setShowModalPayPal(true)
          alert("Tính năng đăng phát triển")
          break;
        }

        default: {
          break
        }
      }
    },
  });

  const handleChangeAddress = useCallback((data) => {
    const { province: { provinceId, provinceName }, district: { districtId, districtName }, ward: { wardId, wardName }, address } = data
    setNewAddress({
      address,
      fullAddress: `${address}, ${wardName}, ${districtName}, ${provinceName}`,
      provinceId,
      districtId,
      wardId
    })
  }, []);

  const handleSuccess = useCallback(async () => {
    try {
      toast.success("Thanh toán thành công!", { autoClose: 2000 });
      setShowModalPayPal(false)
    } catch (error) {
      console.log(error)
    }
  }, [])

  const handleChangeRadio = (e) => {
    const id = e.target.value;
    let address = {}
    if (id !== "-1") {
      address = addressList.find(item => item?._id === id)
      setNewAddress({...address, fullAddress: address?.address})
    }
    formik.setFieldValue("address", {
      _id: id,
      ...address
    });
  }

  useEffect(() => {
    const getService = async () => {
      try {
        setLoadingService(true)
        const { districtId } = shippingAddress
        const result = await fetch(
          `https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/available-services?to_district=${districtId}&from_district=${process.env.REACT_APP_GHN_FROM_DISTRICT_ID}&shop_id=${process.env.REACT_APP_GHN_SHOP_ID}`, {
            method: "GET",
            headers: {
              'token': process.env.REACT_APP_GHN_TOKEN,
            },
        });
        const { data } = await result.json();
        setServiceList(data || [])
        if (data) {
          setServiceId(data[0]?.service_id)
        }
        setLoadingService(false)
      } catch (error) {
        setLoadingService(false)
        console.log(error)
      }
    }
  if (shippingAddress && shippingAddress?.districtId) getService()
  }, [shippingAddress])

  useEffect(() => {
    const getShippingFee = async () => {
      try {
        setLoading(true)
        const { districtId, wardId } = shippingAddress
        const { data } = await axios.post("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee", {
          service_id: serviceId,
          insurance_value: cartData?.total,
          coupon: null,
          from_district_id: +process.env.REACT_APP_GHN_FROM_DISTRICT_ID,
          to_ward_code: wardId,
          to_district_id: districtId,
          weight: 200,
          length: 30,
          width: 20,
          height: 5
        }, {
          headers: {
            'token': process.env.REACT_APP_GHN_TOKEN,
            'shopid': 3710396
          },
        })
        const { total: totalFee } = data?.data
        if  (totalFee) {
          setShippingFee(totalFee)
        }
        setLoading(false)
        
      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    }
    const getLeadTime= async () => {
      try {
        setLoading(true)
        const { districtId, wardId } = shippingAddress
        const { data } = await axios.post("https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/leadtime", {
          service_id: serviceId,
          from_district_id: +process.env.REACT_APP_GHN_FROM_DISTRICT_ID,
          from_ward_code: process.env.REACT_APP_GHN_FROM_WARD_CODE,
          to_ward_code: wardId,
          to_district_id: districtId,
        }, {
          headers: {
            'token': process.env.REACT_APP_GHN_TOKEN,
            'shopid': 3710396
          },
        })
        
        if (data?.code === 200) {
          setLeadTime(data?.data?.leadtime)
        }
        setLoading(false)
        
      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    }
    if (shippingAddress && shippingAddress?.districtId && serviceId && loadingService === false) {
      getShippingFee()
      getLeadTime()
    }
  }, [serviceId, shippingAddress, cartData, loadingService, dispatch])

  return (
    <div className="main">
      <Modal
          size="lg"
          show={showModalPayPal}
          onHide={() => setShowModalPayPal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Thanh toán</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <PayPal amount={(cartData?.total / 23805).toFixed(2)} onSuccess={handleSuccess} />
          </Modal.Body>
        </Modal>
      <Container>
        <Breadcrumb>
            <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
            <Breadcrumb.Item active linkAs={NavLink} linkProps={{ to: "/thanh-toan" }}>Thanh toán</Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.payment_body}>
          <Row>
            <Col xl={7}>
              <div className={styles.payment_info}>
                <h4>THÔNG TIN NHẬN HÀNG</h4>
                <div className={`form-group ${styles.formGroup}`}>
                  <label className={styles.formLabel}>Họ và tên</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    className={`form-control ${styles.formControl} ${
                      formik.errors.fullName ? "is-invalid" : "is-valid"
                    }`}
                    placeholder="Họ và tên"
                    value={formik.values.fullName}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                  />
                  {formik.errors.fullName && (
                    <Form.Control.Feedback
                      type="invalid"
                      className={styles.feedback}
                    >
                      {formik.errors.fullName}
                    </Form.Control.Feedback>
                  )}
                </div>

                <div className={`form-group ${styles.formGroup}`}>
                  <label className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className={`form-control ${styles.formControl} ${
                      formik.errors.email ? "is-invalid" : "is-valid"
                    }`}
                    placeholder="Email"
                    value={formik.values.email}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                  />
                  {formik.errors.email && (
                    <Form.Control.Feedback
                      type="invalid"
                      className={styles.feedback}
                    >
                      {formik.errors.email}
                    </Form.Control.Feedback>
                  )}
                </div>

                <div className={`form-group ${styles.formGroup}`}>
                  <label className={styles.formLabel}>Số điện thoại</label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    className={`form-control ${styles.formControl} ${
                      formik.errors.phoneNumber ? "is-invalid" : "is-valid"
                    }`}
                    placeholder="Số điện thoại"
                    value={formik.values.phoneNumber}
                    onBlur={formik.handleBlur}
                    onChange={formik.handleChange}
                  />
                  {formik.errors.phoneNumber && (
                    <Form.Control.Feedback
                      type="invalid"
                      className={styles.feedback}
                    >
                      {formik.errors.phoneNumber}
                    </Form.Control.Feedback>
                  )}
                </div>
                <div>
                  <div className={styles.shippingAddress}>
                    <p>Địa chỉ giao hàng: {shippingAddress?.fullAddress}</p>
                    {shippingAddress?.fullAddress && <FaCheck />}
                  </div>
                  {addressList && addressList?.length > 1 ? (
                    addressList.map((item) => (
                      <div key={item?._id} className="mb-2">
                        <input
                          type="radio"
                          name="address"
                          id={item?._id}
                          value={item?._id}
                          checked={item?._id === formik?.values?.address?._id}
                          onChange={handleChangeRadio}
                        />
                        <label htmlFor={item?._id}>{item?.address}</label>
                      </div>
                    ))
                  ) : (
                    <AddressSelect onChange={handleChangeAddress} />
                  )}
                </div>
                {formik.values?.address?._id === "-1" && <AddressSelect onChange={handleChangeAddress} />}
                <Button style={{width: 250, marginTop: 15}} disabled={loading} variant="danger" type="button" onClick={() =>  {
                  if ((formik.values?.address?._id === "-1" || addressList?.length <= 1) && newAddress?.address === "") {
                    return alert("Vui lòng điền đầy đủ thông tin!")
                  }
                  if (newAddress?.loading && newAddress?.loading === true) return
                  setShippingAddress(newAddress)
                }}>Xác nhận địa chỉ</Button>
              </div>
            </Col>
            <Col xl={5}>
              <div className={styles.payment_form}>
                <h4>ĐƠN HÀNG CỦA BẠN</h4>
                <div>
                  <p>
                    SẢN PHẨM<span className={styles.form_right1}>TỔNG</span>
                  </p>
                  {cartData?.list.map((item) => (
                    <PayItem
                      item={item?.product}
                      key={item?.product._id}
                      quantity={item?.quantity}
                      totalPriceItem={item?.totalPriceItem}
                    />
                  ))}
                  <p>
                    Tạm tính
                    <span className={styles.form_right}>
                      {format.formatPrice(cartData?.subTotal)}
                    </span>
                  </p>
                  <p>
                    Giảm giá
                    <span className={styles.form_right}>
                      -{format.formatPrice(cartData?.discount)}
                    </span>
                  </p>
                  <p>
                    Phí vận chuyển
                    <span className={styles.form_right}>
                      +{format.formatPrice(shippingFee)}
                    </span>
                  </p>
                  <p>
                    Tổng
                    <span className={styles.form_right}>
                      {format.formatPrice(cartData?.total + shippingFee)}
                    </span>
                  </p>
                </div>
                {shippingAddress && shippingAddress?.districtId ? (
                  <>
                    <br></br>
                    <h4>DỊCH VỤ VẬN CHUYỂN</h4>
                    <div>
                      {serviceList && serviceList?.length > 0 ? serviceList.map(service => {
                        return (
                          <div key={service?.service_id}>
                            <input type="radio" name="service" value={service?.service_id} id={service?.service_id} checked={serviceId === service?.service_id} 
                                onChange={(e) => setServiceId(+e.target.value)} /> 
                            <label htmlFor={service?.service_id}>{service?.short_name}</label>
                            <br />
                          </div>
                        )
                      }) : <h5>Không tìm thấy dịch vụ vận chuyển</h5>}
                    </div>
                    {leadTime && <p>Thời gian giao hàng dự kiến: <Badge bg="danger">{moment.unix(leadTime).format("DD-MM-yyy")}</Badge></p>}
                    </>
                ) : null}
                <br></br>
                <h4>PHƯƠNG THỨC THANH TOÁN</h4>
                <div>
                  {methodData && methodData.map(method => {
                    return (
                      <div key={method.value}>
                        <input type="radio" name="method" value={method.value} id={method.name} checked={parseInt(formik.values.method) === method.value} 
                            onChange={formik.handleChange} /> 
                        <label htmlFor={method.name}>{method.name}</label>
                        {method.image && <label htmlFor={method.name}> <img className="icon-method" src={method.image} alt="" /></label>}
                        <br />
                      </div>
                    )
                  })}
                </div>
                <button type="button" className="bookstore-btn" onClick={formik.handleSubmit} 
                disabled={loading || formik.errors.email || formik.errors.fullName || !formik.values.phoneNumber || !shippingAddress?.fullAddress}>
                  {loading ? "ĐẶT HÀNG..." : "ĐẶT HÀNG"}
                </button>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
