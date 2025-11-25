import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
import authApi from "../../api/authApi";
import styles from "./Auth.module.css";
function ResetPassword() {
  const params = useParams();
  const navigate = useNavigate();

  const { token } = params;

  const [tokenValue, setTokenValue] = useState("")

  useEffect(() => {
    if (token) setTokenValue(token)
  }, [token])

  const formik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validateOnChange: false,
    validateOnBlur: true,
    validationSchema: Yup.object({
      password: Yup.string().required("Không được bỏ trống trường này!"),
      confirmPassword: Yup.string()
        .required("Không được bỏ trống trường này!")
        .oneOf([Yup.ref("password"), null], "Mật khẩu không khớp!"),
    }),
    onSubmit: async () => {
      const { password } = formik.values;
      try {
        const res = await authApi.resetPassword({password, token: tokenValue})
        if (!res.error) {
          alert("Đổi mật khẩu thành công")
          navigate({ pathname: "/dang-nhap" });
          return
        } else {
          alert(res.message)
        }
      } catch (error) {
        alert(error)
      }
    },
  });

  return (
    <div className="main">
      <Container>
        <div className="auth-wrapper">
          <form onSubmit={formik.handleSubmit}>
            <h2 className="title text-center">ĐẶT LẠI MẬT KHẨU</h2>
            <div className={`form-group ${styles.formGroup}`}>
              <input
                type="password"
                id="password"
                name="password"
                className={`form-control ${styles.formControl} ${
                  formik.errors.password ? "is-invalid" : ""
                }`}
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
                className={`form-control ${styles.formControl} ${
                  formik.errors.confirmPassword ? "is-invalid" : ""
                }`}
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
            <button className={`bookstore-btn ${styles.submitBtn}`}>
              Đổi mật khẩu
            </button>
          </form>
        </div>
      </Container>
    </div>
  );
}

export default ResetPassword;
