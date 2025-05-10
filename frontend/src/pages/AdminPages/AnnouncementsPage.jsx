import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/AnnouncementsPage.css'; // Adjust the path as necessary

const AnnouncementsPage = () => {
    const [announcements, setAnnouncements] = useState([]);
    const [formData, setFormData] = useState({
        message: '',
        startDate: '',
        endDate: '',
        isActive: true,
    });
    const [editData, setEditData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(null);

    const API_BASE_URL = 'http://localhost:5001/api/announcements';

    // Fetch announcements
    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${API_BASE_URL}/get`);
            setAnnouncements(response.data.$values);
            setError(null);
        } catch (err) {
            setError('Failed to fetch announcements');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Handle edit form input changes
    const handleEditInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    // Validate form
    const validateForm = (data) => {
        if (!data.message.trim()) return 'Message is required';
        if (data.message.length > 1000) return 'Message cannot exceed 1000 characters';
        if (!data.startDate) return 'Start date and time are required';
        if (!data.endDate) return 'End date and time are required';
        if (new Date(data.endDate) <= new Date(data.startDate)) return 'End date must be after start date';
        return null;
    };

    // Create announcement
    const handleCreate = async (e) => {
        e.preventDefault();
        const validationError = validateForm(formData);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            await axios.post(`${API_BASE_URL}/create`, {
                ...formData,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
            });
            setFormData({ message: '', startDate: '', endDate: '', isActive: true });
            setShowCreateModal(false);
            fetchAnnouncements();
            setError(null);
        } catch (err) {
            setError(err.response?.data || 'Failed to create announcement');
        } finally {
            setLoading(false);
        }
    };

    // Update announcement
    const handleUpdate = async (e) => {
        e.preventDefault();
        const validationError = validateForm(editData);
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        try {
            await axios.put(`${API_BASE_URL}/updateAnnouncement/${editData.id}`, {
                ...editData,
                startDate: new Date(editData.startDate).toISOString(),
                endDate: new Date(editData.endDate).toISOString(),
            });
            setShowEditModal(false);
            fetchAnnouncements();
            setError(null);
        } catch (err) {
            setError(err.response?.data || 'Failed to update announcement');
        } finally {
            setLoading(false);
        }
    };

    // Delete announcement
    const handleDelete = async (id) => {
        setLoading(true);
        try {
            await axios.delete(`${API_BASE_URL}/delete/${id}`);
            setShowDeleteModal(null);
            fetchAnnouncements();
            setError(null);
        } catch (err) {
            setError(err.response?.data || 'Failed to delete announcement');
        } finally {
            setLoading(false);
        }
    };

    // Format datetime for input
    const formatDateTimeForInput = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toISOString().slice(0, 16);
    };

    return (
        <div className="announcement_container">
            <h1 className="announcement_title">Announcements Management</h1>

            {/* Error Message */}
            {error && (
                <div className="announcement_error">
                    {error}
                </div>
            )}

            {/* Create Button */}
            <button
                onClick={() => setShowCreateModal(true)}
                className="announcement_create_button"
            >
                Create New Announcement
            </button>

            {/* Announcements List */}
            {loading ? (
                <div className="announcement_loading">Loading...</div>
            ) : (
                <div className="announcement_list">
                    {announcements.length === 0 ? (
                        <p className="announcement_empty">No announcements found</p>
                    ) : (
                        announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className="announcement_item"
                            >
                                <div>
                                    <h3 className="announcement_item_title">{announcement.message}</h3>
                                    <p className="announcement_item_dates">
                                        {new Date(announcement.startDate).toLocaleString()} -{' '}
                                        {new Date(announcement.endDate).toLocaleString()}
                                    </p>
                                    <p className="announcement_item_status">
                                        Status: {announcement.isActive ? 'Active' : 'Inactive'}
                                    </p>
                                </div>
                                <div className="announcement_item_actions">
                                    <button
                                        onClick={() => {
                                            setEditData({
                                                ...announcement,
                                                startDate: formatDateTimeForInput(announcement.startDate),
                                                endDate: formatDateTimeForInput(announcement.endDate),
                                            });
                                            setShowEditModal(true);
                                        }}
                                        className="announcement_edit_button"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteModal(announcement.id)}
                                        className="announcement_delete_button"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Create Modal */}
            {showCreateModal && (
                <div className="announcement_modal_backdrop">
                    <div className="announcement_modal">
                        <h2 className="announcement_modal_title">Create Announcement</h2>
                        <form onSubmit={handleCreate}>
                            <div className="announcement_form_group">
                                <label className="announcement_form_label">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleInputChange}
                                    className="announcement_form_textarea"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="announcement_form_group">
                                <label className="announcement_form_label">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    className="announcement_form_input"
                                    required
                                />
                            </div>
                            <div className="announcement_form_group">
                                <label className="announcement_form_label">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    className="announcement_form_input"
                                    required
                                />
                            </div>
                            <div className="announcement_form_group">
                                <label className="announcement_form_checkbox_label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                        className="announcement_form_checkbox"
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="announcement_form_actions">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="announcement_cancel_button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="announcement_submit_button"
                                    disabled={loading}
                                >
                                    {loading ? 'Creating...' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && editData && (
                <div className="announcement_modal_backdrop">
                    <div className="announcement_modal">
                        <h2 className="announcement_modal_title">Update Announcement</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="announcement_form_group">
                                <label className="announcement_form_label">Message</label>
                                <textarea
                                    name="message"
                                    value={editData.message}
                                    onChange={handleEditInputChange}
                                    className="announcement_form_textarea"
                                    rows="4"
                                    required
                                />
                            </div>
                            <div className="announcement_form_group">
                                <label className="announcement_form_label">Start Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="startDate"
                                    value={editData.startDate}
                                    onChange={handleEditInputChange}
                                    className="announcement_form_input"
                                    required
                                />
                            </div>
                            <div className="announcement_form_group">
                                <label className="announcement_form_label">End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    name="endDate"
                                    value={editData.endDate}
                                    onChange={handleEditInputChange}
                                    className="announcement_form_input"
                                    required
                                />
                            </div>
                            <div className="announcement_form_group">
                                <label className="announcement_form_checkbox_label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={editData.isActive}
                                        onChange={handleEditInputChange}
                                        className="announcement_form_checkbox"
                                    />
                                    Active
                                </label>
                            </div>
                            <div className="announcement_form_actions">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="announcement_cancel_button"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="announcement_submit_button"
                                    disabled={loading}
                                >
                                    {loading ? 'Updating...' : 'Update'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="announcement_modal_backdrop">
                    <div className="announcement_modal announcement_modal_small">
                        <h2 className="announcement_modal_title">Confirm Delete</h2>
                        <p className="announcement_modal_text">Are you sure you want to delete this announcement?</p>
                        <div className="announcement_form_actions">
                            <button
                                onClick={() => setShowDeleteModal(null)}
                                className="announcement_cancel_button"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteModal)}
                                className="announcement_delete_button"
                                disabled={loading}
                            >
                                {loading ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnnouncementsPage;