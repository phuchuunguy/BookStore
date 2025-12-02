import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // 1. Import thêm useLocation
import { Container, Row, Col, NavLink, Breadcrumb } from "react-bootstrap";
import PaginationBookStore from "../../components/PaginationBookStore";
import BookItem from "../../components/Shop/BookItem";
import Loading from "../../components/Loading/";

import bookApi from "../../api/bookApi";
import genreApi from "../../api/genreApi";

import styles from "./Product.module.css";

export default function Product() {
  const location = useLocation(); // 2. Khai báo hook location

  const [bookData, setBookData] = useState({});
  const [genreList, setGenreList] = useState([]);
  const [page, setPage] = useState(1);

  const [sortString, setSortString] = useState("createdAt|-1");
  const [genresChecked, setGenresChecked] = useState([]);

  const [isGenreOpen, setIsGenreOpen] = useState(true);
  const [loading, setLoading] = useState(false);

  // 3. THÊM ĐOẠN NÀY: Tự động chọn danh mục khi có URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const genreId = params.get("genre"); // Lấy ?genre=... trên thanh địa chỉ

    if (genreId) {
      const id = parseInt(genreId);
      if (!isNaN(id)) {
        setGenresChecked([id]); // Tự động tích vào ô đó
      }
    }
  }, [location.search]);
  // -----------------------------------------------------------

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sortArr = sortString.split("|");

        // Tạo query object
        // Nếu genresChecked rỗng thì không lọc (lấy hết)
        const queryObj = genresChecked.length > 0 ? { genre: { $in: genresChecked } } : {};
        
        const query = JSON.stringify(queryObj);

        setLoading(true);
        const { data, pagination } = await bookApi.getAll({
          limit: 8,
          page: page,
          query,
          sort: {
            [sortArr[0]]: parseInt(sortArr[1]),
          },
        });
        setBookData({ books: data, totalPage: pagination.totalPage });
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };

    fetchData();
  }, [sortString, page, genresChecked]);

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
    
    // Logic chọn 1 (Single Select) - Hoặc bạn có thể đổi thành Multi Select tùy ý
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
            {/* Cột Danh mục */}
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

            {/* Cột Sản phẩm */}
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
                        <p>Vui lòng thử chọn danh mục khác.</p>
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