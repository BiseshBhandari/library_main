import { useState } from "react"
import { useNavigate } from "react-router-dom"

export default function CartSummary({ items, onCartCleared }) {
  const [orderStatus, setOrderStatus] = useState("")
  const navigate = useNavigate()

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handleCheckoutRedirect = () => {
    if (items.length === 0) {
      setOrderStatus("Cannot proceed to checkout with empty archives.")
      return
    }
    navigate("/checkout", { state: { cartItems: items } })
  }

  return (
    <div className="cart-summary">
      <h2 className="summary-title">Deployment Summary</h2>
      <div className="summary-details">
        <div className="summary-row">
          <span>Subtotal ({items.length} items)</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
      </div>

      {orderStatus && (
        <div className="order-status">
          {orderStatus.split("\n").map((line, index) => (
            <p key={index}>{line.trim()}</p>
          ))}
        </div>
      )}

      <button className="checkout-button" onClick={handleCheckoutRedirect} disabled={items.length === 0}>
        Go to Checkout
      </button>
    </div>
  )
}
