import { useCallback, useEffect, useState } from "react";
import PaginationBookStore from "../../../components/PaginationBookStore";
import { FaEdit, FaTrashAlt } from "react-icons/fa"
import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import authorApi from "../../../api/authorApi";

function AuthorList() {
  const [authorData, setAuthorData] = useState({});
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [rerender, setRerender] = useState(false)

  const [authorDelete, setAuthorDelete] = useState({})

  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const [addAuthor, setAddAuthor] = useState({
    name: "",
    year: ""
  })
  const [selectedAuthor, setSelectedAuthor] = useState({})


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await authorApi.getAll({ page: page, limit: 10, sortByDate: "desc" });
        setLoading(false);
        setAuthorData({ authors: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [page, rerender]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const handleCallApiDelete = async (e) => {
    try {
      await authorApi.delete(authorDelete._id);
      setShowModal(false)
      alert("Xóa thành công!")
      setRerender(!rerender)
    } catch (error) {
      alert("Xóa thất bại!")
      setShowModal(false)
    }
  }

  const handleSubmitAdd = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await authorApi.create(addAuthor)
      setLoading(false)
      alert("Thêm tác giả thành công!")
      setRerender(!rerender)
      setShowAddModal(false)
    } catch (error) {
      setLoading(false)
      alert("That bai! ", error)
      console.log(error);
    }
  }

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()

    try {
      setLoading(true)
      await authorApi.update(selectedAuthor?._id, selectedAuthor)
      setLoading(false)
      alert("Cập nhật thành công!")
      setRerender(!rerender)
      setShowUpdateModal(false)
    } catch (error) {
      setLoading(false)
      alert("That bai! ", error)
      console.log(error);
    }
  }

  return (
    <Row>
      <Modal size="lg" show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
        <Modal.Title>Cập nhật tác giả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitUpdate}>
            <Row>
              <Col xl={4}>
                <label>Tên tác giả</label>
                <input required type="text" value={selectedAuthor?.name} className="form-control"
                  onChange={(e) => setSelectedAuthor((prev) => { return { ...prev, name: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Năm sinh</label>
                <input required type="number" value={selectedAuthor?.year} className="form-control"
                  onChange={(e) => setSelectedAuthor((prev) => { return { ...prev, year: +e.target.value } })}
                />
              </Col>
            </Row>
            <Button disabled={loading} type="submit" variant="danger" className="mt-2">
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
        <Modal.Title>Thêm tác giả</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitAdd}>
            <Row>
              <Col xl={4}>
                <label>Tên tác giả</label>
                <input required type="text" value={addAuthor?.name} className="form-control"
                  onChange={(e) => setAddAuthor((prev) => { return { ...prev, name: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Năm sinh</label>
                <input required type="number" value={addAuthor?.year} className="form-control"
                  onChange={(e) => setAddAuthor((prev) => { return { ...prev, year: +e.target.value } })}
                />
              </Col>
            </Row>
            <Button disabled={loading} type="submit" variant="danger" className="mt-2">
              Lưu
            </Button>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Hủy
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa tác giả</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc xóa tác giả <b>{authorDelete && authorDelete.name}</b> này không?</Modal.Body>
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
          <div className="admin-content-header">Danh sách tác giả</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <button type="button" className="btn btn-success ms-auto" onClick={() => setShowAddModal(true)}>Thêm Tác giả</button>
            </div>
          </div>
          <div className="admin-content-body">
            <Table hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tác giả</th>
                  <th colSpan="2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3}>
                      <Spinner
                        animation="border"
                        variant="success"
                      />
                    </td>
                  </tr>
                ) : authorData.authors && authorData.authors.length > 0 ? (
                  authorData.authors.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td>
                          {item.name} {item.year && "-"} {item?.year}
                        </td>
                        
                        <td>
                          <Button
                            variant="warning"
                            onClick={() => {
                              setSelectedAuthor(item)
                              setShowUpdateModal(true)
                            }}
                          >
                            <FaEdit />
                          </Button>
                        </td>
                        <td>
                          <button
                            className="btn btn-danger"
                            onClick={() => {
                              setAuthorDelete({
                                _id: item._id,
                                name: item.name
                              })
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
                    <td colSpan={6}>Không có sản phẩm nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {authorData.totalPage > 1 ? (
                    <PaginationBookStore
                      totalPage={authorData.totalPage}
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

export default AuthorList;
