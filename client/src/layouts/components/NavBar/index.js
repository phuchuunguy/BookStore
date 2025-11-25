import { memo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import { FaBars, FaTimes } from 'react-icons/fa';


import styles from './NavBar.module.css';
function NavBar() {
    return (
        <div className={`navbar ${styles.navbar}`}>
            <div className={styles.navItem}>
                <NavLink to="/" className={({isActive}) => isActive ? `${styles.active}` : null}>Trang chủ</NavLink>
            </div>
            <div className={styles.navItem}>
                <NavLink to="/san-pham" className={({isActive}) => isActive ? `${styles.active}` : null}>Sản phẩm</NavLink>
            </div>
            <div className={styles.navItem}>
                <NavLink to="/khuyen-mai" className={({isActive}) => isActive ? `${styles.active}` : null}>Khuyến mãi</NavLink>
            </div>
        </div>
    )

}

export function NavBarMobile() {

    const [show, setShow] = useState(false)

    return (
        <div className={`navbar ${styles.navbarMobile}`}>
            <div className={styles.iconBar} onClick={() => setShow(!show)}>{show ? <FaTimes /> : <FaBars />}</div>
            <div className={`${styles.menu} ${show && styles.active}`} onClick={() => setShow(false)}>
                <div className={styles.navItem}>
                    <NavLink to="/" className={({isActive}) => isActive ? `${styles.active}` : null}>Trang chủ</NavLink>
                </div>
                <div className={styles.navItem}>
                    <NavLink to="/san-pham" className={({isActive}) => isActive ? `${styles.active}` : null}>Sản phẩm</NavLink>
                </div>
                <div className={styles.navItem}>
                    <NavLink to="/khuyen-mai" className={({isActive}) => isActive ? `${styles.active}` : null}>Khuyến mãi</NavLink>
                </div>
           </div>
        </div>
    )
}

export default memo(NavBar)