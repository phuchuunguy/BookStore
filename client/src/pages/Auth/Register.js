import React, { useEffect, useState } from "react";
import { Container, Form } from "react-bootstrap";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import OAuth2Login from "react-simple-oauth2-login";
import authApi from "../../api/authApi";
import { login } from "../../redux/actions/auth";
import styles from "./Auth.module.css";

export default function Register() {

  const [loading, setLoading] = useState(false)

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const responseSuccessGoogle = async (response) => {
    const accessToken = response.access_token;
    console.log("accessToken-Google", accessToken);

    const { token, user } = await authApi.loginWithGoogle(accessToken);
    
    localStorage.setItem("accessToken", token);
    const { email, fullName, phoneNumber, userId, avatar, role } = user;
    dispatch(login({ email, fullName, phoneNumber, avatar, userId, role }));
    navigate({ pathname: "/" });
  };

  const responseFailureGoogle = (response) => {
    console.log(response);
  };

  const responseSuccessFacebook = async (response) => {
    const accessToken = response.access_token;
    // Lay Profile Facebook thong qua AccessToken

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
        alert("Tạo tài khoản thành công! Vui lòng kiểm tra email để kích hoạt tài khoản")
        navigate({ pathname: "/dang-nhap" });
      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    },
  });

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
          <p style={{ color: "#ccc", textAlign: "center", marginBottom: 8 }}>HOẶC</p>
          <div className="d-flex justify-content-between">
            <div className={styles.boxLoginThirdParty}>
              <img
                src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png"
                alt=""
              />
              <OAuth2Login
                className="bookstore-btn"
                buttonText="Login with Google"
                authorizationUrl="https://accounts.google.com/o/oauth2/auth"
                responseType="token"
                clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
                redirectUri={process.env.REACT_APP_REDIRECT_LOGIN_GOOGLE}
                scope="email profile"
                onSuccess={responseSuccessGoogle}
                onFailure={responseFailureGoogle}
              ></OAuth2Login>
            </div>

            <div className={styles.boxLoginThirdParty}>
              <img
                src="https://cdn.pixabay.com/photo/2015/05/17/10/51/facebook-770688_1280.png"
                alt=""
              />
              <OAuth2Login
                className="bookstore-btn"
                buttonText="Login with Facebook"
                authorizationUrl="https://www.facebook.com/dialog/oauth"
                responseType="token"
                clientId="990086591697823"
                redirectUri={process.env.REACT_APP_REDIRECT_LOGIN_FACEBOOK}
                scope="public_profile"
                onSuccess={responseSuccessFacebook}
                onFailure={responseFailureFacebook}
              ></OAuth2Login>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
