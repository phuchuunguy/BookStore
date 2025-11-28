import { useCallback, useEffect, useState } from "react";
import { Row, Col, Table, Spinner, Modal, Badge, Button } from "react-bootstrap";
import moment from 'moment'
import { FaEdit, FaEye } from "react-icons/fa";

import PaginationBookStore from "../../../components/PaginationBookStore";
import OrderProgress from "../../../components/OrderProgress";
import OrderDetail from "../../../components/OrderDetail";

import steps from "../../../components/OrderProgress/enum";
import orderApi from "../../../api/orderApi";
import format from "../../../helper/format";

export default function OrderList() {
  
  const [orderData, setOrderData] = useState({});
  const [page, setPage] = useState(1);

  const [loading, setLoading] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);

  const [orderDetail, setOrderDetail] = useState({});
  const [selectedStatus, setSelectedStatus] = useState(0);

  // Fetch danh sách đơn hàng
  const fetchData = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await orderApi.getAll({
          page: page,
          limit: 10,
        });
        setLoading(false);
        setOrderData({ orders: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
  };

  useEffect(() => {
    fetchData();
  }, [page]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  // Lấy chi tiết đơn hàng
  const getOrderDetails = async (orderId) => {
      try {
          const res = await orderApi.getById(orderId);
          return res.data || res; 
      } catch (error) {
          console.log("Lỗi lấy chi tiết đơn:", error);
          return null;
      }
  }

  const handleGetOrderDetail = async (orderId) => {
    setOrderDetail(null);
    setShowModal(true);
    setLoadingModal(true);

    const data = await getOrderDetails(orderId);
    if (data) {
        setOrderDetail(data);
    }
    setLoadingModal(false);
  };

  const handleUpdateOrder = async (orderId) => {
    setOrderDetail(null);
    setShowModalUpdate(true);
    setLoadingModal(true);

    const data = await getOrderDetails(orderId);
    if (data) {
        setOrderDetail(data);
        setSelectedStatus(data.orderStatus?.code || 0);
    }
    setLoadingModal(false);
  };

  const handleCallApiChangeStatus = async () => {
    try {
      setLoadingUpdate(true)
      
      // Lấy status từ Dropdown
      const nextStatusCode = parseInt(selectedStatus); 
      
      const { data } = await orderApi.updateOrderStatus(orderDetail?.id, { orderStatusCode: nextStatusCode});
      
      setLoadingUpdate(false)
      
      const { orderStatus, paymentStatus } = data || {}; 
      
      if (orderStatus) {
          setOrderDetail((pre) => ({ ...pre, orderStatus, paymentStatus }));
          setOrderData((pre) => {
            const newArray = [...(pre.orders || [])];
            const updatedOrders = newArray.map((item) => 
               item.id === orderDetail.id ? { ...item, orderStatus, paymentStatus } : item
            );
            return { ...pre, orders: updatedOrders };
          });
          alert("Cập nhật thành công!");
          setShowModalUpdate(false); 
      }
    } catch (error) {
      alert("Cập nhật thất bại!");
      setLoadingUpdate(false)
      console.log(error);
    }
  };

  return (
    <Row>
      {/* Modal Cập nhật trạng thái */}
      <Modal
        dialogClassName="modal-w1100"
        size="lg"
        show={showModalUpdate}
        onHide={() => setShowModalUpdate(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Cập nhật trạng thái đơn hàng #{orderDetail?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingModal ? (
             <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
                <p>Đang tải thông tin đơn hàng...</p>
             </div>
          ) : (
             showModalUpdate && orderDetail && (
                <div className="p-3">
                  <h5 className="mb-4 text-center">
                      Trạng thái hiện tại: <Badge bg="primary">{orderDetail?.orderStatus?.text}</Badge>
                  </h5>
                  
                  <OrderProgress current={orderDetail?.orderStatus?.code} />
                  
                  <hr className="my-4"/>

                  <div className="form-group">
                      <label className="fw-bold mb-2">Chọn trạng thái mới:</label>
                      <select 
                        className="form-select" 
                        value={selectedStatus} 
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{ padding: '10px', fontSize: '16px' }}
                      >
                          <option value="0">0. Chờ cửa hàng xác nhận</option>
                          <option value="1">1. Đã xác nhận đơn hàng</option>
                          <option value="2">2. Đã đóng gói / Chờ lấy hàng</option>
                          <option value="3">3. Đang vận chuyển</option>
                          <option value="4">4. Kiện hàng sắp đến</option>
                          <option value="5">5. Giao hàng thành công</option>
                          <option value="6">⛔ ĐÃ HỦY ĐƠN</option> 
                      </select>
                  </div>

                  <div className="mt-4 d-flex justify-content-end gap-2">
                      <Button variant="secondary" onClick={() => setShowModalUpdate(false)}>
                          Hủy
                      </Button>
                      <Button 
                          variant="primary" 
                          disabled={loadingUpdate} 
                          onClick={handleCallApiChangeStatus}
                      >
                        {loadingUpdate ? "Đang lưu..." : "Cập nhật trạng thái"}
                      </Button>
                  </div>
                </div>
             )
          )}
        </Modal.Body>
      </Modal>

      {/* Modal Xem chi tiết */}
      <Modal
        size="lg"
        dialogClassName="modal-w1100"
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Chi tiết đơn hàng <Badge bg="secondary">#{orderDetail?.id}</Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingModal ? (
             <div className="text-center p-5">
                <Spinner animation="border" variant="primary" />
             </div>
          ) : (
             showModal && orderDetail && <OrderDetail data={orderDetail} />
          )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Quản lý đơn hàng</div>
          <div className="admin-content-body">
            <Table hover responsive>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Thông tin người nhận</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                  <th colSpan="2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((item, index) => {
                    return (
                      <tr key={item?.id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td className="text-start">
                          <strong>{item?.delivery?.fullName}</strong>
                          <br/>
                          <small>{item?.delivery?.phoneNumber}</small>
                          <br/>
                          <small className="text-muted">{item?.delivery?.address}</small>
                        </td>
                        <td>
                          {moment(item?.createdAt).format('DD/MM/YYYY HH:mm')}
                          <br/>
                          {moment(item.createdAt).isSame(moment(), 'day') && (
                             <Badge bg="danger" className="mt-1">Mới</Badge>
                          )}
                        </td>
                        <td className="fw-bold text-danger">
                          {format.formatPrice(item?.cost?.total)}
                        </td>
                        <td>
                            <Badge 
                                bg={item?.orderStatus?.code === 6 ? 'danger' : 'success'} 
                                style={{backgroundColor: steps[item?.orderStatus?.code]?.color}}
                            >
                                {item?.orderStatus?.text}
                            </Badge>
                        </td>
                        <td>
                          <button
                            className="btn btn-warning btn-sm me-2"
                            title="Cập nhật trạng thái"
                            onClick={() => handleUpdateOrder(item?.id)}
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="btn btn-info btn-sm text-white"
                            title="Xem chi tiết"
                            onClick={() => handleGetOrderDetail(item?.id)}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center">Chưa có đơn hàng nào!</td>
                  </tr>
                )}
              </tbody>
            </Table>
            <div className="admin-content-pagination">
              <Row>
                <Col xl={12}>
                  {orderData.totalPage > 1 ? (
                    <PaginationBookStore
                      totalPage={orderData.totalPage}
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