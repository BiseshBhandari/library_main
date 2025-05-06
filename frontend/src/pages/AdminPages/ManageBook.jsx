// import React, { useState, useEffect } from "react";
// import { FaEdit, FaTrash } from "react-icons/fa";
// import axios from "axios";
// import '../../styles/ManageBook.css';

// function ManageBook() {
//     const [books, setBooks] = useState([]);
//     const [showForm, setShowForm] = useState(false);
//     const API_URL = 'http://localhost:5001';

//     const [formData, setFormData] = useState({
//         title: '',
//         author: '',
//         isbn: '',
//         genre: '',
//         description: '',
//         price: 0,
//         inventoryCount: 0,
//         isOnSale: false,
//         image: null
//     });
//     const [error, setError] = useState(null);

//     const fetchBooks = async () => {
//         try {
//             const response = await axios.get(`${API_URL}/api/Admin/Book/getAllBooks`);
//             setBooks(response.data);
//         } catch (err) {
//             setError('Failed to fetch books');
//             console.error(err);
//         }
//     };

//     // Handle form input changes
//     const handleInputChange = (e) => {
//         const { name, value, type, checked } = e.target;
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === 'checkbox' ? checked : value
//         }));
//     };

//     // Handle file input
//     const handleFileChange = (e) => {
//         setFormData(prev => ({
//             ...prev,
//             image: e.target.files[0]
//         }));
//     };

//     // Handle form submission
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const formDataToSend = new FormData();
//         Object.keys(formData).forEach(key => {
//             formDataToSend.append(key, formData[key]);
//         });

//         try {
//             await axios.post(`${API_URL}/api/Admin/Book/addBook`, formDataToSend, {
//                 headers: {
//                     'Content-Type': 'multipart/form-data'
//                 }
//             });
//             setShowForm(false);
//             setFormData({
//                 title: '',
//                 author: '',
//                 isbn: '',
//                 genre: '',
//                 description: '',
//                 price: 0,
//                 inventoryCount: 0,
//                 isOnSale: false,
//                 image: null
//             });
//             fetchBooks();
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to add book');
//             console.error(err);
//         }
//     };

//     // Initialize books on mount
//     useEffect(() => {
//         fetchBooks();
//     }, []);

//     return (
//         <div className="manage-book">
//             <div className="manage-book_header">
//                 <h1>Manage Books</h1>
//                 <button
//                     onClick={() => setShowForm(true)}
//                     className="add-button"
//                 >
//                     Add Book
//                 </button>
//             </div>

//             {/* Error Message */}
//             {error && (
//                 <div className="error">
//                     {error}
//                 </div>
//             )}

//             {/* Add Book Form */}
//             {showForm && (
//                 <div className="modal">
//                     <div className="modal-content">
//                         <h2>Add New Book</h2>
//                         <form onSubmit={handleSubmit}>
//                             <div className="form-fileds">
//                                 <div className="from_fileds_row_1">
//                                     <div className="form-group">
//                                         <label>Title</label>
//                                         <input
//                                             type="text"
//                                             name="title"
//                                             value={formData.title}
//                                             onChange={handleInputChange}
//                                             required
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Author</label>
//                                         <input
//                                             type="text"
//                                             name="author"
//                                             value={formData.author}
//                                             onChange={handleInputChange}
//                                             required
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="from_fileds_row_1">
//                                     <div className="form-group">
//                                         <label>ISBN</label>
//                                         <input
//                                             type="text"
//                                             name="isbn"
//                                             value={formData.isbn}
//                                             onChange={handleInputChange}
//                                             required
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Genre</label>
//                                         <input
//                                             type="text"
//                                             name="genre"
//                                             value={formData.genre}
//                                             onChange={handleInputChange}
//                                             required
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="from_fileds_row_1">
//                                     <div className="form-group">
//                                         <label>Price</label>
//                                         <input
//                                             type="number"
//                                             name="price"
//                                             value={formData.price}
//                                             onChange={handleInputChange}
//                                             min="0"
//                                             step="0.01"
//                                             required
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Inventory Count</label>
//                                         <input
//                                             type="number"
//                                             name="inventoryCount"
//                                             value={formData.inventoryCount}
//                                             onChange={handleInputChange}
//                                             min="0"
//                                             required
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="from_fileds_row_1">
//                                     <div className="form-group">
//                                         <label>On Sale</label>
//                                         <input
//                                             type="checkbox"
//                                             name="isOnSale"
//                                             checked={formData.isOnSale}
//                                             onChange={handleInputChange}
//                                         />
//                                     </div>
//                                     <div className="form-group">
//                                         <label>Image</label>
//                                         <input
//                                             type="file"
//                                             name="image"
//                                             accept="image/*"
//                                             onChange={handleFileChange}
//                                         />
//                                     </div>
//                                 </div>

//                                 <div className="form-group">
//                                     <label>Description</label>
//                                     <textarea
//                                         name="description"
//                                         value={formData.description}
//                                         onChange={handleInputChange}
//                                     />
//                                 </div>
//                             </div>

//                             <div className="form-actions">
//                                 <button
//                                     type="button"
//                                     onClick={() => setShowForm(false)}
//                                     className="cancel-button"
//                                 >
//                                     Cancel
//                                 </button>
//                                 <button
//                                     type="submit"
//                                     className="submit-button"
//                                 >
//                                     Add Book
//                                 </button>
//                             </div>
//                         </form>
//                     </div>
//                 </div >
//             )
//             }

//             {/* Books Table */}
//             <div className="table-container">
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Title</th>
//                             <th>Author</th>
//                             <th>ISBN</th>
//                             <th>Genre</th>
//                             <th>Price</th>
//                             <th>Inventory</th>
//                             <th>On Sale</th>
//                             <th>Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {books.map(book => (
//                             <tr key={book.id}>
//                                 <td>{book.title}</td>
//                                 <td>{book.author}</td>
//                                 <td>{book.isbn}</td>
//                                 <td>{book.genre}</td>
//                                 <td>${book.price.toFixed(2)}</td>
//                                 <td>{book.inventoryCount}</td>
//                                 <td>{book.isOnSale ? 'Yes' : 'No'}</td>
//                                 <td>
//                                     <button
//                                         className="action-button edit-button"
//                                         title="Edit"
//                                     >
//                                         <FaEdit />
//                                     </button>
//                                     <button
//                                         className="action-button delete-button"
//                                         title="Delete"
//                                     >
//                                         <FaTrash />
//                                     </button>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div >
//     );
// }

// export default ManageBook;


import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import axios from "axios";
import '../../styles/ManageBook.css';

function ManageBook() {
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentBookId, setCurrentBookId] = useState(null);
    const API_URL = 'http://localhost:5001';

    const [formData, setFormData] = useState({
        title: '',
        author: '',
        isbn: '',
        genre: '',
        description: '',
        price: 0,
        inventoryCount: 0,
        isOnSale: false,
        image: null
    });
    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Admin/Book/getAllBooks`);
            setBooks(response.data);
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        }
    };

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle file input
    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                formDataToSend.append(key, formData[key]);
            }
        });

        try {
            if (isEditing) {
                console.log('Updating book with ID:', currentBookId);
                console.log('Form data:', formDataToSend);
                await axios.put(`${API_URL}/api/Admin/Book/updateBook/${currentBookId}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                console.log(formDataToSend);
                await axios.post(`${API_URL}/api/Admin/Book/addBook`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            setShowForm(false);

            setIsEditing(false);
            setCurrentBookId(null);
            resetForm();
            fetchBooks();
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'add'} book`);
            console.error(err);
        }
    };

    // Handle edit book
    const handleEdit = (book) => {
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            genre: book.genre,
            description: book.description,
            price: book.price,
            inventoryCount: book.inventoryCount,
            isOnSale: book.isOnSale,
            image: null
        });
        setCurrentBookId(book.id);
        setIsEditing(true);
        setShowForm(true);
    };

    // Handle delete book
    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this book?')) {
            try {
                await axios.delete(`${API_URL}/api/Admin/Book/deleteBook/${id}`);
                fetchBooks();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete book');
                console.error(err);
            }
        }
    };

    // Reset form
    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            isbn: '',
            genre: '',
            description: '',
            price: 0,
            inventoryCount: 0,
            isOnSale: false,
            image: null
        });
    };

    // Handle cancel
    const handleCancel = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentBookId(null);
        resetForm();
    };

    // Initialize books on mount
    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <div className="manage-book">
            <div className="manage-book_header">
                <h1>Manage Books</h1>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        resetForm();
                        setShowForm(true);
                    }}
                    className="add-button"
                >
                    Add Book
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="error">
                    {error}
                </div>
            )}

            {/* Add/Edit Book Form */}
            {showForm && (
                <div className="modal">
                    <div className="modal-content">
                        <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-fileds">
                                <div className="from_fileds_row_1">
                                    <div className="form-group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Author</label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="from_fileds_row_1">
                                    <div className="form-group">
                                        <label>ISBN</label>
                                        <input
                                            type="text"
                                            name="isbn"
                                            value={formData.isbn}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Genre</label>
                                        <input
                                            type="text"
                                            name="genre"
                                            value={formData.genre}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="from_fileds_row_1">
                                    <div className="form-group">
                                        <label>Price</label>
                                        <input
                                            type="number"
                                            name="price"
                                            value={formData.price}
                                            onChange={handleInputChange}
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Inventory Count</label>
                                        <input
                                            type="number"
                                            name="inventoryCount"
                                            value={formData.inventoryCount}
                                            onChange={handleInputChange}
                                            min="0"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="from_fileds_row_1">
                                    <div className="form-group">
                                        <label>On Sale</label>
                                        <input
                                            type="checkbox"
                                            name="isOnSale"
                                            checked={formData.isOnSale}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Image</label>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="cancel-button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="submit-button"
                                >
                                    {isEditing ? 'Update Book' : 'Add Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Books Table */}
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Genre</th>
                            <th>Price</th>
                            <th>Inventory</th>
                            <th>On Sale</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book.id}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.isbn}</td>
                                <td>{book.genre}</td>
                                <td>${book.price.toFixed(2)}</td>
                                <td>{book.inventoryCount}</td>
                                <td>{book.isOnSale ? 'Yes' : 'No'}</td>
                                <td>
                                    <button
                                        className="action-button edit-button"
                                        title="Edit"
                                        onClick={() => handleEdit(book)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="action-button delete-button"
                                        title="Delete"
                                        onClick={() => handleDelete(book.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ManageBook;