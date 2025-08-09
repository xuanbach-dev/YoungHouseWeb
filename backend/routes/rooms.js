const express = require('express');
const router = express.Router();
const Room = require('../models/Room');

// Get all rooms with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const branchId = req.query.branchId ? parseInt(req.query.branchId) : null;
    const status = req.query.status || null;
    
    const rooms = await Room.getAll(page, limit, branchId, status);
    
    res.json({
      success: true,
      data: rooms,
      pagination: {
        page,
        limit,
        filters: { branchId, status }
      },
      message: 'Rooms retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rooms',
      error: error.message
    });
  }
});

// Get available rooms by branch
router.get('/available/:branchId', async (req, res) => {
  try {
    const branchId = parseInt(req.params.branchId);
    const rooms = await Room.getAvailableByBranch(branchId);
    
    res.json({
      success: true,
      data: rooms,
      message: 'Available rooms retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available rooms',
      error: error.message
    });
  }
});

// Search rooms
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const branchId = req.query.branchId ? parseInt(req.query.branchId) : null;
    
    const rooms = await Room.search(searchQuery, branchId);
    
    res.json({
      success: true,
      data: rooms,
      query: searchQuery,
      count: rooms.length,
      message: 'Room search completed successfully'
    });
  } catch (error) {
    console.error('Error searching rooms:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search rooms',
      error: error.message
    });
  }
});

// Get room by ID with media
router.get('/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const room = await Room.getRoomWithMedia(roomId);
    
    if (!room) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: room,
      message: 'Room retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room',
      error: error.message
    });
  }
});

// Create new room
router.post('/', async (req, res) => {
  try {
    const { branchId, roomTypeId, roomNumber, status, description } = req.body;
    
    // Validation
    if (!branchId || !roomTypeId || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID, Room Type ID, and Room Number are required'
      });
    }
    
    const newRoom = await Room.create({
      branchId,
      roomTypeId,
      roomNumber,
      status: status || 'Available',
      description
    });
    
    res.status(201).json({
      success: true,
      data: newRoom,
      message: 'Room created successfully'
    });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create room',
      error: error.message
    });
  }
});

// Update room
router.put('/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { branchId, roomTypeId, roomNumber, status, description } = req.body;
    
    // Validation
    if (!branchId || !roomTypeId || !roomNumber) {
      return res.status(400).json({
        success: false,
        message: 'Branch ID, Room Type ID, and Room Number are required'
      });
    }
    
    const updatedRoom = await Room.update(roomId, {
      branchId,
      roomTypeId,
      roomNumber,
      status,
      description
    });
    
    if (!updatedRoom) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedRoom,
      message: 'Room updated successfully'
    });
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room',
      error: error.message
    });
  }
});

// Update room status only
router.patch('/:id/status', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['Available', 'Occupied', 'Maintenance', 'Reserved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }
    
    const updated = await Room.updateStatus(roomId, status);
    
    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room status updated successfully'
    });
  } catch (error) {
    console.error('Error updating room status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update room status',
      error: error.message
    });
  }
});

// Delete room
router.delete('/:id', async (req, res) => {
  try {
    const roomId = parseInt(req.params.id);
    const deleted = await Room.delete(roomId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Room not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Room deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete room',
      error: error.message
    });
  }
});

module.exports = router;