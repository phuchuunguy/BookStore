import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Row, Col, Table, Spinner, Modal, Badge, Button } from "react-bootstrap";

import { FaEye } from "react-icons/fa";
import PaginationBookStore from "../../components/PaginationBookStore";
import OrderDetail from "../../components/OrderDetail";
import format from "../../helper/format";
import moment from "moment";
import { v4 as uuidv4 } from 'uuid';

import methodData from "../Checkout/methodData"
import steps from "../../components/OrderProgress/enum";
import orderApi from "../../api/orderApi";

export default function Order() {
  const { userId } = useSelector((state) => state.auth);

  const [orderData, setOrderData] = useState([]);
  const [orderDetail, setOrderDetail] = useState({});
  const [page, setPage] = useState(1);
  
  const [loading, setLoading] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState({})
  const [selectedMethod, setSelectedMethod] = useState(1)

  const [showModal, setShowModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data, pagination } = await orderApi.getAll({
          userId: userId,
          page: page,
          limit: 5,
        });
        setLoading(false);
        setOrderData({ orders: data, totalPage: pagination.totalPage });
      } catch (error) {
        setLoading(false);
        console.log(error);
      }
    };
    if (userId) {
      fetchOrder();
    }
  }, [userId, page]);

  const handleGetOrderDetail = async (orderId) => {
    try {
      if (!(orderDetail?._id === orderId)) {
        const { data } = await orderApi.getById(orderId, { userId: userId });
        setOrderDetail(data);
      }
      setShowModal(true);
    } catch (error) {
      console.log(error);
    }
  };

  const handleCheckout = async () => {
    if (selectedMethod === 1) {
      try {
          const { cost: { total }, _id } = selectedOrder
          const paymentId = uuidv4()
          setLoadingCheckout(true)
          await orderApi.updatePaymentId(_id, { paymentId })
          const { payUrl } = await orderApi.getPayUrlMoMo({ amount: total, paymentId })
          setLoadingCheckout(false)
          window.location.href = payUrl
      } catch (error) {
          setLoadingCheckout(false)
          console.log(error)
      }
    } else {
        alert("Tính năng đang phát triển!")
    }
}

  return (
    <div>
      <Modal size="lg" show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Thông tin hóa đơn</Modal.Title>
        </Modal.Header>
          <Modal.Body>
            <div>
              <Row>
                <label>Hình thức thanh toán</label>
                {methodData && methodData.map(method => {
                  if (method?.value !== 0) {
                    return (
                      <div key={method.value}>
                        <input type="radio" name="method" value={method.value} id={method.name} checked={+selectedMethod === method.value}
                        onChange={(e) => setSelectedMethod(+e.target.value)} /> 
                        <label htmlFor={method.name}>{method.name}</label>
                        {method.image && <label htmlFor={method.name}> <img className="icon-method" src={method.image} alt="" /></label>}
                        <br />
                      </div>
                    )
                  } else return null
                })}
              </Row>
              <Button onClick={handleCheckout} className="mt-4" disabled={loadingCheckout}>{loadingCheckout ? "THANH TOÁN..." : "THANH TOÁN"}</Button>
            </div>
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCheckoutModal(false)}>
                Hủy
            </Button>
        </Modal.Footer>
    </Modal>
    <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-w1100">
      <Modal.Header closeButton>
        <Modal.Title>Hóa đơn</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {showModal && orderDetail && (
          <OrderDetail data={orderDetail} />
        )}
      </Modal.Body>
    </Modal>
      <div style={{border: "1px solid #ccc", fontSize: 13}}>
        <Table hover>
          <thead>
            <tr>
              <th>STT</th>
              <th>Thông tin giao hàng</th>
              <th>Ngày đặt hàng</th>
              <th>Tổng tiền</th>
              <th>Tình trạng</th>
              <th>Phương thức</th>
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
            ) : orderData?.orders && orderData?.orders?.length > 0 ? (
              orderData.orders.map((item, index) => {
                return (
                  <tr key={item._id}>
                    <td>{(1 && page - 1) * 10 + (index + 1)}</td>
                    <td className="text-start" style={{ fontSize: 14 }}>
                      <p>
                        Người nhận: <b>{item?.delivery?.fullName}</b>
                      </p>
                      <p>
                        Email: <b>{item?.delivery?.email}</b>
                      </p>
                      <p>
                        Điện thoại: <b>{item?.delivery?.phoneNumber}</b>
                      </p>
                      <p>
                        Địa chỉ: <b>{item?.delivery?.address}</b>{" "}
                      </p>
                    </td>
                    <td style={{ fontSize: 14 }}>
                      {moment(item?.createdAt).format("DD-MM-yyyy HH:mm:ss")}
                    </td>
                    <td className="price fw-bold">
                      {format.formatPrice(item?.cost?.total)}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor:
                          steps[item?.orderStatus?.code]?.color,
                        }}
                      >
                        {item?.orderStatus?.text}
                      </span>
                    </td>
                    <td>
                      <p>
                        <b>{item?.method?.text}</b>
                      </p>
                      {item?.method?.code !== 0 && (
                        <Badge
                          bg={
                            item?.paymentStatus?.code === 2
                              ? "success"
                              : "danger"
                          }
                        >
                          {item?.paymentStatus?.text}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-primary small"
                        onClick={() => handleGetOrderDetail(item?._id)}
                      >
                        <FaEye />
                      </button>
                    </td>
                    <td>
                      {item?.method?.code !== 0 &&
                        item?.paymentStatus?.code !== 2 && (
                          <button
                            className="btn btn-warning small"
                            onClick={() => {
                              setSelectedOrder(item)
                              setShowCheckoutModal(true)
                            }}
                          >
                            Thanh toán
                          </button>
                        )}
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
        {orderData?.totalPage > 1 ? (
          <div className="admin-content-pagination">
            <Row>
              <Col xl={12}>
                <PaginationBookStore
                  totalPage={orderData.totalPage}
                  currentPage={page}
                  onChangePage={handleChangePage}
                />
              </Col>
            </Row>
          </div>
        ) : null}
      </div>
    </div>
  );
}
