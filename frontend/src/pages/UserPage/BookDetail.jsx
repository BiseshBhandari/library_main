// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import Sidebar from "../../Components/Navigation/Sidebar";
// // import Sidebar from "../Components/Sidebar";
// import TopMenu from "../../Components/BookComponents/Topmenu";
// // import TopMenu from "../Components/Topmenu";
// import "../../styles/BookDetail.css"; // Adjust the path as necessary

// const BookDetail = () => {
//   const { id } = useParams();
//   const [book, setBook] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [quantity, setQuantity] = useState(1);
//   const [showModal, setShowModal] = useState(false);

//   useEffect(() => {
//     const fetchBook = async () => {
//       try {
//         const response = await fetch(`http://localhost:5001/api/book/${id}`);
//         const data = await response.json();
//         setBook(data);
//         setLoading(false);
//       } catch (error) {
//         console.error("Failed to fetch book:", error);
//         setLoading(false);
//       }
//     };

//     fetchBook();
//   }, [id]);

//   const handleQuantityChange = (change) => {
//     setQuantity((prev) => Math.max(1, prev + change));
//   };

//   const totalPrice = (book?.price * quantity).toFixed(2);

//   const handleActionClick = () => {
//     // Simulate checking for login
//     setShowModal(true);
//   };

//   if (loading) return <div>Loading book details...</div>;
//   if (!book) return <div>Book not found.</div>;

//   return (
//     <div className="book-detail-container">
//       <Sidebar />
//       <div className="book-main">
//         <TopMenu />
//         <div className="book-content">
//           <div className="left-section">
//             <img
//               src={`http://localhost:5001${book.imageUrl}`}
//               alt={book.title}
//               onError={(e) => (e.target.style.display = "none")}
//             />
//           </div>

//           <div className="right-section">
//             <h1 className="title"><em>{book.title}</em></h1>
//             <p className="description">{book.description || "No description provided."}</p>
//             <p className="price">Unit Price: ${book.price}</p>

//             <div className="quantity-field">
//               <label>Quantity:</label>
//               <div className="quantity-controls">
//                 <button onClick={() => handleQuantityChange(-1)}>-</button>
//                 <input type="number" value={quantity} readOnly />
//                 <button onClick={() => handleQuantityChange(1)}>+</button>
//               </div>
//             </div>

//             <p className="total-price">Total Price: ${totalPrice}</p>

//             <div className="actions">
//               <button className="add-to-cart" onClick={handleActionClick}>Add to cart</button>
//               <span>or</span>
//               <button className="buy-now" onClick={handleActionClick}>Buy Now</button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {showModal && (
//         <div className="modal-overlay">
//           <div className="login-modal">
//             <h3>Please login to continue</h3>
//             <div className="modal-buttons">
//               <button onClick={() => window.location.href = '/login'}>Login</button>
//               <button onClick={() => setShowModal(false)}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default BookDetail;

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../Components/Navigation/Sidebar";
import TopMenu from "../../Components/BookComponents/Topmenu";
import "../../styles/BookDetail.css";

const BookDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/book/${id}`);
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Book not found");
          }
          throw new Error(`Failed to fetch book: ${response.status}`);
        }
        const data = await response.json();
        setBook(data);
        setError("");
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch book:", error);
        setError(error.message || "Could not load book details. Please try again.");
        setLoading(false);
      }
    };

    fetchBook();
  }, [id]);

  const handleQuantityChange = (change) => {
    setQuantity((prev) => {
      const newQuantity = Math.max(1, prev + change);
      if (book && newQuantity > book.inventoryCount) {
        alert(`Cannot select more than ${book.inventoryCount} items (in stock).`);
        return book.inventoryCount;
      }
      return newQuantity;
    });
  };

  const totalPrice = book ? (book.price * quantity).toFixed(2) : "0.00";

  const handleAddToCart = async () => {
    if (!userId || !token) {
      setModalMessage("Please login to add to cart.");
      setShowModal(true);
      return;
    }

    if (quantity > book.inventoryCount) {
      alert(`Cannot add more than ${book.inventoryCount} items to cart.`);
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/users/${userId}/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          BookId: book.id,
          Quantity: quantity,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add to cart: ${errorData.message || response.status}`);
      }

      alert("Book added to cart successfully!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleBuyNow = () => {
    if (!userId || !token) {
      setModalMessage("Please login to buy now.");
      setShowModal(true);
      return;
    }

    if (quantity > book.inventoryCount) {
      alert(`Cannot purchase more than ${book.inventoryCount} items.`);
      return;
    }

    // Redirect to checkout with the selected book and quantity
    navigate("/checkout", {
      state: {
        cartItems: [
          {
            bookId: book.id,
            title: book.title,
            price: book.price,
            quantity,
            coverUrl: book.imageUrl ? `http://localhost:5001${book.imageUrl}` : "/default-cover.jpg",
          },
        ],
      },
    });
  };

  if (loading) return <div className="loading">Loading book details...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="book-detail-container">
      <Sidebar />
      <div className="book-main">
        <TopMenu />
        <div className="book-content">
          <div className="left-section">
            <img
              src={book.imageUrl ? `http://localhost:5001${book.imageUrl}` : "/default-cover.jpg"}
              alt={book.title}
              onError={(e) => (e.target.src = "/default-cover.jpg")}
            />
          </div>

          <div className="right-section">
            <h1 className="title"><em>{book.title}</em></h1>
            <p className="author">By {book.author}</p>
            <p className="description">{book.description || "No description provided."}</p>
            <p className="price">Unit Price: ${book.price.toFixed(2)}</p>
            <p className="stock">In Stock: {book.inventoryCount} available</p>

            <div className="quantity-field">
              <label>Quantity:</label>
              <div className="quantity-controls">
                <button onClick={() => handleQuantityChange(-1)} disabled={quantity <= 1}>-</button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => handleQuantityChange(1)} disabled={quantity >= book.inventoryCount}>+</button>
              </div>
            </div>

            <p className="total-price">Total Price: ${totalPrice}</p>

            <div className="actions">
              <button className="add-to-cart" onClick={handleAddToCart}>Add to Cart</button>
              <span>or</span>
              <button className="buy-now" onClick={handleBuyNow}>Buy Now</button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="login-modal">
            <h3>{modalMessage}</h3>
            <div className="modal-buttons">
              <button onClick={() => navigate("/login")}>Login</button>
              <button onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookDetail;