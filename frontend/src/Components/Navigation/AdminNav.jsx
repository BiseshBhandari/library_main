// import React, { useState } from 'react';
// import {
//     FaTachometerAlt,
//     FaBook,
//     FaUsers,
//     FaExchangeAlt,
//     FaChartBar,
//     FaCog,
//     FaSignOutAlt,
//     FaBars,
// } from 'react-icons/fa';
// import { Link, useLocation } from 'react-router-dom';
// import '../../styles/AdminNav.css';

// function AdminNav() {
//     const location = useLocation();
//     const currentPath = location.pathname;
//     const [isOpen, setIsOpen] = useState(true);

//     const toggleSidebar = () => setIsOpen(!isOpen);

//     return (
//         <div className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}>
//             <div className="toggle-btn" onClick={toggleSidebar}>
//                 <FaBars />
//             </div>

//             <Link to="/dashboard" className={`sidebar-item ${currentPath === '/dashboard' ? 'active' : ''}`}>
//                 <FaTachometerAlt />
//                 {isOpen && <span>Dashboard</span>}
//             </Link>
//             <Link to="/admin/manage-book" className={`sidebar-item ${currentPath === '/admin/manage-book' ? 'active' : ''}`}>
//                 <FaBook />
//                 {isOpen && <span>Books</span>}
//             </Link>
//             <Link to="/members" className={`sidebar-item ${currentPath === '/members' ? 'active' : ''}`}>
//                 <FaUsers />
//                 {isOpen && <span>Members</span>}
//             </Link>
//             <Link to="/transactions" className={`sidebar-item ${currentPath === '/transactions' ? 'active' : ''}`}>
//                 <FaExchangeAlt />
//                 {isOpen && <span>Transactions</span>}
//             </Link>
//             <Link to="/reports" className={`sidebar-item ${currentPath === '/reports' ? 'active' : ''}`}>
//                 <FaChartBar />
//                 {isOpen && <span>Reports</span>}
//             </Link>
//             <Link to="/settings" className={`sidebar-item ${currentPath === '/settings' ? 'active' : ''}`}>
//                 <FaCog />
//                 {isOpen && <span>Settings</span>}
//             </Link>
//             <Link to="/logout" className={`sidebar-item ${currentPath === '/logout' ? 'active' : ''}`}>
//                 <FaSignOutAlt />
//                 {isOpen && <span>Logout</span>}
//             </Link>
//         </div>
//     );
// }

// export default AdminNav;

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
        <div className={`admin_nav_sidebar ${isOpen ? 'admin_nav_open' : 'admin_nav_collapsed'}`}>
            <div className="admin_nav_toggle_btn" onClick={toggleSidebar}>
                <FaBars />
            </div>

            <Link to="/dashboard" className={`admin_nav_sidebar_item ${currentPath === '/dashboard' ? 'admin_nav_active' : ''}`}>
                <FaTachometerAlt />
                {isOpen && <span>Dashboard</span>}
            </Link>
            <Link to="/admin/manage-book" className={`admin_nav_sidebar_item ${currentPath === '/admin/manage-book' ? 'admin_nav_active' : ''}`}>
                <FaBook />
                {isOpen && <span>Books</span>}
            </Link>
            <Link to="/members" className={`admin_nav_sidebar_item ${currentPath === '/members' ? 'admin_nav_active' : ''}`}>
                <FaUsers />
                {isOpen && <span>Members</span>}
            </Link>
            <Link to="/transactions" className={`admin_nav_sidebar_item ${currentPath === '/transactions' ? 'admin_nav_active' : ''}`}>
                <FaExchangeAlt />
                {isOpen && <span>Transactions</span>}
            </Link>
            <Link to="/reports" className={`admin_nav_sidebar_item ${currentPath === '/reports' ? 'admin_nav_active' : ''}`}>
                <FaChartBar />
                {isOpen && <span>Reports</span>}
            </Link>
            <Link to="/settings" className={`admin_nav_sidebar_item ${currentPath === '/settings' ? 'admin_nav_active' : ''}`}>
                <FaCog />
                {isOpen && <span>Settings</span>}
            </Link>
            <Link to="/logout" className={`admin_nav_sidebar_item ${currentPath === '/logout' ? 'admin_nav_active' : ''}`}>
                <FaSignOutAlt />
                {isOpen && <span>Logout</span>}
            </Link>
        </div>
    );
}

export default AdminNav;