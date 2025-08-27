const bcrypt = require('bcrypt');
const dbConfig = require('../config/confi');
const { response } = require('express');

const RegisterUser = (req, res) => {
    const { username, email, password } = req.body;

    // Validate password length-
    if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Check if the user exists
    const checkUser = 'SELECT username FROM user WHERE username = ? OR email = ?';
    
    dbConfig.query(checkUser, [username, email], (error, results) => {
        if (error) {
            console.error('Database check error:', error);
            return res.status(500).json({ error: 'Database error during user check' });
        }

       //if user exists return error
        if (results.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }

        // If we get here, the user does NOT exist -> Proceed to hash and insert
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                return res.status(500).json({ error: 'Error hashing password' });
            }

            // Store user in the database
            const query = 'INSERT INTO user (username, email, password) VALUES (?, ?, ?)';
            const values = [username, email, hashedPassword];

            dbConfig.query(query, values, (err, result) => {
                if (err) {
                    // This might catch other errors (e.g., duplicate raced in)
                    console.error('Database insert error:', err);
                    return res.status(500).json({ error: 'Error registering user' });
                }
                res.status(201).json({ message: 'User registered successfully', userId: result.insertId });
            });
        });
    }); 
}; 

/*--------------------------------------------------------------------------------------------------*/

const UserLogin = (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM `user` WHERE username = ?'; // Select all columns to get password
    dbConfig.query(query, [username], async (error, results) => {
        if (error) {
            console.error('Database check error:', error);
            return res.status(500).json({ error: 'Database error during user check' });
        }
        
        if (results.length == 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        console.log('User found:', user); 
        console.log('Stored password hash:', user.password);

        try {
            const isPasswordValid = await bcrypt.compare(password, user.password);
            console.log('Password valid:', isPasswordValid);

            if (!isPasswordValid) {
                console.log('Password comparison failed');
                return res.status(401).json({ error: 'Invalid username or password' });
            }

            res.status(200).json({ 
                message: 'Login successful',
                user: {
                    username: user.username,
                    email: user.email
                }
            });
            
        } catch (hashError) {
            console.error('Password comparison error:', hashError);
            return res.status(500).json({ error: 'Error during login process' });
        }
    });
};

module.exports = { RegisterUser,UserLogin };