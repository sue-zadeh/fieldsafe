// file: complete.js
import { Router } from 'express'
import { pool } from './db.js'
import { sendEmail } from './email.js'

const completeRouter = Router()

// Simple endpoint to send an email
completeRouter.post('/send-email', async (req, res) => {
  const { email, subject, message } = req.body
  try {
    await sendEmail(email, subject, message)
    res.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    res.status(500).json({ message: 'Failed to send email' })
  }
})
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
// GET /:activityId => load existing "Complete" data
completeRouter.get('/:activityId', async (req, res) => {
  const { activityId } = req.params
  try {
    const [activityRows] = await pool.query(
      `SELECT id, project_id, notes, status 
       FROM activities 
       WHERE id = ?`,
      [activityId]
    )
    if (activityRows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: 'No activity found with that ID' })
    }
    const activity = activityRows[0]

    // Check if there's an incident record
    const [incidentRows] = await pool.query(
      `SELECT * FROM activity_incident_reports 
       WHERE activity_id = ?
       ORDER BY id DESC
       LIMIT 1`,
      [activityId]
    )

    let incidentData = null
    if (incidentRows.length > 0) {
      const inc = incidentRows[0]
      incidentData = {
        any_incident: inc.any_incident,
        typeOfIncident: inc.type_of_incident,
        medicalTreatmentObtained: inc.medical_treatment_obtained,
        projectLocation: inc.project_location,
        projectSiteManager: inc.project_site_manager,
        dateOfIncident: inc.date_of_incident
          ? inc.date_of_incident.toISOString().split('T')[0]
          : null,
        timeOfIncident: inc.time_of_incident,
        injuredPerson: inc.injured_person,
        injuredPersonGender: inc.injured_person_gender,
        typeOfInjury: inc.type_of_injury,
        bodyPartInjured: inc.body_part_injured,
        locationOfAccident: inc.location_of_accident,
        witnesses: inc.witnesses,
        taskUndertaken: inc.task_undertaken,
        safetyInstructions: inc.safety_instructions,
        ppeWorn: inc.ppe_worn,
        incidentDescription: inc.incident_description,
        actionTaken: inc.action_taken,
        dateActionImplemented: inc.date_action_implemented
          ? inc.date_action_implemented.toISOString().split('T')[0]
          : null,
        preExistingInjury: inc.pre_existing_injury,
        conditionDisclosed: inc.condition_disclosed,
        registerOfInjuries: inc.register_of_injuries,
        furtherActionRecommended: inc.further_action_recommended,
        injuredPersonSignature: inc.injured_person_signature,
        injuredPersonSignatureDate: inc.injured_person_signature_date
          ? inc.injured_person_signature_date.toISOString().split('T')[0]
          : null,
        managerSignature: inc.manager_signature,
        managerSignatureDate: inc.manager_signature_date
          ? inc.manager_signature_date.toISOString().split('T')[0]
          : null,
        committeeMeetingDate: inc.committee_meeting_date
          ? inc.committee_meeting_date.toISOString().split('T')[0]
          : null,
        committeeMeetingComments: inc.committee_meeting_comments,
        chairpersonSignature: inc.chairperson_signature,
        chairpersonSignatureDate: inc.chairperson_signature_date
          ? inc.chairperson_signature_date.toISOString().split('T')[0]
          : null,
      }
    }

    return res.json({
      success: true,
      activity: {
        id: activity.id,
        project_id: activity.project_id,
        notes: activity.notes || '',
        status: activity.status,
      },
      incident: incidentData,
    })
  } catch (err) {
    console.error('Error in GET /:activityId:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
})

// POST / => completes an activity + optionally inserts an incident
completeRouter.post('/', async (req, res) => {
  const { activityId, notes, anyIncident, incidentDetails } = req.body

  try {
    // 1) Update the activity => notes + status=Completed
    await pool.query(
      `UPDATE activities
          SET notes = ?, status = 'Completed'
        WHERE id = ?`,
      [notes || '', activityId]
    )

    // 2) Grab the project_id from that activity
    const [rows] = await pool.query(
      `SELECT project_id
         FROM activities
        WHERE id = ?`,
      [activityId]
    )
    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: 'No activity found with that ID',
      })
    }
    const projectId = rows[0].project_id

    // 3) If anyIncident==='Yes', insert an incident row
    if (anyIncident === 'Yes' && incidentDetails) {
      const {
        typeOfIncident,
        medicalTreatmentObtained,
        projectLocation,
        projectSiteManager,
        dateOfIncident,
        timeOfIncident,
        injuredPerson,
        injuredPersonGender,
        typeOfInjury,
        bodyPartInjured,
        locationOfAccident,
        witnesses,
        taskUndertaken,
        safetyInstructions,
        ppeWorn,
        incidentDescription,
        actionTaken,
        dateActionImplemented,
        preExistingInjury,
        conditionDisclosed,
        registerOfInjuries,
        furtherActionRecommended,
        injuredPersonSignature,
        injuredPersonSignatureDate,
        managerSignature,
        managerSignatureDate,
        committeeMeetingDate,
        committeeMeetingComments,
        chairpersonSignature,
        chairpersonSignatureDate,
      } = incidentDetails

      /*
        We have 34 columns total if we exclude:
          - id (auto-increment)
          - created_at (default)
        Because:
          1) activity_id
          2) project_id
          3) any_incident
          4) type_of_incident
          5) medical_treatment_obtained
          6) project_location
          7) project_site_manager
          8) date_of_incident
          9) time_of_incident
          10) injured_person
          11) injured_person_gender
          12) type_of_injury
          13) body_part_injured
          14) location_of_accident
          15) witnesses
          16) task_undertaken
          17) safety_instructions
          18) ppe_worn
          19) incident_description
          20) action_taken
          21) date_action_implemented
          22) pre_existing_injury
          23) condition_disclosed
          24) register_of_injuries
          25) further_action_recommended
          26) injured_person_signature
          27) injured_person_signature_date
          28) manager_signature
          29) manager_signature_date
          30) committee_meeting_date
          31) committee_meeting_comments
          32) chairperson_signature
          33) chairperson_signature_date
          34) report_completed
       */

      const insertSql = `
        INSERT INTO activity_incident_reports (
          activity_id,
          project_id,
          any_incident,
          type_of_incident,
          medical_treatment_obtained,
          project_location,
          project_site_manager,
          date_of_incident,
          time_of_incident,
          injured_person,
          injured_person_gender,
          type_of_injury,
          body_part_injured,
          location_of_accident,
          witnesses,
          task_undertaken,
          safety_instructions,
          ppe_worn,
          incident_description,
          action_taken,
          date_action_implemented,
          pre_existing_injury,
          condition_disclosed,
          register_of_injuries,
          further_action_recommended,
          injured_person_signature,
          injured_person_signature_date,
          manager_signature,
          manager_signature_date,
          committee_meeting_date,
          committee_meeting_comments,
          chairperson_signature,
          chairperson_signature_date,
          report_completed
        )
        VALUES (
          ?, ?, 'Yes',  -- col1=activity_id, col2=project_id, col3=any_incident='Yes'
          ?, ?, ?, ?, ?, ?, ?, ?, ?,      -- placeholders for col4..13
          ?, ?, ?, ?, ?, ?, ?, ?,         -- placeholders for col14..22
          ?, ?, ?, ?, ?, ?, ?, ?,         -- placeholders for col23..30
          ?, ?, ?,?,?, 'Yes'                  -- placeholders for col31..33, plus col34='Yes'
        )
      `

      /*
        Explanation:
         - col3 (any_incident) is literal 'Yes'
         - col34 (report_completed) is literal 'Yes'
         -> That means we have 32 placeholders "?" for the other columns
       */

      await pool.query(insertSql, [
        // col1..2
        activityId,
        projectId,

        // col3 => 'Yes' (literal, no placeholder)

        // columns 4..13 => 10 placeholders:
        typeOfIncident || null, // col4
        medicalTreatmentObtained || null, // col5
        projectLocation || null, // col6
        projectSiteManager || null, // col7
        dateOfIncident || null, // col8
        timeOfIncident || null, // col9
        injuredPerson || null, // col10
        injuredPersonGender || null, // col11
        typeOfInjury || null, // col12
        bodyPartInjured || null, // col13

        // columns 14..22 => 9 placeholders:
        locationOfAccident || null, // col14
        witnesses || null, // col15
        taskUndertaken || null, // col16
        safetyInstructions || null, // col17
        ppeWorn || null, // col18
        incidentDescription || null, // col19
        actionTaken || null, // col20
        dateActionImplemented || null, // col21
        preExistingInjury || 'No', // col22

        // columns 23..30 => 8 placeholders:
        conditionDisclosed || 'No', // col23
        registerOfInjuries || 'No', // col24
        furtherActionRecommended || null, // col25
        injuredPersonSignature || null, // col26
        injuredPersonSignatureDate || null, // col27
        managerSignature || null, // col28
        managerSignatureDate || null, // col29
        committeeMeetingDate || null, // col30

        // columns 31..33 => 3 placeholders:
        committeeMeetingComments || null, // col31
        chairpersonSignature || null, // col32
        chairpersonSignatureDate || null, // col33

        // col34 => 'Yes' (report_completed literal)
      ])
    }

    return res.json({ success: true, message: 'Activity completed' })
  } catch (err) {
    console.error('Error in POST /activities/complete:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
})

export default completeRouter
