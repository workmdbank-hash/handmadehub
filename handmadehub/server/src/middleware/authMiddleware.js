// authMiddleware.js
import jwt from 'jsonwebtoken';

export const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.userId = decoded.userId; 
      req.userRole = decoded.role; 
      next(); 
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// NEW: Security guard that only allows SELLER or ADMIN
export const seller = (req, res, next) => {
  if (req.userRole && (req.userRole === 'SELLER' || req.userRole === 'ADMIN')) {
    next();
  } else {
    res.status(403).json({ message: 'Not authorized. Sellers only.' });
  }
};