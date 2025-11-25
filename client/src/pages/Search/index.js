import { Container, Row, Col } from "react-bootstrap";
import BookItem from "../../components/Shop/BookItem";
import bookApi from "../../api/bookApi";
import { useEffect, useState } from "react";
import styles from './Search.module.css'
import { useSearchParams } from "react-router-dom";

function Search() {

  const [searchParams] = useSearchParams()

  const key = searchParams.get('key')

  const [books, setBooks] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookApi.search({key})
        console.log(res)
        setBooks(res.data)
        
      } catch (error) {
        console.log(error)
      }
    }
    if (key) {
      fetchData()
    }
  }, [key])
  
  return (
    <div className="main">
      <Container>
        <div className={styles.booksList}>
          <div className={styles.title}>
            <h2 className={styles.titleHeading}>Kết quả</h2>
          </div>
          <Row>
            {books && books.length > 0 ? (
               books.map(book => 
                <Col xl={3} key={book._id}>
                  <BookItem boxShadow={true} data={book} />
                </Col>)
            ) :
            <p className={styles.notfound}>Không tìm thấy kết quả phù hợp với từ khóa "<span className={styles.keyword}>{key}</span>"</p>}
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default Search;
