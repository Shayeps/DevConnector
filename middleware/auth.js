const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = function (req, res, next) {
  // Must have token in order to pass this auth middleware
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtToken'));

    // Return decoded user - we can access it from anywhere
    req.user = decoded.user;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(401).json({ msg: 'Token is not valid' });
  }
};
