import { Link } from "react-router-dom";
import styles from "./Search.module.css";
export default function SearchResultItem({ data }) {
  return (
    <Link to={`/chi-tiet-san-pham/${data.slug}`}>
      <div className={styles.resultItem}>
        <div className={styles.img}>
          <img src={data.imageUrl} alt="" />
        </div>
        <div className={styles.bookInfo}>
          <p className={styles.name}>{data.name}</p>
          <p>{data?.author[0]?.name}</p>
        </div>
      </div>
    </Link>
  );
}
