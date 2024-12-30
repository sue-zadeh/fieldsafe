// server/projects.js
import express from 'express'
import { pool } from './db.js'
import multer from 'multer'
import path from 'path'

const router = express.Router()

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // store in "server/uploads"
    cb(null, 'server/uploads/')
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    cb(null, base + '-' + Date.now() + ext)
  },
})
const upload = multer({ storage })

/**
 * ============ GET /api/projects/list ============
 *  ?name=MyProject => check uniqueness
 *  else => return joined list of all projects + objectives
 */
router.get('/list', async (req, res) => {
  const { name } = req.query
  try {
    if (name) {
      // Check if that project name exists
      const [rows] = await pool.query(
        'SELECT id FROM projects WHERE name = ?',
        [name]
      )
      if (rows.length > 0) {
        return res.json({ exists: true })
      } else {
        return res.json({ exists: false })
      }
    } else {
      // Return ALL projects with joined objectives
      // e.g. p.*, GROUP_CONCAT(o.title)
      // Then parse them in the front-end if needed
      const [rows] = await pool.query(`
        SELECT 
          p.*,
          GROUP_CONCAT(o.title SEPARATOR ', ') AS objectiveTitles
        FROM projects p
        LEFT JOIN project_objectives po ON p.id = po.project_id
        LEFT JOIN objectives o ON po.objective_id = o.id
        GROUP BY p.id
        ORDER BY p.id DESC
      `)
      return res.json(rows)
    }
  } catch (err) {
    console.error('Error fetching projects list:', err)
    return res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

/**
 * ============ GET /api/projects/:id ============
 *  Return a single project and its objective IDs
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    // 1) fetch the project
    const [projRows] = await pool.query('SELECT * FROM projects WHERE id = ?', [
      id,
    ])
    if (projRows.length === 0) {
      return res.status(404).json({ message: 'Project not found' })
    }
    const project = projRows[0]

    // 2) fetch bridging objectives
    const [objRows] = await pool.query(
      'SELECT objective_id FROM project_objectives WHERE project_id = ?',
      [id]
    )
    const objectiveIds = objRows.map((r) => r.objective_id)

    return res.json({ project, objectiveIds })
  } catch (err) {
    console.error('Error fetching project:', err)
    return res.status(500).json({ message: 'Server error' })
  }
})

/**
 * ============ POST /api/projects (CREATE) ============
 *  Expects formData: name, location, startDate, status, ...
 */
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'inductionFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        name,
        location,
        startDate,
        status,
        createdBy,
        emergencyServices,
        localMedicalCenterAddress,
        localMedicalCenterPhone,
        localHospital,
        primaryContactName,
        primaryContactPhone,
        objectives, // JSON string
      } = req.body

      let imageUrl = null
      let inductionFileUrl = null

      if (req.files['image']) {
        imageUrl = req.files['image'][0].path
      }
      if (req.files['inductionFile']) {
        inductionFileUrl = req.files['inductionFile'][0].path
      }

      // Insert project
      const insertSql = `
        INSERT INTO projects
        (name, location, startDate, status, createdBy,
         emergencyServices, localMedicalCenterAddress, localMedicalCenterPhone,
         localHospital, primaryContactName, primaryContactPhone,
         imageUrl, inductionFileUrl)
        VALUES (?, ?, ?, ?, ?,
                ?, ?, ?,
                ?, ?, ?,
                ?, ?)
      `
      const [result] = await pool.query(insertSql, [
        name,
        location,
        startDate,
        status,
        createdBy || null,
        emergencyServices || '111 will contact all emergency services',
        localMedicalCenterAddress || '',
        localMedicalCenterPhone || '',
        localHospital || '',
        primaryContactName || '',
        primaryContactPhone || '',
        imageUrl,
        inductionFileUrl,
      ])
      const projectId = result.insertId

      // parse objectives
      let parsedObjectives = []
      try {
        parsedObjectives = objectives ? JSON.parse(objectives) : []
      } catch (err) {
        console.error('Failed to parse objectives JSON:', err)
      }
      if (Array.isArray(parsedObjectives)) {
        for (const objId of parsedObjectives) {
          await pool.query(
            'INSERT INTO project_objectives (project_id, objective_id) VALUES (?, ?)',
            [projectId, objId]
          )
        }
      }

      return res.status(201).json({
        id: projectId,
        message: 'Project created successfully',
      })
    } catch (error) {
      console.error('Error creating project:', error)
      return res.status(500).json({ message: 'Failed to create project' })
    }
  }
)

/**
 * ============ PUT /api/projects/:id (UPDATE) ============
 *  For “Edit Project” scenario.
 *  Also updates bridging objectives.
 */
router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'inductionFile', maxCount: 1 },
  ]),
  async (req, res) => {
    const { id } = req.params

    try {
      // parse the body
      const {
        name,
        location,
        startDate,
        status,
        createdBy,
        emergencyServices,
        localMedicalCenterAddress,
        localMedicalCenterPhone,
        localHospital,
        primaryContactName,
        primaryContactPhone,
        objectives, // JSON string of objective IDs
      } = req.body

      let imageUrl = null
      let inductionFileUrl = null

      if (req.files['image']) {
        imageUrl = req.files['image'][0].path
      }
      if (req.files['inductionFile']) {
        inductionFileUrl = req.files['inductionFile'][0].path
      }

      // 1) fetch existing row
      const [existingRows] = await pool.query(
        'SELECT * FROM projects WHERE id = ?',
        [id]
      )
      if (existingRows.length === 0) {
        return res.status(404).json({ message: 'Project not found' })
      }
      const old = existingRows[0]

      // 2) partial update logic
      const updatedName = name ?? old.name
      const updatedLocation = location ?? old.location
      const updatedStartDate = startDate ?? old.startDate
      const updatedStatus = status ?? old.status
      const updatedCreatedBy = createdBy ?? old.createdBy
      const updatedEmergency = emergencyServices ?? old.emergencyServices
      const updatedMedAddr =
        localMedicalCenterAddress ?? old.localMedicalCenterAddress
      const updatedMedPhone =
        localMedicalCenterPhone ?? old.localMedicalCenterPhone
      const updatedLocalHosp = localHospital ?? old.localHospital
      const updatedPContactName = primaryContactName ?? old.primaryContactName
      const updatedPContactPhone =
        primaryContactPhone ?? old.primaryContactPhone
      const updatedImage = imageUrl ?? old.imageUrl
      const updatedInduction = inductionFileUrl ?? old.inductionFileUrl

      // 3) update statement
      const updateSql = `
        UPDATE projects
        SET name = ?, location = ?, startDate = ?, status = ?, createdBy = ?,
            emergencyServices = ?, localMedicalCenterAddress = ?, localMedicalCenterPhone = ?,
            localHospital = ?, primaryContactName = ?, primaryContactPhone = ?,
            imageUrl = ?, inductionFileUrl = ?
        WHERE id = ?
      `
      await pool.query(updateSql, [
        updatedName,
        updatedLocation,
        updatedStartDate,
        updatedStatus,
        updatedCreatedBy,
        updatedEmergency,
        updatedMedAddr,
        updatedMedPhone,
        updatedLocalHosp,
        updatedPContactName,
        updatedPContactPhone,
        updatedImage,
        updatedInduction,
        id,
      ])

      // 4) update bridging objectives
      // remove old bridging, insert new
      let parsedObjectives = []
      try {
        parsedObjectives = objectives ? JSON.parse(objectives) : []
      } catch (err) {
        console.error('Failed to parse updated objectives JSON:', err)
      }
      // delete existing bridging
      await pool.query('DELETE FROM project_objectives WHERE project_id = ?', [
        id,
      ])
      // insert new bridging
      if (Array.isArray(parsedObjectives)) {
        for (const objId of parsedObjectives) {
          await pool.query(
            'INSERT INTO project_objectives (project_id, objective_id) VALUES (?, ?)',
            [id, objId]
          )
        }
      }

      return res.json({ message: 'Project updated successfully' })
    } catch (err) {
      console.error('Error updating project:', err)
      return res.status(500).json({ message: 'Failed to update project' })
    }
  }
)

/**
 * ============ DELETE /api/projects/:id ============
 *  Confirm and delete bridging + project row.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    // remove bridging
    await pool.query('DELETE FROM project_objectives WHERE project_id = ?', [
      id,
    ])
    // remove project
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id])
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' })
    }
    return res.json({ message: 'Project deleted successfully' })
  } catch (err) {
    console.error('Error deleting project:', err)
    return res.status(500).json({ message: 'Failed to delete project' })
  }
})

export default router
