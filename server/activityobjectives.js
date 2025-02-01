import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// GET => /api/activity_outcome/:activityId
// This looks up projectObjectives for the *project* of the given activity
router.get('/activity_outcome/:activityId', async (req, res) => {
  const { activityId } = req.params
  try {
    // 1) Find which project this activity belongs to
    const [actRows] = await pool.query(
      'SELECT project_id FROM activities WHERE id = ?',
      [activityId]
    )
    if (!actRows.length) {
      return res.status(404).json({ message: 'No such activity.' })
    }
    const projectId = actRows[0].project_id

    // 2) Get the project’s objectives (join with the objectives table)
    const [objRows] = await pool.query(
      `SELECT 
         po.id AS projectObjectiveId,
         po.objective_id,
         po.amount,
         o.title,
         o.measurement
       FROM project_objectives po
       JOIN objectives o ON po.objective_id = o.id
       WHERE po.project_id = ?`,
      [projectId]
    )
    res.json({ projectId, objectives: objRows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to load project objectives.' })
  }
})

// PUT => /api/project_objectives/:id
// Update the amount (or any other field) on the project_objectives row
router.put('/project_objectives/:id', async (req, res) => {
  const { id } = req.params
  const { amount } = req.body
  try {
    const [result] = await pool.query(
      `UPDATE project_objectives 
       SET amount = ?
       WHERE id = ?`,
      [amount ?? null, id]
    )
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: 'No project objective row found.' })
    }
    res.json({ message: 'Project objective updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update project objective.' })
  }
})

// PREDATOR routes (simplified example)

// GET => /api/activity_predator/:activityId
router.get('/activity_predator/:activityId', async (req, res) => {
  const { activityId } = req.params
  try {
    const [rows] = await pool.query(
      `SELECT ap.*, p.sub_type 
         FROM activity_predator ap
         JOIN predator p ON ap.predator_id = p.id
         WHERE ap.activity_id = ?`,
      [activityId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch predator records.' })
  }
})

// POST => /api/activity_predator
router.post('/api/activity_predator', async (req, res) => {
  try {
    const {
      activity_id,
      predator_id,
      measurement,
      rats,
      possums,
      mustelids,
      hedgehogs,
      others,
      othersDescription,
    } = req.body

    await pool.query(
      `INSERT INTO activity_predator 
        (activity_id, predator_id, measurement, 
         rats, possums, mustelids, hedgehogs, others, others_description) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        activity_id,
        predator_id,
        measurement ?? null,
        rats ?? 0,
        possums ?? 0,
        mustelids ?? 0,
        hedgehogs ?? 0,
        others ?? 0,
        othersDescription || null,
      ]
    )
    res.status(201).json({ message: 'Predator record created.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to create predator record.' })
  }
})

// PUT => /api/activity_predator/:id
router.put('/api/activity_predator/:id', async (req, res) => {
  const { id } = req.params
  const {
    activity_id,
    predator_id,
    measurement,
    rats,
    possums,
    mustelids,
    hedgehogs,
    others,
    othersDescription,
  } = req.body
  try {
    const [result] = await pool.query(
      `UPDATE activity_predator
       SET activity_id=?, predator_id=?, measurement=?, 
           rats=?, possums=?, mustelids=?, hedgehogs=?, others=?, 
           others_description=?
       WHERE id = ?`,
      [
        activity_id,
        predator_id,
        measurement ?? null,
        rats ?? 0,
        possums ?? 0,
        mustelids ?? 0,
        hedgehogs ?? 0,
        others ?? 0,
        othersDescription || null,
        id,
      ]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'No predator record found.' })
    }
    res.json({ message: 'Predator record updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to update predator record.' })
  }
})

// DELETE => /api/activity_predator/:id
router.delete('/api/activity_predator/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query(`DELETE FROM activity_predator WHERE id = ?`, [id])
    res.json({ message: 'Predator record deleted.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Failed to delete predator record.' })
  }
})

export default router
