// server/register.js
import express from 'express'
import bcrypt from 'bcrypt'
import { pool } from './db.js'
import { sendEmail } from './email.js'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// 1) Simple endpoint to send an email
router.post('/send-email', async (req, res) => {
  const { email, subject, message } = req.body
  try {
    await sendEmail(email, subject, message)
    res.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ message: 'Failed to send email' })
  }
})

// Helper to prevent undefined fields from crashing queries
const sanitizeInput = (value) => (value === undefined ? null : value)

// ========================= STAFF ENDPOINTS =========================
// Table: "staffs" (Group Admin, Field Staff, Team Leader)

// ========== (GET) /api/staff?role=&search= (optional filters)
router.get('/staff', async (req, res) => {
  const { role, search } = req.query
  try {
    let sql = 'SELECT * FROM staffs WHERE 1=1'
    const params = []

    if (role) {
      sql += ' AND role = ?'
      params.push(role)
    }
    if (search) {
      sql += ' AND (firstname LIKE ? OR lastname LIKE ? OR email LIKE ?)'
      const wildcard = `%${search}%`
      params.push(wildcard, wildcard, wildcard)
    }

    const [rows] = await pool.query(sql, params)
    return res.json(rows)
  } catch (error) {
    console.error('Error fetching staff:', error)
    return res.status(500).json({ message: 'Error fetching staff' })
  }
})

// ========== (POST) /api/staff — Create new staff
router.post('/staff', async (req, res) => {
  const { firstname, lastname, email, phone, role, password } = req.body

  // Sanitize
  const sFirst = sanitizeInput(firstname)
  const sLast = sanitizeInput(lastname)
  const sEmail = sanitizeInput(email)
  const sPhone = sanitizeInput(phone)
  const sRole = sanitizeInput(role)

  try {
    // 1) Check for email duplicates
    const [exists] = await pool.query(
      'SELECT email FROM staffs WHERE email = ?',
      [sEmail]
    )
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Email is already in use.' })
    }

    // 2) Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // 3) Insert staff with hashed password
    const sql = `
      INSERT INTO staffs (firstname, lastname, email, phone, role, password)
      VALUES (?, ?, ?, ?, ?, ?)
    `
    const [result] = await pool.execute(sql, [
      sFirst,
      sLast,
      sEmail,
      sPhone,
      sRole,
      hashedPassword,
    ])

    return res.status(201).json({
      id: result.insertId,
      firstname: sFirst,
      lastname: sLast,
      email: sEmail,
      phone: sPhone,
      role: sRole,
      message: 'Staff created successfully',
    })
  } catch (error) {
    console.error('Error creating staff:', error.message)
    return res.status(500).json({ message: 'Failed to create staff' })
  }
})

// ========== (PUT) /api/staff/:id — Update existing staff
router.put('/staff/:id', async (req, res) => {
  const { id } = req.params
  const { firstname, lastname, email, phone, role, password } = req.body

  const sFirst = sanitizeInput(firstname)
  const sLast = sanitizeInput(lastname)
  const sEmail = sanitizeInput(email)
  const sPhone = sanitizeInput(phone)
  const sRole = sanitizeInput(role)

  try {
    // Check if new email is used by someone else
    const [exists] = await pool.query(
      'SELECT email FROM staffs WHERE email = ? AND id != ?',
      [sEmail, id]
    )
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Email is already in use.' })
    }

    // Get existing row
    const [rows] = await pool.query('SELECT * FROM staffs WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Staff not found' })
    }

    const old = rows[0]
    const updatedFirstname = sFirst ?? old.firstname
    const updatedLastname = sLast ?? old.lastname
    const updatedEmail = sEmail ?? old.email
    const updatedPhone = sPhone ?? old.phone
    const updatedRole = sRole ?? old.role

    // If password is provided => hash it, otherwise keep old password
    let hashedPassword = old.password
    if (password && password.trim()) {
      hashedPassword = await bcrypt.hash(password, 10)
    }

    // Update row
    // including password in the columns
    const updateSql = `
      UPDATE staffs
      SET firstname = ?, lastname = ?, email = ?, phone = ?, role = ?, password = ?
      WHERE id = ?
    `
    const [result] = await pool.execute(updateSql, [
      updatedFirstname,
      updatedLastname,
      updatedEmail,
      updatedPhone,
      updatedRole,
      hashedPassword,
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff not updated' })
    }

    return res.json({ message: 'Staff updated successfully' })
  } catch (error) {
    console.error('Error updating staff:', error.message)
    return res.status(500).json({ message: 'Error updating staff.' })
  }
})

// ========== (DELETE) /api/staff/:id — Delete staff
router.delete('/staff/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.execute('DELETE FROM staffs WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff not found' })
    }
    return res.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error.message)
    return res.status(500).json({ message: 'Error deleting staff.' })
  }
})

export default router
