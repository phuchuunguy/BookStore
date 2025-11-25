import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateQuantity, removeItem } from "../../../redux/actions/cart";

import { FaTrashAlt } from "react-icons/fa"

import format from "../../../helper/format";
import styles from "./CartItem.module.css";
import { Button } from "react-bootstrap";

export default function CartItem(props) {
  const dispatch = useDispatch();

  const [quantity, setQuantity] = useState(props.quantity);
  const [totalPriceItem, setTotalPriceItem] = useState(props.totalPriceItem);

  function increaseQuantity() {
    setQuantity((preValue) => preValue + 1);
    setTotalPriceItem(props.price * (quantity + 1));
  }

  function decreaseQuantity() {
    if (quantity > 1) {
      setQuantity((preValue) => preValue - 1);
      setTotalPriceItem(props.price * (quantity - 1));
    }
  }

  function handleChange(event) {
    const value =
      parseInt(event.target.value) > 0 ? parseInt(event.target.value) : 1;
    setQuantity(value);
    setTotalPriceItem(props.price * value);
  }

  const handleRemoveItem = (productId) => {
    dispatch(removeItem({productId}));
  }

  useEffect(() => {
    dispatch(updateQuantity({ productId: props.productId, quantity }));
  }, [quantity, dispatch, props.productId]);

  return (
    <tr>
      <td style={{maxWidth: 450, textAlign: "left"}}>
        <div className="d-flex align-items-center">
          <img src={props.imageUrl} alt={props.name} style={{width: 100}} />
          <p style={{marginLeft: 10}}>{props.name}</p>
        </div>
      </td>
      <td className="price">{format.formatPrice(props.price)}</td>
      <td>
        <div className="d-flex align-items-center justify-content-center">
          <button className={styles.btnChange} onClick={decreaseQuantity}>
            -
          </button>
          <input type="number" className={styles.inputQuantity} value={quantity} onChange={handleChange} />
          <button className={styles.btnChange} onClick={increaseQuantity}>
            +
          </button>
        </div>
      </td>
      <td className="price" style={{fontWeight: "bold"}}>{format.formatPrice(totalPriceItem)}</td>
      <td>
        <Button variant="danger" onClick={() => handleRemoveItem(props.productId)}><FaTrashAlt /></Button>
      </td>
    </tr>
  );
}
