import React from "react";
import { useNavigate } from "react-router-dom";

const TopMenu = () => {
  const navigate = useNavigate();

  return (
    <div className="top-menu">
      {/* <div className="auth-buttons">
        <button className="auth-btn" onClick={() => navigate('/cart')}>
          🛒
        </button>
        <button className="auth-btn" onClick={() => navigate('/register')}>
          Sign up
        </button>
        <button className="auth-btn" onClick={() => navigate('/login')}>
          Login
        </button>
      </div> */}

      <style>{`
        
      `}</style>
    </div>
  );
};

export default TopMenu;