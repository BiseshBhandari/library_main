import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ManageBook from './pages/AdminPages/ManageBook';
import StaffDashboard from './pages/StaffPage/StaffDashboard';
import LandingPage from './pages/UserPage/Landingpage';
import BookDetail from './pages/UserPage/BookDetail';

import AdminLayout from './layouts/AdminLayout';
import StaffLayout from './layouts/StaffLayout';
import MemberLayout from './layouts/MemberLayout';

import Bookmark from './pages/MemberPage/Bookmark';
import CartPage from './pages/MemberPage/CartPage';
import CheckoutPage from './pages/MemberPage/CheckoutOrder';
import MemberLanding from './pages/MemberPage/MemberLanding';


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
          </Route>

          <Route path='/staff/*' element={<StaffLayout />}>
            <Route path="StaffDashboard" element={<StaffDashboard />} />
          </Route>

          <Route path='/member/*' element={<MemberLayout />}>
            <Route path="member-landing" element={<MemberLanding />} />
          </Route>

          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/bookmark" element={<Bookmark />} />



        </Routes>
      </div>
    </Router>
  );
}

export default App;
