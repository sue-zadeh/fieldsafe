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

// POST /api/projects
// Expects formData: name, location, startDate, status, createdBy, emergencyServices etc.
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
        startDate,
        status,
        createdBy,
        emergencyServices,
        localMedicalCenterAddress,
        localMedicalCenterPhone,
        localHospital,
        primaryContactName,
        primaryContactPhone,
        location,

        // This is a JSON string and parse it if it exists.
        objectives,
      } = req.body

      let imageUrl = null
      let inductionFileUrl = null

      // If user uploaded an image
      if (req.files['image']) {
        imageUrl = req.files['image'][0].path
      }
      // If user uploaded an induction file
      if (req.files['inductionFile']) {
        inductionFileUrl = req.files['inductionFile'][0].path
      }

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

      // If objectives is present,and parse it
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

      res.status(201).json({
        id: projectId,
        message: 'Project created successfully',
      })
    } catch (error) {
      console.error('Error creating project:', error)
      res.status(500).json({ message: 'Failed to create project' })
    }
  }
)

export default router
