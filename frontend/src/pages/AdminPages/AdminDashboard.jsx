import { useState, useEffect } from "react"
import { FaBook, FaShoppingCart, FaChartLine, FaCalendarAlt, FaSearch, FaSync, FaUser, FaEdit, FaTrash } from "react-icons/fa"
import { MdAnnouncement } from "react-icons/md"
import axios from "axios"
import "../../styles/AdminDashboard.css"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalInventory: 0,
  })
  const [books, setBooks] = useState([])
  const [recentBooks, setRecentBooks] = useState([])
  const [orders, setOrders] = useState([])
  const [recentOrders, setRecentOrders] = useState([])
  const [users, setUsers] = useState([])
  const [recentUsers, setRecentUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [ordersMessage, setOrdersMessage] = useState(null)
  const [bookSearch, setBookSearch] = useState("")
  const [orderSearch, setOrderSearch] = useState("")
  const [userSearch, setUserSearch] = useState("")
  const [bookPage, setBookPage] = useState(1)
  const [orderPage, setOrderPage] = useState(1)
  const [userPage, setUserPage] = useState(1)
  const [itemsPerPage] = useState(5)
  const [bookSort, setBookSort] = useState({ field: "createdAt", direction: "desc" })
  const [editUser, setEditUser] = useState(null)
  const [deleteUserId, setDeleteUserId] = useState(null)

  const API_URL = "http://localhost:5001"
  // Refresh interval: 5 minutes (300,000 ms)
  const REFRESH_INTERVAL = 300000

  // Mock orders as fallback
  const mockOrders = [
    {
      orderId: "mock-101",
      userId: "mock-user-1",
      claimCode: "CLAIM101",
      totalPrice: 125.50,
      status: "Complete",
      createdAt: "2025-05-10T10:00:00Z",
      items: [{ bookId: "book-1", quantity: 2, price: 62.75 }],
    },
    {
      orderId: "mock-102",
      userId: "mock-user-2",
      claimCode: "CLAIM102",
      totalPrice: 75.25,
      status: "Processing",
      createdAt: "2025-05-09T15:30:00Z",
      items: [{ bookId: "book-2", quantity: 1, price: 75.25 }],
    },
    {
      orderId: "mock-103",
      userId: "mock-user-3",
      claimCode: "CLAIM103",
      totalPrice: 49.99,
      status: "Complete",
      createdAt: "2025-05-08T12:00:00Z",
      items: [{ bookId: "book-3", quantity: 1, price: 49.99 }],
    },
  ]

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    setLoading(true)
    setError(null)
    setOrdersMessage(null)
    try {
      // Fetch books
      console.log("Fetching books from:", `${API_URL}/api/Admin/Book/getAllBooks`)
      const booksResponse = await axios.get(`${API_URL}/api/Admin/Book/getAllBooks`)
      const booksData = booksResponse.data.$values || booksResponse.data || []
      console.log("Books fetched:", booksData)
      setBooks(booksData)

      // Process books for display
      let filteredBooks = [...booksData]
      if (bookSearch) {
        filteredBooks = filteredBooks.filter(
          (book) =>
            book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
            book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
            book.isbn.toLowerCase().includes(bookSearch.toLowerCase())
        )
      }

      // Sort books
      filteredBooks.sort((a, b) => {
        const field = bookSort.field
        const direction = bookSort.direction === "asc" ? 1 : -1
        if (field === "createdAt") {
          return direction * (new Date(b[field]) - new Date(a[field]))
        }
        return direction * (a[field] < b[field] ? -1 : 1)
      })

      // Paginate books
      const bookStartIndex = (bookPage - 1) * itemsPerPage
      const paginatedBooks = filteredBooks.slice(bookStartIndex, bookStartIndex + itemsPerPage).map((book) => ({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        inventoryCount: book.inventoryCount,
        createdAt: book.createdAt,
      }))
      setRecentBooks(paginatedBooks)

      // Fetch all orders
      console.log("Fetching orders from:", `${API_URL}/api/staff/getAllOrders`)
      let ordersData = []
      try {
        const ordersResponse = await axios.get(`${API_URL}/api/staff/getAllOrders`)
        ordersData = ordersResponse.data.$values || ordersResponse.data || []
        console.log("Orders fetched:", ordersData)
        if (ordersData.length === 0) {
          setOrdersMessage("No orders found in the system. Displaying sample data.")
          ordersData = mockOrders // Fallback to mock orders
        }
      } catch (orderErr) {
        console.error("Failed to fetch orders:", orderErr.response?.data || orderErr.message)
        setOrdersMessage("Unable to fetch recent orders. Displaying sample data.")
        ordersData = mockOrders // Fallback to mock orders
      }
      setOrders(ordersData)

      // Process orders for display
      let filteredOrders = [...ordersData]
      if (orderSearch) {
        filteredOrders = filteredOrders.filter(
          (order) =>
            order.orderId.toString().toLowerCase().includes(orderSearch.toLowerCase()) ||
            (order.status && order.status.toLowerCase().includes(orderSearch.toLowerCase())) ||
            (order.claimCode && order.claimCode.toLowerCase().includes(orderSearch.toLowerCase()))
        )
      }

      // Sort and paginate orders
      filteredOrders.sort((a, b) => {
        const dateA = new Date(a.createdAt)
        const dateB = new Date(b.createdAt)
        return isNaN(dateB) || isNaN(dateA) ? 0 : dateB - dateA
      })
      const orderStartIndex = (orderPage - 1) * itemsPerPage
      const paginatedOrders = filteredOrders.slice(orderStartIndex, orderStartIndex + itemsPerPage).map((order) => ({
        id: order.orderId,
        customer: order.userId,
        amount: order.totalPrice || 0,
        status: order.status || "Unknown",
        date: order.createdAt,
        claimCode: order.claimCode || "N/A",
      }))
      console.log("Paginated orders:", paginatedOrders)
      setRecentOrders(paginatedOrders)

      // Fetch all users
      console.log("Fetching users from:", `${API_URL}/api/admin/user/getall`)
      let usersData = []
      try {
        const usersResponse = await axios.get(`${API_URL}/api/admin/user/getall`)
        usersData = usersResponse.data.$values || usersResponse.data || []
        console.log("Users fetched:", usersData)
      } catch (userErr) {
        console.error("Failed to fetch users:", userErr.response?.data || userErr.message)
      }
      setUsers(usersData)

      // Process users for display
      let filteredUsers = [...usersData]
      if (userSearch) {
        filteredUsers = filteredUsers.filter(
          (user) =>
            user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
            user.role.toLowerCase().includes(userSearch.toLowerCase())
        )
      }

      // Sort users by fullName (default)
      filteredUsers.sort((a, b) => a.fullName.localeCompare(b.fullName))
      const userStartIndex = (userPage - 1) * itemsPerPage
      const paginatedUsers = filteredUsers.slice(userStartIndex, userStartIndex + itemsPerPage).map((user) => ({
        id: user.id,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
      }))
      console.log("Paginated users:", paginatedUsers)
      setRecentUsers(paginatedUsers)

      // Calculate stats
      const totalBooks = booksData.length
      const totalInventory = booksData.reduce((sum, book) => sum + book.inventoryCount, 0)
      const totalOrders = ordersData.length
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

      setStats({
        totalBooks,
        totalOrders,
        totalRevenue,
        totalInventory,
      })
    } catch (err) {
      console.error("Error fetching dashboard data:", err.response?.data || err.message)
      setError("Failed to load dashboard data. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit user
  const handleEditUser = async (user) => {
    try {
      const response = await axios.put(`${API_URL}/api/admin/user/edit/${user.id}`, {
        fullName: user.fullName,
        role: user.role,
        email: user.email,
      })
      const updatedUser = response.data
      setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
      setRecentUsers(recentUsers.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
      setEditUser(null)
    } catch (err) {
      console.error("Failed to edit user:", err.response?.data || err.message)
      alert("Failed to update user. Please try again.")
    }
  }

  // Handle delete user
  const handleDeleteUser = async (userId) => {
    try {
      await axios.delete(`${API_URL}/api/admin/user/delete/${userId}`)
      setUsers(users.filter((u) => u.id !== userId))
      setRecentUsers(recentUsers.filter((u) => u.id !== userId))
      setDeleteUserId(null)
    } catch (err) {
      console.error("Failed to delete user:", err.response?.data || err.message)
      alert("Failed to delete user. Please try again.")
    }
  }

  // Initial fetch and periodic refresh
  useEffect(() => {
    fetchDashboardData()

    // Set up periodic refresh
    const intervalId = setInterval(fetchDashboardData, REFRESH_INTERVAL)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [bookSearch, bookPage, orderSearch, orderPage, userSearch, userPage, bookSort])

  // Handle book search
  const handleBookSearch = (e) => {
    setBookSearch(e.target.value)
    setBookPage(1)
  }

  // Handle order search
  const handleOrderSearch = (e) => {
    setOrderSearch(e.target.value)
    setOrderPage(1)
  }

  // Handle user search
  const handleUserSearch = (e) => {
    setUserSearch(e.target.value)
    setUserPage(1)
  }

  // Handle book sorting
  const handleBookSort = (field) => {
    setBookSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Handle pagination
  const handleBookPageChange = (newPage) => setBookPage(newPage)
  const handleOrderPageChange = (newPage) => setOrderPage(newPage)
  const handleUserPageChange = (newPage) => setUserPage(newPage)

  // Handle row clicks
  const handleBookClick = (bookId) => {
    window.location.href = `/admin/book/${bookId}`
  }

  const handleOrderClick = (orderId) => {
    window.location.href = `/admin/order/${orderId}`
  }

  // Handle refresh button click
  const handleRefresh = () => {
    fetchDashboardData()
  }

  // Handle panel header click to refresh
  const handleBooksPanelClick = () => {
    fetchDashboardData()
  }

  // Calculate total pages without Math.ceil
  const totalBookPages = Math.floor((books.filter(
    (book) =>
      !bookSearch ||
      book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
      book.isbn.toLowerCase().includes(bookSearch.toLowerCase())
  ).length + itemsPerPage - 1) / itemsPerPage)
  const totalOrderPages = Math.floor((orders.filter(
    (order) =>
      !orderSearch ||
      order.orderId.toString().toLowerCase().includes(orderSearch.toLowerCase()) ||
      (order.status && order.status.toLowerCase().includes(orderSearch.toLowerCase())) ||
      (order.claimCode && order.claimCode.toLowerCase().includes(orderSearch.toLowerCase()))
  ).length + itemsPerPage - 1) / itemsPerPage)
  const totalUserPages = Math.floor((users.filter(
    (user) =>
      !userSearch ||
      user.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearch.toLowerCase())
  ).length + itemsPerPage - 1) / itemsPerPage)

  if (loading) {
    return (
      <div className="admin_dashboard_loading">
        <div className="admin_dashboard_spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin_dashboard_error">
        <p>{error}</p>
        <button onClick={handleRefresh} className="admin_dashboard_retry_button">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="admin_dashboard_container">
      <div className="admin_dashboard_header">
        <h1 className="admin_dashboard_title">Admin Dashboard</h1>
        <button onClick={handleRefresh} className="admin_dashboard_refresh_button" title="Refresh Data">
          <FaSync />
        </button>
      </div>

      {/* Stats Section */}
      <div className="admin_dashboard_stats">
        <div className="admin_dashboard_stat_card">
          <div className="admin_dashboard_stat_icon"><FaBook /></div>
          <div className="admin_dashboard_stat_info">
            <h3>Total Books</h3>
            <p>{stats.totalBooks}</p>
          </div>
        </div>
        <div className="admin_dashboard_stat_card">
          <div className="admin_dashboard_stat_icon"><FaShoppingCart /></div>
          <div className="admin_dashboard_stat_info">
            <h3>Total Orders</h3>
            <p>{stats.totalOrders}</p>
          </div>
        </div>
        <div className="admin_dashboard_stat_card">
          <div className="admin_dashboard_stat_icon"><FaChartLine /></div>
          <div className="admin_dashboard_stat_info">
            <h3>Total Revenue</h3>
            <p>${stats.totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="admin_dashboard_stat_card">
          <div className="admin_dashboard_stat_icon"><FaChartLine /></div>
          <div className="admin_dashboard_stat_info">
            <h3>Total Inventory</h3>
            <p>{stats.totalInventory}</p>
          </div>
        </div>
      </div>

      {/* Panels Section */}
      <div className="admin_dashboard_panels">
        {/* Recent Books Panel */}
        <div className="admin_dashboard_panel">
          <div className="admin_dashboard_panel_header" onClick={handleBooksPanelClick} style={{ cursor: "pointer" }}>
            <h2>Recent Books</h2>
            <FaBook />
          </div>
          <div className="admin_dashboard_search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search books..."
              value={bookSearch}
              onChange={handleBookSearch}
            />
          </div>
          <div className="admin_dashboard_panel_content">
            {recentBooks.length > 0 ? (
              <>
                <table className="admin_dashboard_table">
                  <thead>
                    <tr>
                      <th onClick={() => handleBookSort("title")} className="admin_dashboard_sortable">
                        Title {bookSort.field === "title" && (bookSort.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleBookSort("author")} className="admin_dashboard_sortable">
                        Author {bookSort.field === "author" && (bookSort.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleBookSort("price")} className="admin_dashboard_sortable">
                        Price {bookSort.field === "price" && (bookSort.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th>Inventory</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBooks.map((book) => (
                      <tr
                        key={book.id}
                        onClick={() => handleBookClick(book.id)}
                        className="admin_dashboard_table_row_clickable"
                      >
                        <td>{book.title}</td>
                        <td>{book.author}</td>
                        <td>${book.price.toFixed(2)}</td>
                        <td>{book.inventoryCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin_dashboard_pagination">
                  <button
                    disabled={bookPage === 1}
                    onClick={() => handleBookPageChange(bookPage - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {bookPage} of {totalBookPages}</span>
                  <button
                    disabled={bookPage >= totalBookPages}
                    onClick={() => handleBookPageChange(bookPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="admin_dashboard_no_data">No books found</p>
            )}
          </div>
        </div>

        {/* Recent Orders Panel */}
        <div className="admin_dashboard_panel">
          <div className="admin_dashboard_panel_header">
            <h2>Recent Orders</h2>
            <FaShoppingCart />
          </div>
          {ordersMessage && <p className="admin_dashboard_orders_message">{ordersMessage}</p>}
          <div className="admin_dashboard_search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search orders by ID, status, or claim code..."
              value={orderSearch}
              onChange={handleOrderSearch}
            />
          </div>
          <div className="admin_dashboard_panel_content">
            {recentOrders.length > 0 ? (
              <>
                <table className="admin_dashboard_table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer ID</th>
                      <th>Claim Code</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr
                        key={order.id}
                        onClick={() => handleOrderClick(order.id)}
                        className="admin_dashboard_table_row_clickable"
                      >
                        <td>#{order.id}</td>
                        <td>{order.customer}</td>
                        <td>{order.claimCode}</td>
                        <td>${order.amount.toFixed(2)}</td>
                        <td>
                          <span className={`admin_dashboard_status admin_dashboard_status_${(order.status || "unknown").toLowerCase()}`}>
                            {order.status || "Unknown"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin_dashboard_pagination">
                  <button
                    disabled={orderPage === 1}
                    onClick={() => handleOrderPageChange(orderPage - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {orderPage} of {totalOrderPages}</span>
                  <button
                    disabled={orderPage >= totalOrderPages}
                    onClick={() => handleOrderPageChange(orderPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="admin_dashboard_no_data">No recent orders available</p>
            )}
          </div>
        </div>

        {/* Users Panel */}
        <div className="admin_dashboard_panel">
          <div className="admin_dashboard_panel_header">
            <h2>Users</h2>
            <FaUser />
          </div>
          <div className="admin_dashboard_search">
            <FaSearch />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={userSearch}
              onChange={handleUserSearch}
            />
          </div>
          <div className="admin_dashboard_panel_content">
            {recentUsers.length > 0 ? (
              <>
                <table className="admin_dashboard_table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="admin_dashboard_table_row_clickable">
                        <td>{user.fullName}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <button
                            className="admin_dashboard_action_icon"
                            onClick={() => setEditUser(user)}
                            title="Edit User"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="admin_dashboard_action_icon admin_dashboard_delete_icon"
                            onClick={() => setDeleteUserId(user.id)}
                            title="Delete User"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="admin_dashboard_pagination">
                  <button
                    disabled={userPage === 1}
                    onClick={() => handleUserPageChange(userPage - 1)}
                  >
                    Previous
                  </button>
                  <span>Page {userPage} of {totalUserPages}</span>
                  <button
                    disabled={userPage >= totalUserPages}
                    onClick={() => handleUserPageChange(userPage + 1)}
                  >
                    Next
                  </button>
                </div>
              </>
            ) : (
              <p className="admin_dashboard_no_data">No users found</p>
            )}
          </div>
        </div>
      </div>

      {/* Edit User Modal */}
      {editUser && (
        <div className="admin_dashboard_modal">
          <div className="admin_dashboard_modal_content">
            <h2>Edit User</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditUser(editUser)
              }}
            >
              <div className="admin_dashboard_form_group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={editUser.fullName}
                  onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="admin_dashboard_form_group">
                <label>Email</label>
                <input
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="admin_dashboard_form_group">
                <label>Role</label>
                <input
                  type="text"
                  value={editUser.role}
                  onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                  required
                />
              </div>
              <div className="admin_dashboard_modal_actions">
                <button type="submit" className="admin_dashboard_modal_button">
                  Save
                </button>
                <button
                  type="button"
                  className="admin_dashboard_modal_button admin_dashboard_modal_cancel"
                  onClick={() => setEditUser(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation */}
      {deleteUserId && (
        <div className="admin_dashboard_modal">
          <div className="admin_dashboard_modal_content">
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete this user?</p>
            <div className="admin_dashboard_modal_actions">
              <button
                className="admin_dashboard_modal_button admin_dashboard_modal_delete"
                onClick={() => handleDeleteUser(deleteUserId)}
              >
                Delete
              </button>
              <button
                className="admin_dashboard_modal_button admin_dashboard_modal_cancel"
                onClick={() => setDeleteUserId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="admin_dashboard_quick_actions">
        <h2>Quick Actions</h2>
        <div className="admin_dashboard_buttons">
          <button
            className="admin_dashboard_action_button"
            onClick={() => {
              fetchDashboardData()
              window.location.href = "/admin/manage-book"
            }}
          >
            <FaBook />
            Manage Books
          </button>
          <button
            className="admin_dashboard_action_button"
            onClick={() => (window.location.href = "/admin/announcements")}
          >
            <MdAnnouncement />
            Manage Announcements
          </button>
          <button
            className="admin_dashboard_action_button"
            onClick={() => (window.location.href = "/admin/calendar")}
          >
            <FaCalendarAlt />
            View Calendar
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard