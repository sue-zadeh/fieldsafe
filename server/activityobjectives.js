import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET => /api/activity_objectives/:activity_id
// Returns all objectives for a given activity
router.get('/activity_objectives/:activity_id', async (req, res) => {
  const { activity_id } = req.params
  try {
    const sql = `
      SELECT
        ao.id AS activityObjectiveId,
        ao.activity_id,
        ao.objective_id,
        ao.amount,
        ao.dateStart,
        ao.dateEnd,
        o.title,
        o.measurement
      FROM activity_objectives ao
      JOIN objectives o ON ao.objective_id = o.id
      WHERE ao.activity_id = ?
    `
    const [rows] = await pool.query(sql, [activity_id])
    res.json(rows)
  } catch (err) {
    console.error('Error fetching activity objectives:', err)
    res.status(500).json({ message: 'Failed to fetch activity objectives.' })
  }
})

// POST => /api/activity_objectives
// Insert a new objective row for an activity
router.post('/activity_objectives', async (req, res) => {
  const { activity_id, objective_id, amount, dateStart, dateEnd } = req.body
  try {
    const sql = `
      INSERT INTO activity_objectives
      (activity_id, objective_id, amount, dateStart, dateEnd)
      VALUES (?, ?, ?, ?, ?)
    `
    await pool.query(sql, [
      activity_id,
      objective_id,
      amount ?? null,
      dateStart ?? null,
      dateEnd ?? null,
    ])
    res.status(201).json({ message: 'Objective added to activity.' })
  } catch (err) {
    console.error('Error inserting activity objective:', err)
    res.status(500).json({ message: 'Failed to add objective to activity.' })
  }
})

// PUT => /api/activity_objectives/:id
// Update amount / dateStart / dateEnd
router.put('/activity_objectives/:id', async (req, res) => {
  const { id } = req.params
  const { amount, dateStart, dateEnd } = req.body
  try {
    const sql = `
      UPDATE activity_objectives
      SET amount = ?, dateStart = ?, dateEnd = ?
      WHERE id = ?
    `
    const [result] = await pool.query(sql, [
      amount ?? null,
      dateStart ?? null,
      dateEnd ?? null,
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No objective row found.' })
    }
    res.json({ message: 'Activity objective updated.' })
  } catch (err) {
    console.error('Error updating activity objective:', err)
    res.status(500).json({ message: 'Failed to update activity objective.' })
  }
})

// DELETE => /api/activity_objectives/:id (optional)
router.delete('/activity_objectives/:id', async (req, res) => {
  const { id } = req.params
  try {
    const [result] = await pool.query(
      `DELETE FROM activity_objectives WHERE id = ?`,
      [id]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No objective row found.' })
    }
    res.json({ message: 'Objective removed from activity.' })
  } catch (err) {
    console.error('Error deleting activity objective:', err)
    res.status(500).json({ message: 'Failed to remove objective.' })
  }
})

export default router
