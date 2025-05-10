import React, { useState, useEffect } from "react";
import { FaEdit, FaTrash, FaPercent, FaTimes } from "react-icons/fa";
import axios from "axios";
import '../../styles/ManageBook.css';

function ManageBook() {
    const [books, setBooks] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [showDiscountForm, setShowDiscountForm] = useState(false);
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
        image: null
    });

    const [discountFormData, setDiscountFormData] = useState({
        bookId: null,
        discountPercentage: 0,
        discountStart: '',
        discountEnd: ''
    });

    const [error, setError] = useState(null);

    const fetchBooks = async () => {
        try {
            const response = await axios.get(`${API_URL}/api/Admin/Book/getAllBooks`);
            setBooks(response.data.$values || []);
        } catch (err) {
            setError('Failed to fetch books');
            console.error(err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleDiscountInputChange = (e) => {
        const { name, value } = e.target;
        setDiscountFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            image: e.target.files[0]
        }));
    };

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
                await axios.put(`${API_URL}/api/Admin/Book/updateBook/${currentBookId}`, formDataToSend, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
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

    const handleDiscountSubmit = async (e) => {
        e.preventDefault();
        if (new Date(discountFormData.discountEnd) <= new Date(discountFormData.discountStart)) {
            setError('Discount end time must be after start time');
            return;
        }
        try {
            await axios.post(`${API_URL}/api/discount/add`, discountFormData);
            setShowDiscountForm(false);
            resetDiscountForm();
            fetchBooks();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add discount');
            console.error(err);
        }
    };

    const handleRemoveDiscount = async (bookId) => {
        if (window.confirm('Are you sure you want to remove the discount for this book?')) {
            try {
                await axios.post(`${API_URL}/api/discount/remove`, { bookId });
                fetchBooks();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to remove discount');
                console.error(err);
            }
        }
    };

    const handleEdit = (book) => {
        setFormData({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            genre: book.genre,
            description: book.description,
            price: book.price,
            inventoryCount: book.inventoryCount,
            image: null
        });
        setCurrentBookId(book.id);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleAddDiscount = (book) => {
        setDiscountFormData({
            bookId: book.id,
            discountPercentage: 0,
            discountStart: '',
            discountEnd: ''
        });
        setShowDiscountForm(true);
    };

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

    const resetForm = () => {
        setFormData({
            title: '',
            author: '',
            isbn: '',
            genre: '',
            description: '',
            price: 0,
            inventoryCount: 0,
            image: null
        });
    };

    const resetDiscountForm = () => {
        setDiscountFormData({
            bookId: null,
            discountPercentage: 0,
            discountStart: '',
            discountEnd: ''
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setIsEditing(false);
        setCurrentBookId(null);
        resetForm();
    };

    const handleDiscountCancel = () => {
        setShowDiscountForm(false);
        resetDiscountForm();
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    useEffect(() => {
        fetchBooks();
    }, []);

    return (
        <div className="manage_book_container">
            <div className="manage_book_header">
                <h1>Manage Books</h1>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        resetForm();
                        setShowForm(true);
                    }}
                    className="manage_book_add_button"
                >
                    Add Book
                </button>
            </div>

            {error && (
                <div className="manage_book_error">
                    {error}
                </div>
            )}

            {showForm && (
                <div className="manage_book_modal">
                    <div className="manage_book_modal_content">
                        <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="manage_book_form_fields">
                                <div className="manage_book_form_fields_row">
                                    <div className="manage_book_form_group">
                                        <label>Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="manage_book_form_group">
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

                                <div className="manage_book_form_fields_row">
                                    <div className="manage_book_form_group">
                                        <label>ISBN</label>
                                        <input
                                            type="text"
                                            name="isbn"
                                            value={formData.isbn}
                                            onChange={handleInputChange}
                                            required
                                        />
                                    </div>
                                    <div className="manage_book_form_group">
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

                                <div className="manage_book_form_fields_row">
                                    <div className="manage_book_form_group">
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
                                    <div className="manage_book_form_group">
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

                                <div className="manage_book_form_fields_row">
                                    {/* <div className="manage_book_form_group">
                                        <label>On Sale</label>
                                        <input
                                            type="checkbox"
                                            name="isOnSale"
                                            checked={formData.isOnSale}
                                            onChange={handleInputChange}
                                        />
                                    </div> */}
                                    <div className="manage_book_form_group">
                                        <label>Image</label>
                                        <input
                                            type="file"
                                            name="image"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </div>
                                </div>

                                <div className="manage_book_form_group">
                                    <label>Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="manage_book_form_actions">
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="manage_book_cancel_button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="manage_book_submit_button"
                                >
                                    {isEditing ? 'Update Book' : 'Add Book'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showDiscountForm && (
                <div className="manage_book_modal">
                    <div className="manage_book_modal_content">
                        <h2>Add Discount</h2>
                        <form onSubmit={handleDiscountSubmit}>
                            <div className="manage_book_form_fields">
                                <div className="manage_book_form_group">
                                    <label>Discount Percentage (%)</label>
                                    <input
                                        type="number"
                                        name="discountPercentage"
                                        value={discountFormData.discountPercentage}
                                        onChange={handleDiscountInputChange}
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        required
                                    />
                                </div>
                                <div className="manage_book_form_group">
                                    <label>Discount Start</label>
                                    <input
                                        type="datetime-local"
                                        name="discountStart"
                                        value={discountFormData.discountStart}
                                        onChange={handleDiscountInputChange}
                                        required
                                    />
                                </div>
                                <div className="manage_book_form_group">
                                    <label>Discount End</label>
                                    <input
                                        type="datetime-local"
                                        name="discountEnd"
                                        value={discountFormData.discountEnd}
                                        onChange={handleDiscountInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="manage_book_form_actions">
                                <button
                                    type="button"
                                    onClick={handleDiscountCancel}
                                    className="manage_book_cancel_button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="manage_book_submit_button"
                                >
                                    Add Discount
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="manage_book_table_container">
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
                            <th>Discount %</th>
                            <th>Discount Start</th>
                            <th>Discount End</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {books.map(book => (
                            <tr key={book.id} className={book.isOnSale ? 'manage_book_on_sale' : ''}>
                                <td>{book.title}</td>
                                <td>{book.author}</td>
                                <td>{book.isbn}</td>
                                <td>{book.genre}</td>
                                <td>${book.price.toFixed(2)}</td>
                                <td>{book.inventoryCount}</td>
                                <td>{book.isOnSale ? 'Yes' : 'No'}</td>
                                <td>{book.discountPercentage ? `${book.discountPercentage}%` : '-'}</td>
                                <td>{formatDate(book.discountStart)}</td>
                                <td>{formatDate(book.discountEnd)}</td>
                                <td>
                                    <button
                                        className="manage_book_action_button manage_book_edit_button"
                                        title="Edit"
                                        onClick={() => handleEdit(book)}
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        className="manage_book_action_button manage_book_delete_button"
                                        title="Delete"
                                        onClick={() => handleDelete(book.id)}
                                    >
                                        <FaTrash />
                                    </button>
                                    {book.isOnSale ? (
                                        <button
                                            className="manage_book_action_button manage_book_remove_discount_button"
                                            title="Remove Discount"
                                            onClick={() => handleRemoveDiscount(book.id)}
                                        >
                                            <FaTimes />
                                        </button>
                                    ) : (
                                        <button
                                            className="manage_book_action_button manage_book_add_discount_button"
                                            title="Add Discount"
                                            onClick={() => handleAddDiscount(book)}
                                        >
                                            <FaPercent />
                                        </button>
                                    )}
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