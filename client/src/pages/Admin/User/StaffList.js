import { useCallback, useEffect, useState } from "react";
import { Row, Col, Table, Button, Badge, Modal, Spinner } from "react-bootstrap";
import PaginationBookStore from "../../../components/PaginationBookStore";

import moment from "moment";
import { FaSearch } from "react-icons/fa";

import userApi from "../../../api/userApi"

export default function StaffList() {

  const [staffData, setStaffData] = useState([])
  const [loading, setLoading] = useState(false)

  const [page, setPage] = useState(1)

  const [rerender, setRerender] = useState(false)

  const [addStaff, setAddStaff] = useState({
    email: "",
    fullName: "",
    phoneNumber: ""
  })

  const [showAddModal, setShowAddModal] = useState(false)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await userApi.getAll({ 
          page, 
          limit: 10,
          query: { role: 2 } 
        });
        setLoading(false);
        setStaffData({ list: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    fetchData();
  }, [rerender, page]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const handleSubmitAdd = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      await userApi.createStaff(addStaff)
      setLoading(false)
      alert("Thành công!")
      setShowAddModal(false)
      setRerender(!rerender)
    } catch (error) {
      setLoading(false)
      console.log(error)
    }
  }

  const handleUpdateStatus = async ({  _id: userId, status }) => {
    const newStatus = status === 1 ? 0 : 1
    try {
      await userApi.updateStatus(userId, { status:  newStatus })
      alert("Thành công!")
      setRerender(!rerender)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <Row>
      <Modal size="lg" show={showAddModal} onHide={() => setShowAddModal(false)} >
        <Modal.Header closeButton>
          <Modal.Title>Thêm nhân viên</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
              <h5>Thông tin nhân viên</h5>
              <form onSubmit={handleSubmitAdd}>
                <Row>
                  <Col xl={4}>
                    <label>Tên nhân viên</label>
                    <input required type="text" value={addStaff?.fullName} className="form-control"
                      onChange={(e) => setAddStaff((prev) => { return { ...prev, fullName: e.target.value } })}
                    />
                  </Col>
                  <Col xl={4}>
                    <label>Email</label>
                    <input required type="email" value={addStaff?.email} className="form-control"
                      onChange={(e) => setAddStaff((prev) => { return { ...prev, email: e.target.value } })}
                    />
                  </Col>
                  <Col xl={4}>
                    <label>Điện thoại</label>
                    <input required type="text" value={addStaff?.phoneNumber} className="form-control"
                      onChange={(e) => setAddStaff((prev) => { return { ...prev, phoneNumber: e.target.value } })}
                    />
                  </Col>
                </Row>
                <Button className="mt-4" type="submit" disabled={loading} variant="success">Lưu</Button>
              </form>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>Hủy</Button>
        </Modal.Footer>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách nhân viên</div>
          <div className="admin-content-action">
            <div className="d-flex justify-content-between">
              <div className="d-flex">
                <input className="form-control search" placeholder="Nhập tên, mã nhân viên" />
                <Button type="button" style={{color: "white"}} variant="info">
                  <FaSearch />
                </Button>
              </div>
              <div>
                <button type="button" className="btn btn-success ms-auto" onClick={() => setShowAddModal(true)}>
                  Thêm nhân viên
                </button>
              </div>
            </div>
          </div>
          <div className="admin-content-body">
            <Table hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Tên nhân viên</th>
                  <th>Email</th>
                  <th>SĐT</th>
                  <th>Ngày tạo</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
              {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : staffData?.list && staffData?.list?.length > 0 ? (
                  staffData.list.map((item, index) => {
                    return (
                      <tr key={item._id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td className="text-start">
                          <div className="d-flex align-items-center">
                            <img className="avatar" src={item?.avatar?.url} alt="" />
                            <div >{item?.fullName}</div>
                          </div>
                        </td>
                        
                        <td>{item?.email}</td>
                        <td>{item?.phoneNumber}</td>
                        <td>{<p>{moment(item?.createdAt).format('DD-MM-yyyy HH:mm:ss')}</p>}</td>
                        <td><Badge bg={item?.status === 1 ? "success" : "danger"}>{item?.status === 1 ? "Đang hoạt động" : "Đã khóa"}</Badge></td>
                        <td>
                          <Button variant={item?.status === 1 ? "danger" : "success"} onClick={() => handleUpdateStatus(item)}>
                            {item?.status === 1 ? "Khóa" : "Kích hoạt"}
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>Không có nhân viên nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {staffData.totalPage > 1 ? (
                    <PaginationBookStore
                      totalPage={staffData.totalPage}
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