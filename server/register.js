// register.js
import express from 'express'
import { pool } from './db.js'
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const router = express.Router()

// Setup nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // e.g. "fieldbase.email@gmail.com"
    pass: process.env.EMAIL_PASS,
  },
})

// Helper to send email
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

// Route to let front-end do axios.post('/api/send-email', {...})
router.post('/send-email', async (req, res) => {
  const { email, subject, message } = req.body
  try {
    await sendEmail(email, subject, message)
    res.json({ message: 'Email sent successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Failed to send email' })
  }
})

const sanitizeInput = (value) => (value === undefined ? null : value)

// ========== GET /staff (with optional ?role= & ?search=)
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
    res.json(rows)
  } catch (error) {
    console.error('Error fetching staff:', error)
    res.status(500).json({ message: 'Error fetching staff' })
  }
})

// ========== POST /staff (create new staff, e.g. GroupAdmin/TeamLeader/FieldStaff)
router.post('/staff', async (req, res) => {
  const { firstname, lastname, email, phone, role } = req.body
  const sFirst = sanitizeInput(firstname)
  const sLast = sanitizeInput(lastname)
  const sEmail = sanitizeInput(email)
  const sPhone = sanitizeInput(phone)
  const sRole = sanitizeInput(role)

  try {
    // Check duplicates
    const [exists] = await pool.query(
      'SELECT email FROM staffs WHERE email = ?',
      [sEmail]
    )
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Email is already in use.' })
    }

    // Insert
    const sql = `
      INSERT INTO staffs (firstname, lastname, email, phone, role)
      VALUES (?, ?, ?, ?, ?)
    `
    const [result] = await pool.execute(sql, [
      sFirst,
      sLast,
      sEmail,
      sPhone,
      sRole,
    ])

    res.status(201).json({
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
    res.status(500).json({ message: 'Failed to create staff' })
  }
})

// ========== PUT /staff/:id (update existing staff)
router.put('/staff/:id', async (req, res) => {
  const { id } = req.params
  const { firstname, lastname, email, phone, role } = req.body

  const sFirst = sanitizeInput(firstname)
  const sLast = sanitizeInput(lastname)
  const sEmail = sanitizeInput(email)
  const sPhone = sanitizeInput(phone)
  const sRole = sanitizeInput(role)

  try {
    // Check if email is used by another staff
    const [exists] = await pool.query(
      'SELECT email FROM staffs WHERE email = ? AND id != ?',
      [sEmail, id]
    )
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Email is already in use.' })
    }

    // Retrieve existing row
    const [rows] = await pool.query('SELECT * FROM staffs WHERE id = ?', [id])
    if (!rows.length) {
      return res.status(404).json({ message: 'Staff not found' })
    }

    const old = rows[0]
    const updatedFirstname = sFirst ?? old.firstname
    const updatedLastname = sLast ?? old.lastname
    const updatedEmail = sEmail ?? old.email
    const updatedPhone = sPhone ?? old.phone
    const updatedRole = sRole ?? old.role

    const updateSql = `
      UPDATE staffs
      SET firstname = ?, lastname = ?, email = ?, phone = ?, role = ?
      WHERE id = ?
    `
    const [result] = await pool.execute(updateSql, [
      updatedFirstname,
      updatedLastname,
      updatedEmail,
      updatedPhone,
      updatedRole,
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff not updated' })
    }

    res.json({ message: 'Staff updated successfully' })
  } catch (error) {
    console.error('Error updating staff:', error.message)
    res.status(500).json({ message: 'Error updating staff.' })
  }
})

// ========== DELETE /staff/:id
router.delete('/staff/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.execute('DELETE FROM staffs WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Staff not found' })
    }
    res.json({ message: 'Staff deleted successfully' })
  } catch (error) {
    console.error('Error deleting staff:', error.message)
    res.status(500).json({ message: 'Error deleting staff.' })
  }
})

export default router
