import { useEffect, useState } from "react"
import Swal from "sweetalert2"

export default function CartItem({ item, onIncrement, onDecrement, onDelete }) {
  const [inventoryStock, setInventoryStock] = useState(null)

  useEffect(() => {
    const fetchInventoryStock = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/Books/${item.bookId}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch book inventory: ${response.status}`)
        }
        const bookData = await response.json()
        setInventoryStock(bookData.inventoryCount || 0)
      } catch (err) {
        console.error("Error fetching inventory stock:", err)
        setInventoryStock(0) // Default to 0 if fetch fails
      }
    }

    fetchInventoryStock()
  }, [item.bookId])

  const canIncrement = inventoryStock !== null && item.quantity < inventoryStock

  const handleIncrementClick = () => {
    if (!canIncrement) {
      Swal.fire({
        icon: "warning",
        title: "Stock Limit Reached",
        text: `Only ${inventoryStock} items are available in stock.`,
      })
      return
    }
    onIncrement()
  }

  return (
    <div className="cart-item">
      <div className="item-image-container">
        <img
          src={item.coverUrl || "/placeholder.svg"}
          alt={item.title}
          className="item-image"
          onError={(e) => (e.target.src = "/default-cover.jpg")}
        />
      </div>
      <div className="item-details">
        <h3 className="item-title">{item.title}</h3>
        <p className="item-subtitle">
          Price:
          {item.isDiscountActive ? (
            <>
              <span className="original-price">${item.originalPrice.toFixed(2)}</span>
              <span className="discounted-price"> ${item.price.toFixed(2)}</span>
            </>
          ) : (
            <span className="regular-price"> ${item.price.toFixed(2)}</span>
          )}
        </p>
      </div>
      <div className="item-quantity">
        <button className="quantity-btn plus" onClick={handleIncrementClick} disabled={!canIncrement}>
          +
        </button>
        <span className="quantity-value">{item.quantity}</span>
        <button className="quantity-btn minus" onClick={onDecrement}>
          -
        </button>
      </div>
      <div className="item-total">${(item.price * item.quantity).toFixed(2)}</div>
      <button className="item-remove" onClick={onDelete}>
        ✕
      </button>
    </div>
  )
}
