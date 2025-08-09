const express = require('express');
const router = express.Router();

// Mock user database
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@younghouse.com',
    bio: 'Administrator of YoungHouse platform',
    avatar: 'https://via.placeholder.com/100',
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    username: 'john_doe',
    email: 'john@example.com',
    bio: 'Young entrepreneur and tech enthusiast',
    avatar: 'https://via.placeholder.com/100',
    createdAt: '2024-01-15T00:00:00.000Z'
  }
];

// Get all users
router.get('/', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const paginatedUsers = users
    .slice(startIndex, endIndex)
    .map(user => ({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt
    }));

  res.json({
    users: paginatedUsers,
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(users.length / limit),
      totalUsers: users.length,
      hasNext: endIndex < users.length,
      hasPrev: startIndex > 0
    }
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = users.find(user => user.id === userId);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt
    }
  });
});

// Search users
router.get('/search/:query', (req, res) => {
  const query = req.params.query.toLowerCase();
  const filteredUsers = users
    .filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      (user.bio && user.bio.toLowerCase().includes(query))
    )
    .map(user => ({
      id: user.id,
      username: user.username,
      bio: user.bio,
      avatar: user.avatar,
      createdAt: user.createdAt
    }));

  res.json({
    users: filteredUsers,
    query,
    count: filteredUsers.length
  });
});

// Update user profile (protected route - requires authentication)
router.put('/:id', authenticateToken, (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, bio, avatar } = req.body;

  // Check if user exists and user owns the profile
  const userIndex = users.findIndex(user => user.id === userId);
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (req.user.userId !== userId) {
    return res.status(403).json({ message: 'You can only update your own profile' });
  }

  // Update user data
  if (username) users[userIndex].username = username;
  if (bio) users[userIndex].bio = bio;
  if (avatar) users[userIndex].avatar = avatar;
  users[userIndex].updatedAt = new Date().toISOString();

  res.json({
    message: 'Profile updated successfully',
    user: {
      id: users[userIndex].id,
      username: users[userIndex].username,
      email: users[userIndex].email,
      bio: users[userIndex].bio,
      avatar: users[userIndex].avatar,
      updatedAt: users[userIndex].updatedAt
    }
  });
});

// Middleware to authenticate JWT token (copy from auth.js)
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