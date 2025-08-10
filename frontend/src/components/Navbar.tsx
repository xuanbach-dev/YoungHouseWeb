import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdminAuthed, setIsAdminAuthed] = useState<boolean>(false);

  useEffect(() => {
    const flag = localStorage.getItem('yh_admin_auth') === 'true';
    setIsAdminAuthed(flag);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('yh_admin_auth');
    setIsAdminAuthed(false);
    navigate('/admin-login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-logo">
            <img src="/logo.png" alt="YoungHouse" className="logo-image" />
          </div>
        </Link>

        <div className="navbar-menu">
          <Link to="/" className="navbar-item">
            <span>Trang chủ</span>
          </Link>

          <Link to="/system-home" className="navbar-item">
            <span>Hệ thống nhà trọ</span>
          </Link>

         

          <Link to="/profile" className="navbar-item">
            <span>Liên hệ</span>
          </Link>
          <div className="navbar-auth">
            {isAdminAuthed ? (
              <>
                <Link to="/admin" className="navbar-item">
                  <span>Admin</span>
                </Link>
                <button className="navbar-item" onClick={handleLogout}>
                  <span>Đăng xuất</span>
                </button>
              </>
            ) : (
              <Link to="/admin-login" className="navbar-item">
                <span>Đăng nhập Admin</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;