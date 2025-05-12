import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/StaffDashboard.css" // Adjust the path as necessary
import { Search, Calendar, Filter, RefreshCw, LogOut, ChevronDown, ChevronUp, CheckCircle, Clock, AlertTriangle, XCircle, DollarSign, ShoppingBag, Package, BarChart2, Users, List, Grid, Shield } from 'lucide-react'

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api"

function StaffDashboard() {
  const [claimCode, setClaimCode] = useState("")
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [updateMessage, setUpdateMessage] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "createdAt", direction: "desc" })
  const [statusFilter, setStatusFilter] = useState("all")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const [viewMode, setViewMode] = useState("grid") // 'grid' or 'list'
  const [isFilterExpanded, setIsFilterExpanded] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(null)
  const navigate = useNavigate()

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    complete: 0,
    cancelled: 0,
  })

  useEffect(() => {
    fetchAllOrders()
    // Auto-hide success message after 3 seconds
    if (updateMessage) {
      const timer = setTimeout(() => {
        setUpdateMessage(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [updateMessage])

  const fetchAllOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`${API_URL}/staff/getAllOrders`)
      const data = await response.json()
      // Handle the $values wrapper and transform the data
      const transformedOrders = (data.$values || data).map((order) => ({
        id: order.orderId,
        userId: order.userId,
        claimCode: order.claimCode,
        total: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.$values.map((item) => ({
          id: item.orderItemId,
          book: {
            title: item.title,
            author: item.author,
          },
          quantity: item.quantity,
          unitPrice: item.price,
        })),
      }))
      setOrders(transformedOrders)
      applyFilters(transformedOrders)
      updateOrderStats(transformedOrders)
    } catch (err) {
      setError("Failed to fetch orders: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStats = (ordersList) => {
    const newStats = {
      pending: 0,
      processing: 0,
      complete: 0,
      cancelled: 0,
    }

    ordersList.forEach((order) => {
      const status = order.status.toLowerCase()
      if (newStats[status] !== undefined) {
        newStats[status]++
      }
    })

    setStats(newStats)
  }

  const applyFilters = (ordersToFilter = orders) => {
    let filtered = [...ordersToFilter]

    // Apply claim code filter
    if (claimCode.trim()) {
      filtered = filtered.filter((order) => order.claimCode.toLowerCase().includes(claimCode.toLowerCase()))
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status.toLowerCase() === statusFilter)
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter((order) => new Date(order.createdAt) >= new Date(dateRange.start))
    }
    if (dateRange.end) {
      filtered = filtered.filter((order) => new Date(order.createdAt) <= new Date(dateRange.end))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key]
      let bValue = b[sortConfig.key]

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1
      return 0
    })

    setFilteredOrders(filtered)
  }

  useEffect(() => {
    applyFilters()
  }, [claimCode, statusFilter, dateRange, sortConfig])

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === "asc" ? "desc" : "asc",
    }))
  }

  const updateClaimStatus = async (orderClaimCode) => {
    try {
      // Find the order by claim code
      const order = orders.find((o) => o.claimCode === orderClaimCode)

      // Check if the order is canceled
      if (order && order.status.toLowerCase() === "cancelled") {
        setError(`Order ${orderClaimCode} is canceled and cannot be marked as complete.`)
        return
      }

      setProcessingOrder(orderClaimCode)
      setLoading(true)

      const response = await fetch(`${API_URL}/staff/updateClaimStatus/${orderClaimCode}`, {
        method: "PUT",
      })

      if (!response.ok) throw new Error("Failed to update status")

      setUpdateMessage(`Order ${orderClaimCode} marked as complete`)
      await fetchAllOrders()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
      setProcessingOrder(null)
    }
  }

  const clearFilters = () => {
    setClaimCode("")
    setStatusFilter("all")
    setDateRange({ start: "", end: "" })
    setSortConfig({ key: "createdAt", direction: "desc" })
  }

  const getStatusIcon = (status) => {
    const statusIcons = {
      complete: <CheckCircle size={16} />,
      pending: <Clock size={16} />,
      processing: <RefreshCw size={16} />,
      cancelled: <XCircle size={16} />,
    }
    return statusIcons[status.toLowerCase()] || <AlertTriangle size={16} />
  }

  const getStatusColor = (status) => {
    const statusColors = {
      complete: "#4CAF50", // Hope Green
      pending: "#FFCC00", // Laser Gold
      processing: "#3399FF", // Solar Blue
      cancelled: "#D62828", // Cape Red
    }
    return statusColors[status.toLowerCase()] || "#6b7280"
  }

  const calculateTotalRevenue = (orders) => {
    return orders.reduce((total, order) => total + order.total, 0).toFixed(2)
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <Shield size={24} className="logo-icon" />
          <h2>Justice League Command</h2>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <ShoppingBag size={18} />
            <span>Deployments</span>
          </div>
        </nav>
        <div className="sidebar-footer">
          <button
            className="logout-button"
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                navigate("/login")
              }
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <h1>Deployment Management</h1>
          <div className="header-actions">
            <button className="refresh-button" onClick={fetchAllOrders} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spinning" : ""} />
              <span>Refresh</span>
            </button>
            <div className="view-toggle">
              <button
                className={`toggle-button ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <Grid size={16} />
              </button>
              <button
                className={`toggle-button ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon orders">
              <ShoppingBag size={20} />
            </div>
            <div className="stat-content">
              <h3>Total Deployments</h3>
              <p>{orders.length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon revenue">
              <DollarSign size={20} />
            </div>
            <div className="stat-content">
              <h3>Total Revenue</h3>
              <p>${calculateTotalRevenue(orders)}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={20} />
            </div>
            <div className="stat-content">
              <h3>Pending</h3>
              <p>{stats.pending}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <CheckCircle size={20} />
            </div>
            <div className="stat-content">
              <h3>Completed</h3>
              <p>{stats.complete}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="notification error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button className="close-notification" onClick={() => setError(null)}>
              &times;
            </button>
          </div>
        )}

        {updateMessage && (
          <div className="notification success">
            <CheckCircle size={18} />
            <span>{updateMessage}</span>
            <button className="close-notification" onClick={() => setUpdateMessage(null)}>
              &times;
            </button>
          </div>
        )}

        <div className="filters-section">
          <div
            className="filters-header"
            onClick={() => setIsFilterExpanded(!isFilterExpanded)}
            role="button"
            tabIndex={0}
          >
            <div className="filters-title">
              <Filter size={16} />
              <h2>Filters & Sorting</h2>
            </div>
            <button className="expand-button">
              {isFilterExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          {isFilterExpanded && (
            <div className="filters-content">
              <div className="filters-grid">
                <div className="filter-group">
                  <label>
                    <Search size={14} />
                    Claim Code
                  </label>
                  <input
                    type="text"
                    value={claimCode}
                    onChange={(e) => setClaimCode(e.target.value)}
                    placeholder="Search claim code..."
                    className="filter-input"
                  />
                </div>

                <div className="filter-group">
                  <label>
                    <Filter size={14} />
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="complete">Complete</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="filter-group date-range-group">
                  <label>
                    <Calendar size={14} />
                    Date Range
                  </label>
                  <div className="date-range-inputs">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
                      className="filter-input date-input"
                    />
                    <span className="date-separator">to</span>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
                      className="filter-input date-input"
                    />
                  </div>
                </div>

                <div className="filter-group sort-group">
                  <label>
                    <BarChart2 size={14} />
                    Sort By
                  </label>
                  <div className="sort-buttons">
                    <button
                      className={`sort-button ${sortConfig.key === "createdAt" ? "active" : ""}`}
                      onClick={() => handleSort("createdAt")}
                    >
                      Date {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      className={`sort-button ${sortConfig.key === "total" ? "active" : ""}`}
                      onClick={() => handleSort("total")}
                    >
                      Price {sortConfig.key === "total" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      className={`sort-button ${sortConfig.key === "status" ? "active" : ""}`}
                      onClick={() => handleSort("status")}
                    >
                      Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </button>
                  </div>
                </div>
              </div>

              <div className="filters-actions">
                <button onClick={clearFilters} className="clear-filters-button">
                  Clear All Filters
                </button>
                <div className="results-count">
                  Showing <span className="highlight">{filteredOrders.length}</span> of{" "}
                  <span className="highlight">{orders.length}</span> deployments
                </div>
              </div>
            </div>
          )}
        </div>

        {loading && !processingOrder ? (
          <div className="loading-container">
            <div className="spinner-container">
              <div className="spinner"></div>
              <p>Loading deployments...</p>
            </div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className={`orders-container ${viewMode}`}>
            {viewMode === "grid" ? (
              <div className="orders-grid">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="order-card">
                    <div className="order-card-header">
                      <div className="order-id">Deployment #{order.id}</div>
                      <div className="status-badge" style={{ backgroundColor: getStatusColor(order.status) }}>
                        {getStatusIcon(order.status)}
                        <span>{order.status}</span>
                      </div>
                    </div>

                    <div className="order-card-content">
                      <div className="order-info">
                        <div className="info-row">
                          <span className="info-label">Claim Code:</span>
                          <span className="info-value claim-code">{order.claimCode}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Hero ID:</span>
                          <span className="info-value">{order.userId}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Total:</span>
                          <span className="info-value price">${order.total.toFixed(2)}</span>
                        </div>
                        <div className="info-row">
                          <span className="info-label">Created:</span>
                          <span className="info-value date">{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      <div className="order-items-section">
                        <h4>
                          Deployment Items <span className="item-count">({order.items.length})</span>
                        </h4>
                        <div className="items-table-container">
                          <table className="items-table">
                            <thead>
                              <tr>
                                <th>Archive Title</th>
                                <th>Qty</th>
                                <th>Price</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="book-title">{item.book.title}</td>
                                  <td>{item.quantity}</td>
                                  <td>${item.unitPrice.toFixed(2)}</td>
                                  <td className="item-total">${(item.quantity * item.unitPrice).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {order.status.toLowerCase() !== "complete" && (
                        <button
                          onClick={() => updateClaimStatus(order.claimCode)}
                          className="complete-button"
                          disabled={processingOrder === order.claimCode}
                        >
                          {processingOrder === order.claimCode ? (
                            <>
                              <div className="button-spinner"></div>
                              Processing...
                            </>
                          ) : (
                            <>
                              <CheckCircle size={16} />
                              Mark as Complete
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="orders-list">
                <table className="orders-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("id")}>
                        ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleSort("claimCode")}>
                        Claim Code {sortConfig.key === "claimCode" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleSort("userId")}>
                        Hero ID {sortConfig.key === "userId" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleSort("total")}>
                        Total {sortConfig.key === "total" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleSort("status")}>
                        Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th onClick={() => handleSort("createdAt")}>
                        Date {sortConfig.key === "createdAt" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                      </th>
                      <th>Items</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>#{order.id}</td>
                        <td className="claim-code">{order.claimCode}</td>
                        <td>{order.userId}</td>
                        <td className="price">${order.total.toFixed(2)}</td>
                        <td>
                          <div className="status-badge-small" style={{ backgroundColor: getStatusColor(order.status) }}>
                            {getStatusIcon(order.status)}
                            <span>{order.status}</span>
                          </div>
                        </td>
                        <td className="date">{formatDate(order.createdAt)}</td>
                        <td>{order.items.length} items</td>
                        <td>
                          {order.status.toLowerCase() !== "complete" ? (
                            <button
                              onClick={() => updateClaimStatus(order.claimCode)}
                              className="complete-button-small"
                              disabled={processingOrder === order.claimCode}
                            >
                              {processingOrder === order.claimCode ? (
                                <div className="button-spinner-small"></div>
                              ) : (
                                <CheckCircle size={14} />
                              )}
                            </button>
                          ) : (
                            <span className="completed-text">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <Package size={48} />
            </div>
            <h3>No deployments found</h3>
            <p>No deployments match your current filter criteria</p>
            <button onClick={clearFilters} className="clear-filters-button">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default StaffDashboard
