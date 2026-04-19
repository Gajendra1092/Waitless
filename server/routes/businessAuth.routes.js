// server/routes/auth.routes.js
import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Business from '../models/Business.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'refresh_secret';

// Helper to generate tokens
const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

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

    const newBusiness = new Business({ name, email, password, phone, address });
    await newBusiness.save();

    const { accessToken, refreshToken } = generateTokens(newBusiness._id);

    // Store refresh token in Redis (7 days TTL)
    if (req.redis) {
        await req.redis.setEx(`refresh_token:${newBusiness._id}`, 7 * 24 * 60 * 60, refreshToken);
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(201).json({ accessToken, business: { id: newBusiness._id, name: newBusiness.name, email: newBusiness.email } });
  } catch (error) {
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
    if (!business || !(await bcryptjs.compare(password, business.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const { accessToken, refreshToken } = generateTokens(business._id);

    // Store refresh token in Redis
    if (req.redis) {
        await req.redis.setEx(`refresh_token:${business._id}`, 7 * 24 * 60 * 60, refreshToken);
    }

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken, business: { id: business._id, name: business.name, email: business.email } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Refresh token route
router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token missing' });

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    
    // Verify against Redis
    if (req.redis) {
        const storedToken = await req.redis.get(`refresh_token:${decoded.id}`);
        if (storedToken !== refreshToken) {
            return res.status(403).json({ message: 'Refresh token revoked or invalid' });
        }
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.id);

    // Update Redis with new refresh token (Token Rotation)
    if (req.redis) {
        await req.redis.setEx(`refresh_token:${decoded.id}`, 7 * 24 * 60 * 60, newRefreshToken);
    }

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({ accessToken });
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token' });
  }
});

// Logout route
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Delete from Redis
    if (req.redis) {
        await req.redis.del(`refresh_token:${req.businessId}`);
    }
    res.clearCookie('refreshToken');
    res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get profile route
router.get('/profile', verifyToken, async (req, res) => {
  try {
    // Select the necessary fields including phone and address for the settings page
    const business = await Business.findById(req.businessId).select('_id name email avatar phone address');
    
    if (!business) {
      return res.status(404).json({ message: 'Business not found' });
    }
    
    res.status(200).json({
      id: business._id,
      name: business.name,
      email: business.email,
      phone: business.phone || '',
      address: business.address || '',
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