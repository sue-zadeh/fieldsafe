import express from 'express'
import { pool } from './db.js'

const router = express.Router()
/**
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

// e.g. GET => /api/report/report_outcome/:projectId
// (unchanged) returns project objectives

/**
 * GET => /api/report/objective?projectId=..&objectiveId=..&startDate=..&endDate=..
 * Now returns an array of activities + amounts, plus the final total.
 */
router.get('/objective', async (req, res) => {
  const { projectId, objectiveId, startDate, endDate } = req.query
  if (!projectId || !objectiveId || !startDate || !endDate) {
    return res.status(400).json({
      message: 'Missing projectId, objectiveId, startDate, or endDate.',
    })
  }

  try {
    // 1) Check if the objective is “Establishing Predator Control”
    const [objRows] = await pool.query(
      'SELECT id, title FROM objectives WHERE id=?',
      [objectiveId]
    )
    if (objRows.length === 0) {
      return res.status(404).json({ message: 'No such objective.' })
    }
    const objectiveTitle = (objRows[0].title || '').toLowerCase()
    const isPredator = objectiveTitle.includes('predator control')
          
         // If it's a "predator control" objective, needs do a different query
    if (isPredator) {
      // We’ll skip it for now so can see how to show each activity’s amount.
      return res.json({
        message: 'Predator control logic not implemented in this example!',
        detailRows: [],
        totalAmount: 0,
      })
    }

    

    // 2) For a normal objective => get each activity’s “amount” row
    //    from activity_objectives, joined to activities => we can see activity_name
    //    Then we can do the sum in JS.
    const sql = `
      SELECT 
        a.id AS activityId,
        a.activity_name,
        ao.amount,
        a.activity_date
      FROM activity_objectives ao
      JOIN activities a ON ao.activity_id = a.id
      WHERE a.project_id = ?
        AND ao.objective_id = ?
        AND a.activity_date >= ?
        AND a.activity_date <= ?
      ORDER BY a.activity_date ASC
    `
    const [rows] = await pool.query(sql, [
      projectId,
      objectiveId,
      startDate,
      endDate,
    ])

    let totalAmount = 0
    const detailRows = rows.map((r) => {
      const amt = r.amount ?? 0
      totalAmount += amt
      return {
        activityId: r.activityId,
        activityName: r.activity_name,
        activityDate: r.activity_date, // to show the date
        amount: amt,
      }
    })

    return res.json({
      detailRows,
      totalAmount,
    })
  } catch (err) {
    console.error('Error generating objective report:', err)
    return res.status(500).json({ message: 'Failed to generate report.' })
  }
})

export default router
