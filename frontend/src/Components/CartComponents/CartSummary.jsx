import React, { useState } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom'; // ✅ Import

export default function CartSummary({ items }) {
  const [isLoading, setIsLoading] = useState(false);
  const [orderStatus, setOrderStatus] = useState('');
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const navigate = useNavigate(); // ✅ Create navigate function

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const handlePlaceOrder = async () => {
    setIsLoading(true);
    try {
      const currentDateTime = format(new Date(), "yyyy-MM-dd HH:mm:ss");

      const orderRequest = {
        items: items.map(item => ({
          productId: item.bookId,
          quantity: item.quantity,
          price: item.price,
          name: item.title
        })),
        totalPrice: calculateSubtotal(),
        createdAt: currentDateTime,
        userId: userId
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
        throw new Error(`Failed to place order: ${response.status}`);
      }

      const orderResponse = await response.json();
      setOrderStatus(`
        Order placed successfully!
        Order ID: ${orderResponse.orderId}
        Claim Code: ${orderResponse.claimCode}
        Total: $${orderResponse.totalPrice.toFixed(2)}
        Date: ${orderResponse.createdAt}
      `);

      // Optionally clear cart here

    } catch (error) {
      setOrderStatus('Failed to place order. Please try again.');
      console.error('Order error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckoutRedirect = () => {
    navigate('/checkout'); // ✅ Redirect to checkout page
  };

  return (
    <div className="cart-summary">
      <h2>Order Summary</h2>
      <div className="summary-details">
        <div className="summary-row">
          <span>Subtotal ({items.length} items)</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="summary-row">
          <span>Shipping</span>
          <span>Free</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
      </div>

      {orderStatus && (
        <div className="order-status">
          {orderStatus.split('\n').map((line, index) => (
            <p key={index}>{line.trim()}</p>
          ))}
        </div>
      )}

      <button
        className="order-button"
        onClick={handlePlaceOrder}
        disabled={isLoading || items.length === 0}
      >
        {isLoading ? 'Processing Order...' : 'Place Order'}
      </button>

      <button
        className="checkout-button"
        onClick={handleCheckoutRedirect}
        disabled={items.length === 0}
        style={{ marginTop: '10px' }}
      >
        Go to Checkout
      </button>
    </div>
  );
}
