// adminMiddleware.js
export const admin = (req, res, next) => {
  // If the user's role is ADMIN, let them through
  if (req.userRole && req.userRole === 'ADMIN') {
    next();
  } else {
    // If not an admin, block them!
    res.status(403).json({ message: 'Not authorized as an admin' });
  }
};