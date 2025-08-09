const { executeQuery } = require('../config/database');

class Branch {
  // Get all branches
  static async getAll() {
    const query = `
      SELECT 
        BranchID,
        BranchName,
        Address,
        City,
        Phone,
        Description,
        CreatedAt
      FROM Branch
      ORDER BY BranchName
    `;
    const result = await executeQuery(query);
    return result.recordset;
  }

  // Get branch by ID
  static async getById(branchId) {
    const query = `
      SELECT 
        BranchID,
        BranchName,
        Address,
        City,
        Phone,
        Description,
        CreatedAt
      FROM Branch
      WHERE BranchID = @branchId
    `;
    const result = await executeQuery(query, { branchId });
    return result.recordset[0];
  }

  // Create new branch
  static async create(branchData) {
    const { branchName, address, city, phone, description } = branchData;
    const query = `
      INSERT INTO Branch (BranchName, Address, City, Phone, Description)
      OUTPUT INSERTED.*
      VALUES (@branchName, @address, @city, @phone, @description)
    `;
    const result = await executeQuery(query, {
      branchName,
      address,
      city,
      phone,
      description
    });
    return result.recordset[0];
  }

  // Update branch
  static async update(branchId, branchData) {
    const { branchName, address, city, phone, description } = branchData;
    const query = `
      UPDATE Branch
      SET 
        BranchName = @branchName,
        Address = @address,
        City = @city,
        Phone = @phone,
        Description = @description
      OUTPUT INSERTED.*
      WHERE BranchID = @branchId
    `;
    const result = await executeQuery(query, {
      branchId,
      branchName,
      address,
      city,
      phone,
      description
    });
    return result.recordset[0];
  }

  // Delete branch
  static async delete(branchId) {
    const query = `
      DELETE FROM Branch
      WHERE BranchID = @branchId
    `;
    const result = await executeQuery(query, { branchId });
    return result.rowsAffected[0] > 0;
  }

  // Get branches with room count
  static async getBranchesWithRoomCount() {
    const query = `
      SELECT 
        b.BranchID,
        b.BranchName,
        b.Address,
        b.City,
        b.Phone,
        b.Description,
        b.CreatedAt,
        COUNT(r.RoomID) as RoomCount,
        COUNT(CASE WHEN r.Status = 'Available' THEN 1 END) as AvailableRooms
      FROM Branch b
      LEFT JOIN Room r ON b.BranchID = r.BranchID
      GROUP BY 
        b.BranchID, b.BranchName, b.Address, b.City, 
        b.Phone, b.Description, b.CreatedAt
      ORDER BY b.BranchName
    `;
    const result = await executeQuery(query);
    return result.recordset;
  }
}

module.exports = Branch;