// file: complete.js
import { Router } from 'express'
import { pool } from './db.js' // confirm 'db.js' is in the same folder

// Name this router "completeRouter" so we can use it below
const completeRouter = Router()

completeRouter.post('/complete', async (req, res) => {
  const { projectId, notes, anyIncident, incidentDetails } = req.body

  try {
    // 1) Create or update the Activity
    const [activityResult] = await pool.query(
      `INSERT INTO activities (project_id, activity_date, notes, createdBy, status)
       VALUES (?, CURDATE(), ?, ?, 'Completed')`,
      [projectId, notes, /* just a placeholder for createdBy: */ 1]
    )

    const newActivityId = activityResult.insertId

    // 2) If user said "Yes" to an incident, insert record in activity_incident_reports
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

      await pool.query(
        `INSERT INTO activity_incident_reports
        (
          activity_id,
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
        VALUES (?, 'Yes', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Yes')
        `,
        [
          newActivityId,
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
        ]
      )
    }

    // Return success
    return res.json({
      success: true,
      message: 'Activity completed',
      activityId: newActivityId,
    })
  } catch (err) {
    console.error('Error in POST /activities/complete:', err)
    return res.status(500).json({ success: false, message: err.message })
  }
})

// Use a default export, so you can do `import completeRouter from './complete.js'` in server.js
export default completeRouter
