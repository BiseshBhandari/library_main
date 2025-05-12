import { useEffect, useState } from "react"
import { FaBookmark as Bookmarked, FaRegBookmark as Unbookmarked, FaShoppingCart, FaShieldAlt } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import Swal from "sweetalert2"
import Sidebar from "../../Components/Navigation/Sidebar"
import "../../styles/Landing.css"

const LandingPage = () => {
  const [books, setBooks] = useState([])
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("")
  const [inStockOnly, setInStockOnly] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [genres, setGenres] = useState(["All Books"])
  const [error, setError] = useState("")
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [announcements, setAnnouncements] = useState([])
  const itemsPerPage = 5
  const navigate = useNavigate()
  const userId = localStorage.getItem("userId")
  const token = localStorage.getItem("token")

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const url = userId
          ? `http://localhost:5001/api/Admin/Book/getAllBooks?userId=${userId}`
          : "http://localhost:5001/api/Admin/Book/getAllBooks"
        const response = await fetch(url, {
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        })
        if (!response.ok) throw new Error(`Failed to fetch books: ${response.status}`)
        const data = await response.json()
        const bookArray = data.$values || data
        if (!Array.isArray(bookArray)) {
          throw new Error("Expected an array of books")
        }
        const mappedBooks = bookArray.map((book) => {
          const rating = Math.round(Number(book.rating) || 0)
          const normalizedRating = Math.max(0, Math.min(5, rating))
          return {
            id: book.id,
            title: book.title || "Untitled",
            author: book.author || "Unknown Author",
            coverUrl: book.imageUrl ? `http://localhost:5001${book.imageUrl}` : "/default-cover.jpg",
            price: book.price || 0,
            effectivePrice: book.effectivePrice || book.price || 0,
            isOnSale: book.isOnSale || false,
            discountStart: book.discountStart ? new Date(book.discountStart) : null,
            discountEnd: book.discountEnd ? new Date(book.discountEnd) : null,
            genre: book.genre || "Unknown",
            inventoryCount: book.inventoryCount || 0,
            rating: normalizedRating,
          }
        })
        setBooks(mappedBooks)
        const uniqueGenres = [...new Set(mappedBooks.map((book) => book.genre))]
        setGenres(["All Books", ...uniqueGenres])
      } catch (error) {
        console.error("Error fetching books:", error)
        setBooks([])
      }
    }

    const fetchBookmarkedBooks = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (response.status === 404) {
          console.log("User not found or no bookmarks available")
          setBookmarkedIds(new Set())
          return
        }
        if (!response.ok) throw new Error(`Failed to fetch bookmarks: ${response.status}`)
        const data = await response.json()
        const bookmarkArray = data.$values || data
        if (!Array.isArray(bookmarkArray)) {
          console.warn("Bookmark data is not an array, setting empty bookmarks")
          setBookmarkedIds(new Set())
          return
        }
        const ids = new Set(bookmarkArray.map((item) => item.bookId))
        setBookmarkedIds(ids)
      } catch (error) {
        console.error("Error fetching bookmarked books:", error)
        setBookmarkedIds(new Set())
      }
    }

    const fetchAnnouncements = async () => {
      try {
        const response = await fetch("http://localhost:5001/api/announcements/get")
        if (!response.ok) throw new Error(`Failed to fetch announcements: ${response.status}`)
        const data = await response.json()
        const announcementArray = data.$values || data
        if (!Array.isArray(announcementArray)) {
          console.warn("Announcement data is not an array, setting empty announcements")
          setAnnouncements([])
          return
        }
        setAnnouncements(announcementArray)
      } catch (error) {
        console.error("Error fetching announcements:", error)
        setAnnouncements([])
      }
    }

    const executePendingAction = async () => {
      const pendingAction = localStorage.getItem("pendingAction")
      if (pendingAction && userId && token) {
        const action = JSON.parse(pendingAction)
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        }

        try {
          if (action.action === "add-to-cart") {
            const book = books.find((b) => b.id === action.bookId)
            if (book && book.inventoryCount === 0) {
              Swal.fire({
                icon: "error",
                title: "Out of Stock",
                text: "This item is currently out of stock.",
              })
              localStorage.removeItem("pendingAction")
              return
            }
            const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                bookId: action.bookId,
                quantity: action.quantity || 1,
              }),
            })

            if (!response.ok) {
              throw new Error(`Failed to add to cart: ${response.status}`)
            }
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Archive added to cart successfully!",
              timer: 1500,
              showConfirmButton: false,
            })
            navigate("/cart")
          } else if (action.action === "bookmark") {
            setBookmarkedIds((prev) => new Set(prev).add(action.bookId))
            const requestBody = { userId, bookId: action.bookId }
            const response = await fetch("http://localhost:5001/api/Whitelist/add", {
              method: "POST",
              headers,
              body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
              setBookmarkedIds((prev) => {
                const newSet = new Set(prev)
                newSet.delete(action.bookId)
                return newSet
              })
              throw new Error(`Failed to add bookmark: ${response.status}`)
            }
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Saved to archives successfully!",
              timer: 1500,
              showConfirmButton: false,
            })
            navigate("/bookmark")
          }
          localStorage.removeItem("pendingAction")
        } catch (error) {
          console.error("Error executing pending action:", error.message)
          setError(`Failed to execute pending action. Please try again.`)
        }
      }
    }

    fetchBooks()
    fetchAnnouncements()
    if (userId && token) {
      fetchBookmarkedBooks()
      executePendingAction()
    } else {
      setBookmarkedIds(new Set())
    }
  }, [userId, token, navigate])

  const handleToggle = async (bookId) => {
    if (!userId || !token) {
      localStorage.setItem("pendingAction", JSON.stringify({ action: "bookmark", bookId }))
      setShowLoginModal(true)
      return
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    try {
      if (bookmarkedIds.has(bookId)) {
        setBookmarkedIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(bookId)
          return newSet
        })

        const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}/book/${bookId}`, {
          method: "DELETE",
          headers,
        })

        if (response.status === 404) {
          console.log("Bookmark not found on server, already removed")
        } else if (!response.ok) {
          setBookmarkedIds((prev) => new Set(prev).add(bookId))
          throw new Error(`Failed to remove bookmark: ${response.status}`)
        } else {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Removed from saved archives!",
            timer: 1500,
            showConfirmButton: false,
          })
        }
      } else {
        setBookmarkedIds((prev) => new Set(prev).add(bookId))

        const requestBody = { userId, bookId }
        const response = await fetch("http://localhost:5001/api/Whitelist/add", {
          method: "POST",
          headers,
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          setBookmarkedIds((prev) => {
            const newSet = new Set(prev)
            newSet.delete(bookId)
            return newSet
          })
          throw new Error(`Failed to add bookmark: ${response.status}`)
        } else {
          Swal.fire({
            icon: "success",
            title: "Success",
            text: "Saved to archives successfully!",
            timer: 1500,
            showConfirmButton: false,
          })
        }
      }
    } catch (error) {
      console.error("Error in handleToggle:", error.message)
      setError(`Failed to ${bookmarkedIds.has(bookId) ? "remove" : "add"} bookmark. Please try again.`)
    }
  }

  const handleAddToCart = async (bookId) => {
    if (!userId || !token) {
      localStorage.setItem("pendingAction", JSON.stringify({ action: "add-to-cart", bookId, quantity: 1 }))
      setShowLoginModal(true)
      return
    }

    const book = books.find((b) => b.id === bookId)
    if (!book || book.inventoryCount === 0) {
      Swal.fire({
        icon: "error",
        title: "Out of Stock",
        text: "This item is currently out of stock.",
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
          bookId,
          quantity: 1,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`)
      }

      Swal.fire({
        icon: "success",
        title: "Success",
        text: "Archive added to cart successfully!",
        timer: 1500,
        showConfirmButton: false,
      })
      navigate("/cart")
    } catch (error) {
      console.error("Error adding to cart:", error.message)
      setError("Failed to add archive to cart. Please try again.")
    }
  }

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`)
  }

  const filteredBooks = books
    .filter((book) => book.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter((book) => (inStockOnly ? book.inventoryCount > 0 : true))
    .filter((book) => {
      if (selectedCategory && selectedCategory !== "All Books") {
        return book.genre === selectedCategory
      }
      return true
    })
    .sort((a, b) => {
      if (sortOption === "title-asc") return a.title.localeCompare(b.title)
      if (sortOption === "title-desc") return b.title.localeCompare(a.title)
      if (sortOption === "price-asc") return a.price - b.price
      if (sortOption === "price-desc") return b.price - a.price
      return 0
    })

  const indexOfLastBook = currentPage * itemsPerPage
  const indexOfFirstBook = indexOfLastBook - itemsPerPage
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)

  const getPageNumbers = () => {
    const maxPagesToShow = 5
    const pageNumbers = []
    const halfRange = Math.floor(maxPagesToShow / 2)

    let startPage = Math.max(1, currentPage - halfRange)
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i)
    }

    if (startPage > 1) {
      pageNumbers.unshift("...")
      pageNumbers.unshift(1)
    }
    if (endPage < totalPages) {
      pageNumbers.push("...")
      pageNumbers.push(totalPages)
    }

    return pageNumbers
  }

  const now = new Date()

  return (
    <div className="member_landing_container">
      <Sidebar />

      <main className="member_landing_main">
        {announcements.length > 0 && (
          <div className="member_landing_announcement_bar">
            {announcements.map((announcement) => (
              <div key={announcement.id} className="member_landing_announcement">
                <span className="announcement_icon">⚡</span>
                <span>{announcement.message}</span>
                <span className="announcement_icon">⚡</span>
              </div>
            ))}
          </div>
        )}

        <div className="member_landing_top_nav">
          <div className="member_landing_actions">

            <button className="member_landing_action_button" onClick={() => navigate("/register")}>
              Register
            </button>
            <button className="member_landing_action_button" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </div>

        <div className="member_landing_filters">
          <div className="member_landing_filter_group">
            <input
              type="text"
              placeholder="Search archives..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="member_landing_search_input"
            />
            <select
              className="member_landing_sort_dropdown"
              value={sortOption}
              onChange={(e) => {
                setSortOption(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">Sort By</option>
              <option value="title-asc">Title A–Z</option>
              <option value="title-desc">Title Z–A</option>
              <option value="price-asc">Price Low–High</option>
              <option value="price-desc">Price High–Low</option>
            </select>
            <label className="member_landing_filter rålabel">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={() => {
                  setInStockOnly(!inStockOnly)
                  setCurrentPage(1)
                }}
              />
              In Stock Only
            </label>
          </div>
          <div className="member_landing_category_filters">
            <button
              className={`member_landing_filter_btn ${selectedCategory === "All Books" ? "active" : ""}`}
              onClick={() => {
                setSelectedCategory("All Books")
                setCurrentPage(1)
              }}
            >
              All Archives
            </button>
            <div className="member_landing_tabs">
              {genres.map((genre, idx) => (
                <button
                  key={idx}
                  className={`member_landing_tab_button ${selectedCategory === genre ? "active" : ""}`}
                  onClick={() => {
                    setSelectedCategory(genre)
                    setCurrentPage(1)
                  }}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <div className="member_landing_error_message">{error}</div>}

        <section className="member_landing_section">
          <h2 className="member_landing_section_title">
            {selectedCategory === "All Books" ? "All Archives" : selectedCategory}
          </h2>
          <p className="member_landing_section_subtitle">
            Explore archives from the{" "}
            {selectedCategory === "All Books" ? "All Archives" : selectedCategory} category
          </p>
          <div className="member_landing_book_grid">
            {currentBooks.length === 0 ? (
              <p className="member_landing_empty_message">No archives found.</p>
            ) : (
              currentBooks.map((book) => (
                <div key={book.id} className="member_landing_book_card">
                  <div className="book-cover-container">
                    <img
                      src={book.coverUrl || "/placeholder.svg"}
                      alt={book.title}
                      className="member_landing_book_image"
                      onError={(e) => (e.target.src = "/default-cover.jpg")}
                      onClick={() => handleBookClick(book.id)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>
                  <h3
                    className="member_landing_book_title"
                    onClick={() => handleBookClick(book.id)}
                    style={{ cursor: "pointer" }}
                  >
                    {book.title}
                  </h3>
                  <p className="member_landing_book_author">{book.author}</p>
                  {book.isOnSale &&
                    book.discountStart &&
                    book.discountEnd &&
                    book.discountStart <= now &&
                    book.discountEnd >= now ? (
                    <p className="member_landing_book_price">
                      <span className="original-price">${book.price.toFixed(2)}</span>
                      <span className="discounted-price">${book.effectivePrice.toFixed(2)}</span>
                    </p>
                  ) : (
                    <p className="member_landing_book_price">${book.price.toFixed(2)}</p>
                  )}
                  <div className="book-rating">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <span key={i} className={`star ${i < book.rating ? "filled" : ""}`}>
                          {i < book.rating ? "★" : "☆"}
                        </span>
                      ))}
                  </div>
                  <div className="member_landing_book_actions">
                    {bookmarkedIds.has(book.id) ? (
                      <Bookmarked
                        className="member_landing_icon member_landing_icon_bookmarked"
                        onClick={() => handleToggle(book.id)}
                      />
                    ) : (
                      <Unbookmarked
                        className="member_landing_icon member_landing_icon_unbookmarked"
                        onClick={() => handleToggle(book.id)}
                      />
                    )}
                    <FaShoppingCart
                      className="member_landing_icon member_landing_icon_cart"
                      onClick={() => handleAddToCart(book.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
          {totalPages > 1 && (
            <div className="member_landing_pagination">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="member_landing_pagination_btn"
              >
                Previous
              </button>
              {getPageNumbers().map((page, index) => (
                <button
                  key={index}
                  onClick={() => typeof page === "number" && setCurrentPage(page)}
                  className={`member_landing_pagination_btn ${page === currentPage ? "active" : ""} ${typeof page !== "number" ? "ellipsis" : ""
                    }`}
                  disabled={typeof page !== "number"}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="member_landing_pagination_btn"
              >
                Next
              </button>
            </div>
          )}
        </section>

        {showLoginModal && (
          <div className="member_landing_modal_backdrop" onClick={() => setShowLoginModal(false)}>
            <div className="member_landing_modal_content" onClick={(e) => e.stopPropagation()}>
              <h3>Access Required</h3>
              <p>You need to access your powers to save archives or add them to your collection.</p>
              <button onClick={() => navigate("/login")} className="member_landing_modal_btn">
                Access Powers
              </button>
              <button onClick={() => setShowLoginModal(false)} className="member_landing_modal_btn cancel">
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default LandingPage

