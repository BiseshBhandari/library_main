import React, { useState } from 'react';
import {
    FaTachometerAlt,
    FaBook,
    FaUsers,
    FaExchangeAlt,
    FaChartBar,
    FaCog,
    FaSignOutAlt,
    FaBars,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/AdminNav.css';

function AdminNav() {
    const location = useLocation();
    const currentPath = location.pathname;
    const [isOpen, setIsOpen] = useState(true);

    const toggleSidebar = () => setIsOpen(!isOpen);

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
            <div className="toggle-btn" onClick={toggleSidebar}>
                <FaBars />
            </div>

            <Link to="/dashboard" className={`sidebar-item ${currentPath === '/dashboard' ? 'active' : ''}`}>
                <FaTachometerAlt />
                {isOpen && <span>Dashboard</span>}
            </Link>
            <Link to="/admin/manage-book" className={`sidebar-item ${currentPath === '/admin/manage-book' ? 'active' : ''}`}>
                <FaBook />
                {isOpen && <span>Books</span>}
            </Link>
            <Link to="/members" className={`sidebar-item ${currentPath === '/members' ? 'active' : ''}`}>
                <FaUsers />
                {isOpen && <span>Members</span>}
            </Link>
            <Link to="/transactions" className={`sidebar-item ${currentPath === '/transactions' ? 'active' : ''}`}>
                <FaExchangeAlt />
                {isOpen && <span>Transactions</span>}
            </Link>
            <Link to="/reports" className={`sidebar-item ${currentPath === '/reports' ? 'active' : ''}`}>
                <FaChartBar />
                {isOpen && <span>Reports</span>}
            </Link>
            <Link to="/settings" className={`sidebar-item ${currentPath === '/settings' ? 'active' : ''}`}>
                <FaCog />
                {isOpen && <span>Settings</span>}
            </Link>
            <Link to="/logout" className={`sidebar-item ${currentPath === '/logout' ? 'active' : ''}`}>
                <FaSignOutAlt />
                {isOpen && <span>Logout</span>}
            </Link>
        </div>
    );
}

export default AdminNav;
