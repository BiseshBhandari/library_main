import React from 'react';
import { FaPlus, FaMinus, FaTrash } from 'react-icons/fa';
// import '../styles/CartItem.css';
import "../../styles/CartItem.css"; // Adjust the path as necessary

export default function CartItem({ item, onIncrement, onDecrement, onDelete }) {
  return (
    <div className="cart-item">
      <img src={item.coverUrl} alt={item.title} />
      <div className="item-details">
        <h3>{item.title}</h3>
        <p>${item.price.toFixed(2)}</p>
        <div className="quantity-controls">
          <FaMinus onClick={onDecrement} />
          <span>{item.quantity}</span>
          <FaPlus onClick={onIncrement} />
        </div>
      </div>
      <FaTrash className="delete-icon" onClick={onDelete} />
    </div>
  );
}