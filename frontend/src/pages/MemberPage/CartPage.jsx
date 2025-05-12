import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import MemberSide from "../../Components/Navigation/MemberSide"
import NavBar from "../../Components/Navigation/MemberNav"
import CartItem from "../../Components/CartComponents/CartItem"
import CartSummary from "../../Components/CartComponents/CartSummary"
import Swal from "sweetalert2"
import "../../styles/CartPage.css"

export default function CartPage() {
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const [items, setItems] = useState([])
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.")
        }
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }
      const data = await response.json()
      const cartItems = data.items.$values || data.items
      if (!Array.isArray(cartItems)) {
        throw new Error("Expected an array of cart items")
      }
      setItems(
        cartItems.map((item) => ({
          id: item.cartItemId,
          bookId: item.bookId,
          title: item.title || "Untitled",
          price: item.price || 0,
          originalPrice: item.originalPrice || item.price || 0,
          isDiscountActive: item.isDiscountActive || false,
          quantity: item.quantity || 1,
          coverUrl: item.imageUrl ? `http://localhost:5001${item.imageUrl}` : "/default-cover.jpg",
        })),
      )
      setError("")
    } catch (err) {
      console.error("Error fetching cart items:", err)
      setError(err.message || "Could not load cart. Please try again.")
      setItems([])
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        localStorage.removeItem("user")
        navigate("/login")
      }
    }
  }

  useEffect(() => {
    if (!userId || !token) {
      setError("Please log in to view your cart.")
      navigate("/login")
      return
    }
    fetchCartItems()
    const executePendingAction = async () => {
      const pendingAction = localStorage.getItem("pendingAction")
      if (pendingAction) {
        const action = JSON.parse(pendingAction)
        if (action.action === "add-to-cart") {
          const bookResponse = await fetch(`http://localhost:5001/api/Books/${action.bookId}`)
          if (bookResponse.ok) {
            const bookData = await bookResponse.json()
            if (bookData.inventoryCount === 0) {
              Swal.fire({
                icon: "error",
                title: "Out of Stock",
                text: `${bookData.title} is out of stock and cannot be added to your archives.`,
              })
              localStorage.removeItem("pendingAction")
              return
            }

            // Check current cart quantity before adding
            const cartResponse = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (cartResponse.ok) {
              const cartData = await cartResponse.json()
              const cartItems = cartData.items.$values || cartData.items || []
              const cartItem = cartItems.find((item) => item.bookId === action.bookId)
              const currentCartQuantity = cartItem ? cartItem.quantity : 0
              const totalRequested = currentCartQuantity + (action.quantity || 1)

              if (totalRequested > bookData.inventoryCount) {
                Swal.fire({
                  icon: "warning",
                  title: "Stock Limit Exceeded",
                  text: `Only ${bookData.inventoryCount - currentCartQuantity} items remain in stock.`,
                })
                localStorage.removeItem("pendingAction")
                return
              }
            }
          }

          await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              bookId: action.bookId,
              quantity: action.quantity || 1,
            }),
          })
          localStorage.removeItem("pendingAction")
          fetchCartItems()
        }
      }
    }
    executePendingAction()
  }, [userId, token, navigate])

  const handleIncrement = async (item) => {
    try {
      // Fetch the book's inventory stock
      const bookResponse = await fetch(`http://localhost:5001/api/Books/${item.bookId}`)
      if (!bookResponse.ok) {
        throw new Error(`Failed to fetch book inventory: ${bookResponse.status}`)
      }
      const bookData = await bookResponse.json()
      const inventoryStock = bookData.inventoryCount || 0

      // Check if incrementing exceeds inventory
      const totalRequested = item.quantity + 1
      if (totalRequested > inventoryStock) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limit Exceeded",
          text: `Only ${inventoryStock - item.quantity} items remain in stock.`,
        })
        return
      }

      // Proceed with increment
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: item.quantity + 1 }),
      })

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.")
        }
        throw new Error(`Failed to update cart item: ${response.status}`)
      }
      fetchCartItems()
    } catch (err) {
      console.error("Error incrementing cart item:", err)
      setError(err.message || "Failed to update cart item.")
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        localStorage.removeItem("user")
        navigate("/login")
      }
    }
  }

  const handleDecrement = async (item) => {
    if (item.quantity <= 1) {
      handleDelete(item)
      return
    }
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items/${item.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: item.quantity - 1 }),
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.")
        }
        throw new Error(`Failed to update cart item: ${response.status}`)
      }
      fetchCartItems()
    } catch (err) {
      console.error("Error decrementing cart item:", err)
      setError(err.message || "Failed to update cart item.")
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        localStorage.removeItem("user")
        navigate("/login")
      }
    }
  }

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items/${item.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please log in again.")
        }
        throw new Error(`Failed to delete cart item: ${response.status}`)
      }
      fetchCartItems()
    } catch (err) {
      console.error("Error deleting cart item:", err)
      setError(err.message || "Failed to delete cart item.")
      if (err.message.includes("Unauthorized")) {
        localStorage.removeItem("token")
        localStorage.removeItem("userId")
        localStorage.removeItem("user")
        navigate("/login")
      }
    }
  }

  const handleCartCleared = () => {
    fetchCartItems()
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="cart-container">
      <MemberSide />
      <main className="cart-main">
        <NavBar />
        <section className="cart-content">
          <div className="cart-left">
            <h1 className="cart-title">My Archives</h1>
            <p className="cart-subtitle">You have {items.length} items in your archives</p>
            {items.length === 0 ? (
              <p className="empty-cart">Your archives are empty.</p>
            ) : (
              items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={() => handleIncrement(item)}
                  onDecrement={() => handleDecrement(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))
            )}
          </div>
          <div className="cart-right">
            <CartSummary items={items} onCartCleared={handleCartCleared} />
          </div>
        </section>
      </main>
    </div>
  )
}
