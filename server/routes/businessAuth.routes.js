// server/routes/auth.routes.js
import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Business from '../models/Business.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

// Signup route
router.post('/signup',verifyToken, async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ message: 'Business already exists' });
    }
    
    const hashedPassword = await bcryptjs.hash(password, 10);
    const newBusiness = new Business({
      name, 
      email, 
      password: hashedPassword, 
      phone, 
      address,
    });
    
    await newBusiness.save();
    
    const token = jwt.sign({ id: newBusiness._id }, JWT_SECRET);
    res.status(201).json({ token, business: newBusiness });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Login route
router.post('/login',verifyToken, async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    const business = await Business.findOne({ email });
    if (!business) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const isValidPassword = await bcryptjs.compare(password, business.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: business._id }, JWT_SECRET);
    res.status(200).json({ token, business });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

export default router;