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
      // uniqueness objective title ============
      return res
        .status(400)
        .json({ message: 'Objective title already exists.' })
    }
    console.error('Error updating objective:', error)
    return res.status(500).json({ message: 'Failed to update objective.' })
  }
})

// DELETE Objective ================
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    // First, delete related records in project_objectives
    await pool.query('DELETE FROM project_objectives WHERE objective_id = ?', [
      id,
    ])

    // Then, delete the objective itself
    const [result] = await pool.query('DELETE FROM objectives WHERE id = ?', [
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Objective not found.' })
    }

    res.json({ message: 'Objective deleted successfully!' })
  } catch (error) {
    console.error('Error deleting objective:', error)
    res.status(500).json({ message: 'Internal server error.' })
  }
})

// ================================================================
//     NEW ENDPOINTS FOR THE "OUTCOME" / "PROJECT OBJECTIVES"
// ================================================================

//
//  GET the chosen objectives for a specific project
//    (JOIN project_objectives + objectives)
//
router.get('/project_objectives/:project_id', async (req, res) => {
  const { project_id } = req.params
  try {
    const sql = `
      SELECT 
        po.id AS projectObjectiveId,
        po.project_id,
        po.objective_id,
        po.amount,
        po.dateStart,
        po.dateEnd,
        o.title,
        o.measurement
      FROM project_objectives po
      JOIN objectives o ON po.objective_id = o.id
      WHERE po.project_id = ?
    `
    const [rows] = await pool.query(sql, [project_id])
    res.json(rows)
  } catch (err) {
    console.error('Error fetching project objectives:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

//
// UPDATE a single project_objectives row (dateStart, dateEnd, amount, etc.)
//    PUT /api/project_objectives/:id
//
router.put('/project_objectives/:id', async (req, res) => {
  const { id } = req.params
  const { amount, dateStart, dateEnd } = req.body

  try {
    const sql = `
      UPDATE project_objectives
      SET amount = ?, dateStart = ?, dateEnd = ?
      WHERE id = ?
    `
    const [result] = await pool.query(sql, [amount, dateStart, dateEnd, id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project objective not found.' })
    }

    res.json({ message: 'Project objective updated successfully.' })
  } catch (error) {
    console.error('Error updating project objective:', error)
    res.status(500).json({ message: 'Failed to update project objective.' })
  }
})

export default router
