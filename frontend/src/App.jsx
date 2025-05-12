import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageBook from './pages/AdminPages/ManageBook';
import StaffDashboard from './pages/StaffPage/StaffDashboard';
import LandingPage from './pages/UserPage/Landingpage';
import BookDetail from './pages/UserPage/BookDetail';
import AnnouncementsPage from './pages/AdminPages/AnnouncementsPage';

import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import MemberLayout from './layouts/MemberLayout';
import Review from './pages/MemberPage/Review';
import Comment from './pages/MemberPage/Comment';
import Order from './pages/MemberPage/Order';
import Bookmark from './pages/MemberPage/Bookmark';
import CartPage from './pages/MemberPage/CartPage';
import CheckoutPage from './pages/MemberPage/CheckoutOrder';
import MemberLanding from './pages/MemberPage/MemberLanding';
import AdminDashboard from './pages/AdminPages/AdminDashboard';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/book/:id" element={<BookDetail />} />
          <Route path="/" element={<LandingPage />} />

          <Route path='/admin/*' element={<AdminLayout />}>
            <Route path="manage-book" element={<ManageBook />} />
            <Route path="announcements" element={<AnnouncementsPage />} />
            <Route path="admindashboard" element={<AdminDashboard />} />
            <Route path="*" element={<AdminDashboard />} />

          </Route>

          <Route path='/staff/*' element={<StaffLayout />}>
            <Route path="StaffDashboard" element={<StaffDashboard />} />
          </Route>

          <Route path="/member/member-landing" element={<MemberLanding />} />
          <Route path="/review" element={<Review />} />
          <Route path="/comment" element={<Comment />} />
          <Route path="/orders" element={<Order />} />

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/bookmark" element={<Bookmark />} />



        </Routes>
      </div>
    </Router>
  );
}

export default App;
