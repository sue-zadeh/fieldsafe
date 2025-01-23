// server/activities.js
import express from 'express'
import { pool } from './db.js' // your existing db connection
// If you need Multer for file uploads, import it here, but likely not needed for a simple Activity Note

const router = express.Router()

/** GET /api/activities
 * Optional ?projectId= to get activities for one project.
 */
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query
    let sql =
      'SELECT a.*, p.name AS projectName FROM activities a JOIN projects p ON a.project_id = p.id'
    const params = []
    if (projectId) {
      sql += ' WHERE a.project_id = ?'
      params.push(projectId)
    }
    sql += ' ORDER BY a.id DESC'
    const [rows] = await pool.query(sql, params)
    return res.json(rows)
  } catch (err) {
    console.error('GET /activities error:', err)
    return res.status(500).json({ message: 'Failed to fetch activities' })
  }
})

/** GET /api/activities/:id
 * Return one activity row + associated project info.
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sql = `
      SELECT a.*, p.name AS projectName
      FROM activities a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ?
    `
    const [rows] = await pool.query(sql, [id])
    if (!rows.length) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    return res.json(rows[0])
  } catch (err) {
    console.error('GET /activities/:id error:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

/** POST /api/activities
 * Create a new Activity Note for a single project
 */
router.post('/', async (req, res) => {
  try {
    const { project_id, activity_date, location, notes, createdBy } = req.body

    // Minimal validation
    if (!project_id || !activity_date) {
      return res
        .status(400)
        .json({ message: 'project_id and activity_date are required' })
    }

    const insertSql = `
      INSERT INTO activities (project_id, activity_date, location, notes, createdBy)
      VALUES (?, ?, ?, ?, ?)
    `
    const [result] = await pool.query(insertSql, [
      project_id,
      activity_date,
      location || '',
      notes || '',
      createdBy || null,
    ])

    return res.status(201).json({
      id: result.insertId,
      message: 'Activity created successfully',
    })
  } catch (err) {
    console.error('POST /activities error:', err)
    return res.status(500).json({ message: 'Failed to create activity' })
  }
})

/** PUT /api/activities/:id
 * Update an existing Activity
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { project_id, activity_date, location, notes, createdBy } = req.body

    // fetch existing to ensure it exists
    const [exists] = await pool.query('SELECT * FROM activities WHERE id=?', [
      id,
    ])
    if (!exists.length) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    const updateSql = `
      UPDATE activities
      SET project_id = ?, activity_date = ?, location = ?, notes = ?, createdBy = ?
      WHERE id = ?
    `
    await pool.query(updateSql, [
      project_id,
      activity_date,
      location || '',
      notes || '',
      createdBy || null,
      id,
    ])
    return res.json({ message: 'Activity updated successfully' })
  } catch (err) {
    console.error('PUT /activities/:id error:', err)
    return res.status(500).json({ message: 'Failed to update activity' })
  }
})

/** DELETE /api/activities/:id
 * Remove an activity
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM activities WHERE id=?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    return res.json({ message: 'Activity deleted successfully' })
  } catch (err) {
    console.error('DELETE /activities/:id error:', err)
    return res.status(500).json({ message: 'Failed to delete activity' })
  }
})

export default router
