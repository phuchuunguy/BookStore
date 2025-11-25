import React from 'react';
import format from "../../../helper/format";
import styles from './PayItem.module.css'

const PayItem = ({item, quantity, totalPriceItem}) => {
  return (
    <div className={styles.container}>
      <p>
        <span className={styles.name}>
          {item.name}
        </span> x 
        <span className={styles.quantity}>
          {quantity}
        </span>
        <span className={styles.right}>
          {format.formatPrice(totalPriceItem)}
        </span>
      </p>
    </div>
  )
}
export default PayItem