"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Sidebar from "../../Components/Navigation/Sidebar"
import MemberSide from "../../Components/Navigation/MemberSide"
import TopMenu from "../../Components/BookComponents/Topmenu"
import MemberNav from "../../Components/Navigation/MemberNav"
import Swal from "sweetalert2"
import { motion, AnimatePresence } from "framer-motion"
import "../../styles/BookDetail.css"

const BookDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [book, setBook] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [modalMessage, setModalMessage] = useState("")
  const [cartQuantity, setCartQuantity] = useState(0)
  const [activeTab, setActiveTab] = useState("description")
  const [showImageModal, setShowImageModal] = useState(false)
  const [relatedBooks, setRelatedBooks] = useState([])
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const reviewsRef = useRef(null)

  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const isLoggedIn = userId && token

  useEffect(() => {
    const fetchBookAndCart = async () => {
      try {
        const url = userId
          ? `http://localhost:5001/api/Books/${id}?userId=${userId}`
          : `http://localhost:5001/api/Books/${id}`
        const response = await fetch(url, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Book not found")
          }
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `Failed to fetch book: ${response.status}`)
        }

        const data = await response.json()
        if (!data || typeof data !== "object") {
          throw new Error("Invalid book data received from server")
        }

        setBook({
          id: data.id,
          title: data.title,
          author: data.author,
          description: data.description,
          imageUrl: data.imageUrl,
          price: data.price || 0,
          effectivePrice: data.effectivePrice || data.price || 0,
          isOnSale: data.isOnSale || false,
          discountStart: data.discountStart ? new Date(data.discountStart) : null,
          discountEnd: data.discountEnd ? new Date(data.discountEnd) : null,
          inventoryCount: data.inventoryCount,
          rating: data.rating || 0,
          genre: data.genre || "Fiction",
          publishedDate: data.publishedDate ? new Date(data.publishedDate) : new Date(),
          isbn: data.isbn || "Unknown",
          pages: data.pages || 0,
        })

        const reviewsArray =
          data.reviews && data.reviews.$values ? data.reviews.$values : Array.isArray(data.reviews) ? data.reviews : []
        const formattedReviews = reviewsArray.map((review) => ({
          id: review.reviewId,
          reviewerName: review.reviewerName || "Anonymous",
          rating: review.rating || 0,
          comment: review.comment || "",
          date: review.createdAt,
        }))

        setReviews(formattedReviews)

        if (isLoggedIn) {
          const cartResponse = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (cartResponse.ok) {
            const cartData = await cartResponse.json()
            const cartItems = cartData.items.$values || cartData.items || []
            const cartItem = cartItems.find((item) => item.bookId === Number.parseInt(id))
            setCartQuantity(cartItem ? cartItem.quantity : 0)
          }
        }

        // Fetch related books (mock data for now)
        setRelatedBooks([
          {
            id: 101,
            title: "The Great Adventure",
            author: "Jane Smith",
            imageUrl: "/default-cover.jpg",
            price: 12.99,
            rating: 4.5,
          },
          {
            id: 102,
            title: "Mystery of the Lost Key",
            author: "John Doe",
            imageUrl: "/default-cover.jpg",
            price: 9.99,
            rating: 4.2,
          },
          {
            id: 103,
            title: "The Hidden Truth",
            author: "Alice Johnson",
            imageUrl: "/default-cover.jpg",
            price: 14.99,
            rating: 4.8,
          },
        ])

        setError("")
        setLoading(false)
      } catch (error) {
        console.error("Failed to fetch book or cart:", error)
        setError(error.message || "Could not load book details. Please try again.")
        setLoading(false)
      }
    }

    fetchBookAndCart()
  }, [id, userId, token, isLoggedIn])

  const handleQuantityChange = (change) => {
    setQuantity((prev) => {
      const newQuantity = Math.max(1, prev + change)
      const totalRequested = newQuantity + cartQuantity
      if (book && totalRequested > book.inventoryCount) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limit Reached",
          text: `Only ${book.inventoryCount - cartQuantity} items remain in stock.`,
          background: "#f8f9fa",
          iconColor: "#dc3545",
          confirmButtonColor: "#0d6efd",
        })
        return prev
      }
      return newQuantity
    })
  }

  const now = new Date()
  const isDiscountActive =
    book &&
    book.isOnSale &&
    book.discountStart &&
    book.discountEnd &&
    book.discountStart <= now &&
    book.discountEnd >= now
  const displayPrice = book ? (isDiscountActive ? book.effectivePrice : book.price) : 0
  const totalPrice = book ? (displayPrice * quantity).toFixed(2) : "0.00"

  // Calculate discount percentage
  const discountPercentage =
    book && isDiscountActive ? Math.round(((book.price - book.effectivePrice) / book.price) * 100) : 0

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      localStorage.setItem(
        "pendingAction",
        JSON.stringify({
          action: "add-to-cart",
          bookId: book?.id,
          quantity,
        }),
      )
      setModalMessage("Please login to add to cart.")
      setShowModal(true)
      return
    }

    if (!book || book.inventoryCount === 0) {
      Swal.fire({
        icon: "error",
        title: "Out of Stock",
        text: "This item is currently out of stock.",
        background: "#f8f9fa",
        iconColor: "#dc3545",
        confirmButtonColor: "#0d6efd",
      })
      return
    }

    setIsAddingToCart(true)

    try {
      const cartResponse = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!cartResponse.ok) {
        throw new Error(`Failed to fetch cart: ${cartResponse.status}`)
      }

      const cartData = await cartResponse.json()
      const cartItems = cartData.items.$values || cartData.items || []
      const cartItem = cartItems.find((item) => item.bookId === book.id)
      const currentCartQuantity = cartItem ? cartItem.quantity : 0

      const totalRequested = currentCartQuantity + quantity
      if (totalRequested > book.inventoryCount) {
        Swal.fire({
          icon: "warning",
          title: "Stock Limit Exceeded",
          text: `Only ${book.inventoryCount - currentCartQuantity} items remain in stock.`,
          background: "#f8f9fa",
          iconColor: "#dc3545",
          confirmButtonColor: "#0d6efd",
        })
        setIsAddingToCart(false)
        return
      }

      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
          quantity: quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to add to cart: ${errorData.message || response.status}`)
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Book added to cart successfully!",
        timer: 1500,
        showConfirmButton: false,
        background: "#f8f9fa",
        iconColor: "#198754",
      })
      setCartQuantity((prev) => prev + quantity)
      navigate("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error: ${error.message}`,
        background: "#f8f9fa",
        iconColor: "#dc3545",
        confirmButtonColor: "#0d6efd",
      })
    } finally {
      setIsAddingToCart(false)
    }
  }

  const handleBuyNow = async () => {
    if (!isLoggedIn) {
      localStorage.setItem(
        "pendingAction",
        JSON.stringify({
          action: "buy-now",
          bookId: book?.id,
          quantity,
        }),
      )
      setModalMessage("Please login to buy now.")
      setShowModal(true)
      return
    }

    const totalRequested = quantity + cartQuantity
    if (!book || totalRequested > book.inventoryCount) {
      Swal.fire({
        icon: "warning",
        title: "Stock Limit Exceeded",
        text: `Only ${book.inventoryCount - cartQuantity} items remain in stock.`,
        background: "#f8f9fa",
        iconColor: "#dc3545",
        confirmButtonColor: "#0d6efd",
      })
      return
    }

    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookId: book.id,
          quantity: quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to add to cart: ${errorData.message || response.status}`)
      }

      navigate("/checkout", {
        state: {
          cartItems: [
            {
              bookId: book.id,
              title: book.title,
              price: displayPrice,
              quantity,
              coverUrl: book.imageUrl ? `http://localhost:5001${book.imageUrl}` : "/default-cover.jpg",
            },
          ],
        },
      })
    } catch (error) {
      console.error("Error adding to cart for buy now:", error)
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Error: ${error.message}`,
        background: "#f8f9fa",
        iconColor: "#dc3545",
        confirmButtonColor: "#0d6efd",
      })
    }
  }

  const scrollToReviews = () => {
    setActiveTab("reviews")
    setTimeout(() => {
      reviewsRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading book details...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">!</div>
        <h2 className="error-title">Error Loading Book</h2>
        <p className="error-message">{error}</p>
        <button className="error-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="error-container">
        <div className="error-icon">?</div>
        <h2 className="error-title">Book Not Found</h2>
        <p className="error-message">The requested book could not be found.</p>
        <button className="error-button" onClick={() => navigate("/")}>
          Return to Home
        </button>
      </div>
    )
  }

  return (
    <div className="book-detail-container">
      {isLoggedIn ? <MemberSide /> : <Sidebar />}
      <div className="book-main">
        {isLoggedIn ? <MemberNav /> : <TopMenu />}

        <motion.div
          className="breadcrumb"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <span onClick={() => navigate("/")} className="breadcrumb-item">
            Home
          </span>
          <span className="breadcrumb-separator">/</span>
          <span onClick={() => navigate(`/category/${book.genre}`)} className="breadcrumb-item">
            {book.genre}
          </span>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-item active">{book.title}</span>
        </motion.div>

        <div className="book-content">
          <div className="left-section">
            <div className="book-cover-wrapper">
              <img
                src={book.imageUrl ? `http://localhost:5001${book.imageUrl}` : "/default-cover.jpg"}
                alt={book.title}
                onError={(e) => {
                  e.currentTarget.src = "/default-cover.jpg"
                  e.currentTarget.onerror = null // Prevent infinite loop
                }}
                className="book-cover-large"
              />
              {isDiscountActive && (
                <div className="discount-badge">
                  {Math.round(((book.price - book.effectivePrice) / book.price) * 100)}% OFF
                </div>
              )}
            </div>
          </div>

          <motion.div
            className="right-section"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="book-title">{book.title}</h1>
            <p className="book-author">
              By <span className="author-name">{book.author}</span>
            </p>

            <div className="book-rating" onClick={scrollToReviews}>
              <div className="stars">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i} className={`star ${i < Math.floor(book.rating) ? "filled" : ""}`}>
                      {i < Math.floor(book.rating) ? "★" : "☆"}
                    </span>
                  ))}
                {book.rating % 1 >= 0.5 && <span className="star half-filled">★</span>}
              </div>
              <span className="rating-text">
                {book.rating.toFixed(1)} ({reviews.length} reviews)
              </span>
            </div>

            <div className="price-container">
              {isDiscountActive ? (
                <>
                  <div className="price-wrapper">
                    <span className="original-price">${book.price.toFixed(2)}</span>
                    <span className="discounted-price">${book.effectivePrice.toFixed(2)}</span>
                  </div>
                  <div className="sale-info">
                    <span className="sale-badge">SALE</span>
                    <span className="sale-dates">
                      Sale ends in {Math.ceil((book.discountEnd - now) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </>
              ) : (
                <div className="price-wrapper">
                  <span className="regular-price">${book.price.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="stock-status">
              {book.inventoryCount === 0 ? (
                <div className="stock-out">
                  <span className="stock-icon">✕</span>
                  <span className="stock-text">Out of Stock</span>
                </div>
              ) : (
                <div className="stock-in">
                  <span className="stock-icon">✓</span>
                  <span className="stock-text">
                    In Stock: <span className="stock-count">{book.inventoryCount}</span> available
                  </span>
                </div>
              )}
            </div>

            {book.inventoryCount > 0 && (
              <div className="quantity-section">
                <label className="quantity-label">Quantity:</label>
                <div className="quantity-controls">
                  <motion.button
                    className="quantity-btn minus"
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || book.inventoryCount === 0}
                    whileTap={{ scale: 0.9 }}
                  >
                    -
                  </motion.button>
                  <input type="number" value={quantity} readOnly className="quantity-input" />
                  <motion.button
                    className="quantity-btn plus"
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity + cartQuantity >= book.inventoryCount || book.inventoryCount === 0}
                    whileTap={{ scale: 0.9 }}
                  >
                    +
                  </motion.button>
                </div>
              </div>
            )}

            <div className="total-price">
              <span className="total-label">Total:</span>
              <span className="price-value">${totalPrice}</span>
            </div>

            <div className="book-actions">
              {isLoggedIn ? (
                <>
                  <motion.button
                    className="add-to-cart-btn"
                    onClick={handleAddToCart}
                    disabled={book.inventoryCount === 0 || isAddingToCart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="btn-icon loading"></span>
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <span className="btn-icon cart"></span>
                        <span>Add to Cart</span>
                      </>
                    )}
                  </motion.button>
                  <motion.button
                    className="buy-now-btn"
                    onClick={handleBuyNow}
                    disabled={book.inventoryCount === 0}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="btn-icon buy"></span>
                    <span>Buy Now</span>
                  </motion.button>
                </>
              ) : (
                <motion.div
                  className="login-message"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <p>
                    Please{" "}
                    <span onClick={() => navigate("/login")} className="login-link">
                      log in
                    </span>{" "}
                    to add items to your cart or buy now.
                  </p>
                </motion.div>
              )}
            </div>

            <div className="additional-info">
              <div className="info-item">
                <span className="info-icon returns"></span>
                <div className="info-text">
                  <span className="info-title">Easy Returns</span>
                  <span className="info-desc">30 day return policy</span>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon secure"></span>
                <div className="info-text">
                  <span className="info-title">Secure Checkout</span>
                  <span className="info-desc">SSL Encrypted</span>
                </div>
              </div>
            </div>

            <div className="wishlist-compare">
              <button className="wishlist-btn">
                <span className="btn-icon heart"></span>
                <span>Add to Wishlist</span>
              </button>
              <button className="compare-btn">
                <span className="btn-icon compare"></span>
                <span>Compare</span>
              </button>
            </div>
          </motion.div>
        </div>

        <div className="book-tabs">
          <div className="tabs-header">
            <button
              className={`tab-btn ${activeTab === "description" ? "active" : ""}`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`tab-btn ${activeTab === "details" ? "active" : ""}`}
              onClick={() => setActiveTab("details")}
            >
              Details
            </button>
            <button
              className={`tab-btn ${activeTab === "reviews" ? "active" : ""}`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews ({reviews.length})
            </button>
          </div>

          <div className="tabs-content">
            <AnimatePresence mode="wait">
              {activeTab === "description" && (
                <motion.div
                  key="description"
                  className="tab-content description-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="book-description">{book.description || "No description provided."}</p>
                </motion.div>
              )}

              {activeTab === "details" && (
                <motion.div
                  key="details"
                  className="tab-content details-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <table className="details-table">
                    <tbody>
                      <tr>
                        <th>Title</th>
                        <td>{book.title}</td>
                      </tr>
                      <tr>
                        <th>Author</th>
                        <td>{book.author}</td>
                      </tr>
                      <tr>
                        <th>ISBN</th>
                        <td>{book.isbn}</td>
                      </tr>
                      <tr>
                        <th>Publication Date</th>
                        <td>{book.publishedDate.toLocaleDateString()}</td>
                      </tr>
                      <tr>
                        <th>Pages</th>
                        <td>{book.pages}</td>
                      </tr>
                      <tr>
                        <th>Genre</th>
                        <td>{book.genre}</td>
                      </tr>
                      <tr>
                        <th>Language</th>
                        <td>English</td>
                      </tr>
                      <tr>
                        <th>Format</th>
                        <td>Hardcover</td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === "reviews" && (
                <motion.div
                  key="reviews"
                  className="tab-content reviews-content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  ref={reviewsRef}
                >
                  <div className="reviews-summary">
                    <div className="rating-summary">
                      <div className="average-rating">
                        <span className="big-rating">{book.rating.toFixed(1)}</span>
                        <div className="rating-stars">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <span key={i} className={`star ${i < Math.floor(book.rating) ? "filled" : ""}`}>
                                {i < Math.floor(book.rating) ? "★" : "☆"}
                              </span>
                            ))}
                        </div>
                        <span className="total-reviews">Based on {reviews.length} reviews</span>
                      </div>

                      <div className="rating-bars">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter((r) => Math.floor(r.rating) === stars).length
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0

                          return (
                            <div key={stars} className="rating-bar-item">
                              <span className="stars-label">{stars} stars</span>
                              <div className="rating-bar-container">
                                <div className="rating-bar" style={{ width: `${percentage}%` }}></div>
                              </div>
                              <span className="rating-count">{count}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {reviews.length === 0 ? (
                    <div className="no-reviews">
                      <p>No reviews yet for this book.</p>
                    </div>
                  ) : (
                    <div className="reviews-list">
                      {reviews.map((review, index) => (
                        <motion.div
                          key={review.id}
                          className="review-item"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <div className="review-header">
                            <div className="reviewer-info">
                              <div className="reviewer-avatar">{review.reviewerName.charAt(0).toUpperCase()}</div>
                              <div className="reviewer-details">
                                <span className="reviewer-name">{review.reviewerName}</span>
                                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="review-rating">
                              {Array(5)
                                .fill(0)
                                .map((_, i) => (
                                  <span key={i} className={`star ${i < review.rating ? "filled" : ""}`}>
                                    {i < review.rating ? "★" : "☆"}
                                  </span>
                                ))}
                            </div>
                          </div>
                          <p className="review-comment">{review.comment || "No comment provided."}</p>
                          <div className="review-actions">
                            <button className="review-action-btn helpful">
                              <span className="action-icon thumbs-up"></span>
                              <span>Helpful</span>
                            </button>
                            <button className="review-action-btn report">
                              <span className="action-icon flag"></span>
                              <span>Report</span>
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <motion.div
          className="related-books-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <h2 className="section-title">You May Also Like</h2>
          <div className="related-books">
            {relatedBooks.map((relatedBook, index) => (
              <motion.div
                key={relatedBook.id}
                className="related-book-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.15)",
                }}
                onClick={() => navigate(`/book/${relatedBook.id}`)}
              >
                <div className="related-book-cover">
                  <img
                    src={relatedBook.imageUrl || "/placeholder.svg"}
                    alt={relatedBook.title}
                    onError={(e) => (e.target.src = "/default-cover.jpg")}
                  />
                </div>
                <div className="related-book-info">
                  <h3 className="related-book-title">{relatedBook.title}</h3>
                  <p className="related-book-author">{relatedBook.author}</p>
                  <div className="related-book-rating">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className={`star ${i < Math.floor(relatedBook.rating) ? "filled" : ""}`}>
                          {i < Math.floor(relatedBook.rating) ? "★" : "☆"}
                        </span>
                      ))}
                  </div>
                  <p className="related-book-price">${relatedBook.price.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div
            className="image-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div
              className="image-modal-content"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.5 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button className="modal-close-btn" onClick={() => setShowImageModal(false)}>
                ×
              </button>
              <img
                src={book.imageUrl ? `http://localhost:5001${book.imageUrl}` : "/default-cover.jpg"}
                alt={book.title}
                onError={(e) => (e.target.src = "/default-cover.jpg")}
                className="modal-image"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              className="login-modal"
              initial={{ scale: 0.5, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.5, y: 100 }}
            >
              <h3 className="modal-title">{modalMessage}</h3>
              <div className="modal-buttons">
                <motion.button
                  className="login-btn"
                  onClick={() => navigate("/login")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log In
                </motion.button>
                <motion.button
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default BookDetail
