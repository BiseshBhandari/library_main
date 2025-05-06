import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Sidebar from "../../Components/Navigation/Sidebar";
// import Sidebar from "../Components/Sidebar";
import TopMenu from "../../Components/BookComponents/Topmenu";
// import TopMenu from "../Components/Topmenu";
import "../../styles/BookDetail.css"; // Adjust the path as necessary

const BookDetail = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/book/${id}`);
        const data = await response.json();
        setBook(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch book:", error);
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => Math.max(1, prev + change));
  };

  const totalPrice = (book?.price * quantity).toFixed(2);

  const handleActionClick = () => {
    // Simulate checking for login
    setShowModal(true);
  };

  if (loading) return <div>Loading book details...</div>;
  if (!book) return <div>Book not found.</div>;

  return (
    <div className="book-detail-container">
      <Sidebar />
      <div className="book-main">
        <TopMenu />
        <div className="book-content">
          <div className="left-section">
            <img
              src={`http://localhost:5001${book.imageUrl}`}
              alt={book.title}
              onError={(e) => (e.target.style.display = "none")}
            />
          </div>

          <div className="right-section">
            <h1 className="title"><em>{book.title}</em></h1>
            <p className="description">{book.description || "No description provided."}</p>
            <p className="price">Unit Price: ${book.price}</p>

            <div className="quantity-field">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => handleQuantityChange(-1)}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange(1)}>+</button>
              </div>
            </div>

            <p className="total-price">Total Price: ${totalPrice}</p>

            <div className="actions">
              <button className="add-to-cart" onClick={handleActionClick}>Add to cart</button>
              <span>or</span>
              <button className="buy-now" onClick={handleActionClick}>Buy Now</button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h3>Please login to continue</h3>
            <div className="modal-buttons">
              <button onClick={() => window.location.href = '/login'}>Login</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;
