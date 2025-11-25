import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import PaginationBookStore from "../../components/PaginationBookStore";
import styles from "./GenreDetail.module.css";
// import Product from "../../components/Product";
import BookItem from "../../components/Shop/BookItem";
import { useParams } from "react-router-dom";
import bookApi from "../../api/bookApi";
import genreApi from "../../api/genreApi";

export default function GenreDetail() {
  const params = useParams();
  const { genre } = params;

  const [bookData, setBookData] = useState({});
  const [genreData, setGenreData] = useState({});

  const [sortString, setSortString] = useState("createdAt|-1")
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sortArr = sortString.split('|')
        const { data, pagination } = await bookApi.getAll({
          query: {
            genre: { "$in": genreData?._id}
          },
          limit: 8,
          page: page,
          sort: {
            [sortArr[0]]: parseInt(sortArr[1])
          }
        });
        setBookData({ books: data, totalPage: pagination.totalPage });
      } catch (error) {
        console.log(error);
      }
    };

    if (genreData?._id) {
      fetchData();
    }
  }, [genreData, sortString, page]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await genreApi.getBySlug(genre);
        setGenreData(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    if (genre) {
      fetchData();
    }
  }, [genre]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  return (
    <div className="main">
      <Container>
        <div className={styles.genre_header}>
          <ul>
            <li>Trang chủ</li>
            <li>Sản Phẩm</li>
            <li>{genreData && genreData.name}</li>
          </ul>
          <h1>{genreData && genreData.name}</h1>
        </div>
        <div className={styles.genre_body}>
          <div className={styles.genreOrder}>
            <Row>
              <Col xl={4}>
                <div className={styles.orderItem}>
                  <label htmlFor="date-order">Sắp xếp:</label>
                  <select
                    className="form-select"
                    name="date-order"
                    value={sortString}
                    onChange={(e) => setSortString(e.target.value)}
                  >
                    <option value="createdAt|-1">Mới nhất</option>
                    <option value="createdAt|1">Cũ nhất</option>
                    <option value="price|1">Giá tăng dần</option>
                    <option value="price|-1">Giá giảm dần</option>
                    <option value="discount|-1">Giảm giá nhiếu nhất</option>
                  </select>
                </div>
              </Col>
            </Row>
          </div>
          <div className={styles.products}>
            <Row>
              {bookData.books && bookData.books.length > 0
                ? bookData.books.map((book) => (
                    <Col xl={3} key={book._id}>
                      <BookItem data={book} />
                    </Col>
                  ))
                : null}
            </Row>
          </div>
          <div className={styles.pagination}>
            <Row>
              <Col xl={12}>
                {bookData.totalPage > 1 ? (
                  <PaginationBookStore
                    totalPage={bookData.totalPage}
                    currentPage={page}
                    onChangePage={handleChangePage}
                  />
                ) : null}
              </Col>
            </Row>
          </div>
        </div>
      </Container>
    </div>
  );
}
