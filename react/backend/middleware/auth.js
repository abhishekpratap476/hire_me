const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ServiceProvider = require('../models/ServiceProvider');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user exists
    let user = await User.findById(decoded.userId);
    if (!user) {
      // If not found in users, check service providers
      user = await ServiceProvider.findById(decoded.userId);
      if (!user) {
        throw new Error();
      }
    }

    // Add user info to request
    req.user = user;
    req.user._id = decoded.userId;
    req.token = token;

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid or expired' });
  }
};

module.exports = auth; 