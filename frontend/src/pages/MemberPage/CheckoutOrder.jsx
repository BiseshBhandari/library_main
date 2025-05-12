import React, { useState, useEffect } from "react"
import { format } from "date-fns"
import { useNavigate, useLocation } from "react-router-dom"
import Swal from 'sweetalert2';
import MemberSide from "../../Components/Navigation/MemberSide"
import NavBar from "../../Components/Navigation/MemberNav"
import "../../styles/CheckoutPage.css"

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isOrdersLoading, setIsOrdersLoading] = useState(true)
  const [orderStatus, setOrderStatus] = useState("")
  const [cartItems, setCartItems] = useState([])
  const [orders, setOrders] = useState([])
  const [successfulOrdersCount, setSuccessfulOrdersCount] = useState(0)
  const [error, setError] = useState("")
  const [ordersError, setOrdersError] = useState("")
  const [orderDetails, setOrderDetails] = useState(null) // Store cart items and totalPrice post-order
  const [orderPreview, setOrderPreview] = useState(null) // Store pre-order total/discount

  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const navigate = useNavigate()
  const location = useLocation()
  const currentDateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss")
  const currentUser = localStorage.getItem("username") || "LuciHav"

  useEffect(() => {
    // Reset states on navigation
    setOrderDetails(null)
    setOrderPreview(null)
    // Set cart items and order status from location.state if available
    if (location.state) {
      if (location.state.cartItems) {
        setCartItems(location.state.cartItems)
      }
      if (location.state.orderStatus) {
        setOrderStatus(location.state.orderStatus)
      }
    }
    // Always fetch fresh cart items and orders
    fetchCartItems()
    fetchOrders()
  }, [location.state])

  // Fetch order preview whenever cartItems or successfulOrdersCount changes
  useEffect(() => {
    if (cartItems.length > 0 && !isOrdersLoading) {
      fetchOrderPreview()
    } else {
      setOrderPreview(null)
    }
  }, [cartItems, successfulOrdersCount, isOrdersLoading])

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
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
        })),
      )
      setError("")
    } catch (err) {
      setError("Could not load cart items.")
      setCartItems([])
      console.error("Cart error:", err)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setOrdersError("Authentication failed. Please log in again.")
          navigate("/login")
        }
        throw new Error(`Failed to fetch orders: ${response.status}`)
      }

      const data = await response.json()
      console.log("Fetched Orders Response:", JSON.stringify(data, null, 2))

      if (Array.isArray(data)) {
        setOrders(data)
        const completedCount = data.filter((order) => order.status === "Complete").length
        setSuccessfulOrdersCount(completedCount)
        console.log("Successful Orders Count:", completedCount)
      } else {
        console.error("Unexpected API response: Expected an array of orders", data)
        setOrders([])
        setSuccessfulOrdersCount(0)
      }

      setOrdersError("")
    } catch (err) {
      setOrdersError("Could not load orders.")
      setOrders([])
      setSuccessfulOrdersCount(0)
      console.error("Orders error:", err)
    } finally {
      setIsOrdersLoading(false)
    }
  }

  const fetchOrderPreview = async () => {
    try {
      const previewRequest = {
        items: cartItems.map((item) => ({
          BookId: item.bookId,
          Quantity: item.quantity,
          Price: item.price,
        })),
      }

      const response = await fetch(`http://localhost:5001/api/users/${userId}/orders/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(previewRequest),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to fetch order preview: ${response.status} - ${errorData.message || "Unknown error"}`)
      }

      const previewResponse = await response.json()
      console.log("Order Preview Response:", JSON.stringify(previewResponse, null, 2))
      setOrderPreview({
        originalTotal: previewResponse.originalTotal,
        discount: previewResponse.discount,
        finalTotal: previewResponse.finalTotal,
      })
    } catch (err) {
      setError("Could not load order preview.")
      setOrderPreview(null)
      console.error("Preview error:", err)
    }
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
      console.log("Order Response:", JSON.stringify(orderResponse, null, 2))
      setOrderDetails({
        items: [...cartItems],
        totalPrice: orderResponse.totalPrice,
      })

      const clearCartResponse = await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!clearCartResponse.ok) {
        throw new Error("Failed to clear cart")
      }

      setCartItems([])
      fetchOrders()
      fetchCartItems()

      // Sweet notification and redirection
      Swal.fire({
        icon: 'success',
        title: 'Order Confirmed!',
        text: 'Redirecting to home page...',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      }).then(() => {
        navigate("/member/member-landing")
      })

    } catch (error) {
      setOrderStatus(`Failed to place order: ${error.message}`)
      console.error("Order error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getOrderSummary = () => {
    if (!orderDetails) return null
    const originalTotal = orderDetails.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const discount = originalTotal - orderDetails.totalPrice
    return {
      originalTotal,
      discount: discount < 0 ? 0 : discount,
      finalTotal: orderDetails.totalPrice,
    }
  }

  const orderSummary = getOrderSummary()

  return (
    <div className="checkout-container">
      <MemberSide />
      <main className="checkout-main">
        <NavBar />
        <div className="checkout-content">
          {error && <div className="error-message">{error}</div>}
          {ordersError && <div className="error-message">{ordersError}</div>}

          <div className="cart-section">
            <h2>{orderDetails ? "Deployment Confirmation" : "Current Archives"}</h2>
            {cartItems.length === 0 && orderDetails ? (
              <div className="order-confirmation">
                <p>Your deployment has been processed successfully!</p>
                {orderDetails.items.map((item) => (
                  <div key={item.id || item.bookId} className="cart-item">
                    <img
                      src={item.coverUrl || "/placeholder.svg"}
                      alt={item.title}
                      className="book-cover"
                      onError={(e) => {
                        e.target.src = "/default-cover.jpg"
                      }}
                    />
                    <div className="item-details">
                      <h3>{item.title}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${(item.price || 0).toFixed(2)}</p>
                      <p>Subtotal: ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {orderSummary && (
                  <div className="cart-total">
                    <h3>Total: ${orderSummary.originalTotal.toFixed(2)}</h3>
                    <h3>Discount: -${orderSummary.discount.toFixed(2)}</h3>
                    <h3>Final Total: ${orderSummary.finalTotal.toFixed(2)}</h3>
                  </div>
                )}
              </div>
            ) : cartItems.length === 0 ? (
              <p>Your archives are empty.</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id || item.bookId} className="cart-item">
                    <img
                      src={item.coverUrl || "/placeholder.svg"}
                      alt={item.title}
                      className="book-cover"
                      onError={(e) => {
                        e.target.src = "/default-cover.jpg"
                      }}
                    />
                    <div className="item-details">
                      <h3>{item.title}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${(item.price || 0).toFixed(2)}</p>
                      <p>Subtotal: ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                {orderPreview ? (
                  <div className="cart-total">
                    <h3>Total: ${orderPreview.originalTotal.toFixed(2)}</h3>
                    <h3>Discount: -${orderPreview.discount.toFixed(2)}</h3>
                    <h3>Final Total: ${orderPreview.finalTotal.toFixed(2)}</h3>
                  </div>
                ) : (
                  <p>Loading order totals...</p>
                )}
                <div className="discount-info">
                  {isOrdersLoading ? <p>Loading order history...</p> : <>{/* Removed the display of successful orders and the qualification message */}</>}
                </div>
              </>
            )}

            {orderStatus && (
              <div className={`order-status ${orderStatus.includes("successfully") ? "success" : "error"}`}>
                {orderStatus}
              </div>
            )}

            {cartItems.length > 0 && (
              <button
                className="place-order-button"
                onClick={handlePlaceOrder}
                disabled={isLoading || cartItems.length === 0}
              >
                {isLoading ? "Processing..." : "Deploy Order"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
