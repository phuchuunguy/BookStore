import React from 'react';
import styles from './Product.module.css'

const Product = ({item}) => {
  console.log("Dữ liệu sách nhận được:", item);
  // URL ảnh mặc định nếu ảnh thật bị lỗi
  const fallbackImage = "https://via.placeholder.com/300x400.png?text=No+Image";

  return (
    <div className={styles.container}>
      <img 
        className={styles.Image} 
        alt={item.name} 
        // 👇 SỬA TỪ item.image THÀNH item.imageUrl 👇
        src={item.imageUrl ? item.imageUrl : fallbackImage} 
        
        // Thêm dòng này để nếu link Tiki chết thì tự hiện ảnh mặc định
        onError={(e) => {
          e.target.onerror = null; 
          e.target.src = fallbackImage;
        }}
      />
      
      <p className={styles.name}>{item.name}</p>
      
      {/* Format giá tiền cho đẹp (VD: 50.000 đ) */}
      <p className={styles.price}>
        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
      </p>
    </div>
  )
}
export default Product