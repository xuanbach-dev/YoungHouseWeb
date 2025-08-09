const { executeQuery } = require('../config/database');

class Booking {
  // Get all bookings with details
  static async getAll(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = { offset, limit };
    
    if (status) {
      whereClause = ' AND b.Status = @status';
      params.status = status;
    }

    const query = `
      SELECT 
        b.BookingID,
        b.CheckIn,
        b.CheckOut,
        b.Status,
        b.CreatedAt,
        c.CustomerID,
        c.FullName,
        c.Phone,
        c.Email,
        r.RoomID,
        r.RoomNumber,
        rt.TypeName,
        rt.Price,
        br.BranchName,
        br.Address
      FROM Booking b
      INNER JOIN Customer c ON b.CustomerID = c.CustomerID
      INNER JOIN Room r ON b.RoomID = r.RoomID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      INNER JOIN Branch br ON r.BranchID = br.BranchID
      WHERE 1=1 ${whereClause}
      ORDER BY b.CreatedAt DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    
    const result = await executeQuery(query, params);
    return result.recordset;
  }

  // Get booking by ID
  static async getById(bookingId) {
    const query = `
      SELECT 
        b.BookingID,
        b.CheckIn,
        b.CheckOut,
        b.Status,
        b.CreatedAt,
        c.CustomerID,
        c.FullName,
        c.Phone,
        c.Email,
        c.Note,
        r.RoomID,
        r.RoomNumber,
        r.Description as RoomDescription,
        rt.TypeName,
        rt.Price,
        rt.Description as TypeDescription,
        br.BranchID,
        br.BranchName,
        br.Address,
        br.City,
        br.Phone as BranchPhone
      FROM Booking b
      INNER JOIN Customer c ON b.CustomerID = c.CustomerID
      INNER JOIN Room r ON b.RoomID = r.RoomID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      INNER JOIN Branch br ON r.BranchID = br.BranchID
      WHERE b.BookingID = @bookingId
    `;
    const result = await executeQuery(query, { bookingId });
    return result.recordset[0];
  }

  // Create new booking
  static async create(bookingData) {
    const { customerId, roomId, checkIn, checkOut, status = 'Pending' } = bookingData;
    
    // Check if room is available for the period
    const availabilityQuery = `
      SELECT COUNT(*) as ConflictCount
      FROM Booking
      WHERE RoomID = @roomId
        AND Status IN ('Confirmed', 'CheckedIn')
        AND NOT (
          @checkOut <= CheckIn OR
          @checkIn >= CheckOut
        )
    `;
    
    const availabilityResult = await executeQuery(availabilityQuery, {
      roomId,
      checkIn,
      checkOut
    });
    
    if (availabilityResult.recordset[0].ConflictCount > 0) {
      throw new Error('Room is not available for the selected dates');
    }
    
    const query = `
      INSERT INTO Booking (CustomerID, RoomID, CheckIn, CheckOut, Status)
      OUTPUT INSERTED.*
      VALUES (@customerId, @roomId, @checkIn, @checkOut, @status)
    `;
    const result = await executeQuery(query, {
      customerId,
      roomId,
      checkIn,
      checkOut,
      status
    });
    return result.recordset[0];
  }

  // Update booking
  static async update(bookingId, bookingData) {
    const { customerId, roomId, checkIn, checkOut, status } = bookingData;
    
    // If dates are being changed, check availability
    if (checkIn && checkOut && roomId) {
      const availabilityQuery = `
        SELECT COUNT(*) as ConflictCount
        FROM Booking
        WHERE RoomID = @roomId
          AND BookingID != @bookingId
          AND Status IN ('Confirmed', 'CheckedIn')
          AND NOT (
            @checkOut <= CheckIn OR
            @checkIn >= CheckOut
          )
      `;
      
      const availabilityResult = await executeQuery(availabilityQuery, {
        bookingId,
        roomId,
        checkIn,
        checkOut
      });
      
      if (availabilityResult.recordset[0].ConflictCount > 0) {
        throw new Error('Room is not available for the selected dates');
      }
    }
    
    const query = `
      UPDATE Booking
      SET 
        CustomerID = @customerId,
        RoomID = @roomId,
        CheckIn = @checkIn,
        CheckOut = @checkOut,
        Status = @status
      OUTPUT INSERTED.*
      WHERE BookingID = @bookingId
    `;
    const result = await executeQuery(query, {
      bookingId,
      customerId,
      roomId,
      checkIn,
      checkOut,
      status
    });
    return result.recordset[0];
  }

  // Update booking status
  static async updateStatus(bookingId, status) {
    const query = `
      UPDATE Booking
      SET Status = @status
      OUTPUT INSERTED.*
      WHERE BookingID = @bookingId
    `;
    const result = await executeQuery(query, { bookingId, status });
    return result.recordset[0];
  }

  // Delete booking
  static async delete(bookingId) {
    const query = `
      DELETE FROM Booking
      WHERE BookingID = @bookingId
    `;
    const result = await executeQuery(query, { bookingId });
    return result.rowsAffected[0] > 0;
  }

  // Get bookings by customer
  static async getByCustomer(customerId) {
    const query = `
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
    const result = await executeQuery(query, { customerId });
    return result.recordset;
  }

  // Get bookings by room
  static async getByRoom(roomId, startDate = null, endDate = null) {
    let whereClause = ' AND r.RoomID = @roomId';
    const params = { roomId };
    
    if (startDate && endDate) {
      whereClause += ' AND b.CheckIn >= @startDate AND b.CheckOut <= @endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const query = `
      SELECT 
        b.BookingID,
        b.CheckIn,
        b.CheckOut,
        b.Status,
        b.CreatedAt,
        c.FullName,
        c.Phone,
        c.Email
      FROM Booking b
      INNER JOIN Customer c ON b.CustomerID = c.CustomerID
      INNER JOIN Room r ON b.RoomID = r.RoomID
      WHERE 1=1 ${whereClause}
      ORDER BY b.CheckIn
    `;
    const result = await executeQuery(query, params);
    return result.recordset;
  }

  // Check room availability
  static async checkAvailability(roomId, checkIn, checkOut) {
    const query = `
      SELECT COUNT(*) as ConflictCount
      FROM Booking
      WHERE RoomID = @roomId
        AND Status IN ('Confirmed', 'CheckedIn')
        AND NOT (
          @checkOut <= CheckIn OR
          @checkIn >= CheckOut
        )
    `;
    const result = await executeQuery(query, { roomId, checkIn, checkOut });
    return result.recordset[0].ConflictCount === 0;
  }

  // Get booking statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as TotalBookings,
        COUNT(CASE WHEN Status = 'Pending' THEN 1 END) as PendingBookings,
        COUNT(CASE WHEN Status = 'Confirmed' THEN 1 END) as ConfirmedBookings,
        COUNT(CASE WHEN Status = 'CheckedIn' THEN 1 END) as CheckedInBookings,
        COUNT(CASE WHEN Status = 'CheckedOut' THEN 1 END) as CheckedOutBookings,
        COUNT(CASE WHEN Status = 'Cancelled' THEN 1 END) as CancelledBookings,
        COUNT(CASE WHEN DATEDIFF(day, CreatedAt, GETDATE()) <= 30 THEN 1 END) as BookingsThisMonth
      FROM Booking
    `;
    const result = await executeQuery(query);
    return result.recordset[0];
  }

  // Get revenue statistics
  static async getRevenueStats(startDate = null, endDate = null) {
    let whereClause = " WHERE b.Status = 'CheckedOut'";
    const params = {};
    
    if (startDate && endDate) {
      whereClause += ' AND b.CheckOut >= @startDate AND b.CheckOut <= @endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const query = `
      SELECT 
        COUNT(*) as CompletedBookings,
        SUM(rt.Price * DATEDIFF(day, b.CheckIn, b.CheckOut)) as TotalRevenue,
        AVG(rt.Price * DATEDIFF(day, b.CheckIn, b.CheckOut)) as AverageRevenue,
        AVG(DATEDIFF(day, b.CheckIn, b.CheckOut)) as AverageStayDuration
      FROM Booking b
      INNER JOIN Room r ON b.RoomID = r.RoomID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      ${whereClause}
    `;
    const result = await executeQuery(query, params);
    return result.recordset[0];
  }
}

module.exports = Booking;