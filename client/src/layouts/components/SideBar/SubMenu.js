import { NavLink } from 'react-router-dom';
import styles from "./AdminSideBar.module.css";

export default function SubMenu({item}) {
    return (
        <li className={styles.navItem}>
             <NavLink className={({isActive}) => [styles.navLink, isActive ? styles.active : null].join(" ")} to={item.path} end={item?.exactly} >
                <div>
                    {item?.icon}
                    <span>{item.title}</span>
                </div>
                {/* <div className="icon-open">
                    {item.subMenu ? (subnav ?  item?.iconOpened : item?.iconClosed) : null}
                </div> */}
            </NavLink>
            <div className={styles.subnav}>
                {item.subMenu && item?.subMenu.map((item, index) => {
                    return (
                      <div key={index} className={styles.navItem}>
                            <NavLink to={item.path} className={styles.navLink}>
                                {item?.icon}
                                <span>{item.title}</span>
                            </NavLink>
                      </div>
                    );
                })}
            </div>
        </li>
    )
}