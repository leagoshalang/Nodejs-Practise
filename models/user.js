const bcrypt = require('bcrypt');
const dbConfig = require('../config/confi');
const { response } = require('express');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


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

/*--------------------------------------------------------------------------------------------------*/
const sendResetEmail = async (email, resetToken, username) => {
       
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER, 
                pass: process.env.EMAIL_PASS 
            }

        });

        const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;   

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request',
            text: `Hello ${username},\n\nYou requested a password reset. Please use the following link to reset your password:\n\n${resetLink}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.\n\nBest regards,\nYour Company`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);

    }


const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password are required' });
    }
    if(newPassword.length < 8){
        return res.status(400).json({error: 'Password must be at least 8 characters'});
    }
    
    try {
        const hashedPassword = await bcrypt.hash(newPassword, 12);

        const query = 'UPDATE user SET password = ?, WHERE id= ?';
        await dbConfig.promise().query(query, [hashedPassword, userId]);

        res.status(200).json({ message: 'Password reset successful' });

    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ error: 'Error during password reset' });
    }

}

const forgotPassword = async (req, res) => {
    const {email} = req.body;
    if(!email){
        return res.status(400).json({error: 'Please provide email'});
    }
    const query = 'SELECT * FROM user WHERE email = ?'
    dbConfig.query(query, [email], async (error, results) => {
        if (error) {
            console.error('Database check error:', error);
            return res.status(500).json({ error: 'Database error during user check' })
        }
        
        if (results.length == 0) {
            return res.status(404).json({ error: 'Email not found' })
        }

        try{
            const user = results[0]

        // Here you would typically generate a reset token and send an email
        const resetToken = crypto.randomBytes(32).toString('hex');
       // const hashedToken = await bcrypt.hash(resetToken, 12);

        const tokenExpiry = Date.now() + 3600000; // 1 hour from now
        //const updateQuery = 'UPDATE user SET resetToken = ?, tokenExpiry = ? WHERE username = ?';

        //await dbConfig.promise().query(updateQuery, [hashedToken, tokenExpiry, user.id])
        
        await sendResetEmail(email,resetToken,user.id)
       

        console.log(`Password reset token for ${email}: ${resetToken}`);
        console.log(`Token expires at: ${new Date(tokenExpiry).toISOString()}`)


        res.status(200).json({ message: 'Password reset link sent to email' })

        }catch(err){
            console.error('Error during sending reset link process:', err)
    }
}
    )
}
 
    

module.exports = { RegisterUser,UserLogin, forgotPassword, resetPassword };