import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET /api/objectives
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM objectives')
    // e.g. rows = [ {id:1, title:'Establishing predator control', measurement:'trap numbers'}, ... ]
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

    // Validate input
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Objective title is required' })
    }
    // measurement can be optional, but if you want to require it:
    if (!measurement || !measurement.trim()) {
      return res.status(400).json({ message: 'Measurement is required' })
    }

    // Insert objective
    const insertSql = `
      INSERT INTO objectives (title, measurement)
      VALUES (?, ?)
    `
    const [result] = await pool.query(insertSql, [
      title.trim(),
      measurement.trim(),
    ])
    const newId = result.insertId

    return res.status(201).json({
      message: 'Objective added successfully!',
      id: newId,
    })
  } catch (error) {
    console.error('Error adding objective:', error)
    return res.status(500).json({ message: 'Failed to add objective.' })
  }
})

export default router
