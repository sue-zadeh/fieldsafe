// server.js
import mysql from 'mysql2/promise'
import express from 'express'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

// Import route files
import staffRoutes from './register.js' // For Staffs (GroupAdmin, TeamLeader, FieldStaff) + email
import volunteerRoutes from './volunteer.js' // For Volunteers (no email sending)

dotenv.config()

const app = express()
app.use(express.json())

// MySQL connection pool
const pool = mysql.createPool({
  host: process.env.db_host,
  user: process.env.db_user,
  password: process.env.db_pass,
  database: process.env.db_name,
  waitForConnections: true,
  connectionLimit: 10,
})

// Test DB connection
;(async () => {
  try {
    const connection = await pool.getConnection()
    console.log('Database connected!')
    connection.release()
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }
})()

// ================= STAFF + EMAIL ROUTES
//  If "register.js" exports a router that uses `/staff`, `/send-email`, etc.
app.use('/api', staffRoutes) // so inside "register.js" we should have routes like router.get('/staff', …)

// ================= VOLUNTEER ROUTES
app.use('/api', volunteerRoutes) // so inside "volunteer.js" we'll see router.get('/volunteers', …)

// ================= LOGIN, JWT, FORGOT PASSWORD
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const [rows] = await pool.query('SELECT * FROM login WHERE username = ?', [
      email,
    ])

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    const user = rows[0]
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    return res.json({
      message: 'Login successful',
      token,
      firstname: user.firstname,
      lastname: user.lastname,
    })
  } catch (err) {
    console.error('Error during login:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
})

app.get('/api/validate-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return res.status(200).json({
      message: 'Token is valid',
      user: decoded,
    })
  } catch (err) {
    console.error('Token validation failed:', err.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
})

app.post('/api/forgot-password', async (req, res) => {
  const { email } = req.body
  if (!email) {
    return res.status(400).json({ message: 'Email is required' })
  }

  try {
    const [rows] = await pool.query('SELECT * FROM login WHERE username = ?', [
      email,
    ])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Email not found' })
    }

    const user = rows[0]
    const newPassword = Math.random().toString(36).substring(2, 10)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE login SET password = ? WHERE id = ?', [
      hashedPassword,
      user.id,
    ])

    // Email the new password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Password Reset',
      text: `Your new password is: ${newPassword}`,
    }

    await transporter.sendMail(mailOptions)
    return res.json({ message: 'Password reset email sent successfully' })
  } catch (err) {
    console.error('Error during password reset:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
})

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
