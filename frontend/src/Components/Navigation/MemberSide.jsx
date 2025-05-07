import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaBookmark, FaBox, FaUser } from 'react-icons/fa';
import "../../styles/MemberSide.css";

export default function MemberSide() {
  return (
    <div className="sidebar">
      <div>
        <h1 className="logo">BookHaven</h1>
        <nav className="nav-links">
          <Link to="/member-landing" className="nav-item"><FaHome />Home</Link>
          <Link to="/browse" className="nav-item"><FaSearch /><span>Browse</span></Link>
        </nav>
        <div className="library-links">
          <Link to="/bookmark" className="nav-item"><FaBookmark /><span>Bookmark</span></Link>
          <Link to="/orders" className="nav-item"><FaBox /><span>Orders</span></Link>
          <Link to="/profile" className="nav-item"><FaUser /><span>Profile</span></Link>
        </div>
      </div>
    </div>
  );
}