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
// In server/activity-risk.js:
router.put('/risks/:riskId', async (req, res) => {
  const { riskId } = req.params
  const { title, likelihood, consequences, chosenControlIds, activity_id } =
    req.body

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title cannot be null or empty.' })
  }

  try {
    // 1) Which row in "risks"?
    const [[foundRisk]] = await pool.query(`SELECT * FROM risks WHERE id=?`, [
      riskId,
    ])
    if (!foundRisk) {
      return res.status(404).json({ error: `No such risk with id=${riskId}` })
    }

    // 2) The real risk_title_id is:
    const realTitleId = foundRisk.risk_title_id

    // If you’re concerned about isReadOnly or something, check it here:
    // e.g. SELECT isReadOnly FROM risk_titles WHERE id=? and block if needed.

    // 3) Update the risk_titles row
    await pool.query(
      `UPDATE risk_titles
          SET title=?
        WHERE id=?`,
      [title, realTitleId]
    )

    // 4) Update the main "risks" row
    await pool.query(
      `UPDATE risks
          SET likelihood=?,
              consequences=?
        WHERE id=?`,
      [likelihood, consequences, riskId]
    )

    // 5) Remove old bridging controls
    await pool.query(
      `DELETE FROM activity_risk_controls
        WHERE activity_id=? AND risk_id=?`,
      [activity_id, riskId]
    )

    // 6) Add new bridging controls
    for (const controlId of chosenControlIds || []) {
      await pool.query(
        `INSERT INTO activity_risk_controls
           (activity_id, risk_id, risk_control_id, is_checked)
         VALUES (?,?,?,?)`,
        [activity_id, riskId, controlId, 1]
      )
    }

    return res.json({ message: 'Updated risk row and controls.' })
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .json({ error: 'Failed to update risk row/controls.' })
  }
})

//======================================

// server/activity-risk.js
router.get('/activity_risk_controls/detailed', async (req, res) => {
  const { activityId } = req.query
  if (!activityId) {
    return res.status(400).json({ message: 'No activityId provided' })
  }
  try {
    // MUST return arc.risk_id so we can do (dc) => dc.risk_id === r.riskId
    const [rows] = await pool.query(
      `
      SELECT arc.id AS activityRiskControlId,
             arc.activity_id,
             arc.risk_id,
             arc.risk_control_id,
             arc.is_checked,
             rc.control_text
        FROM activity_risk_controls arc
        JOIN risk_controls rc ON arc.risk_control_id = rc.id
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

//===================================
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
 *  4) Delete risk, title, and controls together
 *  DELETE /api/activity_risks?activityId=XXX&riskId=YYY
 */
router.delete('/activity_risks', async (req, res) => {
  const { activityId, riskId } = req.query

  if (!activityId || !riskId) {
    return res.status(400).json({ message: 'Missing activityId or riskId.' })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Delete activity risk
    await connection.query(
      `DELETE FROM activity_risks WHERE activity_id = ? AND risk_id = ?`,
      [activityId, riskId]
    )

    // Delete associated risk controls
    await connection.query(
      `DELETE FROM risk_controls WHERE risk_title_id = (SELECT risk_title_id FROM risks WHERE id = ?)`,
      [riskId]
    )

    // Delete risk itself
    await connection.query(`DELETE FROM risks WHERE id = ?`, [riskId])

    // Delete risk title
    await connection.query(
      `DELETE FROM risk_titles WHERE id = (SELECT risk_title_id FROM risks WHERE id = ?)`,
      [riskId]
    )

    await connection.commit()
    res.json({ message: 'Risk and associated data removed successfully.' })
  } catch (err) {
    await connection.rollback()
    console.error(err)
    res
      .status(500)
      .json({ message: 'Failed to delete risk and associated data.' })
  } finally {
    connection.release()
  }
})

/**
 *  7) POST /api/activity_risk_controls
 *  Link a risk_control to the activity
 */
// server/activity-risk.js

router.post('/activity_risk_controls', async (req, res) => {
  const { activity_id, risk_id, risk_control_id, is_checked } = req.body
  if (!activity_id || !risk_id || !risk_control_id) {
    return res.status(400).json({
      message: 'Missing activity_id, risk_id, or risk_control_id.',
    })
  }

  try {
    await pool.query(
      `INSERT INTO activity_risk_controls (activity_id, risk_id, risk_control_id, is_checked)
    VALUES (?,?,?,?)`,
      [activity_id, risk_id, risk_control_id, is_checked ? 1 : 0]
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

// If you still have a "DELETE /api/activity_risk_controls?activityId=...&riskId=..."
// you might do something simpler:

router.delete('/activity_risk_controls', async (req, res) => {
  const { activityId, riskId } = req.query
  if (!activityId || !riskId) {
    return res.status(400).json({ message: 'Missing activityId or riskId' })
  }
  // Because the bridging table doesn't store riskId, we can't strictly filter by riskId.
  // So either remove them all or do some partial approach with risk_titles.
  try {
    // If you want to remove *all controls* for the entire activity:
    await pool.query(
      `DELETE FROM activity_risk_controls WHERE activity_id = ?`,
      [activityId]
    )
    return res.json({
      message: 'Removed all bridging controls for this activity.',
    })
  } catch (err) {
    console.error('DELETE /activity_risk_controls error:', err)
    return res.status(500).json({
      message: 'Failed to remove bridging controls for the specified risk.',
    })
  }
})

// =========== HAZARDS endpoints ===========
//             HAZARDS endpoints
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
