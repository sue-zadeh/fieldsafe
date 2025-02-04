// file: server/report.js
import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/**===============================================
 * Helper to convert an incoming ISO date string
 * (e.g. "2025-01-21T11:00:00.000Z") to "YYYY-MM-DD"
 */
function parseDateForMySQL(isoString) {
  if (!isoString) return null
  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) return null

  // We always want plain year-month-day with no time offset
  const yyyy = dateObj.getUTCFullYear()
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
//====================================

/**
 * (1) GET /api/report/report_outcome/:projectId
 * Similar to "activity_outcome/:activityId" except we pass a projectId directly.
 * Returns { projectId, objectives: [...] } shaped exactly like the old code.
 */
router.get('/report_outcome/:projectId', async (req, res) => {
  const { projectId } = req.params
  try {
    // 1) (Optionally) verify the project actually exists
    const [projRows] = await pool.query(
      'SELECT id FROM projects WHERE id = ?',
      [projectId]
    )
    if (!projRows.length) {
      return res.status(404).json({ message: 'No such project.' })
    }

    // 2) Get the "project objectives" joined with "objectives"
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

    // Return the same shape as activity_outcome: {projectId, objectives: [...]}
    res.json({ projectId, objectives: objRows })
  } catch (err) {
    console.error('Error loading project objectives:', err)
    return res
      .status(500)
      .json({ message: 'Failed to load project objectives.' })
  }
})
/**
 * GET => /api/report/objective?projectId=..&objectiveId=..&startDate=..&endDate=..
 * For generating sums from activity_objectives or activity_predator
 */
router.get('/objective', async (req, res) => {
  const { projectId, objectiveId, startDate, endDate } = req.query
  if (!projectId || !objectiveId || !startDate || !endDate) {
    return res.status(400).json({
      message: 'Missing projectId, objectiveId, startDate, or endDate.',
    })
  }

  try {
    // Check if objective is "Establishing Predator Control"
    const [objRows] = await pool.query(
      'SELECT id, title FROM objectives WHERE id=?',
      [objectiveId]
    )
    if (objRows.length === 0) {
      return res.status(404).json({ message: 'No such objective.' })
    }
    const objectiveTitle = (objRows[0].title || '').toLowerCase()
    const isPredator = objectiveTitle.includes('predator control')

    let reportData = {}

    if (!isPredator) {
      // Sum from activity_objectives
      const [rows] = await pool.query(
        `
        SELECT SUM(ao.amount) AS total
        FROM activity_objectives ao
        JOIN activities a ON ao.activity_id = a.id
        WHERE a.project_id = ?
          AND ao.objective_id = ?
          AND a.activity_date >= ?
          AND a.activity_date <= ?
      `,
        [projectId, objectiveId, startDate, endDate]
      )

      const totalAmount = rows[0].total || 0
      reportData = { totalAmount }
    } else {
      // Sum from activity_predator, etc.
      // We'll just stub in zero or do the real logic
      reportData = {
        trapsEstablishedTotal: 0,
        trapsCheckedTotal: 0,
        catchesBreakdown: {
          rats: 0,
          possums: 0,
          mustelids: 0,
          hedgehogs: 0,
          others: 0,
        },
      }
    }

    res.json(reportData)
  } catch (err) {
    console.error('Error generating objective report:', err)
    res.status(500).json({ message: 'Failed to generate report.' })
  }
})

export default router
