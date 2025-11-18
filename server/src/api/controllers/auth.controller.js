// src/api/controllers/auth.controller.js
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const uuid4 = require('uuid4');

// Alternative approach for compatibility with newer uuid versions
// If the above fails, we can use dynamic import in an async context, but for now let's try uuid4
// const uuid4 = require('uuid4');

// For compatibility with ES module version of uuid, we can also use:
// const { v4 as uuidv4 } = require('uuid');

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.user_id, 
      email: user.email, 
      role: user.role,
      user_id_uuid: user.user_id_uuid 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Register a new user
const register = async (req, res) => {
  try {
    const { email, password, full_name, phone_number, role } = req.body;

    // Validate required fields
    if (!email || !password || !full_name || !role) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, full name, and role are required'
      });
    }

    // Validate role
    const validRoles = ['Patient', 'Professional', 'NGO', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role. Must be one of: Patient, Professional, NGO, Admin' 
      });
    }

    // Check if user already exists
    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ 
        success: false, 
        error: 'User with this email already exists' 
      });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for the user
    const userUuid = uuid4();

    // Insert the user into the database
    const result = await db.query(`
      INSERT INTO users (email, password_hash, full_name, phone_number, role, user_id_uuid)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING user_id, email, full_name, role, created_at, user_id_uuid
    `, [email, hashedPassword, full_name, phone_number, role, userUuid]);

    const user = result.rows[0];

    // Create role-specific profile based on the role
    if (role === 'Patient') {
      await db.query(`
        INSERT INTO patients (user_id, user_id_uuid, patient_id_uuid)
        VALUES ($1, $2, $3)
      `, [user.user_id, user.user_id_uuid, uuid4()]);
    } else if (role === 'Professional') {
      await db.query(`
        INSERT INTO professionals (user_id, user_id_uuid, professional_id_uuid)
        VALUES ($1, $2, $3)
      `, [user.user_id, user.user_id_uuid, uuid4()]);
    } else if (role === 'NGO') {
      await db.query(`
        INSERT INTO ngo_users (user_id, user_id_uuid, ngo_name, ngo_user_id_uuid)
        VALUES ($1, $2, $3, $4)
      `, [user.user_id, user.user_id_uuid, full_name, uuid4()]);
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response with token and user data
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during registration' 
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email and password are required' 
      });
    }

    // Find the user in the database
    const result = await db.query(`
      SELECT user_id, email, password_hash, full_name, role, user_id_uuid
      FROM users
      WHERE email = $1
    `, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    const user = result.rows[0];

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        error: 'Invalid email or password' 
      });
    }

    // Generate JWT token
    const token = generateToken(user);

    // Return success response with token and user data
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error during login' 
    });
  }
};

module.exports = {
  register,
  login
};