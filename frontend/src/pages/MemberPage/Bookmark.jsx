import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { FaBookmark } from "react-icons/fa"
import { BookOpen, Shield, X } from 'lucide-react'
import MemberSide from "../../Components/Navigation/MemberSide"
import NavBar from "../../Components/Navigation/MemberNav"
import "../../styles/BookmarkPage.css"

function Bookmark() {
  const [favBooks, setFavBooks] = useState([])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBookmarkedBooks = async () => {
      if (!userId || !token) {
        setError("Please log in to view bookmarks.")
        setIsLoading(false)
        navigate("/login")
        return
      }

      try {
        const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.status === 401 || response.status === 403) {
          setError("Session expired. Please log in again.")
          localStorage.removeItem("token")
          localStorage.removeItem("userId")
          localStorage.removeItem("user")
          localStorage.removeItem("username")
          localStorage.removeItem("pendingAction")
          navigate("/login")
          return
        }

        if (response.status === 404) {
          setFavBooks([])
          setIsLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch bookmarks: ${response.status}`)
        }

        const data = await response.json()
        const bookmarkArray = data.$values || data
        if (!Array.isArray(bookmarkArray)) {
          console.warn("Bookmark data is not an array, setting empty bookmarks")
          setFavBooks([])
          setIsLoading(false)
          return
        }

        const bookmarkedBooks = bookmarkArray.map((item) => ({
          id: item.bookId,
          title: item.bookTitle,
          author: item.bookAuthor,
          imageUrl: item.bookImageUrl,
        }))
        setFavBooks(bookmarkedBooks)
        setError("")
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching bookmarked books:", error)
        setError("Failed to load bookmarks. Please try again.")
        setFavBooks([])
        setIsLoading(false)
      }
    }

    fetchBookmarkedBooks()
  }, [userId, token, location.pathname, navigate])

  const handleRemove = async (bookId) => {
    if (!userId || !token) {
      alert("Please log in to remove bookmarks.")
      navigate("/login")
      return
    }

    try {
      const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}/book/${bookId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 204) {
        setFavBooks((prev) => prev.filter((book) => book.id !== bookId))
        console.log("Bookmark removed successfully")
      } else if (response.status === 404) {
        console.log("Bookmark not found on server, syncing local state")
        setFavBooks((prev) => prev.filter((book) => book.id !== bookId))
      } else {
        throw new Error(`Failed to remove bookmark: ${response.status}`)
      }
    } catch (error) {
      console.error("Error removing bookmark:", error.message)
      alert("Failed to remove bookmark. Please try again.")
    }
  }

  const handleViewBook = (bookId) => {
    navigate(`/book/${bookId}`)
  }

  return (
    <div className="bookmark-container">
      <MemberSide />
      <main className="bookmark-main">
        <NavBar />

        <div className="bookmark-header">
          <h1 className="bookmark-title">
            <Shield className="bookmark-title-icon" />
            Saved Archives
          </h1>
        </div>

        {error && <div className="bookmark-error">{error}</div>}

        {isLoading ? (
          <div className="bookmark-loading">
            <div className="bookmark-spinner"></div>
            <p>Loading your saved archives...</p>
          </div>
        ) : favBooks.length === 0 && !error ? (
          <div className="bookmark-empty">
            <BookOpen size={48} className="bookmark-empty-icon" />
            <h3>No Saved Archives</h3>
            <p>Books you save will appear here for quick access.</p>
          </div>
        ) : (
          <div className="bookmark-grid">
            {favBooks.map((book) => (
              <div key={book.id} className="bookmark-card">
                <div className="bookmark-image-container">
                  <img
                    src={book.imageUrl ? `http://localhost:5001${book.imageUrl}` : "/default-cover.jpg"}
                    alt={book.title || "Untitled"}
                    className="bookmark-image"
                    onClick={() => handleViewBook(book.id)}
                  />
                  <button
                    onClick={() => handleRemove(book.id)}
                    className="bookmark-remove-btn"
                    aria-label="Remove bookmark"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="bookmark-info">
                  <h3 className="bookmark-book-title" onClick={() => handleViewBook(book.id)}>
                    {book.title || "Untitled"}
                  </h3>
                  <p className="bookmark-book-author">by {book.author || "Unknown Author"}</p>
                  <div className="bookmark-actions">
                    <button className="bookmark-view-btn" onClick={() => handleViewBook(book.id)}>
                      View Details
                    </button>
                    <button className="bookmark-remove-text-btn" onClick={() => handleRemove(book.id)}>
                      <FaBookmark className="bookmark-icon" /> Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default Bookmark

