import React, { useState } from 'react';
import {
    FaTachometerAlt,
    FaBook,
    FaSignOutAlt,
    FaBars,
} from 'react-icons/fa';
import { MdAnnouncement } from "react-icons/md";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../styles/AdminNav.css';

function AdminNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const currentPath = location.pathname;
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        // Clear all localStorage data
        localStorage.clear();

        // Redirect to login page
        navigate('/login');
    };

    return (
        <div className={`admin_nav_sidebar ${isOpen ? 'admin_nav_open' : 'admin_nav_collapsed'}`}>
            <div className="admin_nav_toggle_btn" onClick={toggleSidebar}>
                <FaBars />
            </div>

            <Link to="/admin/admindashboard" className={`admin_nav_sidebar_item ${currentPath === '/admin/admindashboard' ? 'admin_nav_active' : ''}`}>
                <FaTachometerAlt />
                {isOpen && <span>Dashboard</span>}
            </Link>
            <Link to="/admin/manage-book" className={`admin_nav_sidebar_item ${currentPath === '/admin/manage-book' ? 'admin_nav_active' : ''}`}>
                <FaBook />
                {isOpen && <span>Books</span>}
            </Link>
            <Link to="/admin/announcements" className={`admin_nav_sidebar_item ${currentPath === '/admin/announcements' ? 'admin_nav_active' : ''}`}>
                <MdAnnouncement />
                {isOpen && <span>Banner</span>}
            </Link>
            <div
                onClick={handleLogout}
                className={`admin_nav_sidebar_item ${currentPath === '/logout' ? 'admin_nav_active' : ''}`}
                style={{ cursor: 'pointer' }}
            >
                <FaSignOutAlt />
                {isOpen && <span>Logout</span>}
            </div>
        </div>
    );
}

export default AdminNav;