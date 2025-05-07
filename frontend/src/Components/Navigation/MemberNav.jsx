import React from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaSignOutAlt } from 'react-icons/fa';
import "../../styles/MemberNav.css";

export default function NavBar() {
    const tabs = [
        'All Books', 'Bestsellers', 'Award Winners',
        'New releases', 'New Arrivals', 'Coming Soon', 'Deals'
    ];

    return (
        <div className="top-nav">
            <div className="tabs">
                {tabs.map(tab => (
                    <button key={tab} className="tab-button">{tab}</button>
                ))}
            </div>
            <div className="actions">
                <Link to="/cart" className="icon"><FaShoppingCart /></Link>

                <button className="logout-button">
                    <FaSignOutAlt /> <span>Log out</span>
                </button>
            </div>
        </div>
    );
}
