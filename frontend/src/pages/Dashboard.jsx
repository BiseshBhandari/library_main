import React from "react";

function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");

    return (
        <div className="page-container">
            <div className="dashboard-card">
                <h2 className="dashboard-title">Dashboard</h2>
                <p>Welcome, {user ? user.fullName : "Guest"}!</p>
                <p>Your email: {user ? user.email : "N/A"}</p>
                <p>Your token: {token ? token : "N/A"}</p>
            </div>
        </div>
    );
}

export default Dashboard;