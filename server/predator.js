// server/predator.js
import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// 1) GET => /api/predator  (List of all possible predator sub_types)
router.get('/predator', async (req, res) => {
  try {
    // Suppose your "predator" table has: id INT PK, sub_type VARCHAR(100)
    const [rows] = await pool.query('SELECT * FROM predator')
    res.json(rows)
  } catch (err) {
    console.error('Error fetching predator list:', err)
    res.status(500).json({ message: 'Failed to fetch predator list.' })
  }
})

// 2) GET => /api/activity_predator/:activity_id
router.get('/activity_predator/:activity_id', async (req, res) => {
  const { activity_id } = req.params
  try {
    const sql = `
      SELECT
        ap.id,
        ap.activity_id,
        ap.predator_id,
        p.sub_type,
        ap.measurement,
        ap.dateStart,
        ap.dateEnd,
        ap.rats,
        ap.possums,
        ap.mustelids,
        ap.hedgehogs,
        ap.others,
        ap.othersDescription
      FROM activity_predator ap
      JOIN predator p ON ap.predator_id = p.id
      WHERE ap.activity_id = ?
    `
    const [rows] = await pool.query(sql, [activity_id])
    res.json(rows)
  } catch (err) {
    console.error('Error fetching activity predators:', err)
    res.status(500).json({ message: 'Failed to fetch activity predators.' })
  }
})

// 3) POST => /api/activity_predator
router.post('/activity_predator', async (req, res) => {
  try {
    const {
      activity_id,
      predator_id,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      othersDescription,
    } = req.body

    const sql = `
      INSERT INTO activity_predator
      (activity_id, predator_id, measurement, dateStart, dateEnd,
       rats, possums, mustelids, hedgehogs, others, othersDescription)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    await pool.query(sql, [
      activity_id,
      predator_id,
      measurement ?? null,
      dateStart ?? null,
      dateEnd ?? null,
      rats ?? 0,
      possums ?? 0,
      mustelids ?? 0,
      hedgehogs ?? 0,
      others ?? 0,
      othersDescription ?? '',
    ])
    res.status(201).json({ message: 'Predator record added successfully.' })
  } catch (err) {
    console.error('Error inserting predator record:', err)
    res.status(500).json({ message: 'Failed to add predator record.' })
  }
})

// 4) PUT => /api/activity_predator/:id
router.put('/activity_predator/:id', async (req, res) => {
  try {
    const { id } = req.params
    const {
      activity_id,
      predator_id,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      othersDescription,
    } = req.body

    const sql = `
      UPDATE activity_predator
      SET activity_id = ?,
          predator_id = ?,
          measurement = ?,
          dateStart = ?,
          dateEnd = ?,
          rats = ?,
          possums = ?,
          mustelids = ?,
          hedgehogs = ?,
          others = ?,
          othersDescription = ?
      WHERE id = ?
    `
    const [result] = await pool.query(sql, [
      activity_id,
      predator_id,
      measurement ?? null,
      dateStart ?? null,
      dateEnd ?? null,
      rats ?? 0,
      possums ?? 0,
      mustelids ?? 0,
      hedgehogs ?? 0,
      others ?? 0,
      othersDescription ?? '',
      id,
    ])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No predator record found.' })
    }
    res.json({ message: 'Predator record updated successfully.' })
  } catch (err) {
    console.error('Error updating predator record:', err)
    res.status(500).json({ message: 'Failed to update predator record.' })
  }
})

// 5) DELETE => /api/activity_predator/:id
router.delete('/activity_predator/:id', async (req, res) => {
  try {
    const { id } = req.params
    const sql = `DELETE FROM activity_predator WHERE id = ?`
    const [result] = await pool.query(sql, [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Predator record not found.' })
    }
    res.json({ message: 'Predator record deleted successfully.' })
  } catch (err) {
    console.error('Error deleting predator record:', err)
    res.status(500).json({ message: 'Failed to delete predator record.' })
  }
})

export default router
