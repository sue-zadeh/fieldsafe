import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/*****************************************************************
 *             1) GET all Risk Titles => /api/risks
 *****************************************************************/
router.get('/risks', async (req, res) => {
  try {
    // Return all from "risk_titles"
    const [rows] = await pool.query(`
      SELECT id, title, isReadOnly
      FROM risk_titles
      ORDER BY id
    `)
    res.json(rows) // array of { id, title, isReadOnly }
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch risk titles.' })
  }
})

/*****************************************************************
 * 2) GET all controls for a given Risk Title => /api/risks/:riskTitleId/controls
 *****************************************************************/
router.get('/risks/:riskTitleId/controls', async (req, res) => {
  const { riskTitleId } = req.params
  try {
    const [rows] = await pool.query(
      `SELECT id, risk_title_id, control_text
       FROM risk_controls
       WHERE risk_title_id = ?`,
      [riskTitleId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch risk controls.' })
  }
})

/*****************************************************************
 * 3) POST a new control into risk_controls => /api/risks/:riskTitleId/controls
 *****************************************************************/
router.post('/risks/:riskTitleId/controls', async (req, res) => {
  const { riskTitleId } = req.params
  const { control_text } = req.body

  try {
    await pool.query(
      `INSERT INTO risk_controls (risk_title_id, control_text) 
       VALUES (?, ?)`,
      [riskTitleId, control_text]
    )
    res.status(201).json({ message: 'New risk control added.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add new risk control.' })
  }
})

/*****************************************************************
 * 4) POST => Create a new row in `risks` (dynamic risk) => /api/risks-create-row
 *****************************************************************/
router.post('/risks-create-row', async (req, res) => {
  const { risk_title_id, likelihood, consequences } = req.body

  try {
    const [result] = await pool.query(
      `INSERT INTO risks (risk_title_id, likelihood, consequences)
       VALUES (?, ?, ?)`,
      [risk_title_id, likelihood, consequences]
    )
    // Return the newly created "risks" table's primary key
    res.status(201).json({ riskId: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create risk row.' })
  }
})

/*****************************************************************
 * 5) GET => project_risks?projectId=X  (which risks are chosen in this project)
 *****************************************************************/
router.get('/project_risks', async (req, res) => {
  const { projectId } = req.query

  try {
    const [rows] = await pool.query(
      `SELECT 
         pr.id AS projectRiskId,
         r.id AS riskId,
         rt.title AS risk_title_label,
         r.likelihood,
         r.consequences,
         r.risk_rating
       FROM project_risks pr
       JOIN risks r ON pr.risk_id = r.id
       JOIN risk_titles rt ON r.risk_title_id = rt.id
       WHERE pr.project_id = ?`,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Error loadProjectRisks:', err)
    res.status(500).json({ error: 'Failed to fetch project risks.' })
  }
})

/*****************************************************************
 * 6) POST => Link a risk to a project => /api/project_risks
 *****************************************************************/
router.post('/project_risks', async (req, res) => {
  const { project_id, risk_id } = req.body
  try {
    const [result] = await pool.query(
      'INSERT INTO project_risks (project_id, risk_id) VALUES (?, ?)',
      [project_id, risk_id]
    )
    res.status(201).json({
      message: 'Project risk added successfully.',
      id: result.insertId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add project risk.' })
  }
})

/*****************************************************************
 * 7) DELETE => remove that risk from project => /api/project_risks?projectId=X&riskId=Y
 *****************************************************************/
router.delete('/project_risks', async (req, res) => {
  const { projectId, riskId } = req.query
  try {
    await pool.query(
      'DELETE FROM project_risks WHERE project_id = ? AND risk_id = ?',
      [projectId, riskId]
    )
    res.json({ message: 'Project risk removed successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove project risk.' })
  }
})

/*****************************************************************
 * 8) GET => /api/project_risk_controls?projectId=X
 *****************************************************************/
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

/*****************************************************************
 * 9) POST => Add a project_risk_control => /api/project_risk_controls
 *****************************************************************/
router.post('/project_risk_controls', async (req, res) => {
  const { project_id, risk_control_id, is_checked } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO project_risk_controls (project_id, risk_control_id, is_checked)
       VALUES (?, ?, ?)`,
      [project_id, risk_control_id, is_checked]
    )
    res.status(201).json({
      message: 'Project risk control added successfully.',
      id: result.insertId,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add project risk control.' })
  }
})

/*****************************************************************
 * 10) DELETE => remove project_risk_controls for a given risk => /api/project_risk_controls?projectId=X&riskId=Y
 *****************************************************************/
router.delete('/project_risk_controls', async (req, res) => {
  const { projectId, riskId } = req.query
  try {
    // Because "riskId" is from `risks.id`, we join to see which controls belong
    await pool.query(
      `DELETE prc
         FROM project_risk_controls prc
         JOIN risk_controls rc ON prc.risk_control_id = rc.id
         JOIN risks r         ON r.risk_title_id      = rc.risk_title_id
        WHERE prc.project_id = ?
          AND r.id           = ?`,
      [projectId, riskId]
    )
    res.json({ message: 'Project risk controls removed successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove project risk controls.' })
  }
})

/*****************************************************************
 *      HAZARDS: we must also provide GET /api/site_hazards
 *               and GET /api/activity_people_hazards
 *               so that front-end can load them
 *****************************************************************/

/** GET /api/site_hazards => returns all site hazards in DB */
router.get('/site_hazards', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, hazard_description
      FROM site_hazards
      ORDER BY id
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch site hazards.' })
  }
})

/** GET /api/activity_people_hazards => returns all activity/people hazards in DB */
router.get('/activity_people_hazards', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, hazard_description
      FROM activity_people_hazards
      ORDER BY id
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch activity hazards.' })
  }
})

/*****************************************************************
 *  PROJECT-SPECIFIC Site Hazards
 *****************************************************************/
// GET all project site hazards => /api/project_site_hazards?projectId=X
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

// POST => link a site hazard to this project
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

// DELETE => remove site hazard from project => /api/project_site_hazards?projectId=X&hazardId=Y
router.delete('/project_site_hazards', async (req, res) => {
  const { projectId, hazardId } = req.query
  try {
    await pool.query(
      'DELETE FROM project_site_hazards WHERE project_id = ? AND site_hazard_id = ?',
      [projectId, hazardId]
    )
    res.json({ message: 'Site hazard removed successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove site hazard.' })
  }
})

/*****************************************************************
 *  PROJECT-SPECIFIC Activity/People Hazards
 *****************************************************************/
// GET => /api/project_activity_people_hazards?projectId=X
router.get('/project_activity_people_hazards', async (req, res) => {
  const { projectId } = req.query
  try {
    const [rows] = await pool.query(
      `SELECT pah.id, aph.hazard_description
       FROM project_activity_people_hazards pah
       JOIN activity_people_hazards aph ON pah.activity_people_hazard_id = aph.id
       WHERE pah.project_id = ?`,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project activity hazards.' })
  }
})

// POST => link an activity hazard to this project
router.post('/project_activity_people_hazards', async (req, res) => {
  const { project_id, activity_people_hazard_id } = req.body
  try {
    await pool.query(
      `INSERT INTO project_activity_people_hazards (project_id, activity_people_hazard_id)
       VALUES (?, ?)`,
      [project_id, activity_people_hazard_id]
    )
    res.status(201).json({ message: 'Activity hazard added successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add activity hazard.' })
  }
})

// DELETE => remove activity hazard => /api/project_activity_people_hazards?projectId=X&hazardId=Y
router.delete('/project_activity_people_hazards', async (req, res) => {
  const { projectId, hazardId } = req.query
  try {
    await pool.query(
      'DELETE FROM project_activity_people_hazards WHERE project_id = ? AND activity_people_hazard_id = ?',
      [projectId, hazardId]
    )
    res.json({ message: 'Activity hazard removed successfully.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove activity hazard.' })
  }
})

export default router
