import { useEffect, useState } from "react"
import { FaBookmark as Bookmarked, FaRegBookmark as Unbookmarked, FaShoppingCart } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import NavBar from "../../Components/Navigation/MemberNav"

import Swal from "sweetalert2"
import { BookIcon, ShieldIcon, Zap, Search, Filter, ChevronLeft, ChevronRight, Star } from 'lucide-react'
import "../../styles/MemberLanding.css"
import MemberSide from "../../Components/Navigation/MemberSide"

export default function MemberLanding() {
    const [books, setBooks] = useState([])
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set())
    const [searchQuery, setSearchQuery] = useState("")
    const [sortOption, setSortOption] = useState("")
    const [inStockOnly, setInStockOnly] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState("")
    const [genres, setGenres] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [announcements, setAnnouncements] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeIndex, setActiveIndex] = useState(0)
    const itemsPerPage = 8
    const userId = localStorage.getItem("userId")
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const [closedAnnouncements, setClosedAnnouncements] = useState(new Set())

    useEffect(() => {
        const fetchBooks = async () => {
            setIsLoading(true)
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
                const mappedBooks = bookArray.map((book) => ({
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
                    rating: book.rating || 0,
                }))
                setBooks(mappedBooks)
                const uniqueGenres = [...new Set(mappedBooks.map((book) => book.genre))]
                setGenres(uniqueGenres)
            } catch (error) {
                console.error("Error fetching books:", error)
                setBooks([])
            } finally {
                setIsLoading(false)
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

        fetchBooks()
        fetchAnnouncements()
        if (userId && token) {
            fetchBookmarkedBooks()
        } else {
            console.log("No userId or token found, skipping bookmark fetch")
            setBookmarkedIds(new Set())
        }
    }, [userId, navigate, token])

    useEffect(() => {
        if (announcements.length > 0) {
            const interval = setInterval(() => {
                setActiveIndex((current) => (current + 1) % announcements.length)
            }, 5000)
            return () => clearInterval(interval)
        }
    }, [announcements])

    const handleToggle = async (bookId) => {
        if (!userId || !token) {
            Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please log in to bookmark books.",
                background: "#F4F4F9",
                confirmButtonColor: "#0050A0",
            })
            navigate("/login")
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
                        text: "Bookmark removed successfully!",
                        timer: 1500,
                        showConfirmButton: false,
                        background: "#F4F4F9",
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
                        text: "Bookmarked successfully!",
                        timer: 1500,
                        showConfirmButton: false,
                        background: "#F4F4F9",
                    })
                }
            }
        } catch (error) {
            console.error("Error in handleToggle:", error.message)
            Swal.fire({
                icon: "error",
                title: "Error",
                text: `Failed to ${bookmarkedIds.has(bookId) ? "remove" : "add"} bookmark. Please try again.`,
                background: "#F4F4F9",
                confirmButtonColor: "#0050A0",
            })
        }
    }

    const handleAddToCart = async (bookId) => {
        if (!userId || !token) {
            Swal.fire({
                icon: "warning",
                title: "Login Required",
                text: "Please log in to add items to cart.",
                background: "#F4F4F9",
                confirmButtonColor: "#0050A0",
            })
            navigate("/login")
            return
        }

        const book = books.find((b) => b.id === bookId)
        if (!book || book.inventoryCount === 0) {
            Swal.fire({
                icon: "error",
                title: "Out of Stock",
                text: "This item is currently out of stock.",
                background: "#F4F4F9",
                confirmButtonColor: "#0050A0",
            })
            return
        }

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
            const cartItem = cartItems.find((item) => item.bookId === bookId)
            const currentCartQuantity = cartItem ? cartItem.quantity : 0

            const totalRequested = currentCartQuantity + 1
            if (totalRequested > book.inventoryCount) {
                Swal.fire({
                    icon: "warning",
                    title: "Stock Limit Exceeded",
                    text: `Only ${book.inventoryCount - currentCartQuantity} items remain in stock.`,
                    background: "#F4F4F9",
                    confirmButtonColor: "#0050A0",
                })
                return
            }

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
                text: "Book added to your cart successfully!",
                timer: 1500,
                showConfirmButton: false,
                background: "#F4F4F9",
            })
        } catch (error) {
            console.error("Error adding to cart:", error.message)
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to add book to cart. Please try again.",
                background: "#F4F4F9",
                confirmButtonColor: "#0050A0",
            })
        }
    }

    const handleBookClick = (bookId) => {
        navigate(`/book/${bookId}`)
    }

    const handleCloseAnnouncement = (id) => {
        setClosedAnnouncements(prev => {
            const newSet = new Set(prev)
            newSet.add(id)
            return newSet
        })
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
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

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

    // Featured books - select 3 books that are on sale or have high ratings
    const featuredBooks = books
        .filter((book) => book.isOnSale && book.discountStart <= now && book.discountEnd >= now)
        .slice(0, 3)

    return (
        <div className="mainlanding">
            <MemberSide />
            <div className="landing-container">

                <NavBar />

                {/* Hero Banner */}
                <div className="hero-banner">
                    <div className="hero-content">
                        <h1 className="hero-title">Discover Your Next Great Adventure</h1>
                        <p className="hero-subtitle">Explore our vast collection of books and expand your horizons</p>
                        <button
                            className="cta-button"
                            onClick={() =>
                                window.scrollTo({ top: document.querySelector(".book-section").offsetTop, behavior: "smooth" })
                            }
                        >
                            <Zap className="icon" size={18} />
                            Browse Collection
                        </button>
                    </div>
                </div>

                {/* Announcements */}
                {announcements.length > 0 && announcements.some(a => !closedAnnouncements.has(a.id)) && (
                    <div className="announcement-bar">
                        <div className="announcement-wrapper">
                            {announcements.map((announcement, index) => (
                                !closedAnnouncements.has(announcement.id) && (
                                    <div
                                        key={announcement.id || index}
                                        className={`announcement ${index === activeIndex ? "active" : ""}`}
                                        style={{
                                            opacity: index === activeIndex ? 1 : 0,
                                            transform: `translateY(${index === activeIndex ? 0 : 20}px)`,
                                            pointerEvents: index === activeIndex ? "auto" : "none"
                                        }}
                                    >
                                        <ShieldIcon className="announcement-icon pulse" size={18} />
                                        <span className="announcement-text">{announcement.message}</span>
                                        <ShieldIcon className="announcement-icon pulse" size={18} />
                                        <button
                                            className="announcement-close"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                handleCloseAnnouncement(announcement.id || index)
                                            }}
                                            aria-label="Close announcement"
                                        >
                                            &times;
                                        </button>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>
                )}

                {/* Featured Books */}
                {featuredBooks.length > 0 && (
                    <div className="featured-section">
                        <h2 className="section-title">
                            <Star className="section-icon" size={24} />
                            Special Offers
                        </h2>
                        <div className="featured-grid">
                            {featuredBooks.map((book) => (
                                <div key={book.id} className="featured-card" onClick={() => handleBookClick(book.id)}>
                                    <div className="featured-image-container">
                                        <img
                                            src={book.coverUrl || "/placeholder.svg"}
                                            alt={book.title}
                                            className="featured-image"
                                            onError={(e) => (e.target.src = "/default-cover.jpg")}
                                        />
                                        {book.isOnSale &&
                                            book.discountStart &&
                                            book.discountEnd &&
                                            book.discountStart <= now &&
                                            book.discountEnd >= now && <div className="sale-badge">SALE</div>}
                                    </div>
                                    <div className="featured-info">
                                        <h3 className="featured-title">{book.title}</h3>
                                        <p className="featured-author">{book.author}</p>
                                        {book.isOnSale &&
                                            book.discountStart &&
                                            book.discountEnd &&
                                            book.discountStart <= now &&
                                            book.discountEnd >= now ? (
                                            <p className="featured-price">
                                                <span className="original-price">${book.price.toFixed(2)}</span>
                                                <span className="discounted-price">${book.effectivePrice.toFixed(2)}</span>
                                            </p>
                                        ) : (
                                            <p className="featured-price">${book.price.toFixed(2)}</p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="filters">
                    <div className="filter-group">
                        <div className="search-wrapper">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value)
                                    setCurrentPage(1)
                                }}
                                className="search-input"
                            />
                        </div>
                        <select
                            className="sort-dropdown"
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
                        <label className="filter-label">
                            <input
                                type="checkbox"
                                checked={inStockOnly}
                                onChange={() => {
                                    setInStockOnly(!inStockOnly)
                                    setCurrentPage(1)
                                }}
                            />
                            Available Only
                        </label>
                    </div>
                    <div className="category-filters">
                        <button
                            className={`filter-btn ${selectedCategory === "" ? "active" : ""}`}
                            onClick={() => {
                                setSelectedCategory("")
                                setCurrentPage(1)
                            }}
                        >
                            <Filter className="filter-icon" size={16} />
                            All Books
                        </button>
                        {genres.map((genre, idx) => (
                            <button
                                key={idx}
                                className={`filter-btn ${selectedCategory === genre ? "active" : ""}`}
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

                {/* Book Section */}
                <div className="book-section">
                    <h2 className="section-title">
                        <BookIcon className="section-icon" size={24} />
                        {selectedCategory || "All Books"}
                    </h2>

                    {isLoading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <p>Loading books...</p>
                        </div>
                    ) : currentBooks.length === 0 ? (
                        <p className="empty-message">No books available in this category. Please try another filter.</p>
                    ) : (
                        <div className="book-grid">
                            {currentBooks.map((book) => (
                                <div key={book.id} className="book-card">
                                    <div className="book-image-container">
                                        <img
                                            src={book.coverUrl || "/placeholder.svg"}
                                            alt={book.title}
                                            className="book-image"
                                            onError={(e) => (e.target.src = "/default-cover.jpg")}
                                            onClick={() => handleBookClick(book.id)}
                                        />
                                        {book.isOnSale &&
                                            book.discountStart &&
                                            book.discountEnd &&
                                            book.discountStart <= now &&
                                            book.discountEnd >= now && <div className="sale-badge">SALE</div>}
                                    </div>
                                    <div className="book-info">
                                        <h3 className="book-title" onClick={() => handleBookClick(book.id)}>
                                            {book.title}
                                        </h3>
                                        <p className="book-author">{book.author}</p>
                                        {book.isOnSale &&
                                            book.discountStart &&
                                            book.discountEnd &&
                                            book.discountStart <= now &&
                                            book.discountEnd >= now ? (
                                            <p className="book-price">
                                                <span className="original-price">${book.price.toFixed(2)}</span>
                                                <span className="discounted-price">${book.effectivePrice.toFixed(2)}</span>
                                            </p>
                                        ) : (
                                            <p className="book-price">${book.price.toFixed(2)}</p>
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
                                        <div className="book-stock">
                                            {book.inventoryCount > 0 ? (
                                                <span className="in-stock">Available</span>
                                            ) : (
                                                <span className="out-of-stock">Unavailable</span>
                                            )}
                                        </div>
                                        <div className="book-actions">
                                            <button
                                                className="bookmark-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleToggle(book.id)
                                                }}
                                                aria-label={bookmarkedIds.has(book.id) ? "Remove from bookmarks" : "Add to bookmarks"}
                                            >
                                                {bookmarkedIds.has(book.id) ? (
                                                    <Bookmarked className="icon-bookmarked" />
                                                ) : (
                                                    <Unbookmarked className="icon-unbookmarked" />
                                                )}
                                            </button>
                                            <button
                                                className="cart-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleAddToCart(book.id)
                                                }}
                                                disabled={book.inventoryCount === 0}
                                                aria-label="Add to cart"
                                            >
                                                <FaShoppingCart className="icon-cart" />
                                                Add to Cart
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {totalPages > 1 && (
                        <div className="pagination">
                            <button
                                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="pagination-btn prev"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </button>
                            {getPageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    onClick={() => typeof page === "number" && setCurrentPage(page)}
                                    className={`pagination-btn ${page === currentPage ? "active" : ""} ${typeof page !== "number" ? "ellipsis" : ""
                                        }`}
                                    disabled={typeof page !== "number"}
                                >
                                    {page}
                                </button>
                            ))}
                            <button
                                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="pagination-btn next"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="footer">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>About Us</h3>
                            <p>Your premier destination for quality books and literary treasures.</p>
                        </div>
                        <div className="footer-section">
                            <h3>Quick Links</h3>
                            <ul>
                                <li>
                                    <a href="#">Home</a>
                                </li>
                                <li>
                                    <a href="#">Browse</a>
                                </li>
                                <li>
                                    <a href="#">My Account</a>
                                </li>
                                <li>
                                    <a href="#">Contact Us</a>
                                </li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h3>Contact</h3>
                            <p>Email: info@bookhaven.com</p>
                            <p>Phone: (555) 123-4567</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; {new Date().getFullYear()} BookHaven. All rights reserved.</p>
                    </div>
                </footer>
            </div>
        </div>
    )
}
