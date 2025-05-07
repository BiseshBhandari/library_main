import React, { useEffect, useState } from 'react';
// import Sidebar from '../Components/Sidebar';
// import NavBar from '../Components/Navbar';
import MemberSide from '../../Components/Navigation/MemberSide';
import NavBar from '../../Components/Navigation/MemberNav';
// import CartItem from '../Components/CartItem';
// import CartSummary from '../Components/CartSummary';
import CartItem from '../../Components/CartComponents/CartItem';
import CartSummary from '../../Components/CartComponents/CartSummary';

import '../../styles/CartPage.css'; // Adjust the path as necessary

export default function CartPage() {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const fetchCartItems = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to fetch cart: ${response.status}`);
      const data = await response.json();
      setItems(data.items.map(item => ({
        id: item.cartItemId,
        bookId: item.bookId,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
        coverUrl: item.imageUrl ? `http://localhost:5001${item.imageUrl}` : '/default-cover.jpg',
      })));
      setError('');
    } catch (err) {
      setError('Could not load cart.');
      setItems([]);
    }
  };

  useEffect(() => {
    if (!userId) {
      setError('Please log in to view your cart.');
      return;
    }
    fetchCartItems();
  }, [userId]);

  const handleIncrement = async (item) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: item.quantity + 1 }),
      });
      if (!response.ok) throw new Error(`Failed to update cart item: ${response.status}`);
      fetchCartItems();
    } catch (err) {
      setError('Failed to update cart item.');
    }
  };

  const handleDecrement = async (item) => {
    if (item.quantity <= 1) {
      handleDelete(item);
      return;
    }
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ quantity: item.quantity - 1 }),
      });
      if (!response.ok) throw new Error(`Failed to update cart item: ${response.status}`);
      fetchCartItems();
    } catch (err) {
      setError('Failed to update cart item.');
    }
  };

  const handleDelete = async (item) => {
    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items/${item.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error(`Failed to delete cart item: ${response.status}`);
      fetchCartItems();
    } catch (err) {
      setError('Failed to delete cart item.');
    }
  };

  if (error) return <div className="error">{error}</div>;

  return (
    <div className="cart-container">
      <MemberSide />
      <main className="cart-main">
        <NavBar />
        <section className="cart-content">
          <div className="cart-left">
            <h1>My Cart</h1>
            <p className="cart-subtitle">You have {items.length} items in your cart</p>
            {items.length === 0 ? (
              <p>Your cart is empty.</p>
            ) : (
              items.map(item => (
                <CartItem
                  key={item.id}
                  item={item}
                  onIncrement={() => handleIncrement(item)}
                  onDecrement={() => handleDecrement(item)}
                  onDelete={() => handleDelete(item)}
                />
              ))
            )}
          </div>
          <div className="cart-right">
            <CartSummary items={items} />
          </div>
        </section>
      </main>
    </div>
  );
}