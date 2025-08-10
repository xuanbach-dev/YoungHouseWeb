import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Users as UsersIcon, Search, Calendar, Trash2, Shield, ShieldCheck } from 'lucide-react';
import './Users.css';

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  
  // Mock users data since auth system is removed
  const mockUsers: User[] = [
    {
      id: 1,
      username: 'admin',
      email: 'admin@younghouse.com',
      fullName: 'Administrator',
      role: 'admin',
      roleId: 1,
      roleName: 'Admin',
      created_at: '2024-01-01T00:00:00Z',
      bio: 'System Administrator'
    },
    {
      id: 2,
      username: 'guest',
      email: 'guest@younghouse.com',
      fullName: 'Guest User',
      role: 'user',
      roleId: 2,
      roleName: 'User',
      created_at: '2024-01-15T00:00:00Z',
      bio: 'Welcome guest!'
    }
  ];

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setUsers(mockUsers);
    } catch (err: any) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      // Mock roles data
      setRoles([
        { id: 1, name: 'Admin', description: 'Administrator' },
        { id: 2, name: 'User', description: 'Regular User' }
      ]);
    } catch (err: any) {
      console.error('Error fetching roles:', err);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setIsSearching(true);
      // Filter mock users by search query
      const filtered = mockUsers.filter(user => 
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setUsers(filtered);
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

  const handleRoleChange = async (userId: number, newRoleId: number) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsers(users.map(user => 
        user.id === userId 
          ? { 
              ...user, 
              roleId: newRoleId, 
              roleName: roles.find(r => r.id === newRoleId)?.name || user.roleName || 'User' 
            }
          : user
      ));
    } catch (err: any) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      setUsers(users.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user');
    }
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
            <h1>Quản lý người dùng</h1>
            <p>Quản lý người dùng và phân quyền trong hệ thống</p>
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
                  {user.fullName && (
                    <p className="user-full-name">{user.fullName}</p>
                  )}
                  <p className="user-email">{user.email}</p>
                  
                  <div className="user-meta">
                    <div className="user-role">
                      {(user.roleId || (user.role === 'admin' ? 1 : 2)) === 1 ? (
                        <ShieldCheck size={14} color="#10b981" />
                      ) : (
                        <Shield size={14} color="#6b7280" />
                      )}
                      <span className={`role-badge role-${user.roleId || (user.role === 'admin' ? 1 : 2)}`}>
                        {user.roleName || (user.role === 'admin' ? 'Admin' : 'User')}
                      </span>
                    </div>
                    <div className="joined-date">
                      <Calendar size={14} />
                      <span>Tham gia {formatDate(user.createdAt || user.created_at)}</span>
                    </div>
                  </div>
                </div>

                <div className="user-actions">
                  <div className="role-selector">
                    <label htmlFor={`role-${user.id}`}>Vai trò:</label>
                    <select
                      id={`role-${user.id}`}
                      value={user.roleId || (user.role === 'admin' ? 1 : 2)}
                      onChange={(e) => handleRoleChange(user.id, parseInt(e.target.value))}
                      disabled={user.id === 1} // Disable for admin user
                    >
                      {roles.map(role => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {user.id !== 1 && ( // Don't allow deleting admin user
                    <button 
                      className="delete-user-btn"
                      onClick={() => handleDeleteUser(user.id)}
                      title="Xóa người dùng"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
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