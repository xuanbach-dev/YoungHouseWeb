const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// Get all bookings with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || null;
    
    const bookings = await Booking.getAll(page, limit, status);
    
    res.json({
      success: true,
      data: bookings,
      pagination: {
        page,
        limit,
        filters: { status }
      },
      message: 'Bookings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings',
      error: error.message
    });
  }
});

// Get booking statistics
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await Booking.getStatistics();
    
    res.json({
      success: true,
      data: statistics,
      message: 'Booking statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching booking statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking statistics',
      error: error.message
    });
  }
});

// Get revenue statistics
router.get('/revenue', async (req, res) => {
  try {
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
    const revenueStats = await Booking.getRevenueStats(startDate, endDate);
    
    res.json({
      success: true,
      data: revenueStats,
      filters: { startDate, endDate },
      message: 'Revenue statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching revenue statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch revenue statistics',
      error: error.message
    });
  }
});

// Check room availability
router.post('/check-availability', async (req, res) => {
  try {
    const { roomId, checkIn, checkOut } = req.body;
    
    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Room ID, check-in date, and check-out date are required'
      });
    }
    
    const isAvailable = await Booking.checkAvailability(roomId, checkIn, checkOut);
    
    res.json({
      success: true,
      data: {
        roomId,
        checkIn,
        checkOut,
        isAvailable
      },
      message: `Room is ${isAvailable ? 'available' : 'not available'} for the selected dates`
    });
  } catch (error) {
    console.error('Error checking availability:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check room availability',
      error: error.message
    });
  }
});

// Get booking by ID
router.get('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const booking = await Booking.getById(bookingId);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: booking,
      message: 'Booking retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch booking',
      error: error.message
    });
  }
});

// Create new booking
router.post('/', async (req, res) => {
  try {
    const { customerId, roomId, checkIn, checkOut, status } = req.body;
    
    // Validation
    if (!customerId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, Room ID, check-in date, and check-out date are required'
      });
    }
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkInDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Check-in date cannot be in the past'
      });
    }
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    const newBooking = await Booking.create({
      customerId,
      roomId,
      checkIn,
      checkOut,
      status: status || 'Pending'
    });
    
    res.status(201).json({
      success: true,
      data: newBooking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking',
      error: error.message
    });
  }
});

// Update booking
router.put('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { customerId, roomId, checkIn, checkOut, status } = req.body;
    
    // Validation
    if (!customerId || !roomId || !checkIn || !checkOut) {
      return res.status(400).json({
        success: false,
        message: 'Customer ID, Room ID, check-in date, and check-out date are required'
      });
    }
    
    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }
    
    const updatedBooking = await Booking.update(bookingId, {
      customerId,
      roomId,
      checkIn,
      checkOut,
      status
    });
    
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking',
      error: error.message
    });
  }
});

// Update booking status only
router.patch('/:id/status', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }
    
    const validStatuses = ['Pending', 'Confirmed', 'CheckedIn', 'CheckedOut', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Valid statuses are: ' + validStatuses.join(', ')
      });
    }
    
    const updatedBooking = await Booking.updateStatus(bookingId, status);
    
    if (!updatedBooking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedBooking,
      message: 'Booking status updated successfully'
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update booking status',
      error: error.message
    });
  }
});

// Delete booking
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id);
    const deleted = await Booking.delete(bookingId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Booking deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete booking',
      error: error.message
    });
  }
});

// Get bookings by customer
router.get('/customer/:customerId', async (req, res) => {
  try {
    const customerId = parseInt(req.params.customerId);
    const bookings = await Booking.getByCustomer(customerId);
    
    res.json({
      success: true,
      data: bookings,
      message: 'Customer bookings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer bookings',
      error: error.message
    });
  }
});

// Get bookings by room
router.get('/room/:roomId', async (req, res) => {
  try {
    const roomId = parseInt(req.params.roomId);
    const startDate = req.query.startDate || null;
    const endDate = req.query.endDate || null;
    
    const bookings = await Booking.getByRoom(roomId, startDate, endDate);
    
    res.json({
      success: true,
      data: bookings,
      filters: { startDate, endDate },
      message: 'Room bookings retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching room bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch room bookings',
      error: error.message
    });
  }
});

module.exports = router;