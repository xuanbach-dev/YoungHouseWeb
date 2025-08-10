const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Role = require('../models/Role');
const { authenticateToken, requireAdmin, requireUser, authenticateAndFetchUser } = require('../middleware/auth');

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const users = await User.findAll();
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedUsers = users
      .slice(startIndex, endIndex)
      .map(user => ({
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        fullName: user.FullName,
        roleId: user.RoleID,
        roleName: user.RoleName,
        createdAt: user.CreatedAt
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
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
});

// Get user by ID (Admin or own profile)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Users can only view their own profile unless they're admin
    if (req.user.roleId !== 1 && req.user.userId !== userId) {
      return res.status(403).json({ message: 'You can only view your own profile' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        fullName: user.FullName,
        roleId: user.RoleID,
        roleName: user.RoleName,
        createdAt: user.CreatedAt
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error fetching user' });
  }
});

// Search users (Admin only)
router.get('/search/:query', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const users = await User.findAll();
    
    const filteredUsers = users
      .filter(user => 
        user.Username.toLowerCase().includes(query) ||
        user.Email.toLowerCase().includes(query) ||
        (user.FullName && user.FullName.toLowerCase().includes(query))
      )
      .map(user => ({
        id: user.UserID,
        username: user.Username,
        email: user.Email,
        fullName: user.FullName,
        roleId: user.RoleID,
        roleName: user.RoleName,
        createdAt: user.CreatedAt
      }));

    res.json({
      users: filteredUsers,
      query,
      count: filteredUsers.length
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ message: 'Server error searching users' });
  }
});

// Update user profile (Own profile or Admin)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { username, fullName, email, roleId } = req.body;

    // Users can only update their own profile unless they're admin
    if (req.user.roleId !== 1 && req.user.userId !== userId) {
      return res.status(403).json({ message: 'You can only update your own profile' });
    }

    // Only admin can change roles
    if (roleId !== undefined && req.user.roleId !== 1) {
      return res.status(403).json({ message: 'Only admin can change user roles' });
    }

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (fullName !== undefined) updateData.fullName = fullName;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = roleId;

    const updatedUser = await User.update(userId, updateData);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.UserID,
        username: updatedUser.Username,
        email: updatedUser.Email,
        fullName: updatedUser.FullName,
        roleId: updatedUser.RoleID,
        roleName: updatedUser.RoleName,
        createdAt: updatedUser.CreatedAt
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Server error updating user' });
  }
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent admin from deleting themselves
    if (req.user.userId === userId) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const deleted = await User.delete(userId);
    if (!deleted) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// Update user role (Admin only)
router.patch('/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { roleId } = req.body;

    if (!roleId) {
      return res.status(400).json({ message: 'Role ID is required' });
    }

    // Prevent admin from changing their own role
    if (req.user.userId === userId) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const updatedUser = await User.updateRole(userId, roleId);
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser.UserID,
        username: updatedUser.Username,
        email: updatedUser.Email,
        fullName: updatedUser.FullName,
        roleId: updatedUser.RoleID,
        roleName: updatedUser.RoleName
      }
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Server error updating user role' });
  }
});

// Get all roles (Admin only)
router.get('/roles/all', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error fetching roles' });
  }
});

module.exports = router;