import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useNavigate } from "react-router-dom"
import MemberSide from "../../Components/Navigation/MemberSide"
import NavBar from "../../Components/Navigation/MemberNav"
import { ShieldCheck, ShieldX, Clock, Package } from 'lucide-react'
import "../../styles/order.css"

export default function Order() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [orderStatus, setOrderStatus] = useState("")
  const [cartItems, setCartItems] = useState([])
  const [orders, setOrders] = useState([])
  const [error, setError] = useState("")
  const [ordersError, setOrdersError] = useState("")

  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const currentDateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss")
  const currentUser = localStorage.getItem("username") || "LuciHav"

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`)

      const data = await response.json()
      const cartItems = data.items.$values || data.items
      if (!Array.isArray(cartItems)) {
        throw new Error("Expected an array of cart items")
      }
      setCartItems(
        cartItems.map((item) => ({
          id: item.cartItemId,
          bookId: item.bookId,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          coverUrl: item.imageUrl ? `http://localhost:5001${item.imageUrl}` : "/default-cover.jpg",
        }))
      )
      setError("")
    } catch (err) {
      setError("Could not load cart items.")
      setCartItems([])
      console.error("Cart error:", err)
    }
  }

  // Fetch all orders
  const fetchOrders = async () => {
    setIsOrdersLoading(true)
    setOrdersError("")
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`)

      const data = await response.json()
      const orderArray = data.$values || data
      if (!Array.isArray(orderArray)) {
        throw new Error("Expected an array of orders")
      }
      console.log("Fetched orders:", orderArray) // Debug: Log the raw order data
      setOrders(orderArray)
    } catch (err) {
      setOrdersError("Could not load orders. Please try again later.")
      console.error("Could not load orders:", err)
    } finally {
      setIsOrdersLoading(false)
    }
  }

  useEffect(() => {
    if (!userId || !token) {
      setError("Please log in to checkout.")
      navigate("/login")
      return
    }

    fetchCartItems()
    fetchOrders()
  }, [userId, token, navigate])

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const handlePlaceOrder = async () => {
    if (!userId || !token) {
      setError("Please log in to place an order.")
      navigate("/login")
      return
    }

    if (cartItems.length === 0) {
      setError("Cannot place an order with an empty cart.")
      return
    }

    setIsLoading(true)
    try {
      const orderRequest = {
        items: cartItems.map((item) => ({
          BookId: item.bookId,
          Quantity: item.quantity,
          Price: item.price,
        })),
        TotalPrice: calculateTotal(),
      }

      const response = await fetch(`http://localhost:5001/api/users/${userId}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to place order: ${response.status} - ${errorData.message || "Unknown error"}`)
      }

      const orderResponse = await response.json()
      setOrderStatus(`Order placed successfully! Claim Code: ${orderResponse.claimCode}`)

      // Clear cart after successful order
      await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setCartItems([])
      fetchOrders()
      fetchCartItems()
    } catch (error) {
      setOrderStatus(`Failed to place order: ${error.message}`)
      console.error("Order error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to cancel order: ${response.status} - ${errorData.message || "Unknown error"}`)
      }

      fetchOrders()
      alert("Order cancelled successfully!")
    } catch (error) {
      console.error("Error cancelling order:", error)
      alert(`Failed to cancel order: ${error.message}`)
    }
  }

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <ShieldCheck className="status-icon completed" />
      case "cancelled":
        return <ShieldX className="status-icon cancelled" />
      case "pending":
        return <Clock className="status-icon pending" />
      default:
        return <Package className="status-icon" />
    }
  }

  return (
    <div className="checkout-container">
      <MemberSide />
      <main className="checkout-main">
        <NavBar />
        
        <div className="page-header">
          <h1 className="page-title">Deployment History</h1>
          {orderStatus && <div className="order-status">{orderStatus}</div>}
        </div>

        <div className="orders-section">
          {isOrdersLoading ? (
            <div className="loading">Loading your deployments...</div>
          ) : ordersError ? (
            <div className="error-message">{ordersError}</div>
          ) : orders.length === 0 ? (
            <div className="empty-state">
              <Package size={48} className="empty-icon" />
              <p>No deployments found. Start your collection today!</p>
            </div>
          ) : (
            <div className="orders-grid">
              {orders.map((order) => {
                console.log("Rendering order:", order) // Debug: Log each order
                const status = order.status || "pending" // Fallback to 'pending'
                return (
                  <div key={order.orderId} className={`order-card ${status.toLowerCase()}`}>
                    <div className="order-header">
                      <div className="order-status">
                        {getStatusIcon(status)}
                        <span className={`status-text ${status.toLowerCase()}`}>{status}</span>
                      </div>
                      <div className="order-date">
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                      </div>
                    </div>
                    
                    <div className="order-content">
                      <div className="order-info">
                        <div className="info-group">
                          <label>Deployment ID:</label>
                          <span>{order.orderId}</span>
                        </div>
                        <div className="info-group">
                          <label>Claim Code:</label>
                          <span className="claim-code">{order.claimCode}</span>
                        </div>
                        <div className="info-group">
                          <label>Total:</label>
                          <span className="order-price">${order.totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="order-footer">
                      {status === "Pending" && (
                        <button
                          className="cancel-button"
                          onClick={() => handleCancelOrder(order.orderId)}
                        >
                          <ShieldX size={16} />
                          Cancel Deployment
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
