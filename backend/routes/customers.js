const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');

// Get all customers with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const customers = await Customer.getAll(page, limit);
    
    res.json({
      success: true,
      data: customers,
      pagination: {
        page,
        limit
      },
      message: 'Customers retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customers',
      error: error.message
    });
  }
});

// Get customer statistics
router.get('/statistics', async (req, res) => {
  try {
    const statistics = await Customer.getStatistics();
    
    res.json({
      success: true,
      data: statistics,
      message: 'Customer statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer statistics',
      error: error.message
    });
  }
});

// Search customers
router.get('/search/:query', async (req, res) => {
  try {
    const searchQuery = req.params.query;
    const customers = await Customer.search(searchQuery);
    
    res.json({
      success: true,
      data: customers,
      query: searchQuery,
      count: customers.length,
      message: 'Customer search completed successfully'
    });
  } catch (error) {
    console.error('Error searching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search customers',
      error: error.message
    });
  }
});

// Get customer by ID with booking history
router.get('/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const customer = await Customer.getWithBookings(customerId);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer,
      message: 'Customer retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
});

// Create new customer
router.post('/', async (req, res) => {
  try {
    const { fullName, phone, email, note } = req.body;
    
    // Validation
    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name and phone number are required'
      });
    }
    
    // Check if phone already exists
    const existingCustomer = await Customer.getByPhone(phone);
    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'Customer with this phone number already exists'
      });
    }
    
    // Check if email already exists (if provided)
    if (email) {
      const existingCustomerByEmail = await Customer.getByEmail(email);
      if (existingCustomerByEmail) {
        return res.status(409).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }
    }
    
    const newCustomer = await Customer.create({
      fullName,
      phone,
      email,
      note
    });
    
    res.status(201).json({
      success: true,
      data: newCustomer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create customer',
      error: error.message
    });
  }
});

// Update customer
router.put('/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const { fullName, phone, email, note } = req.body;
    
    // Validation
    if (!fullName || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Full name and phone number are required'
      });
    }
    
    // Check if phone already exists for other customers
    const existingCustomer = await Customer.getByPhone(phone);
    if (existingCustomer && existingCustomer.CustomerID !== customerId) {
      return res.status(409).json({
        success: false,
        message: 'Another customer with this phone number already exists'
      });
    }
    
    // Check if email already exists for other customers (if provided)
    if (email) {
      const existingCustomerByEmail = await Customer.getByEmail(email);
      if (existingCustomerByEmail && existingCustomerByEmail.CustomerID !== customerId) {
        return res.status(409).json({
          success: false,
          message: 'Another customer with this email already exists'
        });
      }
    }
    
    const updatedCustomer = await Customer.update(customerId, {
      fullName,
      phone,
      email,
      note
    });
    
    if (!updatedCustomer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedCustomer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update customer',
      error: error.message
    });
  }
});

// Delete customer
router.delete('/:id', async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);
    const deleted = await Customer.delete(customerId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message
    });
  }
});

// Get customer by phone
router.get('/phone/:phone', async (req, res) => {
  try {
    const phone = req.params.phone;
    const customer = await Customer.getByPhone(phone);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: customer,
      message: 'Customer retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching customer by phone:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch customer',
      error: error.message
    });
  }
});

module.exports = router;