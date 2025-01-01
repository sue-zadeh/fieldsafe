// server/objectives.js
import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET /api/objectives
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM objectives')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching objectives:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

// POST /api/objectives
router.post('/', async (req, res) => {
  try {
    const { title, measurement } = req.body
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Objective title is required' })
    }
    if (!measurement || !measurement.trim()) {
      return res.status(400).json({ message: 'Measurement is required' })
    }

    const sql = 'INSERT INTO objectives (title, measurement) VALUES (?, ?)'
    await pool.query(sql, [title.trim(), measurement.trim()])
    return res.status(201).json({ message: 'Objective added successfully!' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // MySQL duplicate key error => "title" not unique
      return res
        .status(400)
        .json({ message: 'Objective title already exists.' })
    }
    console.error('Error adding objective:', error)
    return res.status(500).json({ message: 'Failed to add objective.' })
  }
})

// PUT /api/objectives/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { title, measurement } = req.body
  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Objective title is required' })
  }
  if (!measurement || !measurement.trim()) {
    return res.status(400).json({ message: 'Measurement is required' })
  }

  try {
    const sql = 'UPDATE objectives SET title = ?, measurement = ? WHERE id = ?'
    const [result] = await pool.query(sql, [
      title.trim(),
      measurement.trim(),
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objective not found' })
    }
    return res.json({ message: 'Objective updated successfully!' })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // e.g. user trying to rename to an existing title
      return res
        .status(400)
        .json({ message: 'Objective title already exists.' })
    }
    console.error('Error updating objective:', error)
    return res.status(500).json({ message: 'Failed to update objective.' })
  }
})

// DELETE /api/objectives/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = 'DELETE FROM objectives WHERE id = ?'
    const [result] = await pool.query(sql, [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objective not found' })
    }
    return res.json({ message: 'Objective deleted successfully!' })
  } catch (error) {
    console.error('Error deleting objective:', error)
    return res.status(500).json({ message: 'Failed to delete objective.' })
  }
})

export default router
