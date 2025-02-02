// file: routes/project.js
import express from 'express'
import { pool } from './db.js'

const router = express.Router()

/**
 * GET => /api/projects/:projectId/objectives
 * Returns the project_objectives joined with objectives
 *   projectObjectiveId, objective_id, title, measurement, amount, etc.
 */
router.get('/:projectId/objectives', async (req, res) => {
  const { projectId } = req.params
  try {
    // Get the joined rows
    const [objRows] = await pool.query(
      `
      SELECT 
        po.id AS projectObjectiveId,
        po.objective_id,
        po.amount,
        o.title,
        o.measurement
      FROM project_objectives po
      JOIN objectives o ON po.objective_id = o.id
      WHERE po.project_id = ?
    `,
      [projectId]
    )

    return res.json(objRows)
  } catch (err) {
    console.error('Error fetching project objectives:', err)
    return res
      .status(500)
      .json({ message: 'Failed to load project objectives.' })
  }
})

export default router
