import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import MemberSide from "../../Components/Navigation/MemberSide"
import NavBar from "../../Components/Navigation/MemberNav"
import { Star, MessageSquare } from 'lucide-react'
import "../../styles/Review.css"

export default function Review() {
  const [books, setBooks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const apiUrl = "http://localhost:5001"

  useEffect(() => {
    const fetchReviewableBooks = async () => {
      if (!userId) {
        setError("Please log in to view reviewable books.")
        setLoading(false)
        navigate("/login")
        return
      }

      console.log(`Using userId: ${userId}`)
      const url = `${apiUrl}/api/users/${userId}/reviews/reviewable-books`
      try {
        console.log(`Fetching reviewable books from: ${url}`)
        const response = await fetch(url, {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.message || `HTTP error: ${response.status}`)
        }
        const data = await response.json()
        console.log("Raw API response:", data)
        const bookArray = data.$values || (Array.isArray(data) ? data : [])
        console.log("Processed book array:", bookArray)
        if (!Array.isArray(bookArray)) {
          console.warn("API response is not an array:", bookArray)
          setBooks([])
        } else {
          const mappedBooks = bookArray.map((book) => ({
            id: book.bookId || book.id,
            title: book.title || "Unknown",
            author: book.author || "Unknown",
            coverUrl: book.imageUrl ? `${apiUrl}${book.imageUrl}` : "/default-cover.jpg",
            price: book.price || 0,
            effectivePrice: book.effectivePrice || book.price || 0,
            isOnSale: book.isOnSale || false,
            discountStart: book.discountStart ? new Date(book.discountStart) : null,
            discountEnd: book.discountEnd ? new Date(book.discountEnd) : null,
            genre: book.genre || "Unknown",
            inventoryCount: book.inventoryCount || 0,
            rating: book.rating || 0,
          }))
          console.log("Mapped books:", mappedBooks)
          setBooks(mappedBooks)
        }
        setLoading(false)
      } catch (err) {
        console.error("API fetch error:", err)
        setError(`Failed to fetch reviewable books from ${url}: ${err.message}`)
        setBooks([])
        setLoading(false)
      }
    }

    fetchReviewableBooks()
  }, [userId, navigate, token, apiUrl])

  const handleLeaveReview = (book) => {
    navigate("/comment", { state: { book } })
  }

  if (loading)
    return (
      <div className="cart-container">
        <MemberSide />
        <main className="cart-main">
          <NavBar />
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading reviewable archives...</p>
          </div>
        </main>
      </div>
    )

  if (error)
    return (
      <div className="cart-container">
        <MemberSide />
        <main className="cart-main">
          <NavBar />
          <div className="error-message">Error: {error}</div>
        </main>
      </div>
    )

  const now = new Date()

  return (
    <div className="cart-container">
      <MemberSide />
      <main className="cart-main">
        <NavBar />
        <div className="review-container">
          <div className="review-header">
            <h1 className="review-title">Reviewable Archives</h1>
          </div>

          {books.length === 0 ? (
            <div className="empty-reviews">
              <MessageSquare size={48} className="empty-icon" />
              <p>No archives available to review. Complete a deployment to review archives.</p>
            </div>
          ) : (
            <div className="review-grid">
              {books.map((book, idx) => (
                <div className="review-card" key={book.id || idx}>
                  <div className="book-image-container">
                    <img
                      src={book.coverUrl || "/placeholder.svg"}
                      alt={book.title}
                      className="book-image"
                      onError={(e) => {
                        e.target.src = "/default-cover.jpg"
                      }}
                    />
                  </div>
                  <div className="book-content">
                    <h3 className="book-title">{book.title}</h3>
                    <p className="book-author">{book.author}</p>

                    {book.isOnSale &&
                    book.discountStart &&
                    book.discountEnd &&
                    book.discountStart <= now &&
                    book.discountEnd >= now ? (
                      <div className="book-price">
                        <span className="original-price">${book.price.toFixed(2)}</span>
                        <span className="discounted-price">${book.effectivePrice.toFixed(2)}</span>
                      </div>
                    ) : (
                      <div className="book-price">${book.price.toFixed(2)}</div>
                    )}

                    <div className="star-rating">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <span key={i} className={`star ${i < book.rating ? "filled" : ""}`}>
                            {i < book.rating ? "★" : "☆"}
                          </span>
                        ))}
                    </div>

                    <button className="review-button" onClick={() => handleLeaveReview(book)}>
                      <Star size={16} className="review-icon" />
                      Leave a Review
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

