const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token provided in request');
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    try {
      // Verify token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      console.log('JWT Secret available:', !!jwtSecret);
      
      const decoded = jwt.verify(token, jwtSecret);
      console.log('Token decoded successfully:', { id: decoded.id, email: decoded.email, role: decoded.role });

      // Get user from database
      const result = await db.query(
        'SELECT id, name, email, role FROM users WHERE id = $1',
        [decoded.id]
      );

      if (result.rows.length === 0) {
        console.log('User not found in database for ID:', decoded.id);
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user to request object
      req.user = result.rows[0];
      console.log('User authenticated successfully:', { id: req.user.id, email: req.user.email, role: req.user.role });
      next();
    } catch (error) {
      console.error('Token verification failed:', error);
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 