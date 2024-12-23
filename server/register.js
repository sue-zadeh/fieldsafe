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

// ============ UPDATE USER (Partial Updates) ============
router.put('/users/:id', async (req, res) => {
  const { id } = req.params
  const { firstname, lastname, email, phone, role } = req.body

  try {
    // Retrieve existing user
    const [rows] = await pool.query('SELECT * FROM registration WHERE id = ?', [id])
    if (!rows.length) {
      return res.status(404).json({ message: 'User not found' })
    }
    const existing = rows[0]

    // Merge new data with existing data
    const updatedFirstname = firstname ?? existing.firstname
    const updatedLastname = lastname ?? existing.lastname
    const updatedEmail = email ?? existing.email
    const updatedPhone = phone ?? existing.phone
    const updatedRole = role ?? existing.role

    // Update DB
    const [result] = await pool.query(
      `UPDATE registration
       SET firstname=?, lastname=?, email=?, phone=?, role=?
       WHERE id=?`,
      [updatedFirstname, updatedLastname, updatedEmail, updatedPhone, updatedRole, id]
    )

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({ message: 'User updated successfully' })
  } catch (err) {
    console.error('Error updating user:', err)
    res.status(500).json({ message: 'Error updating user.' })
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
