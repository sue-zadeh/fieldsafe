import express from 'express'
import { pool } from './db.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const router = express.Router()

// Email configuration using nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

// Helper function to send email
const sendEmail = async (email, subject, message) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: message,
    })
  } catch (error) {
    console.error('Error sending email:', error.message)
  }
}

// Helper function to sanitize inputs
const sanitizeInput = (value) => (value === undefined ? null : value)

// ============ GET ALL (with optional role and search) ============
router.get('/users', async (req, res) => {
  const { role, search } = req.query

  try {
    let sql = 'SELECT * FROM registration WHERE 1=1'
    const params = []

    // If a role was provided, filter by role
    if (role) {
      sql += ' AND role = ?'
      params.push(role)
    }

    // If there is a search term, filter by firstname, lastname or a letter
    if (search) {
      sql += ' AND (firstname LIKE ? OR lastname LIKE ? OR email LIKE ?)'
      const wildcard = `%${search}%`
      params.push(wildcard, wildcard, wildcard)
    }

    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ message: 'Error fetching users' })
  }
})

// ============ CREATE USER ============
router.post('/users', async (req, res) => {
  const { firstname, lastname, email, phone, role } = req.body

  // Sanitize inputs
  const sanitizedFirstname = sanitizeInput(firstname)
  const sanitizedLastname = sanitizeInput(lastname)
  const sanitizedEmail = sanitizeInput(email)
  const sanitizedPhone = sanitizeInput(phone)
  const sanitizedRole = sanitizeInput(role)

  // Check email uniqueness
  try {
    const [existingUser] = await pool.query(
      'SELECT email FROM registration WHERE email = ?',
      [sanitizedEmail]
    )
    if (existingUser.length > 0) {
      return res.status(400).json({
        message: 'Email is already in use. Please use a unique email.',
      })
    }

    const query =
      'INSERT INTO registration (firstname, lastname, email, phone, role) VALUES (?, ?, ?, ?, ?)'
    const [result] = await pool.execute(query, [
      sanitizedFirstname,
      sanitizedLastname,
      sanitizedEmail,
      sanitizedPhone,
      sanitizedRole,
    ])

    // Send email to the new user
    const emailMessage = `Dear ${sanitizedFirstname} ${sanitizedLastname},\n\nYou have been successfully registered as a ${sanitizedRole}.\n\nBest regards,\nFieldBase Team.`
    await sendEmail(sanitizedEmail, 'Registration Confirmation', emailMessage)

    res.status(201).json({
      id: result.insertId,
      firstname: sanitizedFirstname,
      lastname: sanitizedLastname,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      role: sanitizedRole,
      message: 'User added successfully',
    })
  } catch (error) {
    console.error('Error adding user:', error.message)
    res.status(500).json({ message: 'Error adding user. Please try again.' })
  }
})

// ============ UPDATE USER ============
router.put('/users/:id', async (req, res) => {
  // const { id } = req.params
  const { firstname, lastname, email, phone, role } = req.body

  const query = `
    UPDATE registration 
    SET firstname = ?, lastname = ?, email = ?, phone = ?, role = ?
    WHERE id = ?`

  // Sanitize inputs
  const sanitizedFirstname = sanitizeInput(firstname)
  const sanitizedLastname = sanitizeInput(lastname)
  const sanitizedEmail = sanitizeInput(email)
  const sanitizedPhone = sanitizeInput(phone)
  const sanitizedRole = sanitizeInput(role)

  // Check email uniqueness (except for the same user ID)
  try {
    const [existingUser] = await pool.query(
      'SELECT email FROM registration WHERE email = ? AND id != ?',
      [sanitizedEmail, id]
    )
    if (existingUser.length > 0) {
      return res.status(400).json({
        message: 'Email is already in use. Please use a unique email.',
      })
    }

    const query =
      'UPDATE registration SET firstname = ?, lastname = ?, email = ?, phone = ?, role = ? WHERE id = ?'
    const [result] = await pool.execute(query, [
      sanitizedFirstname,
      sanitizedLastname,
      sanitizedEmail,
      sanitizedPhone,
      sanitizedRole,
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User updated successfully' })
  } catch (error) {
    console.error('Error updating user:', error.message)
    res.status(500).json({ message: 'Error updating user. Please try again.' })
  }
})

// ============ DELETE USER ============
router.delete('/users/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.execute(
      'DELETE FROM registration WHERE id = ?',
      [id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error.message)
    res.status(500).json({ message: 'Error deleting user. Please try again.' })
  }
})

export default router
