import { Router } from 'express'
import { pool } from './db.js'

const checklistRouter = Router()

// 1) GET /api/project_checklist/:project_id
//    Similar to project_volunteer/:project_id
checklistRouter.get('/project_checklist/:project_id', async (req, res) => {
  const { project_id } = req.params
  try {
    const sql = `
      SELECT pc.id, pc.project_id, c.description
      FROM project_checklist pc
      JOIN checklist c ON pc.checklist_id = c.id
      WHERE pc.project_id = ?
    `
    const [rows] = await pool.query(sql, [project_id])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching project checklist:', error)
    res.status(500).json({ message: 'Error fetching project checklist items' })
  }
})

// 2) POST /api/project_checklist
//    Similar to POST /api/project_volunteer
checklistRouter.post('/project_checklist', async (req, res) => {
  const { project_id, checklist_ids } = req.body
  // Build array of [project_id, checklist_id]
  // we set default for is_checked = false in DB
  const values = checklist_ids.map((id) => [project_id, id])

  try {
    const sql = `
      INSERT INTO project_checklist (project_id, checklist_id)
      VALUES ?
    `
    await pool.query(sql, [values])
    res.status(201).json({ message: 'Checklists assigned successfully' })
  } catch (error) {
    console.error('Error assigning checklists:', error)
    res.status(500).json({ message: 'Error assigning checklists to project' })
  }
})

// 3) GET /api/unassigned_checklist/:project_id
//    Similar to GET /api/unassigned_volunteer/:project_id
checklistRouter.get('/unassigned_checklist/:project_id', async (req, res) => {
  const { project_id } = req.params
  try {
    const sql = `
      SELECT c.id, c.description
      FROM checklist c
      WHERE c.id NOT IN (
        SELECT pc.checklist_id
        FROM project_checklist pc
        WHERE pc.project_id = ?
      )
    `
    const [rows] = await pool.query(sql, [project_id])
    res.json(rows)
  } catch (error) {
    console.error('Error fetching unassigned checklists:', error)
    res.status(500).json({ message: 'Error fetching unassigned checklists.' })
  }
})

// 4) DELETE /api/project_checklist/:id
//    Similar to DELETE /api/project_volunteer/:id
checklistRouter.delete('/project_checklist/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      DELETE FROM project_checklist
      WHERE id = ?
    `
    await pool.execute(sql, [id])
    res.json({ message: 'Checklist removed from project' })
  } catch (error) {
    console.error('Error removing checklist:', error)
    res.status(500).json({ message: 'Error removing checklist from project' })
  }
})

export default checklistRouter
