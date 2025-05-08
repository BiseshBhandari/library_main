// import { useState, useEffect } from 'react';
// import { useLocation } from 'react-router-dom';
// import { FaBookmark } from 'react-icons/fa';
// // import Sidebar from '../Components/Sidebar';
// // import NavBar from '../Components/Navbar';
// import MemberSide from '../../Components/Navigation/MemberSide';
// import NavBar from '../../Components/Navigation/MemberNav';
// import '../../styles/BookmarkPage.css';

// function Bookmark() {
//   const [favBooks, setFavBooks] = useState([]);
//   const userId = localStorage.getItem('userId');
//   const token = localStorage.getItem('token');
//   const location = useLocation();

//   useEffect(() => {
//     const fetchBookmarkedBooks = async () => {
//       if (!userId) {
//         console.log('No userId found in localStorage');
//         setFavBooks([]);
//         return;
//       }
//       try {
//         const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}`, {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//           },
//         });
//         if (response.status === 404) {
//           console.log('User not found or no bookmarks available');
//           setFavBooks([]);
//           return;
//         }
//         if (!response.ok) throw new Error(`Failed to fetch bookmarks: ${response.status}`);
//         const data = await response.json();
//         const bookmarkedBooks = data.map(item => ({
//           id: item.bookId,
//           title: item.bookTitle,
//           author: item.bookAuthor,
//           imageUrl: item.bookImageUrl,
//         }));
//         setFavBooks(bookmarkedBooks);
//       } catch (error) {
//         console.error('Error fetching bookmarked books:', error);
//         setFavBooks([]);
//       }
//     };
//     fetchBookmarkedBooks();
//   }, [userId, token, location.pathname]);

//   const handleRemove = async (bookId) => {
//     if (!userId) {
//       alert('Please log in to remove bookmarks.');
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}/book/${bookId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });
//       if (response.status === 204) {
//         setFavBooks(prev => prev.filter(book => book.id !== bookId));
//         console.log('Bookmark removed successfully');
//       } else if (response.status === 404) {
//         console.log('Bookmark not found on server, syncing local state');
//         setFavBooks(prev => prev.filter(book => book.id !== bookId));
//       } else {
//         throw new Error(`Failed to remove bookmark: ${response.status}`);
//       }
//     } catch (error) {
//       console.error('Error removing bookmark:', error.message);
//       alert('Failed to remove bookmark. Please try again.');
//     }
//   };

//   return (
//     <div className="bookmark-container">
//       <MemberSide />
//       <main className="bookmark-main">
//         <NavBar />
//         <section className="bookmark-content">
//           <h1>Your Bookmarks</h1>
//           {favBooks.length === 0 ? (
//             <p>No bookmarks available</p>
//           ) : (
//             favBooks.map(book => (
//               <div key={book.id} className="bookmark-item">
//                 <img
//                   src={book.imageUrl ? `http://localhost:5001${book.imageUrl}` : '/default-cover.jpg'}
//                   alt={book.title || 'Untitled'}
//                   className="bookmark-image"
//                 />
//                 <div className="bookmark-details">
//                   <h3>{book.title || 'Untitled'}</h3>
//                   <p>by {book.author || 'Unknown Author'}</p>
//                   <button
//                     onClick={() => handleRemove(book.id)}
//                     className="remove-button"
//                   >
//                     <FaBookmark /> Remove
//                   </button>
//                 </div>
//               </div>
//             ))
//           )}
//         </section>
//       </main>
//     </div>
//   );
// }

// export default Bookmark;

import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FaBookmark } from 'react-icons/fa';
import MemberSide from '../../Components/Navigation/MemberSide';
import NavBar from '../../Components/Navigation/MemberNav';
import '../../styles/BookmarkPage.css';

function Bookmark() {
  const [favBooks, setFavBooks] = useState([]);
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  const location = useLocation();

  useEffect(() => {
    const fetchBookmarkedBooks = async () => {
      if (!userId || !token) {
        console.log('No userId or token found in localStorage');
        setFavBooks([]);
        return;
      }
      try {
        const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        if (response.status === 404) {
          console.log('User not found or no bookmarks available');
          setFavBooks([]);
          return;
        }
        if (!response.ok) throw new Error(`Failed to fetch bookmarks: ${response.status}`);
        const data = await response.json();
        // Access $values if it exists, otherwise use data directly
        const bookmarkArray = data.$values || data;
        if (!Array.isArray(bookmarkArray)) {
          console.warn('Bookmark data is not an array, setting empty bookmarks');
          setFavBooks([]);
          return;
        }
        const bookmarkedBooks = bookmarkArray.map(item => ({
          id: item.bookId,
          title: item.bookTitle,
          author: item.bookAuthor,
          imageUrl: item.bookImageUrl,
        }));
        setFavBooks(bookmarkedBooks);
      } catch (error) {
        console.error('Error fetching bookmarked books:', error);
        setFavBooks([]);
      }
    };
    fetchBookmarkedBooks();
  }, [userId, token, location.pathname]);

  const handleRemove = async (bookId) => {
    if (!userId || !token) {
      alert('Please log in to remove bookmarks.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}/book/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      if (response.status === 204) {
        setFavBooks(prev => prev.filter(book => book.id !== bookId));
        console.log('Bookmark removed successfully');
      } else if (response.status === 404) {
        console.log('Bookmark not found on server, syncing local state');
        setFavBooks(prev => prev.filter(book => book.id !== bookId));
      } else {
        throw new Error(`Failed to remove bookmark: ${response.status}`);
      }
    } catch (error) {
      console.error('Error removing bookmark:', error.message);
      alert('Failed to remove bookmark. Please try again.');
    }
  };

  return (
    <div className="bookmark-container">
      <MemberSide />
      <main className="bookmark-main">
        <NavBar />
        <section className="bookmark-content">
          <h1>Your Bookmarks</h1>
          {favBooks.length === 0 ? (
            <p>No bookmarks available</p>
          ) : (
            favBooks.map(book => (
              <div key={book.id} className="bookmark-item">
                <img
                  src={book.imageUrl ? `http://localhost:5001${book.imageUrl}` : '/default-cover.jpg'}
                  alt={book.title || 'Untitled'}
                  className="bookmark-image"
                />
                <div className="bookmark-details">
                  <h3>{book.title || 'Untitled'}</h3>
                  <p>by {book.author || 'Unknown Author'}</p>
                  <button
                    onClick={() => handleRemove(book.id)}
                    className="remove-button"
                  >
                    <FaBookmark /> Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Bookmark;