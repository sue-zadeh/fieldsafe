import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/**===============================================
 * Helper to convert an incoming ISO date string
 * (e.g. "2025-01-21T11:00:00.000Z") to "YYYY-MM-DD"
 */
function parseDateForMySQL(isoString) {
  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) {
    return null
  }
  const yyyy = dateObj.getUTCFullYear()
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}` // e.g. "2025-01-21"
}
//====================================

// GET => /api/report/objective?projectId=..&objectiveId=..&startDate=..&endDate=..
router.get('/objective', async (req, res) => {
  const { projectId, objectiveId, startDate, endDate } = req.query
  if (!projectId || !objectiveId || !startDate || !endDate) {
    return res.status(400).json({
      message: 'Missing projectId, objectiveId, startDate, or endDate.',
    })
  }

  try {
    // 1) Check if the objective is "Establishing Predator Control"
    const [objRows] = await pool.query(
      'SELECT id, title FROM objectives WHERE id=?',
      [objectiveId]
    )
    if (objRows.length === 0) {
      return res.status(404).json({ message: 'No such objective.' })
    }
    const objectiveTitle = (objRows[0].title || '').toLowerCase()
    let isPredator = objectiveTitle.includes('predator control')

    let reportData = {}

    if (!isPredator) {
      // Normal objective => sum from activity_objectives
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
      // Predator => sum from activity_predator, etc.
      // ...
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
