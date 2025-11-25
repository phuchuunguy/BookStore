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

  const [showModal, setShowModal] = useState(false);
  const [showModalUpdate, setShowModalUpdate] = useState(false);

  const [orderDetail, setOrderDetail] = useState({});

  useEffect(() => {
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
    fetchData();
  }, [page]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  const handleGetOrderDetail = async (orderId) => {
    try {
      if (!(orderDetail._id === orderId)) {
        const { data } = await orderApi.getById(orderId, {});
        setOrderDetail(data);
      }
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleUpdateOrder = async (orderId) => {
    try {
      if (!(orderDetail._id === orderId)) {
        const { data } = await orderApi.getById(orderId, {});
        setOrderDetail(data);
      }
      setShowModalUpdate(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCallApiChangeStatus = async () => {
    try {
      setLoadingUpdate(true)
      const { data } = await orderApi.updateOrderStatus(orderDetail?._id, { orderStatusCode: +orderDetail?.orderStatus?.code + 1});
      setLoadingUpdate(false)
      const { orderStatus, paymentStatus } = data
      setOrderDetail((pre) => {
        return {
          ...pre,
          orderStatus,
          paymentStatus
        };
      });
      setOrderData((pre) => {
        const newArray = [...pre.orders];
        return {
          ...pre,
          orders: newArray.map((item) => {
            return item?._id === orderDetail?._id
              ? { ...item, orderStatus, paymentStatus }
              : item;
          }),
        };
      });
      alert("Cập nhật thành công!");
    } catch (error) {
      alert("Cập nhật thất bại!");
      setLoadingUpdate(false)
      console.log(error);
    }
  };

  return (
    <Row>
      <Modal
        dialogClassName="modal-w1100"
        size="lg"
        show={showModalUpdate}
        onHide={() => setShowModalUpdate(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Hóa đơn</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModalUpdate && orderDetail && orderDetail?.orderStatus?.text && (
            <div>
              <p className="mb-4">Trạng thái đơn hàng: <b>{orderDetail?.orderStatus?.text}</b></p>
              <OrderProgress current={orderDetail?.orderStatus?.code} />
              {orderDetail?.orderStatus?.code < steps?.length - 1 && (
                <Button variant="success" disabled={loadingUpdate} className="mt-4 d-flex" style={{margin: "0 auto"}} onClick={handleCallApiChangeStatus}>
                  Chuyển sang trạng thái tiếp theo
                </Button>
              )}
            </div>
          )}
        </Modal.Body>
      </Modal>
      <Modal
        size="lg"
        dialogClassName="modal-w1100"
        show={showModal}
        onHide={() => setShowModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Hóa đơn <Badge bg="secondary">{orderDetail?._id}</Badge>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showModal && orderDetail && (
              <OrderDetail data={orderDetail} />
          )}
        </Modal.Body>
      </Modal>
      <Col xl={12}>
        <div className="admin-content-wrapper">
          <div className="admin-content-header">Danh sách đơn hàng</div>
          <div className="admin-content-body">
            <Table hover>
              <thead>
                <tr>
                  <th>STT</th>
                  <th>Thông tin giao hàng</th>
                  <th>Ngày đặt hàng</th>
                  <th>Tổng tiền</th>
                  <th>Tình trạng</th>
                  <th colSpan="2">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7}>
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : orderData.orders && orderData.orders.length > 0 ? (
                  orderData.orders.map((item, index) => {
                    return (
                      <tr key={item?._id}>
                        <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                        <td className="text-start">
                          <p>Người nhận: <b>{item?.delivery?.fullName}</b></p>
                          <p>Email: <b>{item?.delivery?.email}</b></p>
                          <p>Điện thoại: <b>{item?.delivery?.phoneNumber}</b></p>
                          <p>Địa chỉ: <b>{item?.delivery?.address}</b> </p>
                        </td>
                        <td>
                          <p>{moment(item?.createdAt).format('DD-MM-yyyy HH:mm:ss')}</p>
                          {moment(item.createdAt).isSame(moment(), 'day') && (
                             <span style={{backgroundColor: "#ff709e"}} className="badge">{moment(item?.createdAt).fromNow()}</span>
                          )}
                        </td>
                        <td className="price fw-bold">
                          {format.formatPrice(item?.cost?.total)}
                        </td>
                        <td><span className="badge" style={{backgroundColor: steps[item?.orderStatus?.code]?.color}}>{item?.orderStatus?.text}</span></td>
                        <td>
                          <button
                            className="btn btn-success"
                            onClick={() => handleUpdateOrder(item?._id)}
                            disabled={
                              item?.method?.code !== 0 &&
                              item?.paymentStatus?.code !== 2
                            }
                          >
                            <FaEdit />
                          </button>
                        </td>
                        <td>
                          <button
                            className="btn btn-primary"
                            onClick={() => handleGetOrderDetail(item?._id)}
                          >
                            <FaEye />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6}>Không có đơn hàng nào!</td>
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
