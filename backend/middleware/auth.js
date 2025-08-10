// Dummy auth middleware since auth system was removed
// This allows the routes to work without authentication

const authenticateToken = (req, res, next) => {
  // Mock user for routes that need user context
  req.user = {
    id: 1,
    username: 'guest',
    email: 'guest@example.com',
    role: 'user',
    roleId: 2
  };
  next();
};

const requireAdmin = (req, res, next) => {
  // Allow all users for now
  next();
};

const requireUser = (req, res, next) => {
  // Allow all users for now
  next();
};

const authenticateAndFetchUser = (req, res, next) => {
  // Mock user for routes that need user context
  req.user = {
    id: 1,
    username: 'guest',
    email: 'guest@example.com',
    role: 'user',
    roleId: 2
  };
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireUser,
  authenticateAndFetchUser
};