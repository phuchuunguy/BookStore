import { useEffect, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { Table, Spinner, Modal, Badge, Button } from "react-bootstrap";
import { FaTrashAlt, FaCreditCard } from "react-icons/fa";
import { v4 as uuidv4 } from 'uuid';
import Swal from "sweetalert2";
import moment from "moment";

import PaginationBookStore from "../../components/PaginationBookStore";
import OrderDetail from "../../components/OrderDetail";
import format from "../../helper/format";

import methodData from "../Checkout/methodData"
import steps from "../../components/OrderProgress/enum";
import orderApi from "../../api/orderApi";

export default function Order() {
  const { userId } = useSelector((state) => state.auth);

  const [orderData, setOrderData] = useState({});
  const [orderDetail, setOrderDetail] = useState({});
  const [page, setPage] = useState(1);
  
  // State loading
  const [loading, setLoading] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);
  
  const [selectedOrder, setSelectedOrder] = useState({})
  const [selectedMethod, setSelectedMethod] = useState(1)

  const [showModal, setShowModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false)

  // Fetch danh sách đơn hàng
  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data, pagination } = await orderApi.getAll({
        userId: userId,
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
    if (userId) {
      fetchOrder();
    }
  }, [userId, page]);

  const handleChangePage = useCallback((page) => {
    setPage(page);
  }, []);

  // --- HÀM XỬ LÝ HỦY ĐƠN (Gọi API mới) ---
  const handleConfirmCancel = async (orderId) => {
      Swal.fire({
      title: "Xác nhận hủy đơn",
      text: "Bạn có chắc chắn muốn hủy đơn hàng này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Có, hủy đơn",
      cancelButtonText: "Không",
      reverseButtons: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      allowOutsideClick: false,
      focusConfirm: false,
    }).then((result) => {
      if (result.isConfirmed) {
        handleCancelOrder(orderId);
      }
    });
  }

  const handleCancelOrder = async (orderId) => {
  try {
    Swal.fire({
      title: "Đang hủy đơn...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    await orderApi.cancelOrder(orderId); // API hủy đơn

    Swal.fire({
      icon: "success",
      title: "Đã hủy đơn hàng",
      timer: 2000,
      showConfirmButton: false,
    });

    fetchOrder(); // reload danh sách
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Hủy đơn thất bại",
    });
  }
};

  // Xem chi tiết đơn hàng
  const handleGetOrderDetail = async (orderId) => {
    try {
      setShowModal(true);
      setLoadingModal(true);
      
      // Gọi API lấy chi tiết
      const res = await orderApi.getById(orderId);
      const data = res.data || res;

      setOrderDetail(data);
      setLoadingModal(false);
    } catch (error) {
      setLoadingModal(false);
      console.log(error);
      alert("Lỗi kết nối!");
    }
  };

  // Thanh toán lại (cho đơn MoMo chưa thanh toán)
  const handleCheckout = async () => {
    if (selectedMethod === 1) {
      try {
          const { cost: { total }, id } = selectedOrder
          const paymentId = uuidv4()
          setLoadingCheckout(true)
          await orderApi.updatePaymentId(id, { paymentId })
          const { payUrl } = await orderApi.getPayUrlMoMo({ amount: total, paymentId })
          setLoadingCheckout(false)
          window.location.href = payUrl
      } catch (error) {
          setLoadingCheckout(false)
          console.log(error)
          alert("Lỗi thanh toán!")
      }
    } else {
      alert("Tính năng đang phát triển!")
    }
  }

  return (
    <div>
      {/* Modal Thanh toán lại */}
      <Modal size="lg" show={showCheckoutModal} onHide={() => setShowCheckoutModal(false)}>
        <Modal.Header closeButton>
            <Modal.Title>Thanh toán đơn hàng #{selectedOrder.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div>
              <p className="fw-bold">Tổng tiền: {format.formatPrice(selectedOrder?.cost?.total)}</p>
              <label className="mb-2">Chọn hình thức thanh toán:</label>
              {methodData && methodData.map(method => {
                if (method?.value !== 0) {
                  return (
                    <div key={method.value} className="mb-2">
                      <input type="radio" name="method" value={method.value} id={method.name} checked={+selectedMethod === method.value}
                      onChange={(e) => setSelectedMethod(+e.target.value)} style={{marginRight: 5}} /> 
                      <label htmlFor={method.name}>{method.name}</label>
                      {method.image && <label htmlFor={method.name}> <img className="icon-method" src={method.image} alt="" style={{height: 24, marginLeft: 10}}/></label>}
                    </div>
                  )
                } else return null
              })}
              <Button onClick={handleCheckout} className="mt-3 w-100 btn-danger" disabled={loadingCheckout}>
                  {loadingCheckout ? "ĐANG CHUYỂN HƯỚNG..." : "THANH TOÁN NGAY"}
              </Button>
            </div>
        </Modal.Body>
      </Modal>

      {/* Modal Chi tiết đơn hàng */}
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-w1100">
        <Modal.Header closeButton>
          <Modal.Title>Chi tiết đơn hàng #{orderDetail?.id}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {loadingModal ? (
             <div className="text-center p-4">
                <Spinner animation="border" variant="success" />
             </div>
          ) : (
             showModal && orderDetail && <OrderDetail data={orderDetail} />
          )}
        </Modal.Body>
        <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Đóng</Button>
        </Modal.Footer>
      </Modal>

      <div style={{border: "1px solid #eee", borderRadius: 8, overflow: "hidden"}}>
        <Table hover responsive className="mb-0">
          <thead className="bg-light">
            <tr>
              <th>STT</th>
              <th>Thông tin giao hàng</th>
              <th>Ngày đặt hàng</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th className="text-end">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-4">
                  <Spinner animation="border" variant="success" />
                </td>
              </tr>
            ) : orderData?.orders && orderData?.orders?.length > 0 ? (
              orderData.orders.map((item, index) => {
                return (
                  <tr key={item.id}
                    onClick={() => handleGetOrderDetail(item?.id)}
                    style={{ cursor: 'pointer' }} // Hiện bàn tay khi di chuột
                    title="Bấm để xem chi tiết"
                  >
                    <td>{(page - 1) * 10 + (index + 1)}</td>
                    <td className="text-start" style={{ minWidth: 250 }}>
                      <p className="mb-1"><b>{item?.delivery?.fullName}</b></p>
                      <p className="mb-1 text-muted small">{item?.delivery?.phoneNumber}</p>
                      <p className="mb-0 text-muted small">{item?.delivery?.address}</p>
                    </td>
                    <td>
                      {moment(item?.createdAt).format("DD/MM/yyyy HH:mm")}
                    </td>
                    
                    {/* Giá tiền căn trái, màu đỏ */}
                    <td className="text-start fw-bold text-danger">
                      {format.formatPrice(item?.cost?.total)}
                    </td>

                    <td>
                      <Badge 
                        bg={item?.orderStatus?.code === 6 ? 'danger' : 'success'} 
                        style={{
                          backgroundColor: steps[item?.orderStatus?.code]?.color,
                          fontSize: 12, padding: '6px 10px'
                        }}
                      >
                        {item?.orderStatus?.code === 6 
                          ? "Bạn đã hủy đơn" 
                          : item?.orderStatus?.text}
                      </Badge>
                      
                      <div className="mt-2">
                        {item?.method?.code !== 0 && (
                            <Badge bg={item?.paymentStatus?.code === 1 ? "success" : "warning"} text="dark">
                              {item?.paymentStatus?.text}
                            </Badge>
                        )}
                      </div>
                    </td>

                    <td className="text-end">
                      <div className="d-flex flex-column gap-2 align-items-end">
                          {/* Nút Thanh toán lại */}
                          {item?.method?.code !== 0 && item?.paymentStatus?.code !== 1 && item?.orderStatus?.code !== 6 && (
                            <Button size="sm" variant="warning" onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(item);
                                setShowCheckoutModal(true);
                            }} style={{width: '110px'}}>
                                <FaCreditCard /> Thanh toán
                            </Button>
                          )}

                          {/* Nút Hủy đơn (Chỉ hiện khi chưa đóng gói: code < 2) */}
                          {item?.orderStatus?.code < 3 && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline-danger"
                              style={{ width: "110px" }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirmCancel(item.id);
                              }}
                            >
                              <FaTrashAlt /> Hủy đơn
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4">Bạn chưa có đơn hàng nào!</td>
              </tr>
            )}
          </tbody>
        </Table>
        
        {/* Phân trang */}
        {orderData?.totalPage > 1 && (
          <div className="p-3 d-flex justify-content-center border-top">
             <PaginationBookStore
                totalPage={orderData.totalPage}
                currentPage={page}
                onChangePage={handleChangePage}
              />
          </div>
        )}
      </div>
    </div>
  );
}