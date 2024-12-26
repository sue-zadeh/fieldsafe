// server/server.js
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import cors from 'cors'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import { pool } from './db.js'
import projectsRouter from './projects.js'
import volunteerRouter from './volunteer.js'
import staffRouter from './register.js'      // The "register.js" routes for staff

import { sendEmail } from './email.js'       // if you need to send email in forgot-password

dotenv.config()

// For ESM, so we can find __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json())
app.use(cors())

// Serve "uploads" folder for images/docs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Use your route modules
app.use('/api/projects', projectsRouter)
app.use('/api/volunteers', volunteerRouter)
app.use('/api', staffRouter) // e.g. "/api/staff" or "/api/send-email"

// Example test route
app.get('/api/ping', (req, res) => {
  res.json({ message: 'pong' })
})

// ================== LOGIN
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

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.json({
      message: 'Login successful',
      token,
      firstname: user.firstname,
      lastname: user.lastname,
    })
  } catch (err) {
    console.error('Error during login:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// ================== Validate token
app.get('/api/validate-token', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ message: 'No token provided' })
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    res.status(200).json({ message: 'Token is valid', user: decoded })
  } catch (err) {
    console.error('Token validation failed:', err.message)
    res.status(401).json({ message: 'Invalid or expired token' })
  }
})

// ================== Forgot Password
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

    // Send the new password by email
    try {
      await sendEmail(email, 'Password Reset', `Your new password is: ${newPassword}`)
    } catch (err) {
      console.error('Error sending reset email:', err.message)
      return res.status(500).json({ message: 'Failed to send reset email' })
    }

    res.json({ message: 'Password reset email sent successfully' })
  } catch (err) {
    console.error('Error during forgot password:', err.message)
    res.status(500).json({ message: 'Server error' })
  }
})

// Test DB connection at startup
;(async () => {
  try {
    const conn = await pool.getConnection()
    console.log('Database connected!')
    conn.release()
  } catch (err) {
    console.error('Database connection failed:', err.message)
    process.exit(1)
  }
})()

// Start server
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
