// src/api/controllers/auth.controller.js
const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Handles new user registration
const register = async (req, res) => {
    const { email, password, fullName, phoneNumber, role, ...roleSpecificData } = req.body;

    if (!email || !password || !fullName || !role) {
        return res.status(400).json({ message: 'Email, password, full name, and role are required.' });
    }

    // Get a dedicated client from the pool for transactions
    const client = await db.connect();

    try {
        // CORRECT WAY to start a transaction
        await client.query('BEGIN');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Insert into users table
        const newUserQuery = `
            INSERT INTO users (email, password_hash, full_name, phone_number, role)
            VALUES ($1, $2, $3, $4, $5::user_role)
            RETURNING user_id;
        `;
        const newUser = await client.query(newUserQuery, [email, passwordHash, fullName, phoneNumber, role]);
        const userId = newUser.rows[0].user_id;

        // Insert into role-specific table
        if (role === 'Patient') {
            const { dateOfBirth, gender, address } = roleSpecificData;
            await client.query(
                'INSERT INTO patients (user_id, date_of_birth, gender, address) VALUES ($1, $2, $3, $4)',
                [userId, dateOfBirth, gender, address]
            );
        } else if (role === 'Professional') {
            const { specialty, credentials, yearsOfExperience } = roleSpecificData;
            await client.query(
                'INSERT INTO professionals (user_id, specialty, credentials, years_of_experience) VALUES ($1, $2, $3, $4)',
                [userId, specialty, credentials, yearsOfExperience]
            );
        } else if (role === 'NGO') {
            const { ngoName } = roleSpecificData;
            await client.query(
                'INSERT INTO ngo_users (user_id, ngo_name) VALUES ($1, $2)',
                [userId, ngoName]
            );
        }

        await client.query('COMMIT');

        // Generate JWT
        const token = jwt.sign({ userId: userId, role: role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(201).json({
            message: 'User registered successfully!',
            token,
            user: { id: userId, fullName, email, role }
        });

    } catch (error) {
        // If any error occurs, roll back the transaction
        await client.query('ROLLBACK');
        if (error.code === '23505') { // Unique violation (e.g., email already exists)
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }
        res.status(500).json({ message: 'An error occurred during registration.' });

    } finally {
        // Release the client back to the pool
        client.release();
    }
};

// Handles user login
const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        // Find the user by email
        const userResult = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials.' });
        }

        // Create and return a JWT
        const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful!',
            token,
            user: {
                userId: user.user_id,
                email: user.email,
                fullName: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'An error occurred during login.' });
    }
};


module.exports = {
    register,
    login,
};
