import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // 1. Import thêm useLocation
import { Container, Row, Col, NavLink, Breadcrumb } from "react-bootstrap";
import PaginationBookStore from "../../components/PaginationBookStore";
import BookItem from "../../components/Shop/BookItem";
import Loading from "../../components/Loading/";

import bookApi from "../../api/bookApi";
import genreApi from "../../api/genreApi";

import styles from "../Product/Product.module.css";

export default function Search() {
  const location = useLocation();

  const [searchParams] = useState(new URLSearchParams(window.location.search));
  const rawKey = searchParams.get('key')
  const key = rawKey ? rawKey.trim() : ""

  const [bookData, setBookData] = useState({});
  const [genreList, setGenreList] = useState([]);
  const [page, setPage] = useState(1);

  const [sortString, setSortString] = useState("createdAt|-1");
  const [genresChecked, setGenresChecked] = useState([]);

  const [isGenreOpen, setIsGenreOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!key) {
          setBookData({ books: [], totalPage: 0 });
          setLoading(false);
          return;
        }

        const res = await bookApi.search({ key, limit: 8, page });
        const { data, pagination } = res;
        setBookData({ books: data, totalPage: pagination ? pagination.totalPage : 1 });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchData();
  }, [key, page]);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await genreApi.getAll({});
        setGenreList(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchGenres();
  }, []);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const handleChangeGenre = (e) => {
    const id = parseInt(e.target.value);
    setPage(1);
    setGenresChecked((pre) => {
      if (pre.includes(id)) {
        return [];
      } else {
        return [id];
      }
    });
  };

  return (
    <div className="main">
      <Container>
        <Breadcrumb>
          <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item active linkAs={NavLink} linkProps={{ to: "/san-pham" }}>
            Sản phẩm
          </Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.genre_body}>
          <Row>
            <Col xl={3}>
              <div className={styles.filterGroup}>
                <p
                  className={styles.filterGroupTitle}
                  onClick={() => setIsGenreOpen(!isGenreOpen)}
                >
                  Thể loại
                  <span className={`${styles.arrow} ${isGenreOpen ? styles.open : ''}`}>▼</span>
                </p>

                <div className={`${styles.filterList} ${isGenreOpen ? styles.open : ''}`}>
                  {genreList && genreList.map((genre) => (
                    <div
                      key={genre.id}
                      className={`${styles.filterGroupItem} ${
                        genresChecked.includes(genre.id) ? styles.active : ""
                      }`}
                    >
                      <label>
                        <input
                          type="checkbox"
                          className={styles.chk}
                          checked={genresChecked.includes(genre.id)}
                          value={genre.id}
                          onChange={handleChangeGenre}
                        />
                        <span>{genre.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            <Col xl={9}>
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
                {loading ? (
                  <Loading />
                ) : (
                  <Row className="g-3">
                    {bookData.books && bookData.books.length > 0 ? (
                      bookData.books.map((book) => (
                        <Col xl={3} lg={4} md={6} xs={6} key={book.id}>
                          <BookItem item={book} />
                        </Col>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", width: "100%", padding: "50px" }}>
                        <h4>Không tìm thấy sản phẩm nào!</h4>
                        <p>Vui lòng thử từ khóa khác hoặc bỏ khoảng trắng.</p>
                      </div>
                    )}
                  </Row>
                )}
              </div>

              <div className={styles.pagination}>
                <Row>
                  <Col xl={12}>
                    {!loading && bookData.totalPage > 1 ? (
                      <PaginationBookStore
                        totalPage={bookData.totalPage}
                        currentPage={page}
                        onChangePage={handleChangePage}
                      />
                    ) : null}
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
}
