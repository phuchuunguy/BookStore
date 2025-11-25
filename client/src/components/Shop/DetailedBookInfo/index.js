import React from "react";
import format from "../../../helper/format";
import styles from "./DetailedBookInfo.module.css";

function DetailedBookInfo({ data }) {
  return (
    <div className={styles.detail_info}>
      <h2>Thông tin chi tiết</h2>
      <div className={styles.detail_info_container}>
        {data.author ? (
          <div className={styles.detail_info_item}>
            <div>Tác giả</div>
            <div>{format.arrayToString(data.author || [])}</div>
          </div>
        ) : null}
        {data.publisher ? (
          <div className={styles.detail_info_item}>
            <div>NXB</div>
            <div>{data.publisher.name}</div>
          </div>
        ) : null}

        {data.year ? (
          <div className={styles.detail_info_item}>
            <div>Năm xuất bản</div>
            <div>{data.year}</div>
          </div>
        ) : null}
        {data.size ? (
          <div className={styles.detail_info_item}>
            <div>Kích thước</div>
            <div>{data.size}</div>
          </div>
        ) : null}

        {data.pages ? (
          <div className={styles.detail_info_item}>
            <div>Số trang</div>
            <div>{data.pages}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default DetailedBookInfo;
