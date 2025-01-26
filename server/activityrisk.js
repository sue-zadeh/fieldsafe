// server/activity-risk.js
import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/**
 *  1) Create a row in "risks" table (the core risk)
 *  POST /api/risks-create-row
 */
router.post('/risks-create-row', async (req, res) => {
  const { risk_title_id, likelihood, consequences } = req.body
  try {
    const [result] = await pool.query(
      `INSERT INTO risks (risk_title_id, likelihood, consequences)
       VALUES (?, ?, ?)`,
      [risk_title_id, likelihood, consequences]
    )
    return res.status(201).json({ riskId: result.insertId })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to create risk row.' })
  }
})

/**
 *  2) Update an existing "risks" row
 *  PUT /api/risks/:riskId
 */
router.put('/risks/:riskId', async (req, res) => {
  const { riskId } = req.params
  const { likelihood, consequences } = req.body
  try {
    await pool.query(
      `UPDATE risks SET likelihood=?, consequences=? WHERE id=?`,
      [likelihood, consequences, riskId]
    )
    return res.json({ message: 'Updated risk row.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Failed to update risk row.' })
  }
})

/**
 *  3) GET /api/activity_risks?activityId=...
 *  Return bridging rows joined with "risks" + "risk_titles"
 */
router.get('/activity_risks', async (req, res) => {
  const { activityId } = req.query
  if (!activityId) {
    return res.status(400).json({ message: 'No activityId provided' })
  }
  try {
    const [rows] = await pool.query(
      `SELECT ar.id AS activityRiskId,
              r.id AS riskId,
              r.risk_title_id AS riskTitleId,
              rt.title AS risk_title_label,
              r.likelihood,
              r.consequences,
              r.risk_rating
       FROM activity_risks ar
       JOIN risks r ON ar.risk_id = r.id
       JOIN risk_titles rt ON r.risk_title_id = rt.id
       WHERE ar.activity_id = ?`,
      [activityId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('GET /activity_risks error:', err)
    return res.status(500).json({ message: 'Failed to fetch activity risks.' })
  }
})

/**
 *  4) POST /api/activity_risks
 *  Link an existing risk_id to this activity
 */
router.post('/activity_risks', async (req, res) => {
  const { activity_id, risk_id } = req.body
  if (!activity_id || !risk_id) {
    return res.status(400).json({ message: 'activity_id and risk_id required' })
  }
  try {
    await pool.query(
      'INSERT INTO activity_risks (activity_id, risk_id) VALUES (?,?)',
      [activity_id, risk_id]
    )
    return res.status(201).json({ message: 'Activity risk added successfully' })
  } catch (err) {
    console.error('POST /activity_risks error:', err)
    return res.status(500).json({ message: 'Failed to add activity risk.' })
  }
})

/**
 *  5) DELETE /api/activity_risks?activityId=XXX&riskId=YYY
 *  Remove bridging
 */
router.delete('/activity_risks', async (req, res) => {
  const { activityId, riskId } = req.query
  if (!activityId || !riskId) {
    return res.status(400).json({ message: 'Missing activityId or riskId' })
  }
  try {
    await pool.query(
      'DELETE FROM activity_risks WHERE activity_id=? AND risk_id=?',
      [activityId, riskId]
    )
    return res.json({ message: 'Removed risk from activity.' })
  } catch (err) {
    console.error('DELETE /activity_risks error:', err)
    return res.status(500).json({ message: 'Failed to remove risk.' })
  }
})

/**
 *  6) GET /api/activity_risk_controls/detailed?activityId=...
 *  So you can see which controls are chosen for each risk
 */
router.get('/activity_risk_controls/detailed', async (req, res) => {
  const { activityId } = req.query
  if (!activityId) {
    return res.status(400).json({ message: 'No activityId provided' })
  }
  try {
    // Example join
    const [rows] = await pool.query(
      `
      SELECT arc.id AS activityRiskControlId,
             arc.activity_id,
             arc.risk_control_id,
             arc.is_checked,
             rc.control_text,
             r.id AS riskId
      FROM activity_risk_controls arc
      JOIN risk_controls rc ON arc.risk_control_id = rc.id
      JOIN risks r ON r.id = (
        SELECT rr.id FROM risks rr
        WHERE rr.id = (
          SELECT ar.risk_id FROM activity_risks ar
           WHERE ar.activity_id = arc.activity_id
           LIMIT 1
        )
      )
      WHERE arc.activity_id = ?
    `,
      [activityId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('GET /activity_risk_controls/detailed error:', err)
    return res
      .status(500)
      .json({ message: 'Failed to fetch risk controls bridging.' })
  }
})

/**
 *  7) POST /api/activity_risk_controls
 *  Link a risk_control to the activity
 */
router.post('/activity_risk_controls', async (req, res) => {
  const { activity_id, risk_control_id, is_checked } = req.body
  if (!activity_id || !risk_control_id) {
    return res
      .status(400)
      .json({ message: 'Missing activity_id or risk_control_id.' })
  }
  try {
    await pool.query(
      `INSERT INTO activity_risk_controls (activity_id, risk_control_id, is_checked)
       VALUES (?,?,?)`,
      [activity_id, risk_control_id, is_checked ? 1 : 0]
    )
    return res
      .status(201)
      .json({ message: 'Activity risk control linked successfully' })
  } catch (err) {
    console.error('POST /activity_risk_controls error:', err)
    return res
      .status(500)
      .json({ message: 'Failed to link risk control to activity.' })
  }
})

/**
 *  8) DELETE /api/activity_risk_controls?activityId=XXX&riskId=YYY
 *  Remove all bridging controls for that risk
 */
router.delete('/activity_risk_controls', async (req, res) => {
  const { activityId, riskId } = req.query
  if (!activityId || !riskId) {
    return res.status(400).json({ message: 'Missing activityId or riskId' })
  }
  try {
    // We must figure out which controls belong to that risk.
    // Typically you'd do a subselect or a join.
    // For simplicity, let's just do a multi-step approach or simpler approach
    // e.g. remove all controls bridging for that activity & risk.
    // We'll do a join if needed, or (for brevity) we do something simpler:
    const sql = `
      DELETE arc
      FROM activity_risk_controls arc
      JOIN activity_risks ar ON ar.activity_id = arc.activity_id
      WHERE arc.activity_id=? AND ar.risk_id=?`
    await pool.query(sql, [activityId, riskId])
    return res.json({
      message: 'Removed risk controls for that risk from activity.',
    })
  } catch (err) {
    console.error('DELETE /activity_risk_controls error:', err)
    return res
      .status(500)
      .json({ message: 'Failed to remove bridging controls.' })
  }
})

// =========== HAZARDS endpoints ===========
// ====== activity_site_hazards =========

router.get('/activity_site_hazards', async (req, res) => {
  const { activityId } = req.query
  if (!activityId) {
    return res.status(400).json({ message: 'No activityId provided' })
  }
  try {
    const [rows] = await pool.query(
      `
      SELECT ash.id,
             sh.hazard_description,
             ash.site_hazard_id
      FROM activity_site_hazards ash
      JOIN site_hazards sh ON ash.site_hazard_id = sh.id
      WHERE ash.activity_id = ?
    `,
      [activityId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('GET /activity_site_hazards error:', err)
    return res
      .status(500)
      .json({ message: 'Failed to fetch activity site hazards.' })
  }
})

router.post('/activity_site_hazards', async (req, res) => {
  const { activity_id, site_hazard_id } = req.body
  if (!activity_id || !site_hazard_id) {
    return res
      .status(400)
      .json({ message: 'Missing activity_id or site_hazard_id.' })
  }
  try {
    await pool.query(
      `
      INSERT INTO activity_site_hazards (activity_id, site_hazard_id)
      VALUES (?, ?)
    `,
      [activity_id, site_hazard_id]
    )
    return res.status(201).json({ message: 'Site hazard added to activity.' })
  } catch (err) {
    console.error('POST /activity_site_hazards error:', err)
    return res.status(500).json({ message: 'Failed to add site hazard.' })
  }
})

router.delete('/activity_site_hazards', async (req, res) => {
  const { id } = req.query
  if (!id) {
    return res.status(400).json({ message: 'Missing id param' })
  }
  try {
    await pool.query('DELETE FROM activity_site_hazards WHERE id=?', [id])
    return res.json({ message: 'Removed site hazard from activity.' })
  } catch (err) {
    console.error('DELETE /activity_site_hazards error:', err)
    return res.status(500).json({ message: 'Failed to remove hazard.' })
  }
})

// =========================================

// ----=====Activity/People Hazards =====-------
// ===== activity_activity_people_hazards =====
router.get('/activity_activity_people_hazards', async (req, res) => {
  const { activityId } = req.query
  if (!activityId) {
    return res.status(400).json({ message: 'No activityId provided' })
  }
  try {
    const [rows] = await pool.query(
      `
      SELECT aah.id,
             ah.hazard_description,
             aah.activity_people_hazard_id
      FROM activity_activity_people_hazards aah
      JOIN activity_people_hazards ah ON aah.activity_people_hazard_id = ah.id
      WHERE aah.activity_id = ?
    `,
      [activityId]
    )
    return res.json(rows)
  } catch (err) {
    console.error('GET /activity_activity_people_hazards error:', err)
    return res
      .status(500)
      .json({ message: 'Failed to fetch activity/people hazards.' })
  }
})

router.post('/activity_activity_people_hazards', async (req, res) => {
  const { activity_id, activity_people_hazard_id } = req.body
  if (!activity_id || !activity_people_hazard_id) {
    return res.status(400).json({
      message: 'Missing activity_id or activity_people_hazard_id.',
    })
  }
  try {
    await pool.query(
      `
      INSERT INTO activity_activity_people_hazards (activity_id, activity_people_hazard_id)
      VALUES (?, ?)
    `,
      [activity_id, activity_people_hazard_id]
    )
    return res
      .status(201)
      .json({ message: 'Activity/People Hazards added to activity.' })
  } catch (err) {
    console.error('POST /activity_activity_people_hazards error:', err)
    return res
      .status(500)
      .json({ message: 'Failed to add Activity people hazards.' })
  }
})

router.delete('/activity_activity_people_hazards', async (req, res) => {
  const { id } = req.query
  if (!id) {
    return res.status(400).json({ message: 'Missing id param' })
  }
  try {
    await pool.query(
      `
      DELETE FROM activity_activity_people_hazards
      WHERE id = ?
    `,
      [id]
    )
    return res.json({
      message: 'Removed Activity/people Hazards from activity.',
    })
  } catch (err) {
    console.error('DELETE /activity_activity_people_hazards error:', err)
    return res.status(500).json({ message: 'Failed to remove hazard.' })
  }
})

export default router
