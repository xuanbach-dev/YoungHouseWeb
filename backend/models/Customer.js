const { executeQuery } = require('../config/database');

class Customer {
  // Get all customers
  static async getAll(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const query = `
      SELECT 
        CustomerID,
        FullName,
        Phone,
        Email,
        Note,
        CreatedAt
      FROM Customer
      ORDER BY CreatedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    
    const result = await executeQuery(query, { offset, limit });
    return result.recordset;
  }

  // Get customer by ID
  static async getById(customerId) {
    const query = `
      SELECT 
        CustomerID,
        FullName,
        Phone,
        Email,
        Note,
        CreatedAt
      FROM Customer
      WHERE CustomerID = @customerId
    `;
    const result = await executeQuery(query, { customerId });
    return result.recordset[0];
  }

  // Get customer by phone
  static async getByPhone(phone) {
    const query = `
      SELECT 
        CustomerID,
        FullName,
        Phone,
        Email,
        Note,
        CreatedAt
      FROM Customer
      WHERE Phone = @phone
    `;
    const result = await executeQuery(query, { phone });
    return result.recordset[0];
  }

  // Get customer by email
  static async getByEmail(email) {
    const query = `
      SELECT 
        CustomerID,
        FullName,
        Phone,
        Email,
        Note,
        CreatedAt
      FROM Customer
      WHERE Email = @email
    `;
    const result = await executeQuery(query, { email });
    return result.recordset[0];
  }

  // Create new customer
  static async create(customerData) {
    const { fullName, phone, email, note } = customerData;
    const query = `
      INSERT INTO Customer (FullName, Phone, Email, Note)
      OUTPUT INSERTED.*
      VALUES (@fullName, @phone, @email, @note)
    `;
    const result = await executeQuery(query, {
      fullName,
      phone,
      email,
      note
    });
    return result.recordset[0];
  }

  // Update customer
  static async update(customerId, customerData) {
    const { fullName, phone, email, note } = customerData;
    const query = `
      UPDATE Customer
      SET 
        FullName = @fullName,
        Phone = @phone,
        Email = @email,
        Note = @note
      OUTPUT INSERTED.*
      WHERE CustomerID = @customerId
    `;
    const result = await executeQuery(query, {
      customerId,
      fullName,
      phone,
      email,
      note
    });
    return result.recordset[0];
  }

  // Delete customer
  static async delete(customerId) {
    const query = `
      DELETE FROM Customer
      WHERE CustomerID = @customerId
    `;
    const result = await executeQuery(query, { customerId });
    return result.rowsAffected[0] > 0;
  }

  // Search customers
  static async search(searchQuery) {
    const query = `
      SELECT 
        CustomerID,
        FullName,
        Phone,
        Email,
        Note,
        CreatedAt
      FROM Customer
      WHERE 
        FullName LIKE @searchQuery OR
        Phone LIKE @searchQuery OR
        Email LIKE @searchQuery
      ORDER BY FullName
    `;
    const result = await executeQuery(query, { 
      searchQuery: `%${searchQuery}%` 
    });
    return result.recordset;
  }

  // Get customer with booking history
  static async getWithBookings(customerId) {
    const customerQuery = `
      SELECT 
        CustomerID,
        FullName,
        Phone,
        Email,
        Note,
        CreatedAt
      FROM Customer
      WHERE CustomerID = @customerId
    `;
    
    const bookingsQuery = `
      SELECT 
        b.BookingID,
        b.CheckIn,
        b.CheckOut,
        b.Status,
        b.CreatedAt,
        r.RoomNumber,
        rt.TypeName,
        rt.Price,
        br.BranchName
      FROM Booking b
      INNER JOIN Room r ON b.RoomID = r.RoomID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      INNER JOIN Branch br ON r.BranchID = br.BranchID
      WHERE b.CustomerID = @customerId
      ORDER BY b.CreatedAt DESC
    `;
    
    const [customerResult, bookingsResult] = await Promise.all([
      executeQuery(customerQuery, { customerId }),
      executeQuery(bookingsQuery, { customerId })
    ]);
    
    const customer = customerResult.recordset[0];
    if (customer) {
      customer.Bookings = bookingsResult.recordset;
    }
    
    return customer;
  }

  // Get customer statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as TotalCustomers,
        COUNT(CASE WHEN DATEDIFF(day, CreatedAt, GETDATE()) <= 30 THEN 1 END) as NewCustomersThisMonth,
        COUNT(CASE WHEN Email IS NOT NULL AND Email != '' THEN 1 END) as CustomersWithEmail
      FROM Customer
    `;
    const result = await executeQuery(query);
    return result.recordset[0];
  }
}

module.exports = Customer;