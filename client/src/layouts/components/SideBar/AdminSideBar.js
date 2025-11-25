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
              <span>Đăng xuất</span>
            </p>
          </li>
        </ul>

      </div>
    </div>
  );
}

export default AdminSideBar;
