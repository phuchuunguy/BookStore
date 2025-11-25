import styles from "./BookItem.module.css";
import format from "../../../helper/format";
import { Link } from "react-router-dom";

function BookItem({data, boxShadow}) {
  const { price , discount } = data
  let newPrice = price
  if (discount > 0) {
    newPrice = price - price * discount / 100
  }

  return (
    <div className={`${styles.bookItem} ${boxShadow && styles.shadow}`}>
       {discount && discount > 0 ?
        (
          <div className={styles.discount}>
            -{discount}%
          </div>
        ) : null }
      <div className={styles.card}>
        <Link to={`/chi-tiet-san-pham/${data.slug}`} className={styles.bookInfo}>
          <img variant="top" src={data.imageUrl} alt="" />
          <p className={styles.name}>{data.name} - {data.author?.name || data.author[0]?.name}</p>
        </Link>
        <div className={styles.cardFooter}>
          <span className={styles.price}>{format.formatPrice(newPrice)}</span>
          {discount > 0 && <span className={styles.oldPrice}>{format.formatPrice(data.price)}</span>}
        </div>
      </div>
    </div>
  );
}

export default BookItem;
