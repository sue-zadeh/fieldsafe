import express from 'express'
import { pool } from './db.js'

const router = express.Router()

// Add Risk Row (CREATE)
router.post('/risks-create-row', async (req, res) => {
  const { risk_title_id, likelihood, consequences } = req.body

  try {
    const [result] = await pool.query(
      `INSERT INTO risks (risk_title_id, likelihood, consequences) VALUES (?, ?, ?)`,
      [risk_title_id, likelihood, consequences]
    )
    res.status(201).json({ riskId: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create risk row.' })
  }
})

// Get all project risk controls
router.get('/project_risk_controls', async (req, res) => {
  const { projectId } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT prc.id, rc.control_text 
       FROM project_risk_controls prc
       JOIN risk_controls rc ON prc.risk_control_id = rc.id
       WHERE prc.project_id = ?`,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project risk controls.' })
  }
})


// Get all project risks
router.get('/project_risks', async (req, res) => {
  const { projectId } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT pr.projectRiskId, r.id AS riskId, rt.title AS risk_title_label, 
              r.likelihood, r.consequences, r.risk_rating
       FROM project_risks pr
       JOIN risks r ON pr.risk_id = r.id
       JOIN risk_titles rt ON r.risk_title_id = rt.id
       WHERE pr.project_id = ?`,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project risks.' })
  }
})

// ----===Add Hazards to Project====----

// Get all project site hazards
router.get('/project_site_hazards', async (req, res) => {
  const { projectId } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT psh.id, sh.hazard_description 
       FROM project_site_hazards psh
       JOIN site_hazards sh ON psh.site_hazard_id = sh.id
       WHERE psh.project_id = ?`,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project site hazards.' })
  }
})

router.post('/project_site_hazards', async (req, res) => {
  const { project_id, site_hazard_id } = req.body

  try {
    await pool.query(
      'INSERT INTO project_site_hazards (project_id, site_hazard_id) VALUES (?, ?)',
      [project_id, site_hazard_id]
    )
    res.status(201).json({ message: 'Site hazard added successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add site hazard.' })
  }
})

router.post('/project_activity_people_hazards', async (req, res) => {
  const { project_id, activity_people_hazard_id } = req.body

  try {
    await pool.query(
      'INSERT INTO project_activity_people_hazards (project_id, activity_people_hazard_id) VALUES (?, ?)',
      [project_id, activity_people_hazard_id]
    )
    res.status(201).json({ message: 'Activity hazard added successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add activity hazard.' })
  }
})

export default router
