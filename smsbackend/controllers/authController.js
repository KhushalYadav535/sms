const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    console.log('Attempting login for:', email);
    const user = await User.findByEmail(email);
    
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '1d' }
    );

    console.log('Login successful for:', email);
    res.json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      }, 
      token 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    console.log('Attempting registration for:', email);
    console.log('Request body:', { name, email, password: '***' });

    // Check if user exists
    const existing = await User.findByEmail(email);
    if (existing) {
      console.log('Email already exists:', email);
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash password
    console.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    console.log('Password hashed successfully');

    // Create user
    console.log('Creating new user...');
    const newUser = await User.create({ 
      name, 
      email, 
      password: hash, 
      role: 'user'
    });
    console.log('User created successfully:', { id: newUser.id, email: newUser.email, role: newUser.role });

    // Generate token
    console.log('Generating token...');
    const token = jwt.sign(
      { id: newUser.id, role: newUser.role }, 
      process.env.JWT_SECRET || 'your-secret-key', 
      { expiresIn: '1d' }
    );
    console.log('Token generated successfully');

    // Send response
    console.log('Sending response...');
    res.status(201).json({ 
      user: { 
        id: newUser.id, 
        name: newUser.name, 
        email: newUser.email, 
        role: newUser.role 
      }, 
      token 
    });
    console.log('Registration completed successfully for:', email);
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      errno: error.errno,
      sqlMessage: error.sqlMessage,
      sqlState: error.sqlState
    });
    res.status(500).json({ 
      message: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
