import styles from "./BookItem.module.css";
import format from "../../../helper/format";
import { Link } from "react-router-dom";

function BookItem({ item, boxShadow }) {
  
  // 1. Chặn lỗi Crash
  if (!item) return null;

  const { price, discount } = item;
  
  let newPrice = price;
  if (discount > 0) {
    newPrice = price - price * discount / 100;
  }

  const fallbackImage = "https://via.placeholder.com/300x400.png?text=No+Image";

  return (
    <div className={`${styles.bookItem} ${boxShadow && styles.shadow}`}>
      {discount && discount > 0 ? (
        <div className={styles.discount}>
          -{discount}%
        </div>
      ) : null}
      
      <div className={styles.card}>
        <Link to={`/chi-tiet-san-pham/${item.slug}`} className={styles.bookInfo}>
          <img 
            // Đã xóa variant="top" vì img thường không cần
            className={styles.bookImage} // Bạn nên thêm class này để CSS chiều cao ảnh cho đều
            src={item.imageUrl ? item.imageUrl : fallbackImage} 
            alt={item.name} 
            onError={(e) => {e.target.onerror = null; e.target.src = fallbackImage;}}
            style={{ width: '100%', height: '280px', objectFit: 'cover' }} // Mẹo: Set cứng chiều cao để các thẻ không bị lệch
          />
          <p className={styles.name}>
            {item.name} - {Array.isArray(item.author) && item.author[0] ? item.author[0].name : "Tác giả"}
          </p>
        </Link>
        
        <div className={styles.cardFooter}>
          <span className={styles.price}>{format.formatPrice(newPrice)}</span>
          {discount > 0 && (
            <span className={styles.oldPrice}>{format.formatPrice(item.price)}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookItem;