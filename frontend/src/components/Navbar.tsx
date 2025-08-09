import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, Users, PlusCircle, User, LogOut, LogIn, UserPlus } from 'lucide-react';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <span className="brand-highlight">YoungHouse</span>
          </div>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">
            <span>Về YoungHouse</span>
          </Link>

          <Link to="/system-home" className="navbar-item">
            <span>Hệ thống nhà trọ</span>
          </Link>

          <Link to="/dashboard" className="navbar-item">
            <span>Lối sống hiện đại</span>
          </Link>

          <Link to="/create-post" className="navbar-item">
            <span>Sự kiện</span>
          </Link>

          <Link to="/profile" className="navbar-item">
            <span>Liên hệ</span>
          </Link>

          {user ? (
            <div className="navbar-user">
              <Link to="/profile" className="navbar-item user-profile">
                <User size={18} />
                <span>{user.username}</span>
              </Link>

              <button onClick={handleLogout} className="navbar-item logout-btn">
                <LogOut size={18} />
                <span>Đăng xuất</span>
              </button>
            </div>
          ) : (
            <div className="navbar-auth">
              <Link to="/register" className="cta-button">
                Tra Cứu Hóa Đơn
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;