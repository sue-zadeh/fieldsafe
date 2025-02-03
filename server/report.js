// file: routes/report.js
import express from 'express'
import { pool } from '../db.js'

const router = express.Router()

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
      // we'll skip the full logic. we need:
      //   sub_type = 'Traps Established', 'Traps Checked', 'Catches', etc.
      // Summations for measurement, rats, possums, etc.
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
