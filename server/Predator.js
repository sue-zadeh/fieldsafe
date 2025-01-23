// predator.js
import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET /api/predator
router.get('/predator', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM predator')
    res.json(rows)
  } catch (error) {
    console.error('Error fetching predator list:', error)
    res.status(500).json({ message: 'Error fetching predator list.' })
  }
})

// GET /api/project_predator/:project_id
router.get('/project_predator/:project_id', async (req, res) => {
  const { project_id } = req.params
  try {
    const sql = `
      SELECT
        pp.id,
        pp.project_id,
        pp.predator_id,
        pr.sub_type,
        pp.measurement,
        pp.dateStart,
        pp.dateEnd,
        pp.rats,
        pp.possums,
        pp.mustelids,
        pp.hedgehogs,
        pp.others
        pp.others_description 
      FROM project_predator pp
      JOIN predator pr ON pp.predator_id = pr.id
      WHERE pp.project_id = ?
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
      predator_id,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      others_description,
    } = req.body

    const sql = `
      INSERT INTO project_predator
        (project_id, predator_id, measurement, dateStart, dateEnd,
         rats, possums, mustelids, hedgehogs, others)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)    `

    await pool.query(sql, [
      project_id,
      predator_id,
      measurement ?? null,
      dateStart ?? null,
      dateEnd ?? null,
      rats ?? 0,
      possums ?? 0,
      mustelids ?? 0,
      hedgehogs ?? 0,
      others ?? 0,
      others_description || null,
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
      predator_id,
      measurement,
      dateStart,
      dateEnd,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      others_description,
    } = req.body

    const sql = `
      UPDATE project_predator
      SET
        predator_id = ?,
        measurement = ?,
        dateStart = ?,
        dateEnd = ?,
        rats = ?,
        possums = ?,
        mustelids = ?,
        hedgehogs = ?,
        others = ?
        others_description = ?
      WHERE id = ?
    `

    const [result] = await pool.query(sql, [
      predator_id,
      measurement ?? null,
      dateStart ?? null,
      dateEnd ?? null,
      rats ?? 0,
      possums ?? 0,
      mustelids ?? 0,
      hedgehogs ?? 0,
      others ?? 0,
      others_description || null,
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
