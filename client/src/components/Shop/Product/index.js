import React from 'react';
import styles from './Product.module.css'

const Product = ({item}) => {
  return (
    <div className={styles.container}>
      <img className={styles.Image} alt="" src={item.image} />
      <p className={styles.name}>{item.name}</p>
      <p className={styles.price}>{item.price}</p>
    </div>
  )
}
export default Product
