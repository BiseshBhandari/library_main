import React, { useEffect, useState } from 'react';
import { FaBookmark as Bookmarked, FaRegBookmark as Unbookmarked, FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
// import MemberSide from '../../Components/Navigation/MemberSide';
import NavBar from '../../Components/Navigation/MemberNav';
import '../../styles/MemberLanding.css';

export default function MemberLanding() {
    const [books, setBooks] = useState([]);
    const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await fetch('http://localhost:5001/api/Admin/Book/getAllBooks');
                if (!response.ok) throw new Error(`Failed to fetch books: ${response.status}`);
                const data = await response.json();
                // Access $values if it exists, otherwise use data directly
                const bookArray = data.$values || data;
                if (!Array.isArray(bookArray)) {
                    throw new Error('Expected an array of books');
                }
                const mappedBooks = bookArray.map(book => ({
                    id: book.id,
                    title: book.title || 'Untitled',
                    author: book.author || 'Unknown Author',
                    coverUrl: book.imageUrl ? `http://localhost:5001${book.imageUrl}` : '/default-cover.jpg',
                    price: book.price || 0,
                }));
                setBooks(mappedBooks);
            } catch (error) {
                console.error('Error fetching books:', error);
                setBooks([]);
            }
        };

        const fetchBookmarkedBooks = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                if (response.status === 404) {
                    console.log('User not found or no bookmarks available');
                    setBookmarkedIds(new Set());
                    return;
                }
                if (!response.ok) throw new Error(`Failed to fetch bookmarks: ${response.status}`);
                const data = await response.json();
                // Access $values if it exists, otherwise use data directly
                const bookmarkArray = data.$values || data;
                if (!Array.isArray(bookmarkArray)) {
                    console.warn('Bookmark data is not an array, setting empty bookmarks');
                    setBookmarkedIds(new Set());
                    return;
                }
                const ids = new Set(bookmarkArray.map(item => item.bookId));
                setBookmarkedIds(ids);
            } catch (error) {
                console.error('Error fetching bookmarked books:', error);
                setBookmarkedIds(new Set());
            }
        };

        fetchBooks();
        if (userId && token) {
            fetchBookmarkedBooks();
        } else {
            console.log('No userId or token found, skipping bookmark fetch');
            setBookmarkedIds(new Set());
        }
    }, [userId, navigate, token]);

    const handleToggle = async (bookId) => {
        if (!userId || !token) {
            alert('Please log in to bookmark books.');
            navigate('/login');
            return;
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        };

        try {
            if (bookmarkedIds.has(bookId)) {
                setBookmarkedIds(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(bookId);
                    return newSet;
                });

                const response = await fetch(`http://localhost:5001/api/Whitelist/user/${userId}/book/${bookId}`, {
                    method: 'DELETE',
                    headers,
                });

                if (response.status === 404) {
                    console.log('Bookmark not found on server, already removed');
                } else if (!response.ok) {
                    setBookmarkedIds(prev => new Set(prev).add(bookId));
                    throw new Error(`Failed to remove bookmark: ${response.status}`);
                } else {
                    console.log('Bookmark removed successfully');
                }
            } else {
                setBookmarkedIds(prev => new Set(prev).add(bookId));

                const requestBody = { userId, bookId };
                const response = await fetch('http://localhost:5001/api/Whitelist/add', {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(requestBody),
                });

                if (!response.ok) {
                    setBookmarkedIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(bookId);
                        return newSet;
                    });
                    throw new Error(`Failed to add bookmark: ${response.status}`);
                } else {
                    console.log('Bookmark added successfully');
                }
            }
        } catch (error) {
            console.error('Error in handleToggle:', error.message);
            alert(`Failed to ${bookmarkedIds.has(bookId) ? 'remove' : 'add'} bookmark. Please try again.`);
        }
    };

    const handleAddToCart = async (bookId) => {
        if (!userId || !token) {
            alert('Please log in to add items to cart.');
            navigate('/login');
            return;
        }

        try {
            const response = await fetch(`http://localhost:5001/api/users/${userId}/cart/items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    bookId,
                    quantity: 1,
                }),
            });

            if (!response.ok) {
                throw new Error(`Failed to add to cart: ${response.status}`);
            }

            console.log('Item added to cart successfully');
            alert('Book added to cart!');
        } catch (error) {
            console.error('Error adding to cart:', error.message);
            alert('Failed to add book to cart. Please try again.');
        }
    };
    return (
        <div className="member_landing_container">
            {/* <MemberSide /> */}
            <div className="member_landing_main">
                <NavBar />
                <div className="member_landing_section">
                    <h2 className="member_landing_section_title">Bestsellers</h2>
                    {books.length === 0 ? (
                        <p className="member_landing_empty_message">No books available. Check the API or database.</p>
                    ) : (
                        <div className="member_landing_book_grid">
                            {books.map(book => (
                                <div key={book.id} className="member_landing_book_card">
                                    <img
                                        src={book.coverUrl}
                                        alt={book.title}
                                        className="member_landing_book_image"
                                        onError={(e) => (e.target.src = '/default-cover.jpg')}
                                    />
                                    <h3 className="member_landing_book_title">{book.title}</h3>
                                    <p className="member_landing_book_author">{book.author}</p>
                                    <p className="member_landing_book_price">${book.price.toFixed(2)}</p>
                                    <div className="member_landing_book_actions">
                                        {bookmarkedIds.has(book.id)
                                            ? <Bookmarked className="member_landing_icon member_landing_icon_bookmarked" onClick={() => handleToggle(book.id)} />
                                            : <Unbookmarked className="member_landing_icon member_landing_icon_unbookmarked" onClick={() => handleToggle(book.id)} />}
                                        <FaShoppingCart
                                            className="member_landing_icon member_landing_icon_cart"
                                            onClick={() => handleAddToCart(book.id)}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="member_landing_section">
                    <h2 className="member_landing_section_title">Authors</h2>
                    <p className="member_landing_section_subtitle">Find your favorite author</p>
                    <div className="member_landing_author_grid">
                        {['Romance', 'Thriller', 'Psychology', 'Horror', 'Novelist', 'Rock'].map((genre, index) => (
                            <div key={genre + '-' + index} className="member_landing_author_card">
                                <div className="member_landing_author_image"></div>
                                <div className="member_landing_author_name">Author Name</div>
                                <div className="member_landing_author_genre">{genre}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}