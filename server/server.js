// server/server.js
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import jwt from 'jsonwebtoken'

// Import  routes
import staffRoutes from './register.js'
import volunteerRoutes from './volunteer.js'
import { sendEmail } from './email.js'
import projectsRouter from './projects.js'
import objectivesRouter from './objectives.js'

dotenv.config()
// For find __dirname in ES Modules---------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
//------------------------------
const app = express()
app.use(express.json())

// Serve "uploads" folder for images/docs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
// Use routers for pages---------------------------
app.use('/api/projects', projectsRouter)
app.use('/api/objectives', objectivesRouter)

app.use('/api', staffRoutes)
app.use('/api', volunteerRoutes)

// test route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' })
})
// MySQL pool-------
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

// ================= LOGIN
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

// ================= Validate token-Generate JWT
app.get('/api/validate-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    return res.status(200).json({ message: 'Token is valid', user: decoded })
  } catch (err) {
    console.error('Token validation failed:', err.message)
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
})

// ================= Forgot Password
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
    // Generate random new password
    const newPassword = Math.random().toString(36).substring(2, 10)
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await pool.query('UPDATE login SET password = ? WHERE id = ?', [
      hashedPassword,
      user.id,
    ])

    // Instead of local transporter, call our 'sendEmail' function:
    try {
      await sendEmail(
        email,
        'Password Reset',
        `Your new password is: ${newPassword}`
      )
    } catch (err) {
      console.error('Error sending reset email:', err.message)
      return res.status(500).json({ message: 'Failed to send reset email' })
    }

    return res.json({ message: 'Password reset email sent successfully' })
  } catch (err) {
    console.error('Error during password reset:', err.message)
    return res.status(500).json({ message: 'Server error' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
