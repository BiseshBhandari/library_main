import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
// import NavBar from '../Components/Navbar';
// import Sidebar from '../Components/Sidebar';
// import '../styles/CheckoutPage.css';
import MemberSide from '../../Components/Navigation/MemberSide';
import NavBar from '../../Components/Navigation/MemberNav';
import '../../styles/CheckoutPage.css'; // Adjust the path as necessary

export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [orderStatus, setOrderStatus] = useState('');
  const [cartItems, setCartItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [ordersError, setOrdersError] = useState('');

  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const currentDateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");
  const currentUser = localStorage.getItem('username') || 'LuciHav';

  // Fetch cart items
  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);

      const data = await response.json();
      setCartItems(data.items.map(item => ({
        id: item.cartItemId,
        bookId: item.bookId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        coverUrl: item.imageUrl ? `http://localhost:5001${item.imageUrl}` : '/default-cover.jpg',
      })));
      setError('');
    } catch (err) {
      setError('Could not load cart items.');
      setCartItems([]);
      console.error('Cart error:', err);
    }
  };

  // Fetch all orders
  const fetchOrders = async () => {
    setIsOrdersLoading(true);
    setOrdersError('');
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/orders`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch orders: ${response.status}`);

      const data = await response.json();
      setOrders(data);
    } catch (err) {
      setOrdersError('Could not load orders. Please try again later.');
      console.error('Could not load orders:', err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError('Please log in to checkout.');
      return;
    }
    if (!token) {
      setError('Authentication token missing. Please log in again.');
      return;
    }

    fetchCartItems();
    fetchOrders();
  }, [userId, token]);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    if (!userId || !token) {
      setError('Please log in to place an order.');
      return;
    }

    if (cartItems.length === 0) {
      setError('Cannot place an order with an empty cart.');
      return;
    }

    setIsLoading(true);
    try {
      const orderRequest = {
        items: cartItems.map(item => ({
          bookId: item.bookId,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await fetch(
        `http://localhost:5001/api/users/${userId}/orders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderRequest)
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const orderResponse = await response.json();
      setOrderStatus(`Order placed successfully! Claim Code: ${orderResponse.claimCode}`);

      setCartItems([]);
      fetchOrders();
      fetchCartItems();
    } catch (error) {
      setOrderStatus(`Failed to place order: ${error.message}`);
      console.error('Order error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      const response = await fetch(
        `http://localhost:5001/api/users/${userId}/orders/${orderId}/cancel`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      fetchOrders();
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(`Failed to cancel order: ${error.message}`);
    }
  };

  return (
    <div className="checkout-container">
      <MemberSide />
      <main className="checkout-main">
        <NavBar />
        <div className="checkout-content">
          <div className="checkout-header">
            <h1>Checkout</h1>
            <div className="user-info">
              <p>Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}</p>
              <p>Current User's Login: {currentUser}</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {/* Cart Items Section */}
          <div className="cart-section">
            <h2>Current Cart</h2>
            {cartItems.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    <img
                      src={item.coverUrl}
                      alt={item.title}
                      className="book-cover"
                      onError={(e) => {
                        e.target.src = '/default-cover.jpg';
                      }}
                    />
                    <div className="item-details">
                      <h3>{item.title}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ${(item.price || 0).toFixed(2)}</p>
                      <p>Subtotal: ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
                <div className="cart-total">
                  <h3>Total: ${calculateTotal().toFixed(2)}</h3>
                </div>
              </>
            )}

            {orderStatus && (
              <div className={`order-status ${orderStatus.includes('successfully') ? 'success' : 'error'}`}>
                {orderStatus}
              </div>
            )}

            <button
              className="place-order-button"
              onClick={handlePlaceOrder}
              disabled={isLoading || cartItems.length === 0}
            >
              {isLoading ? 'Processing...' : 'Place Order'}
            </button>
          </div>

          {/* Order History Section */}
          <div className="orders-section">
            <h2>Order History</h2>
            {isOrdersLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
              </div>
            ) : ordersError ? (
              <div className="error-message">{ordersError}</div>
            ) : orders.length === 0 ? (
              <p>No orders found.</p>
            ) : (
              <div className="orders-list">
                {orders.map((order) => (
                  <div key={order.orderId} className={`order-item ${order.status.toLowerCase()}`}>
                    <div className="order-details">
                      <p><strong>Order ID:</strong> {order.orderId}</p>
                      <p><strong>Claim Code:</strong> {order.claimCode}</p>
                      <p><strong>Total Price:</strong> ${order.totalPrice.toFixed(2)}</p>
                      <p>
                        <strong>Status:</strong>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </p>
                      <p><strong>Created At:</strong> {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm:ss")}</p>
                    </div>
                    {order.status === 'Pending' && (
                      <button
                        className="cancel-button"
                        onClick={() => handleCancelOrder(order.orderId)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}