import styles from "./DashboardCard.module.css"

const DashboardCard = ({ name, quantity, Icon, bgColor }) => {
  return (
    <div className={`${styles.dashboardCard} ${bgColor}`}>
      <div className={styles.info}>
        <p className={styles.title}>{quantity}</p>
        <span>{name}</span>
      </div>
      <div className={styles.icon}>
        {Icon && <span><Icon /></span>}
      </div>
    </div>
  );
};

export default DashboardCard;
