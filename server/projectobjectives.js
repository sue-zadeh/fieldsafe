import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// ============================================================
//     ENDPOINTS FOR SPECIAL PREDATOR CONTROL OBJECTIVE
// ============================================================

// GET /api/project_predator/:project_id
router.get('/project_predator/:project_id', async (req, res) => {
  const { project_id } = req.params
  try {
    const sql = `
      SELECT *
      FROM project_predator
      WHERE project_id = ?
    `
    const [rows] = await pool.query(sql, [project_id])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching project predator data:', error)
    res.status(500).json({ message: 'Error fetching predator data.' })
  }
})

// POST /api/project_predator
router.post('/project_predator', async (req, res) => {
  try {
    const {
      project_id,
      sub_type,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
    } = req.body

    const sql = `
      INSERT INTO project_predator
      (project_id, sub_type, measurement, dateStart, dateEnd, rats, possums, mustelids, hedgehogs, others)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await pool.query(sql, [
      project_id,
      sub_type,
      measurement || 0,
      dateStart || null,
      dateEnd || null,
      rats || 0,
      possums || 0,
      mustelids || 0,
      hedgehogs || 0,
      others || 0,
    ])

    res.status(201).json({ message: 'Predator record added successfully' })
  } catch (error) {
    console.error('Error inserting predator data:', error)
    res.status(500).json({ message: 'Failed to add predator record.' })
  }
})

// PUT /api/project_predator/:id
router.put('/project_predator/:id', async (req, res) => {
  const { id } = req.params
  try {
    const {
      sub_type,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
    } = req.body

    const sql = `
      UPDATE project_predator
      SET sub_type = ?,
          measurement = ?,
          dateStart = ?,
          dateEnd = ?,
          rats = ?,
          possums = ?,
          mustelids = ?,
          hedgehogs = ?,
          others = ?
      WHERE id = ?
    `
    const [result] = await pool.query(sql, [
      sub_type,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      id,
    ])

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Predator record not found.' })
    }

    res.json({ message: 'Predator record updated successfully.' })
  } catch (error) {
    console.error('Error updating predator record:', error)
    res.status(500).json({ message: 'Failed to update predator record.' })
  }
})

// DELETE /api/project_predator/:id
router.delete('/project_predator/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `DELETE FROM project_predator WHERE id = ?`
    const [result] = await pool.execute(sql, [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Predator record not found.' })
    }
    res.json({ message: 'Predator record deleted successfully.' })
  } catch (error) {
    console.error('Error deleting predator record:', error)
    res.status(500).json({ message: 'Failed to delete predator record.' })
  }
})

export default router
