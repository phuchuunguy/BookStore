import styles from "./BookItem.module.css";
import format from "../../../helper/format";
import { Link } from "react-router-dom";

function BookItem({ item, boxShadow }) {
  
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
          <div className={styles.imgWrapper}>
              <img 
                className={styles.bookImage} 
                src={item.imageUrl ? item.imageUrl : fallbackImage} 
                alt={item.name} 
                onError={(e) => {e.target.onerror = null; e.target.src = fallbackImage;}}
              />
          </div>
          <p className={styles.name} title={item.name}>
            {item.name}
          </p>
          <p className={styles.author}>
             {Array.isArray(item.author) && item.author[0] ? item.author[0].name : "Đang cập nhật"}
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