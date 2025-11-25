import { memo, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { BsSearch } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { Spinner } from "react-bootstrap";

import SearchResultItem from "./SearchResultItem.js";
import useDebounce from "../../../hooks/useDebounce"

import bookApi from "../../../api/bookApi"

import styles from "./Search.module.css"

function Search() {

  const navigate = useNavigate()

  const [key, setKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [searchResult, setSearchResult] = useState([])
  const [showResult, setShowResult] = useState(false)
  const debounced = useDebounce(key, 1000)
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!debounced.trim()) {
          setSearchResult([])
          return
        }
        setLoading(true)
        const res = await bookApi.search({key: debounced, limit: 5})
        setLoading(false)
        setSearchResult(res.data)
        setShowResult(true)
        console.log(res.data)
      } catch (error) {
        setLoading(false)
        console.log(error)
      }
    }
    fetchData()
  }, [debounced])

  const handleSubmitSearch = (e) => {
    e.preventDefault()
    setShowResult(false)
    if (!key.trim()) {
      return
    }
    navigate({
      pathname: '/tim-kiem',
      search: `key=${key}`
    })
   
  }

  return (
    <form onSubmit={handleSubmitSearch}>
      <div className={styles.searchWrapper}>
        <button className={`bookstore-btn ${styles.searchBtn}`}>
          <BsSearch />
        </button>
        <button type="button" onClick={() => setKey("")} className={`bookstore-btn ${styles.resetKey} ${key && !loading ? styles.active : ""}`}>
          <IoClose />
        </button>
        {loading && <div className={styles.loading}>
          <Spinner animation="border" variant="success" size="sm" />
        </div>}
        <div className="form-group">
          <input
            type="text"
            className={`form-control ${styles.formControl}`}
            placeholder="Tìm kiếm sản phẩm..."
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onBlur={() => setShowResult(false)}
            onFocus={() => setShowResult(true && searchResult.length > 0)}
          />
        </div>
        {showResult && searchResult && searchResult.length > 0 && (
          <div className={styles.resultSearch} onMouseDown={(e) => {e.preventDefault()}}
            onClick={() => setShowResult(false)}
          >
            {searchResult.map(book => <SearchResultItem key={book._id} data={book} />)}
          </div>
        )}
      </div>
    </form>
  );
}

export default memo(Search);
