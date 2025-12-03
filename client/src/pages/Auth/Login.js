import { Container, Modal, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import OAuth2Login from "react-simple-oauth2-login";

import authApi from "../../api/authApi";
import jwtDecode from "jwt-decode";
import { login, logout } from "../../redux/actions/auth";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { swalInfo } from "../../helper/swal";

import styles from "./Auth.module.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth);

  // --- Kiểm tra token khi load trang ---
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        if (decoded?.exp && decoded.exp * 1000 > Date.now() && !currentUser.userId) {
          const { user } = await authApi.me();
          const { email, fullName, phoneNumber, avatar, id, role } = user;
          dispatch(login({ email, fullName, phoneNumber, avatar, userId: id, role }));
        } else if (decoded.exp * 1000 <= Date.now()) {
          localStorage.removeItem("accessToken");
          dispatch(logout());
        }
      } catch (err) {
        localStorage.removeItem("accessToken");
        dispatch(logout());
      }
    };
    checkToken();
  }, [dispatch, currentUser.userId]);

  // --- OAuth Google ---
  const responseSuccessGoogle = async (response) => {
    try {
      const accessToken = response?.access_token;
      const { token, user } = await authApi.loginWithGoogle(accessToken);

      localStorage.setItem("accessToken", token);
      const { email, fullName, phoneNumber, userId, avatar, role } = user;
      dispatch(login({ email, fullName, phoneNumber, avatar, userId, role }));
      navigate("/");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  const responseFailureGoogle = (response) => {
    console.error("Google login failed:", response);
  };

  // --- OAuth Facebook ---
  const responseSuccessFacebook = async (response) => {
    try {
      const accessToken = response.access_token;
      const result = await fetch(
        `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`
      );
      const data = await result.json();

      const { email, id, name } = data;
      const avatarFB = data?.picture?.data?.url;

      const { token, user } = await authApi.loginWithFacebook({ email, id, name, avatar: avatarFB });

      localStorage.setItem("accessToken", token);
      const { userId, role, phoneNumber, avatar } = user;
      dispatch(login({ email, fullName: name, phoneNumber, avatar, userId, role }));
      navigate("/");
    } catch (error) {
      console.error("Facebook login error:", error);
    }
  };

  const responseFailureFacebook = (response) => {
    console.error("Facebook login failed:", response);
  };

  // --- Form login ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await authApi.login({ email, password });
      setLoading(false);

      const { token, user } = res;
      localStorage.setItem("accessToken", token);

      const { fullName, phoneNumber, userId, avatar, role } = user;
      dispatch(login({ email, fullName, phoneNumber, avatar, userId, role }));

      navigate("/");
    } catch (error) {
      setLoading(false);
      console.error(error);
      if (error.response?.data?.error === 2) {
        setShowModal(true);
      }
    }
  };

  const handleSendEmail = async () => {
    try {
      const { error } = await authApi.requestActiveAccount({ email });
      if (!error) {
        swalInfo("Vui lòng kiểm tra email để kích hoạt tài khoản!");
        setShowModal(false);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="main">
      <div className={styles.loginPage}>
        <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Thông báo</Modal.Title>
          </Modal.Header>
          <Modal.Body>Tài khoản của bạn chưa được xác minh.</Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Hủy
            </Button>
            <Button variant="danger" onClick={handleSendEmail}>
              Gửi lại Email
            </Button>
          </Modal.Footer>
        </Modal>

        <Container>
          <div className="auth-wrapper">
            <h2 className="title text-center">ĐĂNG NHẬP</h2>

            <form className="form-login" onSubmit={handleLogin}>
              <div className={`form-group ${styles.formGroup}`}>
                <input
                  required
                  type="text"
                  name="email"
                  className="form-control"
                  placeholder="Email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className={`form-group ${styles.formGroup}`}>
                <input
                  required
                  type="password"
                  name="password"
                  className="form-control"
                  autoComplete="on"
                  placeholder="Mật khẩu..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Link className={styles.forgotPassword} to="/quen-mat-khau">
                Quên mật khẩu?
              </Link>

              <button className={`bookstore-btn ${styles.submitBtn}`} disabled={loading}>
                {loading ? "Đăng nhập..." : "Đăng nhập"}
              </button>
            </form>

            <p style={{ textAlign: "center" }}>
              Bạn chưa có tài khoản?{" "}
              <Link to="/dang-ki" style={{ color: "#0074da" }}>
                Đăng ký tại đây
              </Link>
            </p>

            <p style={{ color: "#ccc", textAlign: "center" }}>HOẶC</p>

            <div className="d-flex justify-content-between">
              <div className={styles.boxLoginThirdParty}>
                <img
                  src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png"
                  alt="Google"
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
                />
              </div>

              <div className={styles.boxLoginThirdParty}>
                <img
                  src="https://cdn.pixabay.com/photo/2015/05/17/10/51/facebook-770688_1280.png"
                  alt="Facebook"
                />
                <OAuth2Login
                  className="bookstore-btn"
                  buttonText="Login with Facebook"
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
    </div>
  );
}

export default Login;
