import { Router } from 'express'
import { pool } from './db.js'

const checklistRouter = Router()

// GET /api/activity_checklist/:activity_id
checklistRouter.get('/activity_checklist/:activity_id', async (req, res) => {
  const { activity_id } = req.params
  try {
    const sql = `
      SELECT ac.id, ac.activity_id, c.description
      FROM activity_checklist ac
      JOIN checklist c ON ac.checklist_id = c.id
      WHERE ac.activity_id = ?
    `
    const [rows] = await pool.query(sql, [activity_id])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching activity checklist:', error)
    res.status(500).json({ message: 'Error fetching activity checklist items' })
  }
})

// POST /api/activity_checklist
checklistRouter.post('/activity_checklist', async (req, res) => {
  const { activity_id, checklist_ids } = req.body
  const values = checklist_ids.map((id) => [activity_id, id])

  try {
    const sql = `
      INSERT INTO activity_checklist (activity_id, checklist_id)
      VALUES ?
    `
    await pool.query(sql, [values])
    res
      .status(201)
      .json({ message: 'Checklists assigned successfully to activity' })
  } catch (error) {
    console.error('Error assigning checklists:', error)
    res.status(500).json({ message: 'Error assigning checklists to activity' })
  }
})

// GET /api/unassigned_checklist/:activity_id
checklistRouter.get('/unassigned_checklist/:activity_id', async (req, res) => {
  const { activity_id } = req.params
  try {
    const sql = `
      SELECT c.id, c.description
      FROM checklist c
      WHERE c.id NOT IN (
        SELECT ac.checklist_id
        FROM activity_checklist ac
        WHERE ac.activity_id = ?
      )
    `
    const [rows] = await pool.query(sql, [activity_id])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching unassigned checklists:', error)
    res.status(500).json({ message: 'Error fetching unassigned checklists.' })
  }
})

// DELETE /api/activity_checklist/:id
checklistRouter.delete('/activity_checklist/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      DELETE FROM activity_checklist
      WHERE id = ?
    `
    await pool.execute(sql, [id])
    res.json({ message: 'Checklist removed from activity' })
  } catch (error) {
    console.error('Error removing checklist:', error)
    res.status(500).json({ message: 'Error removing checklist from activity' })
  }
})

export default checklistRouter
