import React from "react";
import { Navigate } from "react-router-dom";
import jwtDecode from "jwt-decode";

function ProtectedRoute({ children, allowedRoles }) {
    const token = localStorage.getItem("jwtToken");

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    let userRole = null;

    try {
        const decoded = jwtDecode(token);
        userRole = decoded.role; 
    } catch (error) {
        console.error("Invalid token:", error);
        return <Navigate to="/login" replace />;
    }

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
}

export default ProtectedRoute;
