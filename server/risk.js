// server/risk.js
import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// Fetch all risks
router.get('/risks', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, isReadOnly FROM risk_titles ORDER BY id'
    )
    res.json(rows)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to fetch risks.' })
  }
})

// Fetch controls for a risk
router.get('/risks/:id/controls', async (req, res) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query(
      'SELECT id, risk_title_id, control_text, isReadOnly FROM risk_controls WHERE risk_title_id = ?',
      [id]
    )
    res.json(rows)
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to fetch controls.' })
  }
})

// Create a new risk
router.post('/risks', async (req, res) => {
  try {
    const { title, isReadOnly = 0 } = req.body
    const [result] = await pool.query(
      'INSERT INTO risk_titles (title, isReadOnly) VALUES (?, ?)',
      [title, isReadOnly]
    )
    res.status(201).json({ id: result.insertId })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to create risk.' })
  }
})

// Add a control to a risk
router.post('/risks/:id/controls', async (req, res) => {
  try {
    const { id } = req.params
    const { control_text, isReadOnly = 0 } = req.body
    const [result] = await pool.query(
      'INSERT INTO risk_controls (risk_title_id, control_text, isReadOnly) VALUES (?, ?, ?)',
      [id, control_text, isReadOnly]
    )
    res.status(201).json({ message: 'Control added successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to add control.' })
  }
})

// Edit control text
router.put('/risk_controls/:controlId', async (req, res) => {
  try {
    const { controlId } = req.params
    const { control_text } = req.body
    const [[control]] = await pool.query(
      'SELECT isReadOnly FROM risk_controls WHERE id = ?',
      [controlId]
    )
    if (!control || control.isReadOnly) {
      return res
        .status(403)
        .json({ message: 'Cannot edit a read-only control.' })
    }
    await pool.query('UPDATE risk_controls SET control_text = ? WHERE id = ?', [
      control_text,
      controlId,
    ])
    res.json({ message: 'Control updated successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to update control.' })
  }
})

// Delete a risk
router.delete('/risks/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [[risk]] = await pool.query(
      'SELECT isReadOnly FROM risks WHERE id = ?',
      [id]
    )
    if (!risk || risk.isReadOnly) {
      return res
        .status(403)
        .json({ message: 'Cannot delete a read-only risk.' })
    }
    await pool.query('DELETE FROM risks WHERE id = ?', [id])
    res.json({ message: 'Risk deleted successfully.' })
  } catch (err) {
    console.error('Error:', err)
    res.status(500).json({ message: 'Failed to delete risk.' })
  }
})

export default router
