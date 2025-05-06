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
            {/* <Route path="StaffDashboard" element={<StaffDashboard />} /> */}
          </Route>



        </Routes>
      </div>
    </Router>
  );
}

export default App;
