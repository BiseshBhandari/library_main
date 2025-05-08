// import { Link } from 'react-router-dom';
// import { FaHome, FaSearch, FaBookmark, FaBox, FaUser } from 'react-icons/fa';
// import "../../styles/MemberSide.css";

// export default function MemberSide() {
//   return (
//     <div className="sidebar">
//       <div>
//         <h1 className="logo">BookHaven</h1>
//         <nav className="nav-links">
//           <Link to="/member-landing" className="nav-item"><FaHome />Home</Link>
//           <Link to="/browse" className="nav-item"><FaSearch /><span>Browse</span></Link>
//         </nav>
//         <div className="library-links">
//           <Link to="/bookmark" className="nav-item"><FaBookmark /><span>Bookmark</span></Link>
//           <Link to="/orders" className="nav-item"><FaBox /><span>Orders</span></Link>
//           <Link to="/profile" className="nav-item"><FaUser /><span>Profile</span></Link>
//         </div>
//       </div>
//     </div>
//   );
// }

import { Link } from 'react-router-dom';
import { FaHome, FaSearch, FaBookmark, FaBox, FaUser } from 'react-icons/fa';
import "../../styles/MemberSide.css";

export default function MemberSide() {
  return (
    <div className="member_side_container">
      <div className="member_side_wrapper">
        <h1 className="member_side_logo">BookHaven</h1>

        <nav className="member_side_nav">
          <Link to="/member-landing" className="member_side_nav_item">
            <span className="member_side_icon"><FaHome /></span>
            <span className="member_side_label">Home</span>
          </Link>
          <Link to="/browse" className="member_side_nav_item">
            <span className="member_side_icon"><FaSearch /></span>
            <span className="member_side_label">Browse</span>
          </Link>
        </nav>

        <div className="member_side_library">
          <Link to="/bookmark" className="member_side_nav_item">
            <span className="member_side_icon"><FaBookmark /></span>
            <span className="member_side_label">Bookmark</span>
          </Link>
          <Link to="/orders" className="member_side_nav_item">
            <span className="member_side_icon"><FaBox /></span>
            <span className="member_side_label">Orders</span>
          </Link>
          <Link to="/profile" className="member_side_nav_item">
            <span className="member_side_icon"><FaUser /></span>
            <span className="member_side_label">Profile</span>
          </Link>
        </div>
      </div>
    </div>
  );
}