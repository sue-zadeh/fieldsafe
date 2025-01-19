// volunteer.js
import express from 'express'
import { pool } from './db.js'

const volunteerRouter = express.Router()

const sanitizeInput = (val) => (val === undefined ? null : val)

// GET /volunteers (with optional ?search=)
volunteerRouter.get('/volunteers', async (req, res) => {
  const { search } = req.query
  try {
    let sql = 'SELECT * FROM volunteers WHERE 1=1'
    const params = []

    if (search) {
      sql += ' AND (firstname LIKE ? OR lastname LIKE ? OR email LIKE ?)'
      const wildcard = `%${search}%`
      params.push(wildcard, wildcard, wildcard)
    }
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (error) {
    console.error('Error fetching volunteers:', error)
    res.status(500).json({ message: 'Error fetching volunteers' })
  }
})

// POST /volunteers
volunteerRouter.post('/volunteers', async (req, res) => {
  const {
    firstname,
    lastname,
    email,
    phone,
    emergencyContact,
    emergencyContactNumber,
    role,
  } = req.body

  const sFirst = sanitizeInput(firstname)
  const sLast = sanitizeInput(lastname)
  const sEmail = sanitizeInput(email)
  const sPhone = sanitizeInput(phone)
  const sContact = sanitizeInput(emergencyContact)
  const sContactNum = sanitizeInput(emergencyContactNumber)
  const sRole = sanitizeInput(role)

  try {
    // Check if email is unique for volunteer
    const [exists] = await pool.query(
      'SELECT email FROM volunteers WHERE email = ?',
      [sEmail]
    )
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Email is already in use.' })
    }

    const sql = `
      INSERT INTO volunteers
        (firstname, lastname, email, phone, emergencyContact, emergencyContactNumber, role)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
    const [result] = await pool.execute(sql, [
      sFirst,
      sLast,
      sEmail,
      sPhone,
      sContact,
      sContactNum,
      sRole,
    ])

    res.status(201).json({
      id: result.insertId,
      firstname: sFirst,
      lastname: sLast,
      email: sEmail,
      phone: sPhone,
      emergencyContact: sContact,
      emergencyContactNumber: sContactNum,
      role: sRole,
      message: 'Volunteer created successfully',
    })
  } catch (error) {
    console.error('Error creating volunteer:', error.message)
    res.status(500).json({ message: 'Failed to create volunteer' })
  }
})

// PUT /volunteers/:id
volunteerRouter.put('/volunteers/:id', async (req, res) => {
  const { id } = req.params
  const {
    firstname,
    lastname,
    email,
    phone,
    emergencyContact,
    emergencyContactNumber,
    role,
  } = req.body

  const sFirst = sanitizeInput(firstname)
  const sLast = sanitizeInput(lastname)
  const sEmail = sanitizeInput(email)
  const sPhone = sanitizeInput(phone)
  const sContact = sanitizeInput(emergencyContact)
  const sContactNum = sanitizeInput(emergencyContactNumber)
  const sRole = sanitizeInput(role)

  try {
    // check if email is used by another volunteer
    const [exists] = await pool.query(
      'SELECT email FROM volunteers WHERE email = ? AND id != ?',
      [sEmail, id]
    )
    if (exists.length > 0) {
      return res.status(400).json({ message: 'Email is already in use.' })
    }

    // get existing volunteer
    const [rows] = await pool.query('SELECT * FROM volunteers WHERE id = ?', [
      id,
    ])
    if (!rows.length) {
      return res.status(404).json({ message: 'Volunteer not found' })
    }

    const oldV = rows[0]
    const updatedFirst = sFirst ?? oldV.firstname
    const updatedLast = sLast ?? oldV.lastname
    const updatedEmail = sEmail ?? oldV.email
    const updatedPhone = sPhone ?? oldV.phone
    const updatedContact = sContact ?? oldV.emergencyContact
    const updatedContactNum = sContactNum ?? oldV.emergencyContactNumber
    const updatedRole = sRole ?? oldV.role

    const updateSql = `
      UPDATE volunteers
      SET firstname = ?, lastname = ?, email = ?, phone = ?, emergencyContact = ?, emergencyContactNumber = ?, role = ?
      WHERE id = ?
    `
    const [result] = await pool.execute(updateSql, [
      updatedFirst,
      updatedLast,
      updatedEmail,
      updatedPhone,
      updatedContact,
      updatedContactNum,
      updatedRole,
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Volunteer not updated' })
    }
    res.json({ message: 'Volunteer updated successfully' })
  } catch (error) {
    console.error('Error updating volunteer:', error.message)
    res.status(500).json({ message: 'Error updating volunteer.' })
  }
})

// DELETE /volunteers/:id
volunteerRouter.delete('/volunteers/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.execute('DELETE FROM volunteers WHERE id = ?', [
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Volunteer not found' })
    }
    res.json({ message: 'Volunteer deleted successfully' })
  } catch (error) {
    console.error('Error deleting volunteer:', error.message)
    res.status(500).json({ message: 'Error deleting volunteer.' })
  }
})
///////////////////////////////
// ----===Add Staffs===----
// POST /api/project_staff
router.post('/project_staff', async (req, res) => {
  const { project_id, staff_id } = req.body
  try {
    const sql = `
      INSERT INTO project_staff (project_id, staff_id)
      VALUES (?, ?)
    `
    await pool.execute(sql, [project_id, staff_id])
    res.status(201).json({ message: 'Staff assigned to project successfully' })
  } catch (error) {
    console.error('Error assigning staff:', error)
    res.status(500).json({ message: 'Error assigning staff to project' })
  }
})
// ----=====Delete Volunteers=====----

// Show Only Unassigned Volunteers
router.get('/unassigned_volunteer/:project_id', async (req, res) => {
  const { project_id } = req.params
  try {
    const sql = `
      SELECT s.id, s.firstname, s.lastname, s.phone, s.role
      FROM volunteers s
      WHERE s.id NOT IN (
        SELECT ps.staff_id
        FROM project_staff ps
        WHERE ps.project_id = ?
      )
    `
    const [rows] = await pool.query(sql, [project_id])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching unassigned staff:', error)
    res.status(500).json({ message: 'Error fetching unassigned staff' })
  }
})

// DELETE /api/project_staff/:id
router.delete('/project_staff/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      DELETE FROM project_staff
      WHERE id = ?
    `
    await pool.execute(sql, [id])
    res.json({ message: 'Staff removed from project' })
  } catch (error) {
    console.error('Error removing staff:', error)
    res.status(500).json({ message: 'Error removing staff from project' })
  }
})



export default volunteerRouter
