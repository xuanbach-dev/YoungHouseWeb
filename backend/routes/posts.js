const express = require('express');
const router = express.Router();

// Mock posts database
let posts = [
  {
    id: 1,
    title: 'Welcome to YoungHouse!',
    content: 'This is the first post on our platform. Welcome to the community of young entrepreneurs and innovators!',
    authorId: 1,
    author: 'admin',
    tags: ['welcome', 'announcement'],
    likes: 15,
    comments: 3,
    createdAt: '2024-01-01T10:00:00.000Z',
    updatedAt: '2024-01-01T10:00:00.000Z'
  },
  {
    id: 2,
    title: 'Tips for Young Entrepreneurs',
    content: 'Starting a business at a young age can be challenging but rewarding. Here are some tips to get you started...',
    authorId: 2,
    author: 'john_doe',
    tags: ['tips', 'business', 'entrepreneurship'],
    likes: 28,
    comments: 7,
    createdAt: '2024-01-15T14:30:00.000Z',
    updatedAt: '2024-01-15T14:30:00.000Z'
  }
];

let postIdCounter = 3;

// Get all posts
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const sortBy = req.query.sortBy || 'createdAt';
  const order = req.query.order || 'desc';

  let sortedPosts = [...posts];

  // Sort posts
  sortedPosts.sort((a, b) => {
    if (order === 'desc') {
      return new Date(b[sortBy]) - new Date(a[sortBy]);
    } else {
      return new Date(a[sortBy]) - new Date(b[sortBy]);
    }
  });

  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedPosts = sortedPosts.slice(startIndex, endIndex);

  res.json({
    posts: paginatedPosts,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(posts.length / limit),
      totalPosts: posts.length,
      hasNext: endIndex < posts.length,
      hasPrev: startIndex > 0
    }
  });
});

// Get post by ID
router.get('/:id', (req, res) => {
  const postId = parseInt(req.params.id);
  const post = posts.find(post => post.id === postId);

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  res.json({ post });
});

// Create new post (protected route)
router.post('/', authenticateToken, (req, res) => {
  const { title, content, tags } = req.body;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required' });
  }

  const newPost = {
    id: postIdCounter++,
    title,
    content,
    authorId: req.user.userId,
    author: req.user.username,
    tags: tags || [],
    likes: 0,
    comments: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  posts.unshift(newPost);

  res.status(201).json({
    message: 'Post created successfully',
    post: newPost
  });
});

// Update post (protected route)
router.put('/:id', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const { title, content, tags } = req.body;

  const postIndex = posts.findIndex(post => post.id === postId);
  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Check if user owns the post
  if (posts[postIndex].authorId !== req.user.userId) {
    return res.status(403).json({ message: 'You can only update your own posts' });
  }

  // Update post data
  if (title) posts[postIndex].title = title;
  if (content) posts[postIndex].content = content;
  if (tags) posts[postIndex].tags = tags;
  posts[postIndex].updatedAt = new Date().toISOString();

  res.json({
    message: 'Post updated successfully',
    post: posts[postIndex]
  });
});

// Delete post (protected route)
router.delete('/:id', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Check if user owns the post
  if (posts[postIndex].authorId !== req.user.userId) {
    return res.status(403).json({ message: 'You can only delete your own posts' });
  }

  posts.splice(postIndex, 1);

  res.json({ message: 'Post deleted successfully' });
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, (req, res) => {
  const postId = parseInt(req.params.id);
  const postIndex = posts.findIndex(post => post.id === postId);

  if (postIndex === -1) {
    return res.status(404).json({ message: 'Post not found' });
  }

  // Toggle like (simplified - in production, track who liked what)
  posts[postIndex].likes += 1;

  res.json({
    message: 'Post liked successfully',
    likes: posts[postIndex].likes
  });
});

// Search posts
router.get('/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(query) ||
    post.content.toLowerCase().includes(query) ||
    post.author.toLowerCase().includes(query) ||
    post.tags.some(tag => tag.toLowerCase().includes(query))
  );

  res.json({
    posts: filteredPosts,
    query,
    count: filteredPosts.length
  });
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
}

module.exports = router;