import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const BookCard = ({ title, rating, imageUrl, id }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const navigate = useNavigate();

  const handleAction = (type) => {
    const isLoggedIn = localStorage.getItem("userToken");
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    console.log(`Added "${title}" to ${type}`);
    // Add wishlist/cart logic here
  };

  const redirectToDetailPage = () => {
    navigate(`/book/${id}`);
  };

  return (
    <>
      <div className="book-card">
        {/* Book Image - Only this triggers detail navigation */}
        <div className="book-image-box" onClick={redirectToDetailPage}>
          <img
            src={`http://localhost:5001${imageUrl}`}
            alt={title}
            className="book-image"
            onError={(e) => (e.target.style.display = "none")}
          />
        </div>

        {/* Title and Footer */}
        <div className="book-title">{title}</div>
        <div className="book-footer">
          <div className="rating">
            {"★".repeat(Math.floor(rating))}{"☆".repeat(5 - Math.floor(rating))}
          </div>
          <div className="icons">
            <span
              className="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleAction("wishlist");
              }}
            >
              ♥
            </span>
            <span
              className="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleAction("cart");
              }}
            >
              🛒
            </span>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Please log in first</h3>
            <p>You need to be logged in to add books to your wishlist or cart.</p>
            <button onClick={() => window.location.href = "/login"} className="modal-btn">Login</button>
            <button onClick={() => setShowLoginModal(false)} className="modal-btn cancel">Cancel</button>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        .book-card {
          width: 180px;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          padding: 10px;
          text-align: center;
          transition: transform 0.2s ease;
          cursor: default;
        }

        .book-card:hover {
          transform: translateY(-4px);
        }

        .book-image-box {
          height: 150px;
          background-color: #f2f2f2;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 8px;
          margin-bottom: 10px;
          cursor: pointer;
        }

        .book-image {
          max-height: 100%;
          max-width: 100%;
          object-fit: contain;
          border-radius: 6px;
        }

        .book-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 8px;
        }

        .book-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .rating {
          color: gold;
          font-size: 14px;
        }

        .icons {
          display: flex;
          gap: 10px;
        }

        .icon {
          cursor: pointer;
          font-size: 16px;
          transition: transform 0.2s;
        }

        .icon:hover {
          transform: scale(1.2);
        }

        .modal-backdrop {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .modal-content {
          background: #fff;
          padding: 20px 30px;
          border-radius: 8px;
          text-align: center;
          max-width: 300px;
        }

        .modal-btn {
          margin: 10px 5px 0;
          padding: 8px 16px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: #007bff;
          color: #fff;
        }

        .modal-btn.cancel {
          background-color: #aaa;
        }

        .modal-btn:hover {
          opacity: 0.9;
        }
      `}</style>
    </>
  );
};

export default BookCard;
