import React from "react";
import { Outlet } from "react-router-dom";

function StaffLayout() {
    return (
        <div className="staff-layout">
            <Outlet />
        </div>
    );
}

export default StaffLayout;