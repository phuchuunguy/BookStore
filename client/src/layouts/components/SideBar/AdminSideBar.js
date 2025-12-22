import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import { routes } from "./routes";
import logo from '../../../assets/images/logo.png'
import SubMenu from "./SubMenu";

import authApi from "../../../api/authApi";
import { logout } from '../../../redux/actions/auth';
import { destroy } from "../../../redux/actions/cart"

import styles from "./AdminSideBar.module.css";


function AdminSideBar() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { role } = useSelector((state) => state.auth)

  const handleLogout = async () => {
    const resultLogout = await authApi.logout()
    console.log(resultLogout)
    dispatch(logout())
    dispatch(destroy())
    const token = localStorage.getItem('accessToken')
    if (token) {
      localStorage.removeItem('accessToken')
    }
    navigate({ pathname: '/' })
  }
  return (

    <div className={styles.adminSideBar}>
      <div className={styles.logo}>
        <Link to="/">
          <img
            src={logo}
            alt=""
          />
          <span>BookStore</span>
        </Link>
      </div>
      <div className={styles.sidebarContainer}>
        <ul className={styles.navList}>
          {routes.map((item, index) => {
              if (item?.permissions.includes(role)) {
                  return <SubMenu item={item} key={index} />
              } else return null;
          })}
        </ul>

        <ul className={styles.navListBottom}>
          <li className={styles.navItem} onClick={handleLogout}>
            <p className={styles.navLink}>
              {/* Inline logout SVG to avoid missing asset */}
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:8}}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Đăng xuất</span>
            </p>
          </li>
        </ul>

      </div>
    </div>
  );
}

export default AdminSideBar;
