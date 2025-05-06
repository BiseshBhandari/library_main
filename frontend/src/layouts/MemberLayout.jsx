import React from "react";
import { Outlet } from "react-router-dom";

function MemberLayout() {
    return (
        <div className="member-layout">
            <header className="member-header">
                <h1>member Dashboard</h1>
            </header>
            <nav className="member-nav">
                <ul>
                    <li><a href="/dashboard">Dashboard</a></li>
                    <li><a href="/profile">Profile</a></li>
                    <li><a href="/settings">Settings</a></li>
                </ul>
            </nav>
            <main className="member-content">
                <Outlet />
            </main>
        </div>
    );
}

export default MemberLayout;