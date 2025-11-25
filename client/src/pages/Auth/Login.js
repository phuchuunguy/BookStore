import { Container, Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import OAuth2Login from 'react-simple-oauth2-login';

import authApi from '../../api/authApi';
import { login } from '../../redux/actions/auth';
import { useDispatch } from "react-redux";
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";

import styles from './Auth.module.css';

function Login() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [loading, setLoading] = useState(false)

  const [showModal, setShowModal] = useState(false)
  
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const responseSuccessGoogle = async (response) => {
   try {
    const accessToken = response?.access_token
    const { token, user } = await authApi.loginWithGoogle(accessToken)
    console.log(token, user)
    localStorage.setItem('accessToken', token)
    const { email, fullName, phoneNumber, userId, avatar, role } = user
    dispatch(login({ email, fullName, phoneNumber, avatar, userId, role }))
    navigate({ pathname: '/' })
   } catch (error) {
     console.log(error)
   }
  }

  const responseFailureGoogle = (response) => {
    console.log(response)
  }

  const responseSuccessFacebook = async (response) => {
    const accessToken = response.access_token
    // Lay Profile Facebook thong qua AccessToken

    const result = await fetch(`https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${accessToken}`)
    const data = await result.json()
    console.log(data)
    const { email, id, name } = data
    const avatarFB = data?.picture?.data.url

    const { token, user } = await authApi.loginWithFacebook({email, id, name, avatar: avatarFB})
    localStorage.setItem('accessToken', token)
    const { userId, role, phoneNumber, avatar } = user
    dispatch(login({ email, fullName: name, phoneNumber, avatar, userId, role }))
    navigate({ pathname: '/' })
  }

  const responseFailureFacebook = (response) => {
    console.log(response)
  }

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      navigate({ pathname: '/' })
    }
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const res = await authApi.login({email, password})
      setLoading(false)
     
      // Nhan token tu server
      const { token, user } = res
      localStorage.setItem('accessToken', token)
      const { fullName, phoneNumber, userId, avatar, role } = user
      dispatch(login({ email, fullName, phoneNumber, avatar, userId, role }))
      navigate({ pathname: '/' })
      
    } catch (error) {
      setLoading(false)
      console.log(error.response.data.error)
      if (error.response.data.error === 2) {
        setShowModal(true)
      }
      console.log(error)
    }
   
  }

  const handleSendEmail = async () => {
    try {
      const { error } = await authApi.requestActiveAccount({email})
      if (!error) {
        alert("Vui lòng kiểm tra email để kích hoạt tài khoản!")
        setShowModal(false)
      }
    } catch (error) {
      console.log(error)
    }
  }
  
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
                <input required type="text" name="email" className="form-control" placeholder="Email..."
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className={`form-group ${styles.formGroup}`}>
                <input required type="password" name="password" className="form-control" autoComplete="on" placeholder="Mật khẩu..." 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Link className={styles.forgotPassword} to="/quen-mat-khau">Quên mật khẩu?</Link>
              <button className={`bookstore-btn ${styles.submitBtn}`} disabled={loading}>{loading ? "Đăng nhập..." : "Đăng nhập"}</button>
            </form>
            <p style={{textAlign: 'center'}}>
              Bạn chưa có tài khoản? <Link to="/dang-ki" style={{color: '#0074da'}}>Đăng ký tại đây</Link>
            </p>
            <p style={{color: '#ccc', textAlign: 'center'}}>HOẶC</p>
          
            <div className="d-flex justify-content-between">
              <div className={styles.boxLoginThirdParty}>
                <img src="https://www.freepnglogos.com/uploads/google-logo-png/google-logo-icon-png-transparent-background-osteopathy-16.png" alt="" />
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
                <img src="https://cdn.pixabay.com/photo/2015/05/17/10/51/facebook-770688_1280.png" alt="" />
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
    </div>
  );
}

export default Login;
