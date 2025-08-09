const { executeQuery } = require('../config/database');

class Room {
  // Get all rooms with branch and room type info
  static async getAll(page = 1, limit = 10, branchId = null, status = null) {
    const offset = (page - 1) * limit;
    
    let whereClause = '';
    const params = { offset, limit };
    
    if (branchId) {
      whereClause += ' AND r.BranchID = @branchId';
      params.branchId = branchId;
    }
    
    if (status) {
      whereClause += ' AND r.Status = @status';
      params.status = status;
    }

    const query = `
      SELECT 
        r.RoomID,
        r.RoomNumber,
        r.Status,
        r.Description as RoomDescription,
        b.BranchID,
        b.BranchName,
        b.Address,
        b.City,
        rt.RoomTypeID,
        rt.TypeName,
        rt.Price,
        rt.Description as TypeDescription
      FROM Room r
      INNER JOIN Branch b ON r.BranchID = b.BranchID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE 1=1 ${whereClause}
      ORDER BY b.BranchName, rt.TypeName, r.RoomNumber
      OFFSET @offset ROWS
      FETCH NEXT @limit ROWS ONLY
    `;
    
    const result = await executeQuery(query, params);
    return result.recordset;
  }

  // Get room by ID with all details
  static async getById(roomId) {
    const query = `
      SELECT 
        r.RoomID,
        r.RoomNumber,
        r.Status,
        r.Description as RoomDescription,
        b.BranchID,
        b.BranchName,
        b.Address,
        b.City,
        b.Phone,
        rt.RoomTypeID,
        rt.TypeName,
        rt.Price,
        rt.Description as TypeDescription
      FROM Room r
      INNER JOIN Branch b ON r.BranchID = b.BranchID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE r.RoomID = @roomId
    `;
    const result = await executeQuery(query, { roomId });
    return result.recordset[0];
  }

  // Get room media
  static async getRoomMedia(roomId) {
    const query = `
      SELECT 
        MediaID,
        FilePath,
        MediaType,
        UploadedAt
      FROM Media
      WHERE RoomID = @roomId
      ORDER BY UploadedAt
    `;
    const result = await executeQuery(query, { roomId });
    return result.recordset;
  }

  // Get room with media
  static async getRoomWithMedia(roomId) {
    const room = await this.getById(roomId);
    if (room) {
      room.Media = await this.getRoomMedia(roomId);
    }
    return room;
  }

  // Create new room
  static async create(roomData) {
    const { branchId, roomTypeId, roomNumber, status = 'Available', description } = roomData;
    const query = `
      INSERT INTO Room (BranchID, RoomTypeID, RoomNumber, Status, Description)
      OUTPUT INSERTED.*
      VALUES (@branchId, @roomTypeId, @roomNumber, @status, @description)
    `;
    const result = await executeQuery(query, {
      branchId,
      roomTypeId,
      roomNumber,
      status,
      description
    });
    return result.recordset[0];
  }

  // Update room
  static async update(roomId, roomData) {
    const { branchId, roomTypeId, roomNumber, status, description } = roomData;
    const query = `
      UPDATE Room
      SET 
        BranchID = @branchId,
        RoomTypeID = @roomTypeId,
        RoomNumber = @roomNumber,
        Status = @status,
        Description = @description
      OUTPUT INSERTED.*
      WHERE RoomID = @roomId
    `;
    const result = await executeQuery(query, {
      roomId,
      branchId,
      roomTypeId,
      roomNumber,
      status,
      description
    });
    return result.recordset[0];
  }

  // Update room status
  static async updateStatus(roomId, status) {
    const query = `
      UPDATE Room
      SET Status = @status
      WHERE RoomID = @roomId
    `;
    const result = await executeQuery(query, { roomId, status });
    return result.rowsAffected[0] > 0;
  }

  // Delete room
  static async delete(roomId) {
    const query = `
      DELETE FROM Room
      WHERE RoomID = @roomId
    `;
    const result = await executeQuery(query, { roomId });
    return result.rowsAffected[0] > 0;
  }

  // Search rooms
  static async search(searchQuery, branchId = null) {
    let whereClause = `
      WHERE (
        r.RoomNumber LIKE @searchQuery OR
        r.Description LIKE @searchQuery OR
        rt.TypeName LIKE @searchQuery OR
        b.BranchName LIKE @searchQuery
      )
    `;
    
    const params = { searchQuery: `%${searchQuery}%` };
    
    if (branchId) {
      whereClause += ' AND r.BranchID = @branchId';
      params.branchId = branchId;
    }

    const query = `
      SELECT 
        r.RoomID,
        r.RoomNumber,
        r.Status,
        r.Description as RoomDescription,
        b.BranchID,
        b.BranchName,
        rt.RoomTypeID,
        rt.TypeName,
        rt.Price
      FROM Room r
      INNER JOIN Branch b ON r.BranchID = b.BranchID
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      ${whereClause}
      ORDER BY b.BranchName, rt.TypeName, r.RoomNumber
    `;
    
    const result = await executeQuery(query, params);
    return result.recordset;
  }

  // Get available rooms by branch
  static async getAvailableByBranch(branchId) {
    const query = `
      SELECT 
        r.RoomID,
        r.RoomNumber,
        r.Status,
        r.Description as RoomDescription,
        rt.RoomTypeID,
        rt.TypeName,
        rt.Price,
        rt.Description as TypeDescription
      FROM Room r
      INNER JOIN RoomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE r.BranchID = @branchId AND r.Status = 'Available'
      ORDER BY rt.Price, r.RoomNumber
    `;
    const result = await executeQuery(query, { branchId });
    return result.recordset;
  }
}

module.exports = Room;