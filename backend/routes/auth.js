const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'connectiq_super_secret';

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, interests } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      interests: interests || [],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2d5a4c&color=fff&size=150`
    });

    await user.save();
    
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        avatar: user.avatar,
        interests: user.interests,
        networkLevel: user.networkLevel || 'Elite'
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email,
        avatar: user.avatar,
        interests: user.interests,
        networkLevel: user.networkLevel || 'Elite'
      } 
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
});

module.exports = router;
