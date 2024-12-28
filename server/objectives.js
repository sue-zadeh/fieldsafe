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

export default router
