import React from "react";

const TopMenu = ({ children }) => {
  return (
    <div className="top-menu">
      <div className="auth-buttons">
        <button className="auth-btn">🛒</button>
        <button className="auth-btn" onClick={() => window.location.href = '/register'}>Sign up</button>
        <button className="auth-btn" onClick={() => window.location.href = '/login'}>Login</button>
      </div>

      {/* Internal CSS */}
      <style>{`
        .top-menu {
          display: flex;
          justify-content: flex-end;
          padding: 10px 20px;
          background-color: #f8f9fa;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .auth-buttons {
          display: flex;
          gap: 10px;
        }

        .auth-btn {
          padding: 8px 15px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-weight: 500;
          background-color: #fff;
          border: 1px solid #ccc;
        }

        .auth-btn:hover {
          background-color: #f0f0f0;
        }
      `}</style>
    </div>
  );
};

export default TopMenu;
