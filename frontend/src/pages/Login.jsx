import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import "../styles/Login.css"

const API_URL = "http://localhost:5001/api/auth"

function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Invalid username or password")
      }

      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      localStorage.setItem("userId", data.user.id)
      localStorage.setItem("username", data.user.fullName || "User")

      // Check for pending action
      const pendingAction = localStorage.getItem("pendingAction")
      if (pendingAction) {
        const { action, bookId, quantity } = JSON.parse(pendingAction)
        const userId = data.user.id
        const token = data.token

        if (action === "add-to-cart") {
          try {
            const cartResponse = await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookId: bookId,
                quantity: quantity || 1,
              }),
            })

            if (!cartResponse.ok) {
              const errorData = await cartResponse.json()
              throw new Error(`Failed to add to cart: ${errorData.message || cartResponse.status}`)
            }

            localStorage.removeItem("pendingAction")
            navigate("/cart")
          } catch (err) {
            console.error("Error adding to cart after login:", err)
            setError(`Failed to add to cart: ${err.message}`)
            localStorage.removeItem("pendingAction")
            navigate("/cart")
          }
        } else if (action === "buy-now") {
          try {
            const cartResponse = await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                bookId: bookId,
                quantity: quantity || 1,
              }),
            })

            if (!cartResponse.ok) {
              const errorData = await cartResponse.json()
              throw new Error(`Failed to add to cart: ${errorData.message || cartResponse.status}`)
            }

            const bookResponse = await fetch(`http://localhost:5001/api/Books/${bookId}`)
            if (!bookResponse.ok) {
              throw new Error("Failed to fetch book details")
            }
            const bookData = await bookResponse.json()

            localStorage.removeItem("pendingAction")
            navigate("/checkout", {
              state: {
                cartItems: [
                  {
                    bookId: bookData.id,
                    title: bookData.title,
                    price: bookData.price,
                    quantity: quantity || 1,
                    coverUrl: bookData.imageUrl
                      ? `http://localhost:5001${bookData.imageUrl}`
                      : "/default-cover.jpg",
                  },
                ],
              },
            })
          } catch (err) {
            console.error("Error processing buy now after login:", err)
            setError(`Failed to process buy now: ${err.message}`)
            localStorage.removeItem("pendingAction")
            navigate("/checkout")
          }
        } else if (action === "bookmark") {
          try {
            const bookmarkResponse = await fetch(`http://localhost:5001/api/Whitelist/add`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                userId,
                bookId,
              }),
            })

            if (!bookmarkResponse.ok) {
              const errorData = await bookmarkResponse.json()
              throw new Error(`Failed to bookmark book: ${errorData.message || bookmarkResponse.status}`)
            }

            localStorage.removeItem("pendingAction")
            navigate("/bookmark")
          } catch (err) {
            console.error("Error bookmarking book after login:", err)
            setError(`Failed to bookmark book: ${err.message}`)
            localStorage.removeItem("pendingAction")
            navigate("/bookmark")
          }
        }
      } else {
        // Default navigation based on role
        if (data.user.role === "Admin") {
          navigate("/admin/manage-book")
        } else if (data.user.role === "Member") {
          navigate("/member/member-landing")
        } else if (data.user.role === "Staff") {
          navigate("/staff/StaffDashboard")
        } else {
          throw new Error("Invalid user role")
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="auth-card">
        <h1 className="site-title">BookHaven</h1>
        <h2 className="auth-heading">Log into your account</h2>
        <p className="auth-subtext">Enter your email and password to log into your account</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="email"
              name="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={handleInputChange}
              className="auth-input"
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              className="auth-input"
              required
            />
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="auth-link">Forgot password?</p>
        <p className="auth-link">
          Don't have an account? <Link to="/register" className="link">Sign up.</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
