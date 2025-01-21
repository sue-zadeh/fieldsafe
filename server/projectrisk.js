import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/*****************************************************************
 *  GET all Risk Titles => /api/risks
 *****************************************************************/
router.get('/risks', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, title, isReadOnly
      FROM risk_titles
      ORDER BY id
    `)
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch risk titles.' })
  }
})

/*****************************************************************
 *  GET controls for a given Risk Title => /api/risks/:riskTitleId/controls
 *****************************************************************/
router.get('/risks/:riskTitleId/controls', async (req, res) => {
  const { riskTitleId } = req.params
  try {
    const [rows] = await pool.query(
      `
      SELECT id, risk_title_id, control_text
      FROM risk_controls
      WHERE risk_title_id = ?
    `,
      [riskTitleId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch risk controls.' })
  }
})

/*****************************************************************
 *  POST a new control => /api/risks/:riskTitleId/controls
 *****************************************************************/
router.post('/risks/:riskTitleId/controls', async (req, res) => {
  const { riskTitleId } = req.params
  const { control_text } = req.body

  try {
    await pool.query(
      `
      INSERT INTO risk_controls (risk_title_id, control_text)
      VALUES (?, ?)
    `,
      [riskTitleId, control_text]
    )
    res.status(201).json({ message: 'New risk control added.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add new risk control.' })
  }
})

/*****************************************************************
 *  POST => Create a new row in `risks` => /api/risks-create-row
 *****************************************************************/
router.post('/risks-create-row', async (req, res) => {
  const { risk_title_id, likelihood, consequences } = req.body

  try {
    const [result] = await pool.query(
      `
      INSERT INTO risks (risk_title_id, likelihood, consequences)
      VALUES (?, ?, ?)
    `,
      [risk_title_id, likelihood, consequences]
    )
    res.status(201).json({ riskId: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to create risk row.' })
  }
})

/*****************************************************************
 *  (Optional) PUT => update an existing risk => /api/risks/:riskId
 *****************************************************************/
router.put('/risks/:riskId', async (req, res) => {
  const { riskId } = req.params
  const { likelihood, consequences } = req.body
  console.log('Updating risk ID:', riskId, 'with', likelihood, consequences) // debug

  try {
    const [result] = await pool.query(
      `
      UPDATE risks
      SET likelihood = ?, consequences = ?
      WHERE id = ?
    `,
      [likelihood, consequences, riskId]
    )

    // Check affectedRows
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `No risk found with ID ${riskId}` })
    }

    res.json({ message: 'Risk updated.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to update risk.' })
  }
})

/*****************************************************************
 * 5) GET => project_risks?projectId=X
 *    Which risks are chosen in this project
 *****************************************************************/
router.get('/project_risks', async (req, res) => {
  const { projectId } = req.query
  try {
    const [rows] = await pool.query(
      `
      SELECT
        pr.id AS projectRiskId,
        r.id AS riskId,
        r.risk_title_id AS riskTitleId, 
        rt.title AS risk_title_label,
        r.likelihood,
        r.consequences,
        r.risk_rating
      FROM project_risks pr
      JOIN risks r        ON pr.risk_id = r.id
      JOIN risk_titles rt ON r.risk_title_id = rt.id
      WHERE pr.project_id = ?
    `,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error('Error loadProjectRisks:', err)
    res.status(500).json({ error: 'Failed to fetch project risks.' })
  }
})

/*****************************************************************
 * 6) POST => link a risk to a project => /api/project_risks
 *****************************************************************/
router.post('/project_risks', async (req, res) => {
  const { project_id, risk_id } = req.body
  try {
    const [result] = await pool.query(
      `
      INSERT INTO project_risks (project_id, risk_id)
      VALUES (?, ?)
    `,
      [project_id, risk_id]
    )
    res
      .status(201)
      .json({ message: 'Project risk added.', id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add project risk.' })
  }
})

/*****************************************************************
 * 7) DELETE => remove that risk => /api/project_risks?projectId=X&riskId=Y
 *****************************************************************/
router.delete('/project_risks', async (req, res) => {
  const { projectId, riskId } = req.query
  try {
    await pool.query(
      `
      DELETE FROM project_risks
      WHERE project_id = ? AND risk_id = ?
    `,
      [projectId, riskId]
    )
    res.json({ message: 'Project risk removed.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove project risk.' })
  }
})

/*****************************************************************
 * 8) GET => /api/project_risk_controls?projectId=X
 *    We also want to know which riskId each control belongs to.
 *****************************************************************/
router.get('/project_risk_controls/detailed', async (req, res) => {
  const { projectId } = req.query
  try {
    // This join figures out which riskId each control is for,
    // using r.risk_title_id => rc.risk_title_id
    // so front-end can show them under the correct risk row
    const [rows] = await pool.query(
      `
      SELECT
        prc.id AS projectRiskControlId,
        prc.project_id,
        prc.risk_control_id,
        rc.control_text,
        r.id AS riskId
      FROM project_risk_controls prc
      JOIN risk_controls rc  ON prc.risk_control_id = rc.id
      JOIN risks r           ON r.risk_title_id     = rc.risk_title_id
      WHERE prc.project_id = ?
    `,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch detailed PRC list.' })
  }
})

// If you still want the old simpler version, keep it too:
router.get('/project_risk_controls', async (req, res) => {
  const { projectId } = req.query
  try {
    const [rows] = await pool.query(
      `
      SELECT prc.id, rc.control_text
      FROM project_risk_controls prc
      JOIN risk_controls rc ON prc.risk_control_id = rc.id
      WHERE prc.project_id = ?
    `,
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
      `
      INSERT INTO project_risk_controls (project_id, risk_control_id, is_checked)
      VALUES (?, ?, ?)
    `,
      [project_id, risk_control_id, is_checked]
    )
    res
      .status(201)
      .json({ message: 'Project risk control added.', id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add project risk control.' })
  }
})

/*****************************************************************
 * 10) DELETE => remove project_risk_controls for that risk
 *****************************************************************/
router.delete('/project_risk_controls', async (req, res) => {
  const { projectId, riskId } = req.query
  try {
    await pool.query(
      `
      DELETE prc
      FROM project_risk_controls prc
      JOIN risk_controls rc ON prc.risk_control_id = rc.id
      JOIN risks r         ON r.risk_title_id     = rc.risk_title_id
      WHERE prc.project_id = ?
        AND r.id           = ?
    `,
      [projectId, riskId]
    )
    res.json({ message: 'Project risk controls removed.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove project risk controls.' })
  }
})

/*****************************************************************
 *  HAZARDS
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

/** GET /api/activity_people_hazards => returns all activity hazards in DB */
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
router.get('/project_site_hazards', async (req, res) => {
  const { projectId } = req.query
  try {
    // We also select psh.id (the row ID) AND psh.site_hazard_id
    // so front-end can use either one to delete
    const [rows] = await pool.query(
      `
      SELECT psh.id AS pshId,
             psh.site_hazard_id,
             sh.hazard_description
      FROM project_site_hazards psh
      JOIN site_hazards sh ON psh.site_hazard_id = sh.id
      WHERE psh.project_id = ?
    `,
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
      `
      INSERT INTO project_site_hazards (project_id, site_hazard_id)
      VALUES (?, ?)
    `,
      [project_id, site_hazard_id]
    )
    res.status(201).json({ message: 'Site hazard added.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add site hazard.' })
  }
})

// DELETE by row ID (pshId)
router.delete('/project_site_hazards', async (req, res) => {
  const { id } = req.query // we will pass the row's ID as ?id=xxx
  try {
    await pool.query(`DELETE FROM project_site_hazards WHERE id = ?`, [id])
    res.json({ message: 'Site hazard removed.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove site hazard.' })
  }
})

/*****************************************************************
 *  PROJECT-SPECIFIC Activity/People Hazards
 *****************************************************************/
router.get('/project_activity_people_hazards', async (req, res) => {
  const { projectId } = req.query
  try {
    // same approach: return row ID plus hazard ID
    const [rows] = await pool.query(
      `
      SELECT pah.id AS pahId,
             pah.activity_people_hazard_id,
             aph.hazard_description
      FROM project_activity_people_hazards pah
      JOIN activity_people_hazards aph ON pah.activity_people_hazard_id = aph.id
      WHERE pah.project_id = ?
    `,
      [projectId]
    )
    res.json(rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch project activity hazards.' })
  }
})

router.post('/project_activity_people_hazards', async (req, res) => {
  const { project_id, activity_people_hazard_id } = req.body
  try {
    await pool.query(
      `
      INSERT INTO project_activity_people_hazards (project_id, activity_people_hazard_id)
      VALUES (?, ?)
    `,
      [project_id, activity_people_hazard_id]
    )
    res.status(201).json({ message: 'Activity hazard added.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to add activity hazard.' })
  }
})

// DELETE by row ID (pahId)
router.delete('/project_activity_people_hazards', async (req, res) => {
  const { id } = req.query
  try {
    await pool.query(
      `DELETE FROM project_activity_people_hazards WHERE id = ?`,
      [id]
    )
    res.json({ message: 'Activity hazard removed.' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to remove activity hazard.' })
  }
})

export default router
