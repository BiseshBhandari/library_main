import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/StaffDashboard.css'; // Adjust the path as necessary 

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

function StaffDashboard() {
  const [claimCode, setClaimCode] = useState('');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updateMessage, setUpdateMessage] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/staff/getAllOrders`);
      const data = await response.json();
      setOrders(data);
      applyFilters(data);
    } catch (err) {
      setError('Failed to fetch orders: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (ordersToFilter = orders) => {
    let filtered = [...ordersToFilter];

    // Apply claim code filter
    if (claimCode.trim()) {
      filtered = filtered.filter(order =>
        order.claimCode.toLowerCase().includes(claimCode.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status.toLowerCase() === statusFilter);
    }

    // Apply date range filter
    if (dateRange.start) {
      filtered = filtered.filter(order =>
        new Date(order.createdAt) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(order =>
        new Date(order.createdAt) <= new Date(dateRange.end)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredOrders(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [claimCode, statusFilter, dateRange, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const updateClaimStatus = async (orderClaimCode) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/staff/updateClaimStatus/${orderClaimCode}`, {
        method: 'PUT'
      });

      if (!response.ok) throw new Error('Failed to update status');

      setUpdateMessage(`Order ${orderClaimCode} marked as complete`);
      await fetchAllOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setClaimCode('');
    setStatusFilter('all');
    setDateRange({ start: '', end: '' });
    setSortConfig({ key: 'createdAt', direction: 'desc' });
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'complete': '#10b981',
      'pending': '#f59e0b',
      'processing': '#3b82f6',
      'cancelled': '#ef4444'
    };
    return statusColors[status.toLowerCase()] || '#6b7280';
  };

  const calculateTotalRevenue = (orders) => {
    return orders.reduce((total, order) => total + order.total, 0).toFixed(2);
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="auth-title">Staff Dashboard</h1>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-label">Total Orders</span>
              <span className="stat-value">{filteredOrders.length}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Revenue</span>
              <span className="stat-value">${calculateTotalRevenue(filteredOrders)}</span>
            </div>
          </div>
        </div>
        <button className="logout-button" onClick={() => {
          if (window.confirm('Are you sure you want to logout?')) {
            navigate('/login');
          }
        }}>
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="filters-section">
          <div className="filters-header">
            <h2>Filters</h2>
            <button onClick={clearFilters} className="clear-filters-button">
              Clear All Filters
            </button>
          </div>

          <div className="filters-grid">
            <div className="filter-group">
              <label>Claim Code</label>
              <input
                type="text"
                value={claimCode}
                onChange={(e) => setClaimCode(e.target.value)}
                placeholder="Search claim code..."
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label>Status</label>
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

            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-range-inputs">
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="filter-input"
                />
                <span>to</span>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="filter-input"
                />
              </div>
            </div>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {updateMessage && <div className="success-message">{updateMessage}</div>}

        {loading ? (
          <div className="spinner" />
        ) : filteredOrders.length > 0 ? (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-id">Order #{order.id}</div>
                  <div
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {order.status}
                  </div>
                </div>

                <div className="order-card-content">
                  <div className="order-info">
                    <div className="info-row">
                      <span className="info-label">Claim Code:</span>
                      <span className="info-value">{order.claimCode}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">User ID:</span>
                      <span className="info-value">{order.userId}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Total:</span>
                      <span className="info-value price">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Created:</span>
                      <span className="info-value">
                        {new Date(order.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="order-items-section">
                    <h4>Order Items ({order.items.length})</h4>
                    <div className="items-table-container">
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Book Title</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map(item => (
                            <tr key={item.id}>
                              <td>{item.book.title}</td>
                              <td>{item.quantity}</td>
                              <td>${item.unitPrice.toFixed(2)}</td>
                              <td>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {order.status !== 'Complete' && (
                    <button
                      onClick={() => updateClaimStatus(order.claimCode)}
                      className="complete-button"
                    >
                      Mark as Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No orders found matching your filters</p>
            <button onClick={clearFilters} className="clear-filters-button">
              Clear All Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffDashboard;