import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom"
import { toast } from 'react-toastify';
import PaginationBookStore from "../../../../components/PaginationBookStore";
import { FaEdit, FaTrashAlt, FaSearch } from "react-icons/fa"


import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import bookApi from "../../../../api/bookApi";
import format from "../../../../helper/format";

function BookList() {
  const [bookData, setBookData] = useState({});
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);

  const [bookDelete, setBookDelete] = useState({})

  const [showModal, setShowModal] = useState(false);

  const [searchInput, setSearchInput] = useState("")
  const [searchString, setSearchString] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const query = {
          name: { "$regex": searchString, "$options": "i" }
        }
        console.log(query)
        const res = await bookApi.getAll({ query, page: page, limit: 10 });
        setLoading(false);
        setBookData({ books: res.data, totalPage: res.pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page, searchString]);


  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const handleCallApiDelete = async (e) => {
    try {
      const { data: orders } = await bookApi.checkIsOrdered(bookDelete._id)
      if (orders.length > 0) {
        toast.error('Sản phẩm đã được mua, không thể xóa!', {autoClose: 2000})
        return
      }
      await bookApi.delete(bookDelete._id)
      toast.success("Xóa thành công!", {autoClose: 2000})
      setShowModal(false)
      setBookData((preState) => {
        const newArray = [...preState.books];
        return {
          ...preState,
          books: newArray.filter((item) => item._id !== bookDelete._id)
        }
      });
    } catch (error) {
      alert("Xóa thất bại!")
      setShowModal(false)
    }
  }

  return (
    <Row>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa sách</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc xóa sách <b>{bookDelete && bookDelete?.name}</b> này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleCallApiDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách sản phẩm</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <input className="form-control search" placeholder="Tìm kiếm" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
              <Button type="button" style={{color: "white"}} variant="info"
                onClick={() => {
                  setSearchString(searchInput)
                  setPage(1)
                }}
                >
                  <FaSearch />
              </Button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên sách</th>
                  <th>Thể loại</th>
                  <th>Xuất bản</th>
                  <th>Giá</th>
                  <th>Khuyến mãi (%)</th>
                  <th colSpan="2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner
                        animation="border"
                        variant="success"
                      />
                    </td>
                  </tr>
                ) : bookData.books && bookData.books.length > 0 ? (
                  bookData.books.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td className="text-start" style={{width: 500}}>
                          {item.name} - {format.arrayToString(item.author || [])}
                        </td>
                        <td>
                          {format.arrayToString(item.genre || [])}
                        </td>
                        <td>
                          {item.publisher?.name} - {item.year}
                        </td>
                        <td className="price">{format.formatPrice(item.price)}</td>
                        <td>{item.discount}</td>
                        <td>
                          <Link
                            to={`/admin/book/update/${item._id}`}
                            className="btn btn-warning"
                            data-id={item._id}
                          >
                            <FaEdit />
                          </Link>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setBookDelete(item)
                              setShowModal(true)
                            }}
                          >
                            <FaTrashAlt />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7}>Không có sản phẩm nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
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
        </div>
      </Col>
    </Row>
  );
}

export default BookList;
