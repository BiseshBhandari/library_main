import { useState, useEffect } from "react"
import { FaBookmark as Bookmarked, FaRegBookmark as Unbookmarked, FaShoppingCart, FaBell } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import NavBar from "../../Components/Navigation/MemberNav"
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr"
import Swal from "sweetalert2"
import { BookIcon, Zap, Search, Filter, ChevronLeft, ChevronRight, Star } from "lucide-react"
import "../../styles/MemberLanding.css"
import MemberSide from "../../Components/Navigation/MemberSide"
import axios from "axios"

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
    const [notifications, setNotifications] = useState([])
    const [showNotifications, setShowNotifications] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)

    // Ensure the calculateStarDistribution function is properly defined
    const calculateStarDistribution = (reviewsArray) => {
        const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
        reviewsArray.forEach((review) => {
            const roundedRating = Math.round(review.rating)
            if (starCounts[roundedRating] !== undefined) {
                starCounts[roundedRating] += 1
            }
        })
        return starCounts
    }

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
                    isbn: book.isbn || "",
                    description: book.description || "",
                }))
                setBooks(mappedBooks)
                const uniqueGenres = [...new Set(mappedBooks.map((book) => book.genre))]
                setGenres(uniqueGenres)
            } catch (error) {
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
                    setBookmarkedIds(new Set())
                    return
                }
                if (!response.ok) throw new Error(`Failed to fetch bookmarks: ${response.status}`)
                const data = await response.json()
                const bookmarkArray = data.$values || data
                if (!Array.isArray(bookmarkArray)) {
                    setBookmarkedIds(new Set())
                    return
                }
                const ids = new Set(bookmarkArray.map((item) => item.bookId))
                setBookmarkedIds(ids)
            } catch (error) {
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
                    setAnnouncements([])
                    return
                }
                setAnnouncements(announcementArray)
            } catch (error) {
                setAnnouncements([])
            }
        }

        fetchBooks()
        fetchAnnouncements()
        if (userId && token) {
            fetchBookmarkedBooks()
        } else {
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

    useEffect(() => {
        const connection = new HubConnectionBuilder()
            .withUrl("http://localhost:5001/hubs/notifications", {
                accessTokenFactory: () => token,
                logger: LogLevel.Information,
            })
            .withAutomaticReconnect()
            .build()

        connection
            .start()
            .then(() => { })
            .catch((error) => { })

        const handleNotification = (type, notification) => {
            const bookTitles = notification.books.map((book) => book.title).join(", ")
            const message = `You have purchased: ${bookTitles}`

            setNotifications((prev) => [
                {
                    id: notification.id, // Use ID from the database
                    type,
                    message,
                    books: notification.books.map((book) => book.title) || [],
                    timestamp: notification.timestamp, // Use timestamp from the database
                    read: notification.read || false,
                },
                ...prev,
            ])
            setUnreadCount((prev) => prev + 1)
            Swal.fire({
                icon: "info",
                title: type,
                html: `<p>${message}</p>`,
                background: "#F4F4F9",
                confirmButtonColor: "#0050A0",
            })
        }

        connection.on("OrderCompleted", (notification) => {
            handleNotification("Order Completed", notification)
        })

        connection.on("TestNotification", (notification) => {
            handleNotification("Test Notification", notification)
        })

        connection.on("UserNotification", (notification) => {
            handleNotification("User Notification", notification)
        })

        return () => {
            connection.stop().then(() => { })
        }
    }, [token])

    useEffect(() => {
        const fetchNotifications = async () => {
            const storedUserId = localStorage.getItem("userId")
            if (!storedUserId) {
                return
            }

            try {
                const response = await axios.get(`http://localhost:5001/api/notifications/user/${storedUserId}`)
                const notificationsData = response.data.slice(0, 5) // Fetch only the latest 5 notifications
                setNotifications(notificationsData)
                setUnreadCount(notificationsData.filter((notification) => !notification.read).length)
            } catch (error) {
                setNotifications([])
            }
        }

        fetchNotifications()
    }, [])

    useEffect(() => {
        const fetchReviewsAndCalculateStars = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/reviews`) // Adjust endpoint as needed
                if (!response.ok) throw new Error(`Failed to fetch reviews: ${response.status}`)
                const reviewsData = await response.json()
                const reviewsArray = Array.isArray(reviewsData) ? reviewsData : reviewsData.$values || []

                // Calculate star distribution
                const starDistribution = calculateStarDistribution(reviewsArray)
            } catch (error) { }
        }

        fetchReviewsAndCalculateStars()
    }, [])

    const clearNotifications = async () => {
        const storedUserId = localStorage.getItem("userId")
        if (!storedUserId) {
            return
        }

        try {
            await axios.delete(`http://localhost:5001/api/notifications/user/${storedUserId}`)
            setNotifications([])
            setUnreadCount(0)
        } catch (error) { }
    }

    const toggleNotifications = async () => {
        setShowNotifications(!showNotifications)
        if (!showNotifications) {
            const storedUserId = localStorage.getItem("userId")
            if (!storedUserId) {
                return
            }

            try {
                const response = await axios.get(`http://localhost:5001/api/notifications/user/${storedUserId}`)
                const notificationsData = response.data.$values || response.data // Handle $values property
                if (Array.isArray(notificationsData)) {
                    setNotifications(notificationsData)
                    setNotifications(
                        (prev) => (Array.isArray(prev) ? prev.map((notification) => ({ ...notification, read: true })) : []), // Ensure prev is an array
                    )
                    setUnreadCount(0)
                } else {
                    setNotifications([]) // Fallback to an empty array if the response is not an array
                }
            } catch (error) {
                setNotifications([]) // Fallback to an empty array in case of an error
            }
        }
    }

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
        setClosedAnnouncements((prev) => {
            const newSet = new Set(prev)
            newSet.add(id)
            return newSet
        })
    }

    const renderNotifications = () => {
        return (
            <div className="notification-dropdown">
                {notifications.length === 0 ? (
                    <p>No notifications available</p>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`notification-item ${notification.read ? "read" : "unread"}`}
                            style={{
                                border: "1px solid #ccc",
                                borderRadius: "5px",
                                padding: "10px",
                                marginBottom: "10px",
                                backgroundColor: notification.read ? "#f9f9f9" : "#e6f7ff",
                            }}
                        >
                            <p style={{ fontWeight: "bold", marginBottom: "5px" }}>{notification.message}</p>
                            <p style={{ fontSize: "12px", color: "#888", marginBottom: "5px" }}>
                                Date: {new Date(notification.createdAt).toLocaleString()}
                            </p>
                            {notification.books && notification.books.length > 0 && (
                                <ul className="book-details" style={{ paddingLeft: "20px", margin: "0" }}>
                                    {notification.books.map((book, index) => (
                                        <li key={index} style={{ listStyleType: "circle", marginBottom: "5px" }}>
                                            {book}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))
                )}
                <button
                    onClick={clearNotifications}
                    className="clear-notifications-btn"
                    style={{
                        backgroundColor: "#0050A0",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "10px 15px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                        marginTop: "10px",
                    }}
                >
                    Clear All Notifications
                </button>
            </div>
        )
    }

    const filteredBooks = books
        .filter((book) =>
            book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.isbn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            book.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
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
            if (sortOption === "price-asc") return a.effectivePrice - b.effectivePrice
            if (sortOption === "price-desc") return b.effectivePrice - a.effectivePrice
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

    const featuredBooks = books
        .filter((book) => book.isOnSale && book.discountStart <= now && book.discountEnd >= now)
        .slice(0, 3)

    return (
        <>
            <div className="mainlanding">
                <MemberSide />
                <div className="landing-container">
                    <div className="nav-container">
                        <NavBar />
                        <div className="notification-wrapper" style={{ position: "relative", display: "inline-block" }}>
                            <button
                                className="notification-btn"
                                onClick={toggleNotifications}
                                aria-label="View notifications"
                                style={{
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    position: "relative",
                                    fontSize: "24px",
                                    color: "#0050A0",
                                }}
                            >
                                <FaBell className="notification-icon" style={{ fontSize: "24px" }} />
                                {unreadCount > 0 && (
                                    <span
                                        className="notification-badge"
                                        style={{
                                            position: "absolute",
                                            top: "-5px",
                                            right: "-5px",
                                            background: "#FF0000",
                                            color: "#FFFFFF",
                                            borderRadius: "50%",
                                            padding: "5px 8px",
                                            fontSize: "12px",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            {showNotifications && renderNotifications()}
                        </div>
                    </div>

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

                    {announcements.length > 0 && announcements.some((a) => !closedAnnouncements.has(a.id)) && (
                        <div className="announcement-bar">
                            <div className="announcement-wrapper">
                                {announcements.map(
                                    (announcement, index) =>
                                        !closedAnnouncements.has(announcement.id) && (
                                            <div
                                                key={announcement.id || index}
                                                className={`announcement ${index === activeIndex ? "active" : ""}`}
                                                style={{
                                                    opacity: index === activeIndex ? 1 : 0,
                                                    transform: `translateY(${index === activeIndex ? 0 : 20}px)`,
                                                    pointerEvents: index === activeIndex ? "auto" : "none",
                                                }}
                                            >
                                                <BookIcon className="announcement-icon pulse" size={18} />
                                                <span className="announcement-text">{announcement.message}</span>
                                                <BookIcon className="announcement-icon pulse" size={18} />
                                                <button
                                                    className="announcement-close"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleCloseAnnouncement(announcement.id || index)
                                                    }}
                                                    aria-label="Close announcement"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        ),
                                )}
                            </div>
                        </div>
                    )}

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
                                                    <span className="out-of-stock">Out of Stock</span>
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
                </div>
            </div>
        </>
    )
}
