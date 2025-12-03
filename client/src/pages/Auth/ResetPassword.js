import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Form } from "react-bootstrap";
import { useFormik } from "formik";
import * as Yup from "yup";
<<<<<<< Updated upstream
import { useDispatch } from "react-redux";
=======
import Swal from "sweetalert2"; // 1. Import SweetAlert2
>>>>>>> Stashed changes
import authApi from "../../api/authApi";
import { logout } from "../../redux/actions/auth";
import styles from "./Auth.module.css";

function ResetPassword() {
  const params = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
        
        // --- LOGIC MỚI VỚI SWEETALERT2 ---
        if (!res.error) {
<<<<<<< Updated upstream
          alert("Đổi mật khẩu thành công")
          localStorage.removeItem('accessToken')
          dispatch(logout())
          navigate({ pathname: "/dang-nhap" });
          return
=======
          // Popup thành công
          Swal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
            confirmButtonColor: '#28a745'
          }).then(() => {
             // Chuyển trang sau khi tắt popup
             navigate({ pathname: "/dang-nhap" });
          });
          return;
>>>>>>> Stashed changes
        } else {
          // Popup lỗi từ server trả về
          Swal.fire({
            icon: 'error',
            title: 'Thất bại',
            text: res.message || 'Không thể đổi mật khẩu.',
            confirmButtonColor: '#d33'
          });
        }
      } catch (error) {
        // Popup lỗi hệ thống/mạng
        console.error(error);
        Swal.fire({
            icon: 'error',
            title: 'Lỗi hệ thống',
            text: 'Có lỗi xảy ra, vui lòng thử lại sau!',
            confirmButtonColor: '#d33'
        });
      }
      // ---------------------------------
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