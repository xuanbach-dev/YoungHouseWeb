const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');

// Get all branches
router.get('/', async (req, res) => {
  try {
    const branches = await Branch.getAll();
    res.json({
      success: true,
      data: branches,
      message: 'Branches retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branches',
      error: error.message
    });
  }
});

// Get branches with room count
router.get('/with-rooms', async (req, res) => {
  try {
    const branches = await Branch.getBranchesWithRoomCount();
    res.json({
      success: true,
      data: branches,
      message: 'Branches with room count retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching branches with room count:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branches with room count',
      error: error.message
    });
  }
});

// Get branch by ID
router.get('/:id', async (req, res) => {
  try {
    const branchId = parseInt(req.params.id);
    const branch = await Branch.getById(branchId);
    
    if (!branch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    res.json({
      success: true,
      data: branch,
      message: 'Branch retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch branch',
      error: error.message
    });
  }
});

// Create new branch
router.post('/', async (req, res) => {
  try {
    const { branchName, address, city, phone, description } = req.body;
    
    // Validation
    if (!branchName || !address) {
      return res.status(400).json({
        success: false,
        message: 'Branch name and address are required'
      });
    }
    
    const newBranch = await Branch.create({
      branchName,
      address,
      city,
      phone,
      description
    });
    
    res.status(201).json({
      success: true,
      data: newBranch,
      message: 'Branch created successfully'
    });
  } catch (error) {
    console.error('Error creating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create branch',
      error: error.message
    });
  }
});

// Update branch
router.put('/:id', async (req, res) => {
  try {
    const branchId = parseInt(req.params.id);
    const { branchName, address, city, phone, description } = req.body;
    
    // Validation
    if (!branchName || !address) {
      return res.status(400).json({
        success: false,
        message: 'Branch name and address are required'
      });
    }
    
    const updatedBranch = await Branch.update(branchId, {
      branchName,
      address,
      city,
      phone,
      description
    });
    
    if (!updatedBranch) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedBranch,
      message: 'Branch updated successfully'
    });
  } catch (error) {
    console.error('Error updating branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update branch',
      error: error.message
    });
  }
});

// Delete branch
router.delete('/:id', async (req, res) => {
  try {
    const branchId = parseInt(req.params.id);
    const deleted = await Branch.delete(branchId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Branch not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Branch deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting branch:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete branch',
      error: error.message
    });
  }
});

module.exports = router;