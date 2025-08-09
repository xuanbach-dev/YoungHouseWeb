import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Settings, Calendar } from 'lucide-react';
import './Profile.css';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">Please log in to view your profile</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <p>Manage your account information and preferences</p>
      </div>

      <div className="profile-content">
        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.avatar ? (
                <img src={user.avatar} alt={user.username} />
              ) : (
                <div className="avatar-placeholder">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            <button className="change-avatar-btn">
              Change Avatar
            </button>
          </div>

          <div className="profile-info">
            <div className="info-section">
              <h2>Account Information</h2>
              
              <div className="info-grid">
                <div className="info-item">
                  <label>Username</label>
                  <div className="info-value">
                    <User size={18} />
                    <span>{user.username}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label>Email</label>
                  <div className="info-value">
                    <span>{user.email}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label>Bio</label>
                  <div className="info-value">
                    <span>{user.bio || 'No bio provided yet'}</span>
                  </div>
                </div>

                <div className="info-item">
                  <label>Member Since</label>
                  <div className="info-value">
                    <Calendar size={18} />
                    <span>{formatDate(user.createdAt)}</span>
                  </div>
                </div>
              </div>

              <div className="profile-actions">
                <button 
                  className="edit-profile-btn"
                  onClick={() => {
                    alert('Profile editing functionality coming soon!');
                  }}
                >
                  <Settings size={18} />
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-stats">
          <h2>Your Activity</h2>
          
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Posts Created</h3>
                <p>View and manage your posts from the dashboard</p>
                <a href="/dashboard" className="stat-link">Go to Dashboard</a>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">❤️</div>
              <div className="stat-content">
                <h3>Community Engagement</h3>
                <p>Your likes and interactions with other posts</p>
                <span className="stat-link coming-soon">Coming Soon</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Connections</h3>
                <p>Connect with other young entrepreneurs</p>
                <a href="/users" className="stat-link">Browse Users</a>
              </div>
            </div>
          </div>
        </div>

        <div className="profile-settings">
          <h2>Account Settings</h2>
          
          <div className="settings-grid">
            <div className="setting-item">
              <div className="setting-content">
                <h3>Privacy Settings</h3>
                <p>Control who can see your profile and posts</p>
              </div>
              <button className="setting-btn" disabled>
                Configure
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-content">
                <h3>Notification Preferences</h3>
                <p>Manage email and push notifications</p>
              </div>
              <button className="setting-btn" disabled>
                Manage
              </button>
            </div>

            <div className="setting-item">
              <div className="setting-content">
                <h3>Account Security</h3>
                <p>Update password and security settings</p>
              </div>
              <button className="setting-btn" disabled>
                Update
              </button>
            </div>
          </div>

          <div className="settings-note">
            <p><strong>Note:</strong> Advanced settings and customization features are coming soon. For now, you can manage your posts and explore the community!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;