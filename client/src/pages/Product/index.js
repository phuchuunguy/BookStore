import { useCallback, useEffect, useState } from "react";
import { Container, Row, Col, NavLink, Breadcrumb } from "react-bootstrap";
import PaginationBookStore from "../../components/PaginationBookStore";
import BookItem from "../../components/Shop/BookItem";
import Loading from "../../components/Loading/"

import bookApi from "../../api/bookApi";
import genreApi from "../../api/genreApi";

import styles from "./Product.module.css";

export default function Product() {

  const [bookData, setBookData] = useState({})
  const [genreList, setGenreList] = useState([])
  const [page, setPage] = useState(1);
  
  const [sortString, setSortString] = useState("createdAt|-1")
  const [genresChecked, setGenresChecked] = useState([])

  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const sortArr = sortString.split('|')
        const query = {
          genre: { "$in": genresChecked}
        }
        setLoading(true)
        const { data, pagination } = await bookApi.getAll({
          limit: 8,
          page: page,
          query,
          sort: {
            [sortArr[0]]: parseInt(sortArr[1])
          }
        });
        setBookData({ books: data, totalPage: pagination.totalPage });
        setLoading(false)
      } catch (error) {
        setLoading(false)
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
    const id = e.target.value
    setPage(1)
    setGenresChecked(pre => {
      if (pre.includes(id)) {
        return pre.filter(genre => genre !== id)
      } else {
        return [...pre, id]
      }
    })
  } 

  return (
    <div className="main">
      <Container>
        <Breadcrumb>
          <Breadcrumb.Item linkAs={NavLink} linkProps={{ to: "/" }}>Trang chủ</Breadcrumb.Item>
          <Breadcrumb.Item active linkAs={NavLink} linkProps={{ to: "/san-pham" }}>Sản phẩm</Breadcrumb.Item>
        </Breadcrumb>
        <div className={styles.genre_body}>
          <Row>
            <Col xl={3}>
              <div className={styles.filterGroup}>
                <p className={styles.filterGroupTitle}>Thể loại</p>
                {genreList &&
                  genreList.length > 0 &&
                  genreList.map((genre) => (
                    <div className={styles.filterGroupItem} key={genre._id}>
                      <label>
                        <input
                          type="checkbox"
                          className={styles.chk}
                          checked={genresChecked.includes(genre._id)}
                          value={genre._id}
                          onChange={handleChangeGenre}
                        />
                        <span>{genre.name}</span>
                      </label>
                    </div>
                  ))}
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
                <Row>
                  {!loading && bookData.books && bookData.books.length > 0
                    ? bookData.books.map((book) => (
                        <Col xl={3} key={book._id}>
                          <BookItem data={book} />
                        </Col>
                      ))
                    : <Loading />}
                </Row>
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
