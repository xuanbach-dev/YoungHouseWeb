const { executeQuery } = require('../config/database');

class ViewingAppointment {
  // Get all viewing appointments with details
  static async getAll(page = 1, limit = 10, status = null) {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = { offset, limit };
    
    if (status) {
      whereClause = ' AND va.Status = @status';
      params.status = status;
    }

    const query = `
      SELECT 
        va.AppointmentID,
        va.FullName,
        va.Email,
        va.Phone,
        va.ViewingDate,
        va.ViewingTime,
        va.Note,
        va.Status,
        va.CreatedAt,
        r.RoomID,
        r.RoomNumber,
        rt.TypeName,
        rt.Price,
        br.BranchName,
        br.Address
      FROM ViewingAppointment va
      INNER JOIN Room r ON va.RoomID = r.RoomID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      INNER JOIN Branch br ON r.BranchID = br.BranchID
      WHERE 1=1 ${whereClause}
      ORDER BY va.ViewingDate DESC, va.ViewingTime DESC
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    
    const result = await executeQuery(query, params);
    return result.recordset;
  }

  // Get viewing appointment by ID
  static async getById(appointmentId) {
    const query = `
      SELECT 
        va.AppointmentID,
        va.FullName,
        va.Email,
        va.Phone,
        va.ViewingDate,
        va.ViewingTime,
        va.Note,
        va.Status,
        va.CreatedAt,
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
      FROM ViewingAppointment va
      INNER JOIN Room r ON va.RoomID = r.RoomID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      INNER JOIN Branch br ON r.BranchID = br.BranchID
      WHERE va.AppointmentID = @appointmentId
    `;
    const result = await executeQuery(query, { appointmentId });
    return result.recordset[0];
  }

  // Create new viewing appointment
  static async create(appointmentData) {
    const { fullName, email, phone, viewingDate, viewingTime, roomId, note, status = 'Pending' } = appointmentData;
    
    // Check if there's already an appointment at the same time for the same room
    const conflictQuery = `
      SELECT COUNT(*) as ConflictCount
      FROM ViewingAppointment
      WHERE RoomID = @roomId
        AND ViewingDate = @viewingDate
        AND ViewingTime = @viewingTime
        AND Status IN ('Pending', 'Confirmed')
    `;
    
    const conflictResult = await executeQuery(conflictQuery, {
      roomId,
      viewingDate,
      viewingTime
    });
    
    if (conflictResult.recordset[0].ConflictCount > 0) {
      throw new Error('Đã có lịch hẹn xem phòng vào thời gian này. Vui lòng chọn thời gian khác.');
    }
    
    const query = `
      INSERT INTO ViewingAppointment (FullName, Email, Phone, ViewingDate, ViewingTime, RoomID, Note, Status)
      OUTPUT INSERTED.*
      VALUES (@fullName, @email, @phone, @viewingDate, @viewingTime, @roomId, @note, @status)
    `;
    const result = await executeQuery(query, {
      fullName,
      email,
      phone,
      viewingDate,
      viewingTime,
      roomId,
      note,
      status
    });
    return result.recordset[0];
  }

  // Update viewing appointment
  static async update(appointmentId, appointmentData) {
    const { fullName, email, phone, viewingDate, viewingTime, roomId, note, status } = appointmentData;
    
    // Check for conflicts if date/time is being changed
    if (viewingDate && viewingTime && roomId) {
      const conflictQuery = `
        SELECT COUNT(*) as ConflictCount
        FROM ViewingAppointment
        WHERE RoomID = @roomId
          AND AppointmentID != @appointmentId
          AND ViewingDate = @viewingDate
          AND ViewingTime = @viewingTime
          AND Status IN ('Pending', 'Confirmed')
      `;
      
      const conflictResult = await executeQuery(conflictQuery, {
        appointmentId,
        roomId,
        viewingDate,
        viewingTime
      });
      
      if (conflictResult.recordset[0].ConflictCount > 0) {
        throw new Error('Đã có lịch hẹn xem phòng vào thời gian này. Vui lòng chọn thời gian khác.');
      }
    }
    
    const query = `
      UPDATE ViewingAppointment
      SET 
        FullName = @fullName,
        Email = @email,
        Phone = @phone,
        ViewingDate = @viewingDate,
        ViewingTime = @viewingTime,
        RoomID = @roomId,
        Note = @note,
        Status = @status
      OUTPUT INSERTED.*
      WHERE AppointmentID = @appointmentId
    `;
    const result = await executeQuery(query, {
      appointmentId,
      fullName,
      email,
      phone,
      viewingDate,
      viewingTime,
      roomId,
      note,
      status
    });
    return result.recordset[0];
  }

  // Update viewing appointment status
  static async updateStatus(appointmentId, status) {
    const query = `
      UPDATE ViewingAppointment
      SET Status = @status
      OUTPUT INSERTED.*
      WHERE AppointmentID = @appointmentId
    `;
    const result = await executeQuery(query, { appointmentId, status });
    return result.recordset[0];
  }

  // Delete viewing appointment
  static async delete(appointmentId) {
    const query = `
      DELETE FROM ViewingAppointment
      WHERE AppointmentID = @appointmentId
    `;
    const result = await executeQuery(query, { appointmentId });
    return result.rowsAffected[0] > 0;
  }

  // Get viewing appointments by room
  static async getByRoom(roomId, startDate = null, endDate = null) {
    let whereClause = ' AND r.RoomID = @roomId';
    const params = { roomId };
    
    if (startDate && endDate) {
      whereClause += ' AND va.ViewingDate >= @startDate AND va.ViewingDate <= @endDate';
      params.startDate = startDate;
      params.endDate = endDate;
    }

    const query = `
      SELECT 
        va.AppointmentID,
        va.FullName,
        va.Email,
        va.Phone,
        va.ViewingDate,
        va.ViewingTime,
        va.Note,
        va.Status,
        va.CreatedAt
      FROM ViewingAppointment va
      INNER JOIN Room r ON va.RoomID = r.RoomID
      WHERE 1=1 ${whereClause}
      ORDER BY va.ViewingDate, va.ViewingTime
    `;
    const result = await executeQuery(query, params);
    return result.recordset;
  }

  // Check time slot availability
  static async checkTimeSlotAvailability(roomId, viewingDate, viewingTime) {
    const query = `
      SELECT COUNT(*) as ConflictCount
      FROM ViewingAppointment
      WHERE RoomID = @roomId
        AND ViewingDate = @viewingDate
        AND ViewingTime = @viewingTime
        AND Status IN ('Pending', 'Confirmed')
    `;
    const result = await executeQuery(query, { roomId, viewingDate, viewingTime });
    return result.recordset[0].ConflictCount === 0;
  }

  // Get viewing appointment statistics
  static async getStatistics() {
    const query = `
      SELECT 
        COUNT(*) as TotalAppointments,
        COUNT(CASE WHEN Status = 'Pending' THEN 1 END) as PendingAppointments,
        COUNT(CASE WHEN Status = 'Confirmed' THEN 1 END) as ConfirmedAppointments,
        COUNT(CASE WHEN Status = 'Completed' THEN 1 END) as CompletedAppointments,
        COUNT(CASE WHEN Status = 'Cancelled' THEN 1 END) as CancelledAppointments,
        COUNT(CASE WHEN DATEDIFF(day, CreatedAt, GETDATE()) <= 30 THEN 1 END) as AppointmentsThisMonth,
        COUNT(CASE WHEN ViewingDate = CAST(GETDATE() AS DATE) THEN 1 END) as AppointmentsToday
      FROM ViewingAppointment
    `;
    const result = await executeQuery(query);
    return result.recordset[0];
  }

  // Get available time slots for a specific date and room
  static async getAvailableTimeSlots(roomId, viewingDate) {
    // Define available time slots (9:00 AM to 6:00 PM, every hour)
    const allTimeSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', 
      '14:00', '15:00', '16:00', '17:00', '18:00'
    ];

    const query = `
      SELECT ViewingTime
      FROM ViewingAppointment
      WHERE RoomID = @roomId
        AND ViewingDate = @viewingDate
        AND Status IN ('Pending', 'Confirmed')
    `;
    
    const result = await executeQuery(query, { roomId, viewingDate });
    // Normalize DB time values to HH:mm for reliable comparison with predefined slots
    const bookedSlots = result.recordset.map(row => {
      const value = row.ViewingTime;
      if (!value) return null;
      if (typeof value === 'string') {
        // Expect formats like HH:mm:ss[.SSS] or HH:mm
        return value.slice(0, 5);
      }
      if (value instanceof Date) {
        // Convert Date to HH:mm
        const hours = value.getHours().toString().padStart(2, '0');
        const minutes = value.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      // Fallback: try toString and slice
      try {
        return value.toString().slice(0, 5);
      } catch (_) {
        return null;
      }
    }).filter(Boolean);
    
    // Filter out booked time slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    return availableSlots;
  }
}

module.exports = ViewingAppointment;