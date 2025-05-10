import React, { useState } from 'react';
import {
    FaTachometerAlt,
    FaBook,
    FaSignOutAlt,
    FaBars,
} from 'react-icons/fa';
import { MdAnnouncement } from "react-icons/md";

import { Link, useLocation } from 'react-router-dom';
import '../../styles/AdminNav.css';

function AdminNav() {
    const location = useLocation();
    const currentPath = location.pathname;
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className={`admin_nav_sidebar ${isOpen ? 'admin_nav_open' : 'admin_nav_collapsed'}`}>
            <div className="admin_nav_toggle_btn" onClick={toggleSidebar}>
                <FaBars />
            </div>

            <Link to="*" className={`admin_nav_sidebar_item ${currentPath === '*' ? 'admin_nav_active' : ''}`}>
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
            <Link to="/logout" className={`admin_nav_sidebar_item ${currentPath === '/logout' ? 'admin_nav_active' : ''}`}>
                <FaSignOutAlt />
                {isOpen && <span>Logout</span>}
            </Link>
        </div>
    );
}

export default AdminNav;