import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import MemberSide from "../../Components/Navigation/MemberSide"
import NavBar from "../../Components/Navigation/MemberNav"
import "../../styles/Comment.css"

export default function Comment() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const book = state?.book || {}
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const apiUrl = "http://localhost:5001"

  const MAX_COMMENT_LENGTH = 500

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0)
  }, [])

  const handleStarClick = (selectedRating) => {
    setRating(selectedRating)
  }

  const handleStarHover = (hoveredRating) => {
    setHoverRating(hoveredRating)
  }

  const handleStarLeave = () => {
    setHoverRating(0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!userId) {
      setError("Please log in to submit a review.")
      navigate("/login")
      return
    }
    if (rating < 1 || rating > 5) {
      setError("Please select a rating between 1 and 5 stars.")
      return
    }
    if (!comment.trim()) {
      setError("Please enter a review comment.")
      return
    }

    setIsSubmitting(true)
    const url = `${apiUrl}/api/users/${userId}/reviews`
    try {
      console.log(`Submitting review to: ${url}`)
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          BookId: book.id,
          Rating: rating,
          Comment: comment,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || `HTTP error: ${response.status}`)
      }

      setSuccess(true)
      setError(null)
      setTimeout(() => navigate("/review"), 2000)
    } catch (err) {
      console.error(`API error: ${err.message}`)
      setError(`Failed to submit review: ${err.message}`)
      setSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStarLabel = (rating) => {
    const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"]
    return labels[rating] || ""
  }

  return (
    <div className="cart-container">
      <MemberSide />
      <main className="cart-main">
        <NavBar />
        <div className="comment-section">
          <h2 className="comment-title">Share Your Thoughts</h2>
          <div className="comment-card">
            <div className="comment-book-info">
              <div className="comment-book-cover">
                <img
                  src={book.coverUrl || "/placeholder.svg"}
                  alt={book.title}
                  className="comment-book-image"
                  onError={(e) => {
                    e.target.src = "/default-cover.jpg"
                  }}
                />
              </div>
              <div className="comment-book-details">
                <h3 className="comment-book-title">{book.title || "Unknown"}</h3>
                <p className="comment-book-author">By {book.author || "Unknown"}</p>
                <p className="comment-book-price">${(book.price || 0).toFixed(2)}</p>
                <div className="comment-book-genre">{book.genre || "Unknown"}</div>
              </div>
            </div>

            <div className="comment-form">
              <div className="rating-container">
                <h4 className="rating-title">Your Rating</h4>
                <div className="star-rating-container">
                  <div className="star-rating" onMouseLeave={handleStarLeave}>
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span
                          key={i}
                          className={`star ${i < (hoverRating || rating) ? "filled" : ""} ${i < rating ? "selected" : ""}`}
                          onClick={() => handleStarClick(i + 1)}
                          onMouseEnter={() => handleStarHover(i + 1)}
                        >
                          {i < (hoverRating || rating) ? "★" : "☆"}
                        </span>
                      ))}
                  </div>
                  {(hoverRating || rating) > 0 && (
                    <span className="rating-label">{getStarLabel(hoverRating || rating)}</span>
                  )}
                </div>
              </div>

              <div className="comment-textarea-container">
                <h4 className="comment-textarea-title">Your Review</h4>
                <textarea
                  className="comment-textarea"
                  placeholder="Share your experience with this book. What did you like or dislike? Would you recommend it to others?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
                  maxLength={MAX_COMMENT_LENGTH}
                ></textarea>
                <div className="comment-textarea-footer">
                  <span className="character-count">
                    {comment.length}/{MAX_COMMENT_LENGTH}
                  </span>
                </div>
              </div>

              {error && (
                <div className="comment-message error">
                  <span className="comment-message-icon">!</span>
                  <span className="comment-message-text">{error}</span>
                </div>
              )}

              {success && (
                <div className="comment-message success">
                  <span className="comment-message-icon">✓</span>
                  <span className="comment-message-text">Review submitted successfully! Redirecting...</span>
                </div>
              )}

              <button
                className={`comment-submit-button ${isSubmitting ? "submitting" : ""}`}
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    <span>Submitting...</span>
                  </>
                ) : (
                  "Submit Review"
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
