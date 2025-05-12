import React from "react"
import { NavLink } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { FaShoppingCart, FaSignOutAlt, FaUserAstronaut } from "react-icons/fa"
import { Zap } from 'lucide-react'
import "../../styles/MemberNav.css"

export default function MemberNav() {
  const navigate = useNavigate()
  const username = localStorage.getItem("username") || "Hero"

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userId")
    localStorage.removeItem("user")
    localStorage.removeItem("username")
    localStorage.removeItem("pendingAction")

    navigate("/login")
  }

  return (
    <div className="superman-top-nav">
      <div className="superman-nav-brand">
        <Zap className="superman-nav-logo-icon" size={24} />
        <span className="superman-nav-title">Book Haven</span>
      </div>

      <div className="superman-nav-actions">
        <span className="superman-welcome-message">
          <FaUserAstronaut className="superman-user-icon" />
          Welcome, {username}
        </span>

        <NavLink to="/cart" className="superman-nav-cart-btn">
          <FaShoppingCart className="superman-cart-icon" />
          <span className="superman-btn-text">Cart</span>
        </NavLink>

        <button className="superman-nav-logout-btn" onClick={handleLogout}>
          <FaSignOutAlt className="superman-logout-icon" />
          <span className="superman-btn-text">Logout</span>
        </button>
      </div>
    </div>
  )
}
