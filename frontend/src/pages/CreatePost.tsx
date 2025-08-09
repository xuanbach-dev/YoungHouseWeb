import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { postsAPI } from '../services/api';
import { PlusCircle, Save, X } from 'lucide-react';
import './CreatePost.css';

const CreatePost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    try {
      setIsLoading(true);
      await postsAPI.createPost({
        title: title.trim(),
        content: content.trim(),
        tags
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create post');
      console.error('Error creating post:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-card">
        <div className="create-post-header">
          <div className="header-content">
            <PlusCircle size={24} className="header-icon" />
            <h1>Create New Post</h1>
          </div>
          <p>Share your ideas, experiences, and insights with the YoungHouse community</p>
        </div>

        <form onSubmit={handleSubmit} className="create-post-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="title">Post Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter an engaging title for your post..."
              maxLength={100}
              required
              disabled={isLoading}
            />
            <div className="char-count">
              {title.length}/100
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Content</label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your post content here... Share your thoughts, experiences, tips, or ask questions to engage with the community."
              rows={12}
              required
              disabled={isLoading}
            />
            <div className="char-count">
              {content.length} characters
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (Optional)</label>
            <div className="tags-input-container">
              <input
                type="text"
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add tags to categorize your post..."
                disabled={isLoading || tags.length >= 5}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="add-tag-btn"
                disabled={!tagInput.trim() || tags.includes(tagInput.trim()) || tags.length >= 5}
              >
                Add
              </button>
            </div>
            
            {tags.length > 0 && (
              <div className="tags-list">
                {tags.map((tag, index) => (
                  <span key={index} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="remove-tag-btn"
                      disabled={isLoading}
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            
            <div className="tags-info">
              {tags.length}/5 tags • Use tags like "startup", "advice", "networking", etc.
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="cancel-btn"
              disabled={isLoading}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading || !title.trim() || !content.trim()}
            >
              <Save size={18} />
              {isLoading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>

        <div className="posting-tips">
          <h3>💡 Tips for Great Posts</h3>
          <ul>
            <li>Write a clear, descriptive title that captures your main idea</li>
            <li>Structure your content with paragraphs for better readability</li>
            <li>Use relevant tags to help others discover your post</li>
            <li>Share personal experiences and insights</li>
            <li>Ask questions to encourage discussion</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;