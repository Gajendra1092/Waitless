// server/routes/auth.routes.js
import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Business from '../models/Business.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

const tokenBlacklist = new Set();
// Signup route
router.post('/signup', async (req, res) => {
  try {

    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    const existingBusiness = await Business.findOne({ email });
    if (existingBusiness) {
      return res.status(400).json({ message: 'Business already exists' });
    }

    const newBusiness = new Business({
      name, 
      email, 
      password, 
      phone, 
      address,
    });

    await newBusiness.save();

    const token = jwt.sign({ id: newBusiness._id }, JWT_SECRET);

    res.status(201).json({ token, business: newBusiness });
  } catch (error) {
    console.log("Error details:", error.message);
    console.log("Full error:", error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login route
router.post('/login', async (req, res) => {
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

// Logout route
router.post('/logout', verifyToken, (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: 'Logout successful' 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message 
    });
  }
});

// Get profile route
router.get('/profile', verifyToken, async (req, res) => {
  try {
    const business = await Business.findById(req.businessId).select('name email avatar');
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(200).json({
      name: business.name,
      email: business.email,
      avatar: business.avatar || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update profile route
router.patch('/profile', verifyToken, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const business = await Business.findById(req.businessId);

    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    if (name) business.name = name;
    // Allow empty strings to clear optional fields
    if (typeof phone !== 'undefined') business.phone = phone;
    if (typeof address !== 'undefined') business.address = address;

    await business.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Change password route
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'All password fields are required' });
    }
    if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const business = await Business.findById(req.businessId);
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }

    const isMatch = await bcryptjs.compare(currentPassword, business.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Incorrect current password' });
    }

    business.password = newPassword; // The pre-save hook in the model will hash it
    await business.save();

    res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;