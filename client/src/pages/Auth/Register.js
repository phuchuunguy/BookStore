import React, { useEffect, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation, Link } from "react-router-dom"; 
import { useFormik } from "formik";
import * as Yup from "yup";
import OAuth2Login from "react-simple-oauth2-login";
import Swal from "sweetalert2"; // 1. Import SweetAlert2

import authApi from "../../api/authApi";
import { login } from "../../redux/actions/auth";
import { setCart } from "../../redux/actions/cart";
import userApi from "../../api/userApi";
import styles from "./Auth.module.css";

export default function Register() {

  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); 

  const responseSuccessGoogle = async (response) => {
    const accessToken = response.access_token;
    console.log("accessToken-Google", accessToken);

    const { token, user } = await authApi.loginWithGoogle(accessToken);
    
    localStorage.setItem("accessToken", token);
    const { email, fullName, phoneNumber, userId, avatar, role } = user;
    dispatch(login({ email, fullName, phoneNumber, avatar, userId, role }));
    // Fetch cart after login
    try {
      const { data: cartData } = await userApi.getCart(userId);
      const newList = (cartData.cart || []).map((item) => {
        const { price, discount } = item.product || { price: 0, discount: 0 };
        const newPrice = price - price * ((discount > 0 ? discount : 0) / 100);
        return {
          ...item,
          product: { ...item.product, price: newPrice },
          totalPriceItem: newPrice * item.quantity,
        };
      });
      dispatch(setCart(newList));
    } catch (err) {
      console.log('Fetch cart after register/google login error:', err);
    }
    navigate({ pathname: "/" });
  };

  const responseFailureGoogle = (response) => {
    console.log(response);
  };

  const responseSuccessFacebook = async (response) => {
    const accessToken = response.access_token;

    const result = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
    );
    const data = await result.json();
    const { email, id, name } = data;
    const avatarFB = data?.picture?.data.url;

    const { token, user } = await authApi.loginWithFacebook({ email, id, name, avatar: avatarFB });

    localStorage.setItem("accessToken", token);
    const { userId, role, phoneNumber, avatar } = user;
    dispatch(login({ email, fullName: name, phoneNumber, avatar, userId, role }));
    // Fetch cart after login
    try {
      const { data: cartData } = await userApi.getCart(userId);
      const newList = (cartData.cart || []).map((item) => {
        const { price, discount } = item.product || { price: 0, discount: 0 };
        const newPrice = price - price * ((discount > 0 ? discount : 0) / 100);
        return {
          ...item,
          product: { ...item.product, price: newPrice },
          totalPriceItem: newPrice * item.quantity,
        };
      });
      dispatch(setCart(newList));
    } catch (err) {
      console.log('Fetch cart after register/facebook login error:', err);
    }
    navigate({ pathname: "/" });
  };

  const responseFailureFacebook = (response) => {
    console.log(response);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      navigate({ pathname: "/" });
    }
  }, [navigate]);


  //Formik: register form
  const formik = useFormik({
    initialValues: {
      email: "",
      fullName: "",
      password: "",
      confirmPassword: "",
    },
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: Yup.object({
      fullName: Yup.string().required("Không được bỏ trống trường này!"),
      email: Yup.string().required("Không được bỏ trống trường này!"),
      password: Yup.string().required("Không được bỏ trống trường này!"),
      confirmPassword: Yup.string()
                        .required("Không được bỏ trống trường này!")
                        .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp!"),
    }),
    onSubmit: async () => {
      const { fullName, password, email } = formik.values
      try {
        setLoading(true)
        await authApi.register({ fullName, password, email})
        setLoading(false)
        
        // Popup thông báo thành công khi đăng ký xong
        Swal.fire({
            icon: 'success',
            title: 'Đăng ký thành công!',
            text: 'Vui lòng kiểm tra email để kích hoạt tài khoản nhé!',
            confirmButtonColor: '#28a745'
        }).then(() => {
            navigate({ pathname: "/dang-nhap" });
        });

      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    },
  });

  // --- 3. LOGIC MỚI: Tự động điền email + Hiện Popup chào mừng ---
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailFromUrl = searchParams.get('email');

    if (emailFromUrl) {
      // 1. Điền email vào ô input
      formik.setFieldValue('email', emailFromUrl);
      
      // 2. Hiện Popup thông báo dễ thương
      Swal.fire({
        title: 'Chào bạn mới!',
        text: 'Còn một bước nữa thôi là chúng mình có thể kết nối với nhau rồi ❤️',
        icon: 'info',
        confirmButtonText: 'OK, điền tiếp nào!',
        confirmButtonColor: '#45a536', // Màu xanh lá cây theo theme sách
      });
    }
  }, [location.search]); 
  // -------------------------------------------

  return (
    <div className="main">
      <Container>
        <div className="auth-wrapper">
          <form onSubmit={formik.handleSubmit}>
              <h2 className="title text-center">ĐĂNG KÝ</h2>
              <div className={`form-group ${styles.formGroup}`}>
                <input
                  type="email"
                  name="email"
                  className={`form-control ${styles.formControl} ${formik.errors.email && formik.touched.email ? 'is-invalid' : ''}`}
                  placeholder="Email"
                  value={formik.values.email}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.errors.email && (
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.email}
                  </Form.Control.Feedback>
                )}
              </div>
              <div className={`form-group ${styles.formGroup}`}>
                <input
                  type="text"
                  id="fullname"
                  name="fullName"
                  className={`form-control ${styles.formControl} ${formik.errors.fullName && formik.touched.fullName ? 'is-invalid' : ''}`}
                  placeholder="Họ và tên"
                  value={formik.values.fullName}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                  {formik.errors.fullName && (
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.fullName}
                  </Form.Control.Feedback>
                )}
              </div>
              <div className={`form-group ${styles.formGroup}`}>
                <input
                  type="password"
                  id="password"
                  name="password"
                  className={`form-control ${styles.formControl} ${formik.errors.password && formik.touched.password ? 'is-invalid' : ''}`}
                  autoComplete="on"
                  placeholder="Mật khẩu"
                  value={formik.values.password}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.errors.password && (
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.password}
                  </Form.Control.Feedback>
                )}
              </div>
              <div className={`form-group ${styles.formGroup}`}>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`form-control ${styles.formControl} ${formik.errors.confirmPassword && formik.touched.confirmPassword ? 'is-invalid' : ''}`}
                  autoComplete="on"
                  placeholder="Xác nhận mật khẩu"
                  value={formik.values.confirmPassword}
                  onBlur={formik.handleBlur}
                  onChange={formik.handleChange}
                />
                {formik.errors.confirmPassword && (
                  <Form.Control.Feedback type="invalid">
                    {formik.errors.confirmPassword}
                  </Form.Control.Feedback>
                )}
              </div>
              <button type="submit" disabled={loading} className={`bookstore-btn ${styles.submitBtn}`}>
                {loading ? "Đăng ký..." : "Đăng ký"}
              </button>
            </form>
          <p style={{textAlign: 'center'}}>
            Quay lại trang <Link to="/dang-nhap" style={{color: '#0074da'}}>đăng nhập</Link>
          </p>
          <p style={{ color: "#ccc", textAlign: "center", marginBottom: 8 }}>HOẶC</p>
          <div className={styles.socialButtons}>
            <div className={styles.boxLoginThirdParty}>
              <img src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png" alt="google" />
              <OAuth2Login
                className="bookstore-btn"
                buttonText="Login With Google"  
                authorizationUrl="https://accounts.google.com/o/oauth2/auth"
                responseType="token"
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                redirectUri={process.env.REACT_APP_REDIRECT_LOGIN_GOOGLE}
                scope="email profile"
                onSuccess={responseSuccessGoogle}
                onFailure={responseFailureGoogle}
              />
            </div>

            <div className={styles.boxLoginThirdParty}>
              <img src="https://cdn.pixabay.com/photo/2015/05/17/10/51/facebook-770688_1280.png" alt="facebook" />
              <OAuth2Login
                className="bookstore-btn"
                buttonText="Login With Facebook" 
                authorizationUrl="https://www.facebook.com/dialog/oauth"
                responseType="token"
                clientId="990086591697823"
                redirectUri={process.env.REACT_APP_REDIRECT_LOGIN_FACEBOOK}
                scope="public_profile,email"
                onSuccess={responseSuccessFacebook}
                onFailure={responseFailureFacebook}
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}