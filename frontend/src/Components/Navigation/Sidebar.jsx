// src/Components/Sidebar.js
import React from "react";
import "../../styles/Landing.css"; // Adjust the path as necessary
// import "../styles/Landing.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h1 className="logo">BookHaven</h1>
      <nav className="nav">
        <button className="nav-item active" onClick={() => window.location.href = '/'}>🏠 Home</button>
        <button className="nav-item">🔍 Browse</button>
      </nav>
    </aside>
  );
};

export default Sidebar;
