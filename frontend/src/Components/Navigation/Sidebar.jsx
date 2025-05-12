import React from "react";
import "../../styles/Sidebar.css";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <h1 className="logo">BookHavenuser</h1>
      <nav className="nav">
        <button className="nav-item active" onClick={() => window.location.href = '/'}>🏠 Home</button>
      </nav>
    </aside>
  );
};

export default Sidebar;
