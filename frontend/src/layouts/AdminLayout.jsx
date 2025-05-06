import React from "react";
import { Outlet } from "react-router-dom";
import AdminNav from "../Components/Navigation/AdminNav";
import '../styles/AdminLayout.css';

function AdminLayout() {
    return (
        <div className="admin-layout">
            <div className="admin-nav">
                <AdminNav />
            </div>
            <div className="admin-content">
                <Outlet />
            </div>
        </div>
    );
}

export default AdminLayout;
