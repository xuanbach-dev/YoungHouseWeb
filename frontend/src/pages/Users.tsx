import React, { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { User } from '../types';
import { Users as UsersIcon, Search, Calendar } from 'lucide-react';
import './Users.css';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersAPI.getUsers();
      setUsers(response.data.users);
    } catch (err: any) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setIsSearching(true);
      const response = await usersAPI.searchUsers(searchQuery.trim());
      setUsers(response.data.users);
    } catch (err: any) {
      console.error('Error searching users:', err);
      setError('Failed to search users');
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="users-container">
        <div className="loading-spinner">Loading users...</div>
      </div>
    );
  }

  return (
    <div className="users-container">
      <div className="users-header">
        <div className="header-content">
          <UsersIcon size={28} className="header-icon" />
          <div>
            <h1>Community Members</h1>
            <p>Connect with young entrepreneurs and innovators in our community</p>
          </div>
        </div>

        <div className="search-section">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search users by name, username, or bio..."
              disabled={isSearching}
            />
            <button
              onClick={handleSearch}
              className="search-btn"
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                fetchUsers();
              }}
              className="clear-search-btn"
            >
              Clear Search
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      {users.length === 0 && !isLoading ? (
        <div className="no-users">
          <UsersIcon size={48} className="no-users-icon" />
          <h3>No users found</h3>
          <p>
            {searchQuery 
              ? `No users match your search for "${searchQuery}"`
              : 'No users in the community yet'
            }
          </p>
        </div>
      ) : (
        <>
          <div className="users-stats">
            <p>
              {searchQuery 
                ? `Found ${users.length} user${users.length !== 1 ? 's' : ''} matching "${searchQuery}"`
                : `${users.length} member${users.length !== 1 ? 's' : ''} in the community`
              }
            </p>
          </div>

          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="user-info">
                  <h3 className="user-name">{user.username}</h3>
                  
                  {user.bio && (
                    <p className="user-bio">{user.bio}</p>
                  )}
                  
                  <div className="user-meta">
                    <div className="joined-date">
                      <Calendar size={14} />
                      <span>Joined {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>

                <div className="user-actions">
                  <button 
                    className="view-profile-btn"
                    onClick={() => {
                      // TODO: Implement user profile view
                      alert('User profile view coming soon!');
                    }}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Users;