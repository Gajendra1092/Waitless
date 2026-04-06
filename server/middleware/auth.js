import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // "Bearer token"
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.businessId = decoded.id; // Attach business ID to request
    next(); // Allow access
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};