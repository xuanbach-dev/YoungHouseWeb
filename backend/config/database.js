const sql = require('mssql');
require('dotenv').config();

// SQL Server configuration
const dbConfig = {
  server: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '123',
  database: process.env.DB_NAME || 'younghouse_db',
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true' || true,
    enableArithAbort: true,
    requestTimeout: 30000,
    connectionTimeout: 30000
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000
  }
};

let poolConnection = null;

// Initialize database connection
const initDatabase = async () => {
  try {
    if (!poolConnection) {
      console.log('🔄 Connecting to SQL Server...');
      poolConnection = await sql.connect(dbConfig);
      console.log('✅ Connected to SQL Server successfully');
      console.log(`📊 Database: ${dbConfig.database}`);
      console.log(`🌐 Server: ${dbConfig.server}:${dbConfig.port}`);
    }
    return poolConnection;
  } catch (error) {
    console.error('❌ SQL Server connection error:', error.message);
    throw error;
  }
};

// Test connection
const testConnection = async () => {
  try {
    await initDatabase();
    
    // Test với một query đơn giản
    const result = await executeQuery('SELECT COUNT(*) as branch_count FROM Branch');
    if (result && result.recordset) {
      console.log(`🏢 Total branches: ${result.recordset[0].branch_count}`);
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    return false;
  }
};

// Get database connection
const getConnection = async () => {
  try {
    if (!poolConnection) {
      await initDatabase();
    }
    return poolConnection;
  } catch (error) {
    console.error('❌ Failed to get database connection:', error.message);
    throw error;
  }
};

// Execute query with parameters
const executeQuery = async (query, params = {}) => {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.query(query);
    return result;
  } catch (error) {
    console.error('❌ Database query error:', error.message);
    throw error;
  }
};

// Execute stored procedure
const executeStoredProcedure = async (procedureName, params = {}) => {
  try {
    const pool = await getConnection();
    const request = pool.request();
    
    // Add parameters to request
    Object.keys(params).forEach(key => {
      request.input(key, params[key]);
    });
    
    const result = await request.execute(procedureName);
    return result;
  } catch (error) {
    console.error('❌ Stored procedure error:', error.message);
    throw error;
  }
};

// Execute transaction
const executeTransaction = async (queries) => {
  const transaction = new sql.Transaction(await getConnection());
  try {
    await transaction.begin();
    
    const results = [];
    for (const { query, params } of queries) {
      const request = new sql.Request(transaction);
      
      // Add parameters
      Object.keys(params || {}).forEach(key => {
        request.input(key, params[key]);
      });
      
      const result = await request.query(query);
      results.push(result);
    }
    
    await transaction.commit();
    return results;
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Transaction error:', error.message);
    throw error;
  }
};

// Health check for database
const healthCheck = async () => {
  try {
    const result = await executeQuery('SELECT COUNT(*) as branch_count, GETDATE() as timestamp FROM Branch');
    return {
      status: 'healthy',
      timestamp: result.recordset[0].timestamp,
      database: process.env.DB_NAME,
      branchCount: result.recordset[0].branch_count
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      database: process.env.DB_NAME
    };
  }
};

// Close database connection
const closeConnection = async () => {
  try {
    if (poolConnection) {
      await poolConnection.close();
      poolConnection = null;
      console.log('🔒 SQL Server connection closed');
    }
  } catch (error) {
    console.error('❌ Error closing database connection:', error.message);
  }
};

module.exports = {
  sql,
  initDatabase,
  testConnection,
  getConnection,
  closeConnection,
  executeQuery,
  executeStoredProcedure,
  executeTransaction,
  healthCheck,
  dbConfig
};