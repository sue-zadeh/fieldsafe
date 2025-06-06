import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import multer from 'multer'
import { pool } from './db.js'

const router = express.Router()

/**
 * Utility to parse a date string (like "2025-01-21T11:00:00.000Z")
 * into "YYYY-MM-DD" for MySQL.
 */
function parseDateForMySQL(isoString) {
  const dateObj = new Date(isoString)
  if (isNaN(dateObj.getTime())) {
    return null
  }
  const yyyy = dateObj.getUTCFullYear()
  const mm = String(dateObj.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(dateObj.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// -------------------------------------------------------------------
//  Setup absolute __dirname for ES modules
// -------------------------------------------------------------------
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// -------------------------------------------------------------------
//  Multer Disk Storage: Save to "uploads" folder
// -------------------------------------------------------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Using an absolute path to ensure files go in "server/uploads"
    cb(null, path.join(__dirname, 'uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const base = path.basename(file.originalname, ext)
    // Append a timestamp to avoid name collisions
    cb(null, `${base}-${Date.now()}${ext}`)
  },
})

const upload = multer({ storage })

// -------------------------------------------------------------------
//  GET /api/projects
//    - ?name= => Check if project name exists
//    - otherwise => List all projects
// -------------------------------------------------------------------
router.get('/', async (req, res) => {
  const { name } = req.query
  try {
    if (name) {
      // Uniqueness check
      const [rows] = await pool.query(
        'SELECT id FROM projects WHERE name = ?',
        [name]
      )
      return res.json({ exists: rows.length > 0 })
    } else {
      // Return a simple list
      const [rows] = await pool.query('SELECT * FROM projects ORDER BY id DESC')
      return res.json(rows)
    }
  } catch (err) {
    console.error('Error in GET /api/projects:', err)
    return res.status(500).json({ message: 'Failed to fetch projects' })
  }
})

// -------------------------------------------------------------------
//  GET /api/projects/projList
//    - Return projects + concatenated objective titles
// -------------------------------------------------------------------
router.get('/projList', async (req, res) => {
  try {
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
  } catch (err) {
    console.error('Error in GET /api/projects/projList:', err)
    return res.status(500).json({ message: 'Failed to fetch project list' })
  }
})

// -------------------------------------------------------------------
//  GET /api/projects/:id
//    - Return single project + objective IDs
// -------------------------------------------------------------------
router.get('/:id', async (req, res) => {
  const { id } = req.params
  try {
    const sql = `
      SELECT
        p.id,
        p.name,
        p.location,
        DATE_FORMAT(p.startDate, '%Y-%m-%d') AS startDate,
        p.status,
        p.createdBy,
        p.emergencyServices,
        p.localMedicalCenterAddress,
        p.localMedicalCenterPhone,
        p.localHospital,
        p.primaryContactName,
        p.primaryContactPhone,
        p.imageUrl,
        p.inductionFileUrl
      FROM projects p
      WHERE p.id = ?
    `
    const [projRows] = await pool.query(sql, [id])
    if (projRows.length === 0) {
      return res.status(404).json({ message: 'Project not found' })
    }
    const project = projRows[0]

    // bridging table -> objective IDs
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

// -------------------------------------------------------------------
//  POST /api/projects (CREATE)
//    - Upload 'image' + 'inductionFile' via Multer
//    - Insert row into 'projects' + bridging table
// -------------------------------------------------------------------
router.post(
  '/',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'inductionFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let {
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
        objectives,
      } = req.body

      const sqlDate = parseDateForMySQL(startDate)
      if (!sqlDate) {
        return res.status(400).json({ message: 'Invalid or unparseable date.' })
      }

      // Check uniqueness
      const [dupRows] = await pool.query(
        'SELECT id FROM projects WHERE name = ?',
        [name]
      )
      if (dupRows.length > 0) {
        return res.status(400).json({ message: 'Project name already taken.' })
      }

      // Handle files
      let imageUrl = null
      let inductionFileUrl = null

      if (req.files['image']) {
        const fullPath = req.files['image'][0].path
        const fileName = path.basename(fullPath)
        // Store a relative path "uploads/myImage..."
        imageUrl = `uploads/${fileName}`
      }
      if (req.files['inductionFile']) {
        const fullPath = req.files['inductionFile'][0].path
        const fileName = path.basename(fullPath)
        inductionFileUrl = `uploads/${fileName}`
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
        sqlDate,
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

      return res
        .status(201)
        .json({ id: projectId, message: 'Project created successfully' })
    } catch (error) {
      console.error('Error creating project:', error)
      return res.status(500).json({ message: 'Failed to create project' })
    }
  }
)

// -------------------------------------------------------------------
//  PUT /api/projects/:id (UPDATE)
//    - Upload 'image' + 'inductionFile' via Multer
//    - Update row, bridging table
// -------------------------------------------------------------------
router.put(
  '/:id',
  upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'inductionFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { id } = req.params
      let {
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
        objectives,
      } = req.body

      // Convert date
      const sqlDate = parseDateForMySQL(startDate)

      // Check if project exists
      const [existingRows] = await pool.query(
        'SELECT * FROM projects WHERE id = ?',
        [id]
      )
      if (existingRows.length === 0) {
        return res.status(404).json({ message: 'Project not found' })
      }
      const old = existingRows[0]

      // Check name conflict
      if (name) {
        const [dupRows] = await pool.query(
          'SELECT id FROM projects WHERE name = ? AND id != ?',
          [name, id]
        )
        if (dupRows.length > 0) {
          return res
            .status(400)
            .json({ message: 'Project name already taken.' })
        }
      }

      // If we have new files, store them
      let imageUrl = old.imageUrl
      let inductionFileUrl = old.inductionFileUrl
      if (req.files['image']) {
        const fullPath = req.files['image'][0].path
        const fileName = path.basename(fullPath)
        imageUrl = `uploads/${fileName}`
      }
      if (req.files['inductionFile']) {
        const fullPath = req.files['inductionFile'][0].path
        const fileName = path.basename(fullPath)
        inductionFileUrl = `uploads/${fileName}`
      }

      // Keep old fields if not provided
      const finalName = name !== undefined ? name : old.name
      const finalLocation = location !== undefined ? location : old.location
      const finalStartDate = sqlDate || old.startDate // keep old if none
      const finalStatus = status !== undefined ? status : old.status
      const finalCreatedBy = createdBy !== undefined ? createdBy : old.createdBy
      const finalEmergency =
        emergencyServices !== undefined
          ? emergencyServices
          : old.emergencyServices
      const finalMedAddr =
        localMedicalCenterAddress !== undefined
          ? localMedicalCenterAddress
          : old.localMedicalCenterAddress
      const finalMedPhone =
        localMedicalCenterPhone !== undefined
          ? localMedicalCenterPhone
          : old.localMedicalCenterPhone
      const finalHosp =
        localHospital !== undefined ? localHospital : old.localHospital
      const finalContactName =
        primaryContactName !== undefined
          ? primaryContactName
          : old.primaryContactName
      const finalContactPhone =
        primaryContactPhone !== undefined
          ? primaryContactPhone
          : old.primaryContactPhone

      // Update row
      const updateSql = `
        UPDATE projects
        SET 
          name = ?, location = ?, startDate = ?, status = ?, createdBy = ?,
          emergencyServices = ?, localMedicalCenterAddress = ?, localMedicalCenterPhone = ?,
          localHospital = ?, primaryContactName = ?, primaryContactPhone = ?,
          imageUrl = ?, inductionFileUrl = ?
        WHERE id = ?
      `
      await pool.query(updateSql, [
        finalName,
        finalLocation,
        finalStartDate,
        finalStatus,
        finalCreatedBy,
        finalEmergency,
        finalMedAddr,
        finalMedPhone,
        finalHosp,
        finalContactName,
        finalContactPhone,
        imageUrl,
        inductionFileUrl,
        id,
      ])

      // bridging: remove old objectives, insert new
      await pool.query('DELETE FROM project_objectives WHERE project_id = ?', [
        id,
      ])
      let parsedObjectives = []
      try {
        parsedObjectives = objectives ? JSON.parse(objectives) : []
      } catch (err) {
        console.error('Failed to parse updated objectives JSON:', err)
      }
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

// -------------------------------------------------------------------
//  DELETE /api/projects/:id
// -------------------------------------------------------------------
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  try {
    await pool.query('DELETE FROM project_objectives WHERE project_id = ?', [
      id,
    ])
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

// -------------------------------------------------------------------
//  GET /api/projects/:projectId/risk_titles
//      - get a project's linked risk titles
// -------------------------------------------------------------------
router.get('/:projectId/risk_titles', async (req, res) => {
  const { projectId } = req.params
  try {
    const [rows] = await pool.query(
        'SELECT risk_title_id FROM project_risk_titles WHERE project_id = ?',
        [projectId]
    )
    res.json(rows.map(r => r.risk_title_id)) // returns [1, 2, 3]
  } catch (err) {
    console.error('Error fetching project risk titles:', err)
    res.status(500).json({ message: 'Failed to fetch project risk titles.' })
  }
})

// -------------------------------------------------------------------
//  PUT /api/projects/:projectId/risk_titles
//      - link risk titles to a project (replace the set)
// -------------------------------------------------------------------
router.put('/:projectId/risk_titles', async (req, res) => {
  const { projectId } = req.params
  const { risk_title_ids } = req.body

  if (!Array.isArray(risk_title_ids)) {
    return res.status(400).json({ message: 'risk_title_ids must be an array.' })
  }

  const conn = await pool.getConnection()

  try {
    await conn.beginTransaction()

    await conn.query('DELETE FROM project_risk_titles WHERE project_id = ?', [projectId])

    if (risk_title_ids.length > 0) {
      const values = risk_title_ids.map(rid => [projectId, rid])
      await conn.query(
          'INSERT INTO project_risk_titles (project_id, risk_title_id) VALUES ?',
          [values]
      )
    }

    await conn.commit()
    res.json({ message: 'Risks set successfully.' })
  } catch (err) {
    await conn.rollback()
    console.error('Error setting project risks:', err)
    res.status(500).json({ message: 'Failed to set project risks.' })
  } finally {
    conn.release()
  }
})

// -------------------------------------------------------------------
//  POST /api/projects/:projectId/risk_titles
//      - add risk titles to a project (create links)
// -------------------------------------------------------------------
router.post('/:projectId/risk_titles', async (req, res) => {
  const { projectId } = req.params
  const { risk_title_ids } = req.body

  if (!Array.isArray(risk_title_ids) || risk_title_ids.length === 0) {
    return res.status(400).json({ message: 'risk_title_ids must be a non-empty array.' })
  }

  try {
    for (const riskId of risk_title_ids) {
      await pool.query(
          'INSERT IGNORE INTO project_risk_titles (project_id, risk_title_id) VALUES (?, ?)',
          [projectId, riskId]
      )
    }
    res.status(201).json({ message: 'Risks linked to project.' })
  } catch (err) {
    console.error('Error linking risks to project :', err)
    res.status(500).json({ message: 'Failed to link risks to project.' })
  }
})

// -------------------------------------------------------------------
//  DELETE /projects/:projectId/risk_titles
//      - remove risk titles from a project (destroy links)
// -------------------------------------------------------------------
router.delete('/:projectId/risk_titles', async (req, res) => {
  const { projectId } = req.params
  const { risk_title_ids } = req.body

  if (!Array.isArray(risk_title_ids) || risk_title_ids.length === 0) {
    return res.status(400).json({ message: 'risk_title_ids must be a non-empty array.' })
  }

  try {
    for (const riskId of risk_title_ids) {
      await pool.query(
          'DELETE FROM project_risk_titles WHERE project_id = ? AND risk_title_id = ?',
          [projectId, riskId]
      )
    }
    res.json({ message: 'Risks unlinked from project.' })
  } catch (err) {
    console.error('Error unlinking risks from project:', err)
    res.status(500).json({ message: 'Failed to unlink risks from project.' })
  }
})



export default router
