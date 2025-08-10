import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { postsAPI, branchesAPI } from '../services/api';
import ViewingAppointmentManager from '../components/ViewingAppointmentManager';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

interface DashboardStats {
  totalUsers: number;
  totalPosts: number;
  totalBranches: number;
  totalRooms: number;
  availableRooms: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalPosts: 0,
    totalBranches: 0,
    totalRooms: 0,
    availableRooms: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleLogout = () => {
    localStorage.removeItem('yh_admin_auth');
    navigate('/admin-login', { replace: true });
  };

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch basic stats
      setStats({
        totalUsers: 0,
        totalPosts: 0,
        totalBranches: 0,
        totalRooms: 0,
        availableRooms: 0
      });
    } catch (err: any) {
      console.error('Failed to fetch dashboard stats:', err);
      setError('Không thể tải thống kê dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const tabs = [
    { id: 'overview', label: 'Tổng Quan', icon: 'fas fa-chart-bar' },
    { id: 'branches', label: 'Quản Lý Chi Nhánh', icon: 'fas fa-building' },
    { id: 'users', label: 'Quản Lý Users', icon: 'fas fa-users' },
    { id: 'appointments', label: 'Lịch Hẹn Xem Phòng', icon: 'fas fa-calendar' },
    { id: 'settings', label: 'Cài Đặt', icon: 'fas fa-cog' }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Đang tải dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>
            <i className="fas fa-tachometer-alt"></i>
            Dashboard Admin
          </h1>
          <p>Chào mừng trở lại, Admin!</p>
        </div>
        <div className="header-actions">
          <Link to="/profile" className="profile-link">
            <i className="fas fa-user-circle"></i>
            Profile
          </Link>
          <button onClick={handleLogout} className="btn-primary" style={{ marginLeft: 12 }}>
            <i className="fas fa-sign-out-alt"></i>
            Đăng xuất
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
          <button onClick={() => setError(null)} className="error-close">×</button>
        </div>
      )}

      <div className="dashboard-nav">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="stats-grid">
              <div className="stat-card users">
                <div className="stat-icon">
                  <i className="fas fa-users"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalUsers}</h3>
                  <p>Tổng Users</p>
                </div>
              </div>

              <div className="stat-card posts">
                <div className="stat-icon">
                  <i className="fas fa-file-alt"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalPosts}</h3>
                  <p>Tổng Bài Viết</p>
                </div>
              </div>

              <div className="stat-card branches">
                <div className="stat-icon">
                  <i className="fas fa-building"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalBranches}</h3>
                  <p>Chi Nhánh</p>
                </div>
              </div>

              <div className="stat-card rooms">
                <div className="stat-icon">
                  <i className="fas fa-door-open"></i>
                </div>
                <div className="stat-content">
                  <h3>{stats.totalRooms}</h3>
                  <p>Tổng Phòng</p>
                </div>
              </div>
            </div>

            <div className="welcome-message">
              <h2>🏠 Chào mừng đến với Admin Dashboard!</h2>
              <p>Bạn đã đăng nhập thành công với quyền Admin. Từ đây bạn có thể:</p>
              <ul>
                <li>✅ Quản lý chi nhánh nhà trọ</li>
                <li>✅ Theo dõi thống kê hệ thống</li>
                <li>✅ Quản lý người dùng</li>
                <li>✅ Cấu hình hệ thống</li>
              </ul>
              
              <div className="quick-actions">
                <Link to="/users" className="action-btn">
                  <i className="fas fa-users"></i>
                  Quản lý Users
                </Link>
                <Link to="/create-post" className="action-btn">
                  <i className="fas fa-plus"></i>
                  Tạo bài viết
                </Link>
                <Link to="/dashboard" className="action-btn">
                  <i className="fas fa-chart-line"></i>
                  Dashboard Posts
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'branches' && (
          <div className="branches-tab">
            <div className="tab-header">
              <h2>
                <i className="fas fa-building"></i>
                Quản Lý Chi Nhánh
              </h2>
            </div>
            <div className="coming-soon">
              <i className="fas fa-building"></i>
              <h3>Quản Lý Chi Nhánh</h3>
              <p>Tính năng quản lý chi nhánh sẽ được cập nhật trong phiên bản tới.</p>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="appointments-tab">
            <div className="tab-header">
              <h2>
                <i className="fas fa-calendar"></i>
                Quản Lý Lịch Hẹn Xem Phòng
              </h2>
            </div>
            <ViewingAppointmentManager />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="users-tab">
            <div className="tab-header">
              <h2>
                <i className="fas fa-users"></i>
                Quản Lý Users
              </h2>
              <Link to="/users" className="btn-primary">
                <i className="fas fa-external-link-alt"></i>
                Xem Chi Tiết
              </Link>
            </div>
            <div className="coming-soon">
              <i className="fas fa-users"></i>
              <h3>Quản Lý Users</h3>
              <p>Truy cập trang Users để quản lý người dùng hệ thống.</p>
              <Link to="/users" className="btn-primary">
                <i className="fas fa-arrow-right"></i>
                Đi Tới Trang Users
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="settings-tab">
            <div className="tab-header">
              <h2>
                <i className="fas fa-cog"></i>
                Cài Đặt Hệ Thống
              </h2>
            </div>
            <div className="settings-grid">
              <div className="setting-card">
                <div className="setting-icon">
                  <i className="fas fa-database"></i>
                </div>
                <div className="setting-content">
                  <h3>Database</h3>
                  <p>Cấu hình kết nối database</p>
                  <span className="status connected">Đã kết nối</span>
                </div>
              </div>

              <div className="setting-card">
                <div className="setting-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <div className="setting-content">
                  <h3>Bảo Mật</h3>
                  <p>Cài đặt JWT và authentication</p>
                  <span className="status active">Hoạt động</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;