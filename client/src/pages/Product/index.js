import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, NavLink, Breadcrumb } from "react-bootstrap";
import PaginationBookStore from "../../components/PaginationBookStore";
import BookItem from "../../components/Shop/BookItem";
import Loading from "../../components/Loading/";

import bookApi from "../../api/bookApi";
import genreApi from "../../api/genreApi";

import styles from "./Product.module.css";

export default function Product() {
  const [bookData, setBookData] = useState({});
  const [genreList, setGenreList] = useState([]);
  const [page, setPage] = useState(1);

  const [sortString, setSortString] = useState("createdAt|-1");
  const [genresChecked, setGenresChecked] = useState([]);

  // State quản lý việc đóng/mở danh sách thể loại
  const [isGenreOpen, setIsGenreOpen] = useState(true);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sortArr = sortString.split("|");

        // Tạo query object
        const queryObj = { genre: { $in: genresChecked } };
        // Chuyển thành chuỗi JSON để gửi đi (giúp Backend parse dễ dàng)
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
    // Ép kiểu ID về số nguyên (vì DB lưu số)
    const id = parseInt(e.target.value);
    
    setPage(1); // Reset về trang 1 khi lọc

    // Logic chọn 1 (Single Select) - Bấm cái mới thì bỏ cái cũ
    setGenresChecked((pre) => {
      if (pre.includes(id)) {
        return []; // Bấm lại vào cái đang chọn -> Bỏ chọn
      } else {
        return [id]; // Chọn cái mới -> Chỉ lấy cái mới
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
            {/* Cột Danh mục (Bên trái) */}
            <Col xl={3}>
              <div className={styles.filterGroup}>
                
                {/* Tiêu đề có thể click để đóng/mở */}
                <p 
                  className={styles.filterGroupTitle} 
                  onClick={() => setIsGenreOpen(!isGenreOpen)}
                >
                  Thể loại
                  {/* Mũi tên chỉ hướng */}
                  <span className={`${styles.arrow} ${isGenreOpen ? styles.open : ''}`}>
                    ▼
                  </span>
                </p>

                {/* Danh sách cuộn thả (Accordion) */}
                <div className={`${styles.filterList} ${isGenreOpen ? styles.open : ''}`}>
                  {genreList &&
                    genreList.length > 0 &&
                    genreList.map((genre) => (
                      <div
                        key={genre.id}
                        // Thêm class 'active' nếu đang chọn -> CSS sẽ tô màu đỏ
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

            {/* Cột Sản phẩm (Bên phải) */}
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

              {/* Danh sách sản phẩm */}
              <div className={styles.products}>
                {loading ? (
                  <Loading />
                ) : (
                  <Row className="g-3">
                    {bookData.books && bookData.books.length > 0 ? (
                      bookData.books.map((book) => (
                        <Col xl={3} lg={4} md={6} xs={6} key={book.id}>
                          {/* Đã sửa data={book} thành item={book} */}
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

              {/* Phân trang */}
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