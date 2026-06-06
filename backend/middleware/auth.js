/**
 * Bypassed Authentication Protection Middleware
 * Maps all REST endpoint actions automatically to the single local default-user,
 * completely eliminating the need for login/register credentials.
 */
const protect = async (req, res, next) => {
  // Attach local default user parameters
  req.user = {
    id: 'default-user',
    name: 'Premium User',
    email: 'user@example.com'
  };
  next();
};

module.exports = { protect };
