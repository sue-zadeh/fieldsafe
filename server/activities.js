// server/activities.js

import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// ============== POST => /api/activities =============
// Creates a new activity with a unique activity_name
// Also copies project objectives => activity_objectives (if you want).
router.post('/', async (req, res) => {
  try {
    const {
      activity_name,
      project_id,
      activity_date,
      notes,
      createdBy,
      status,
    } = req.body

    if (!activity_name || !project_id || !activity_date) {
      return res
        .status(400)
        .json({ message: 'activity_name, project_id, and activity_date required' })
    }

    // Check for uniqueness
    const [existingRows] = await pool.query(
      'SELECT id FROM activities WHERE activity_name = ?',
      [activity_name]
    )
    if (existingRows.length > 0) {
      return res
        .status(409)
        .json({ message: 'Activity name already in use. Must be unique.' })
    }

    // Insert into `activities`
    const [actResult] = await pool.query(
      `
        INSERT INTO activities
          (activity_name, project_id, activity_date, notes, createdBy, status)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        activity_name,
        project_id,
        activity_date,
        notes || '',
        createdBy || null,
        status || 'InProgress',
      ]
    )
    const newActivityId = actResult.insertId

    // (Optional) copy from project_objectives => activity_objectives
    // If you have such a table:
    await pool.query(
      `
      INSERT INTO activity_objectives (activity_id, objective_id)
      SELECT ?, objective_id
      FROM project_objectives
      WHERE project_id = ?
      `,
      [newActivityId, project_id]
    )

    return res.status(201).json({
      activityId: newActivityId,
      message: 'Activity created successfully',
    })
  } catch (err) {
    console.error('POST /activities error:', err)
    return res.status(500).json({ message: 'Failed to create activity' })
  }
})

// ============== GET => /api/activities (ALL) =============
router.get('/', async (req, res) => {
  try {
    const { projectId } = req.query
    let sql = `
      SELECT a.*,
             p.name AS projectName,
             p.location AS projectLocation
      FROM activities a
      JOIN projects p ON a.project_id = p.id
    `
    const params = []
    if (projectId) {
      sql += ' WHERE a.project_id = ?'
      params.push(projectId)
    }
    sql += ' ORDER BY a.id DESC'
    const [rows] = await pool.query(sql, params)
    res.json(rows)
  } catch (err) {
    console.error('GET /activities error:', err)
    res.status(500).json({ message: 'Failed to fetch activities' })
  }
})

// ============== GET => /api/activities/:id =============
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      SELECT a.*,
             p.name AS projectName,
             p.location AS projectLocation
      FROM activities a
      JOIN projects p ON a.project_id = p.id
      WHERE a.id = ?
    `
    const [rows] = await pool.query(sql, [id])
    if (!rows.length) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('GET /activities/:id error:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// ============== PUT => /api/activities/:id =============
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      activity_name,
      project_id,
      activity_date,
      notes,
      createdBy,
      status,
    } = req.body

    if (!activity_name || !project_id || !activity_date) {
      return res.status(400).json({
        message: 'activity_name, project_id, and activity_date are required',
      })
    }

    // Check if activity exists
    const [existing] = await pool.query(
      'SELECT * FROM activities WHERE id=?',
      [id]
    )
    if (!existing.length) {
      return res.status(404).json({ message: 'Activity not found' })
    }

    // Check for name conflict if different from old name
    const oldName = existing[0].activity_name
    if (oldName !== activity_name) {
      // see if new name is taken by another
      const [conflict] = await pool.query(
        'SELECT id FROM activities WHERE activity_name = ? AND id <> ?',
        [activity_name, id]
      )
      if (conflict.length > 0) {
        return res.status(409).json({
          message: 'Activity name already in use by another activity.',
        })
      }
    }

    // Proceed to update
    const sql = `
      UPDATE activities
      SET activity_name=?, project_id=?, activity_date=?,
          notes=?, createdBy=?, status=?
      WHERE id=?
    `
    await pool.query(sql, [
      activity_name,
      project_id,
      activity_date,
      notes || '',
      createdBy || null,
      status || 'InProgress',
      id,
    ])

    res.json({ message: 'Activity updated successfully' })
  } catch (err) {
    console.error('PUT /activities/:id error:', err)
    res.status(500).json({ message: 'Failed to update activity' })
  }
})

// ============== DELETE => /api/activities/:id =============
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.query('DELETE FROM activities WHERE id=?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    res.json({ message: 'Activity deleted successfully' })
  } catch (err) {
    console.error('DELETE /activities/:id error:', err)
    res.status(500).json({ message: 'Failed to delete activity' })
  }
})

export default router
