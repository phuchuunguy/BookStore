import { useCallback, useEffect, useState } from "react";
import { Table, Button, Modal } from "react-bootstrap";
import { useSelector } from "react-redux";
import { FaCheckCircle } from "react-icons/fa";
import AddressSelect from "../../components/AddressSelect";
import userApi from "../../api/userApi";
import styles from "./Account.module.css";

function Address() {
  const [addressList, setAddressList] = useState([]);

  const [showAddForm, setShowAddForm] = useState(false);

  const [newAddress, setNewAddress] = useState("");
  const [addressDelete, setAddressDelete] = useState({})

  const [showModal, setShowModal] = useState(false)

  const { userId } = useSelector((state) => state.auth);

  useEffect(() => {
    const fetchAdress = async () => {
      try {
        const { data } = await userApi.getAllAddressById(userId);
        setAddressList(data?.address);
      } catch (error) {
        console.log(error)
      }
    };

    if (userId) {
      fetchAdress();
    }
  }, [userId]);

  const handleSubmitAddNewAddress = async (e) => {
    e.preventDefault();
    const { province: { provinceId, provinceName }, district: { districtId, districtName }, ward: { wardId, wardName }, address } = newAddress
    try {
      const { data } = await userApi.addAddress(userId, {
        address: {
          address: `${address}, ${wardName}, ${districtName}, ${provinceName}`,
          provinceId,
          districtId,
          wardId
        }
      });
      console.log(data)
      setShowAddForm(false);
      setAddressList((preState) => {
        const newArray = [...preState];
        newArray.push({
          _id: data?._id,
          address: data?.address,
          isDefault: false,
        });
        return newArray;
      });
    } catch (error) {
      console.log(error)
    }
  };

  const handleCallApiDelete = async () => {
    try {
      await userApi.deleteById(userId, addressDelete?._id);
      setShowModal(false)
      setAddressList((preState) => {
        const newArray = [...preState];
        return newArray.filter((item) => item._id !== addressDelete?._id);
      });
    } catch (error) {
      setShowModal(false)
      console.log(error)
    }
  };

  const handleUpdateDefaultAddress = async (addressId) => {
    try {
      await userApi.updateDefaultAddressById(
        userId,
        addressId
      );
      setAddressList((preState) => {
        const newArray = [...preState];
        return newArray.map((item) => {
          return item._id === addressId
            ? { ...item, isDefault: true }
            : { ...item, isDefault: false };
        });
      });
    } catch (error) {
      console.log(error)
    }
  };

  const handleChangeAddress = useCallback((data) => {
    setNewAddress(data)
  }, [])

  return (
    <>
      <Modal size="lg" show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xóa địa chỉ</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc xóa địa chỉ <b>{addressDelete && addressDelete?.address}</b> này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={handleCallApiDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
      <div className={styles.addressWrapper}>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Địa chỉ</th>
              <th colSpan="2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {addressList && addressList?.length > 0 ? (
              addressList.map((item, index) => {
                return (
                  <tr key={item._id}>
                    <td>{index + 1}</td>
                    <td>
                      {item.address}{" "} {item.isDefault ? (
                        <button className={`bookstore-btn ${styles.btnCheck}`}>
                          <FaCheckCircle />
                        </button>
                      ) : ("")}
                    </td>
                    <td>
                      {!item.isDefault ? (
                        <Button onClick={() => handleUpdateDefaultAddress(item?._id)} >
                          Đặt làm mặc định
                        </Button>
                      ) : ("")}
                    </td>
                    <td>
                      <button className="btn btn-danger" onClick={() => {
                        setAddressDelete(item)
                        setShowModal(true)
                      }}>
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3}>Bạn chưa có địa chỉ giao hàng nào!</td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      <button
        className={`bookstore-btn ${styles.addAddressBtn}`}
        onClick={() => setShowAddForm(!showAddForm)}
      >
        {showAddForm ? "Hủy thêm" : "Thêm địa chỉ"}
      </button>

      {showAddForm && (
        <form onSubmit={handleSubmitAddNewAddress}>
          <AddressSelect onChange={handleChangeAddress} />
          <button className={`bookstore-btn ${styles.submitBtn}`}>
            Xác nhận
          </button>
        </form>
      )}
    </>
  );
}

export default Address;
