import { useCallback, useEffect, useState } from "react";
import PaginationBookStore from "../../../components/PaginationBookStore";
import { FaEdit, FaTrashAlt } from "react-icons/fa"

import { Row, Col, Table, Spinner, Modal, Button } from "react-bootstrap";
import format from "../../../helper/format";
import voucherApi from "../../../api/voucherApi";
import moment from "moment";

function Voucher() {
  const [voucherData, setVoucherData] = useState({});
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false)
  const [rerender, setRerender] = useState(false)

  const [voucherDelete, setVoucherDelete] = useState({})

  const [showModal, setShowModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  const [addVoucher, setAddVoucher] = useState({
    code: "",
    name: "",
    by: "percent",
    value: 0,
    start: "",
    end: "",
    minimum: 0,
  })

  const [selectedVoucher, setSelectedVoucher] = useState({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await voucherApi.getAll({ page: page, limit: 10, sortByDate: "desc" });
        setLoading(false);
        setVoucherData({ vouchers: res.data, totalPage: res.pagination.totalPage });
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
      await voucherApi.deleteVoucher(voucherDelete._id);
      setShowModal(false)
      alert("Xóa thành công!")
      setVoucherData((preState) => {
        const newArray = [...preState.vouchers];
        return {
          ...preState,
          vouchers: newArray.filter((item) => item._id !== voucherDelete._id)
        }
      });
    } catch (error) {
      alert("Xóa thất bại!")
      setShowModal(false)
    }
  }

  const handleSubmitAdd = async (e) => {
    e.preventDefault()
    try {
      const { start, end } = addVoucher

      if (new Date(start) > new Date(end)) {
        return alert("Ngày kết thúc phải lớn hơn ngày bắt đầu!")
      }

      await voucherApi.createVoucher({ ...addVoucher, start: new Date(start), end: new Date(end) })
      alert("Thêm thành công!")
      setRerender(!rerender)
      setShowAddModal(false)
    } catch (error) {
      console.log(error)
    }
  }

  const handleSubmitUpdate = async (e) => {
    e.preventDefault()
    try {
      const { start, end, _id } = selectedVoucher
      if (new Date(start) > new Date(end)) {
        return alert("Ngày kết thúc phải lớn hơn ngày bắt đầu!")
      }
      await voucherApi.updateVoucher(_id, { ...selectedVoucher, start: new Date(start), end: new Date(end) })
      alert("Thành công!")
      setRerender(!rerender)
      setShowUpdateModal(false)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Row>
      <Modal size="lg" show={showUpdateModal} onHide={() => setShowUpdateModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật mã giảm giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitUpdate}>
            <Row>
              <Col xl={4}>
                <label>Tên mã giảm giá</label>
                <input required type="text" value={selectedVoucher?.name} className="form-control"
                  onChange={(e) => setSelectedVoucher((prev) => { return { ...prev, name: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Code</label>
                <input readOnly type="text" value={selectedVoucher?.code} className="form-control" />
              </Col>
              <Col xl={4}>
                <label>Loại</label>
                <input readOnly type="text" value={selectedVoucher.by === "percent" ? "Phần trăm (%)" : "Mức cố định (VNĐ)"} className="form-control" />
              </Col>
              <Col xl={4}>
                <label>Mức giảm</label>
                <input readOnly type="number" value={selectedVoucher?.value} className="form-control" />
              </Col>
              <Col xl={4}>
                <label>Ngày bắt đầu</label>
                <input required type="date" value={selectedVoucher?.start} className="form-control"
                  onChange={(e) => setSelectedVoucher((prev) => { return { ...prev, start: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Ngày kết thúc</label>
                <input required type="date" value={selectedVoucher?.end} className="form-control"
                  onChange={(e) => setSelectedVoucher((prev) => { return { ...prev, end: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Mức chi tối thiểu</label>
                <input readOnly type="number" value={selectedVoucher?.minimum} className="form-control" />
              </Col>
            </Row>
            <Button type="submit" variant="danger" className="mt-2">
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
          <Modal.Title>Thêm mã giảm giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmitAdd}>
            <Row>
              <Col xl={4}>
                <label>Tên mã giảm giá</label>
                <input required type="text" value={addVoucher?.name} className="form-control"
                  onChange={(e) => setAddVoucher((prev) => { return { ...prev, name: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Code</label>
                <input required type="text" value={addVoucher?.code} className="form-control"
                  onChange={(e) => setAddVoucher((prev) => { return { ...prev, code: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Loại</label>
                <select className="form-select"
                  value={addVoucher?.by}
                  onChange={(e) => setAddVoucher(prev => { return {...prev, by: e.target.value}})}
                >
                    <option value="percent">
                      Phần trăm                    
                    </option>
                    <option value="amount">
                      Mức cố định         
                    </option>
                  </select>
              </Col>
              <Col xl={4}>
                <label>Mức giảm</label>
                <input required type="number" value={addVoucher?.value} className="form-control"
                  onChange={(e) => setAddVoucher((prev) => { return { ...prev, value: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Ngày bắt đầu</label>
                <input required type="date" value={addVoucher?.start} className="form-control"
                  onChange={(e) => setAddVoucher((prev) => { return { ...prev, start: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Ngày kết thúc</label>
                <input required type="date" value={addVoucher?.end} className="form-control"
                  onChange={(e) => setAddVoucher((prev) => { return { ...prev, end: e.target.value } })}
                />
              </Col>
              <Col xl={4}>
                <label>Mức chi tối thiểu</label>
                <input required type="number" value={addVoucher?.minimum} className="form-control"
                  onChange={(e) => setAddVoucher((prev) => { return { ...prev, minimum: e.target.value } })}
                />
              </Col>
            </Row>
            <Button type="submit" className="mt-2" variant="danger">
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
          <Modal.Title>Xóa mã giảm giá</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc xóa mã giảm giá <b>{voucherDelete && voucherDelete.code}</b> này không?</Modal.Body>
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
          <div className="admin-content-header">Danh sách Mã giảm giá</div>
          <div className="admin-content-action">
            <div className="d-flex">
              <button type="button" className="btn btn-success ms-auto" onClick={() => setShowAddModal(true)}>Thêm Mã giảm giá</button>
            </div>
          </div>
          <div className="admin-content-body">
              
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên mã giảm giá</th>
                  <th>Code Mã giảm giá</th>
                  <th>Mức chi tối thiểu</th>
                  <th>Giảm</th>
                  <th>Thời gian</th>
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
                ) : voucherData.vouchers && voucherData.vouchers.length > 0 ? (
                  voucherData.vouchers.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td>{item.name}</td>
                        <td>{item.code}</td>
                        <td>{`${format.formatPrice(item.minimum)}`}</td>
                        <td>{item.by === "percent" ? "Phần trăm (%)" : "Mức cố định (VNĐ)"} - {item.value}</td>
                        <td>Từ {moment(item?.start).format('DD-MM-yyyy')} Đến {moment(item?.end).format('DD-MM-yyyy')}</td>
                        <td>
                          <Button
                            variant="warning"
                            onClick={() => {
                              setSelectedVoucher({
                                ...item,
                                start: new Date(item.start).toLocaleDateString('en-GB').split('/').reverse().join('-'),
                                end: new Date(item.end).toLocaleDateString('en-GB').split('/').reverse().join('-')
                              })
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
                              setVoucherDelete({
                                _id: item._id,
                                code: item.code
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
                    <td colSpan={6}>Không có mã giảm giá!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
            <Row>
              <Col xl={12}>
                {voucherData.totalPage > 1 ? (
                  <PaginationBookStore
                    totalPage={voucherData.totalPage}
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

export default Voucher;
