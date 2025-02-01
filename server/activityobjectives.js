import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// 1) GET => /api/activity_outcome/:activityId
router.get('/activity_outcome/:activityId', async (req, res) => {
  const { activityId } = req.params
  try {
    // Find projectId
    const [actRows] = await pool.query(
      'SELECT project_id FROM activities WHERE id = ?',
      [activityId]
    )
    if (!actRows.length) {
      return res.status(404).json({ message: 'No such activity.' })
    }
    const projectId = actRows[0].project_id

    // Get project objectives joined to objectives
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

// 2) POST => /api/objectives
// Create a new objective in "objectives"
router.post('/objectives', async (req, res) => {
  try {
    const { title, measurement } = req.body
    if (!title || !measurement) {
      return res.status(400).json({ message: 'Missing title or measurement.' })
    }

    const sql = `INSERT INTO objectives (title, measurement) VALUES (?, ?)`
    const [result] = await pool.query(sql, [title, measurement])
    // Return the inserted ID
    return res.status(201).json({
      id: result.insertId,
      message: 'Objective created successfully.',
    })
  } catch (err) {
    console.error('Error creating new objective:', err)
    return res.status(500).json({ message: 'Failed to create new objective.' })
  }
})

// 3) POST => /api/project_objectives
// Link the new objective to a project
router.post('/project_objectives', async (req, res) => {
  try {
    const { project_id, objective_id, amount } = req.body
    if (!project_id || !objective_id) {
      return res.status(400).json({
        message: 'Missing project_id or objective_id.',
      })
    }

    const sql = `
      INSERT INTO project_objectives (project_id, objective_id, amount)
      VALUES (?, ?, ?)
    `
    await pool.query(sql, [project_id, objective_id, amount ?? null])
    return res
      .status(201)
      .json({ message: 'Objective linked to project successfully.' })
  } catch (err) {
    console.error('Error linking objective to project:', err)
    return res
      .status(500)
      .json({ message: 'Failed to link objective to project.' })
  }
})

// 4) PUT => /api/project_objectives/:id
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

//========= PREDATOR routes ===========

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
