import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { postsAPI } from '../services/api';
import { Post } from '../types';
import { PlusCircle, Edit3, Trash2, Calendar, Heart, MessageCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUserPosts();
  }, []);

  const fetchUserPosts = async () => {
    try {
      setIsLoading(true);
      const response = await postsAPI.getPosts();
      // Filter posts by current user
      const filtered = response.data.posts.filter((post: Post) => post.authorId === user?.id);
      setUserPosts(filtered);
    } catch (err: any) {
      setError('Failed to fetch your posts');
      console.error('Error fetching user posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (postId: number) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      await postsAPI.deletePost(postId);
      setUserPosts(userPosts.filter(post => post.id !== postId));
    } catch (err: any) {
      console.error('Error deleting post:', err);
      alert('Failed to delete post');
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
      <div className="dashboard-container">
        <div className="loading-spinner">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>Welcome back, {user?.username}!</h1>
          <p>Manage your posts and track your community engagement</p>
        </div>
        
        <Link to="/create-post" className="create-post-btn">
          <PlusCircle size={20} />
          Create New Post
        </Link>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>{userPosts.length}</h3>
          <p>Total Posts</p>
        </div>
        
        <div className="stat-card">
          <h3>{userPosts.reduce((sum, post) => sum + post.likes, 0)}</h3>
          <p>Total Likes</p>
        </div>
        
        <div className="stat-card">
          <h3>{userPosts.reduce((sum, post) => sum + post.comments, 0)}</h3>
          <p>Total Comments</p>
        </div>
      </div>

      <div className="posts-section">
        <h2>Your Posts</h2>
        
        {error && (
          <div className="error-message">{error}</div>
        )}

        {userPosts.length === 0 ? (
          <div className="no-posts">
            <PlusCircle size={48} className="no-posts-icon" />
            <h3>No posts yet</h3>
            <p>Share your ideas and connect with the community!</p>
            <Link to="/create-post" className="create-first-post-btn">
              Create Your First Post
            </Link>
          </div>
        ) : (
          <div className="posts-list">
            {userPosts.map((post) => (
              <div key={post.id} className="post-item">
                <div className="post-content">
                  <h3>
                    <Link to={`/posts/${post.id}`} className="post-title">
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="post-excerpt">
                    {post.content.substring(0, 120)}...
                  </p>
                  
                  <div className="post-meta">
                    <div className="post-date">
                      <Calendar size={16} />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    
                    <div className="post-stats">
                      <div className="stat">
                        <Heart size={16} />
                        <span>{post.likes}</span>
                      </div>
                      
                      <div className="stat">
                        <MessageCircle size={16} />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="post-actions">
                  <Link
                    to={`/posts/${post.id}`}
                    className="action-btn view-btn"
                    title="View Post"
                  >
                    View
                  </Link>
                  
                  <button
                    className="action-btn edit-btn"
                    title="Edit Post"
                    onClick={() => {
                      // TODO: Implement edit functionality
                      alert('Edit functionality coming soon!');
                    }}
                  >
                    <Edit3 size={16} />
                  </button>
                  
                  <button
                    className="action-btn delete-btn"
                    title="Delete Post"
                    onClick={() => handleDeletePost(post.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;