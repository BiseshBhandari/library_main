import { Link } from "react-router-dom"
import { FaHome, FaSearch, FaBookmark, FaBox, FaShieldAlt } from "react-icons/fa"
import "../../styles/MemberSide.css"

export default function MemberSide() {
  return (
    <div className="superman-side-container">
      <div className="superman-side-wrapper">
        <h1 className="superman-side-logo">
          <span className="superman-logo-text">BookHaven</span>
          <FaShieldAlt className="superman-logo-icon" />
        </h1>

        <nav className="superman-side-nav">
          <Link to="/member/member-landing" className="superman-side-nav-item">
            <span className="superman-side-icon">
              <FaHome />
            </span>
            <span className="superman-side-label">Home page</span>
          </Link>
          <Link to="/bookmark" className="superman-side-nav-item">
            <span className="superman-side-icon">
              <FaBookmark />
            </span>
            <span className="superman-side-label">Saved</span>
          </Link>
        </nav>

        <div className="superman-side-divider"></div>

        <div className="superman-side-library">
          <h2 className="superman-side-section-title">Hero Profile</h2>
          <Link to="/orders" className="superman-side-nav-item">
            <span className="superman-side-icon">
              <FaBox />
            </span>
            <span className="superman-side-label">Orders</span>
          </Link>
          <Link to="/review" className="superman-side-nav-item">
            <span className="superman-side-icon">
              <FaSearch />
            </span>
            <span className="superman-side-label">Reviews</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
