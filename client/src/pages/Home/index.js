import { Container, Row, Col } from "react-bootstrap";
import BookItem from "../../components/Shop/BookItem";
import bookApi from "../../api/bookApi";
import analyticApi from "../../api/analyticApi";
import { useEffect, useState } from "react";
import styles from './Home.module.css'
import Loading from "../../components/Loading"

function Home() {
  const [newest, setNewest] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [bestSellers, setBestSellers] = useState([])
  const [loading, setLoading] = useState(true)

  // Utility: get YYYY-MM-DD
  const todayKey = () => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // 1) Newest products (existing behavior)
        const { data: newestData } = await bookApi.getAll({ page: 1, limit: 6 })
        setNewest(newestData)

        // 2) Today's suggestions: ephemeral per-page-load (resets on F5) and per-day
        try {
          const win = window || {};
          const storedDate = win.__suggestions_date;
          const stored = win.__suggestions_books;
          if (storedDate === todayKey() && Array.isArray(stored) && stored.length > 0) {
            setSuggestions(stored.slice(0, 10));
          } else {
            // Fetch a larger pool then pick random 10
            const { data: poolResp } = await bookApi.getAll({ page: 1, limit: 60 })
            const pool = Array.isArray(poolResp) ? poolResp : (poolResp || [])
            const shuffle = pool.sort(() => Math.random() - 0.5)
            const picked = shuffle.slice(0, 10)
            setSuggestions(picked)
            try {
              win.__suggestions_date = todayKey();
              win.__suggestions_books = picked;
            } catch (e) {}
          }
        } catch (e) {
          console.error('Suggestion fetch failed', e)
        }

        // 3) Top best-selling (call public analytics endpoint)
        try {
          const { data: bestResp } = await analyticApi.getBestSellerPublic()
          // bestResp is expected to be an array of { id, count, product: [book] }
          const books = Array.isArray(bestResp)
            ? bestResp.map(item => (item.product && item.product[0]) ? item.product[0] : null).filter(Boolean)
            : []
          setBestSellers(books.slice(0,5))
        } catch (e) {
          console.error('Best seller fetch failed', e)
        }

      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])
  
  if (loading) return <Loading />

  return (
    <div className="main">
      <Container>
        {/* Newest products (show first) */}
        <div className={styles.booksList} style={{ marginBottom: 20 }}>
          <div className={styles.title}>
            <h2 className={styles.titleHeading}>Sản phẩm mới nhất</h2>
          </div>
          <Row className={styles.row}>
            {newest && newest.length > 0 ? (
               newest.map(book => (
                <Col xl={2} xs={6} key={book.id}>
                  <div className={styles.cardWrapper}>
                    <BookItem item={book} />
                  </div>
                </Col>
               ))
            ) : <Loading />}
          </Row>
        </div>

        {/* Today's suggestions (resets daily) */}
        <div className={styles.booksList} style={{ marginBottom: 20 }}>
          <div className={styles.title}>
            <h2 className={styles.titleHeading}>Gợi ý cho bạn</h2>
          </div>
          <Row xs={2} md={3} xl={5} className={styles.row}>
            {suggestions && suggestions.length > 0 ? (
              suggestions.map(book => (
                <Col key={book.id}>
                  <div className={styles.cardWrapper}>
                    <BookItem item={book} />
                  </div>
                </Col>
              ))
            ) : (
              <div style={{ padding: 20, width: '100%' }}>Không có gợi ý cho bạn.</div>
            )}
          </Row>
        </div>

        {/* Top selling books (top 5) - displayed under newest */}
        <div className={styles.booksList} style={{ marginBottom: 20 }}>
          <div className={styles.title}>
            <h2 className={styles.titleHeading}>Top sách bán chạy</h2>
          </div>
          <Row className={styles.row}>
            {bestSellers && bestSellers.length > 0 ? (
              <div className={styles.topSellersRow}>
                {bestSellers.map(book => (
                  <div className={styles.topSellersItem} key={book.id}>
                    <BookItem item={book} />
                  </div>
                ))}
              </div>
            ) : <div style={{ padding: 20 }}>Không có dữ liệu bán chạy.</div>}
          </Row>
        </div>
      </Container>
    </div>
  );
}

export default Home;