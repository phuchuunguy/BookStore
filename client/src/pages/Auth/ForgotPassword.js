import { useState } from "react";
import { Container, Spinner } from "react-bootstrap";
import authApi from "../../api/authApi";
import styles from "./Auth.module.css"
function ForgotPassword() {

  const [loading, setLoading] = useState(false)
  const [sentEmail, setSentEmail] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmitResetPassword = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await authApi.forgotPassword({email})
      setLoading(false)
      setSentEmail(true)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  return (
    <div className="main">
      <Container>
        <div className={`auth-wrapper ${sentEmail ? styles.sent : ''}`}>
            {!sentEmail && (
              <form onSubmit={handleSubmitResetPassword}>
              <h5 className="title text-center">BẠN QUÊN MẬT KHẨU?</h5>
              <p className={styles.info}>
                Hãy nhập email đã xác minh của tài khoản bạn. 
                Chúng tôi sẽ gửi cho bạn đường dẫn để khôi phục mật khẩu.
              </p>
             
              <div className={`form-group ${styles.formGroup}`}>
                <input
                  required
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="Nhập Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                
              </div>
              {loading && (
              <div className="row">
                  <Spinner style={{margin: '0 auto'}} animation="border" variant="success" />
              </div>
              )}
              <button className={`bookstore-btn ${styles.submitBtn}`}>
                Gửi
              </button>
            </form>
            )}
            {sentEmail && (
              <div>
                <p>
                  Hãy kiếm tra email <b>{email}</b> để nhận được link đặt lại mật khẩu.
                  Có thể mất một vài phút, kiểm tra cả trong thư mục spam.
                </p>
              </div>
            )}
        </div>
      </Container>
    </div>
  );
}

export default ForgotPassword;
