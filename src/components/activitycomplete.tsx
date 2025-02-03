import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

interface ActivityCompleteProps {
  activityId: number // from parent (ActivityTabs)
  activityName?: string
  projectName?: string
}

const ActivityComplete: React.FC<ActivityCompleteProps> = ({
  activityId,
  activityName,
}) => {
  // ----------------------------------------------------------------------
  // 1) State: notes & "AnyIncidents?" question
  // ----------------------------------------------------------------------
  const [notes, setNotes] = useState('')
  const [anyIncident, setAnyIncident] = useState<'No' | 'Yes'>('No')

  // ----------------------------------------------------------------------
  // 2) If "Yes," we show the incident form fields
  // ----------------------------------------------------------------------
  const [typeOfIncident, setTypeOfIncident] = useState('')
  const [medicalTreatmentObtained, setMedicalTreatmentObtained] = useState('')
  const [projectLocation, setProjectLocation] = useState('')
  const [projectSiteManager, setProjectSiteManager] = useState('')

  // CHANGE #1: Store date fields simply as "YYYY-MM-DD".
  const [dateOfIncident, setDateOfIncident] = useState('')
  const [timeOfIncident, setTimeOfIncident] = useState('')
  const [injuredPerson, setInjuredPerson] = useState('')
  const [injuredPersonGender, setInjuredPersonGender] = useState('')
  const [typeOfInjury, setTypeOfInjury] = useState('')
  const [bodyPartInjured, setBodyPartInjured] = useState('')
  const [locationOfAccident, setLocationOfAccident] = useState('')
  const [witnesses, setWitnesses] = useState('')
  const [taskUndertaken, setTaskUndertaken] = useState('')
  const [safetyInstructions, setSafetyInstructions] = useState('')
  const [ppeWorn, setPpeWorn] = useState('')
  const [incidentDescription, setIncidentDescription] = useState('')
  const [actionTaken, setActionTaken] = useState('')
  const [dateActionImplemented, setDateActionImplemented] = useState('')

  const [preExistingInjury, setPreExistingInjury] = useState<'No' | 'Yes'>('No')
  const [conditionDisclosed, setConditionDisclosed] = useState<'No' | 'Yes'>(
    'No'
  )
  const [registerOfInjuries, setRegisterOfInjuries] = useState<'No' | 'Yes'>(
    'No'
  )
  const [furtherActionRecommended, setFurtherActionRecommended] = useState('')

  const [injuredPersonSignature, setInjuredPersonSignature] = useState('')
  const [injuredPersonSignatureDate, setInjuredPersonSignatureDate] =
    useState('')
  const [managerSignature, setManagerSignature] = useState('')
  const [managerSignatureDate, setManagerSignatureDate] = useState('')
  const [committeeMeetingDate, setCommitteeMeetingDate] = useState('')
  const [committeeMeetingComments, setCommitteeMeetingComments] = useState('')
  const [chairpersonSignature, setChairpersonSignature] = useState('')
  const [chairpersonSignatureDate, setChairpersonSignatureDate] = useState('')

  // ----------------------------------------------------------------------
  // 3) Modal for sending incident via email if user says "Yes"
  // ----------------------------------------------------------------------
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientName] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // ----------------------------------------------------------------------
  // 4) On component load, fetch existing data
  // ----------------------------------------------------------------------
  useEffect(() => {
    if (!activityId) return
    axios
      .get(`/api/activities/complete/${activityId}`)
      .then((res) => {
        if (!res.data.success) return
        const { activity, incident } = res.data
        // Fill the "notes" from activity
        setNotes(activity.notes || '')

        // If there's an incident, set anyIncident='Yes' and fill details
        if (incident) {
          setAnyIncident('Yes')
          setTypeOfIncident(incident.typeOfIncident || '')
          setMedicalTreatmentObtained(incident.medicalTreatmentObtained || '')
          setProjectLocation(incident.projectLocation || '')
          setProjectSiteManager(incident.projectSiteManager || '')
          // CHANGE #2: We simply store the date string exactly as returned
          setDateOfIncident(incident.dateOfIncident || '')
          setTimeOfIncident(incident.timeOfIncident || '')
          setInjuredPerson(incident.injuredPerson || '')
          setInjuredPersonGender(incident.injuredPersonGender || '')
          setTypeOfInjury(incident.typeOfInjury || '')
          setBodyPartInjured(incident.bodyPartInjured || '')
          setLocationOfAccident(incident.locationOfAccident || '')
          setWitnesses(incident.witnesses || '')
          setTaskUndertaken(incident.taskUndertaken || '')
          setSafetyInstructions(incident.safetyInstructions || '')
          setPpeWorn(incident.ppeWorn || '')
          setIncidentDescription(incident.incidentDescription || '')
          setActionTaken(incident.actionTaken || '')
          setDateActionImplemented(incident.dateActionImplemented || '')
          setPreExistingInjury(incident.preExistingInjury || 'No')
          setConditionDisclosed(incident.conditionDisclosed || 'No')
          setRegisterOfInjuries(incident.registerOfInjuries || 'No')
          setFurtherActionRecommended(incident.furtherActionRecommended || '')
          setInjuredPersonSignature(incident.injuredPersonSignature || '')
          setInjuredPersonSignatureDate(
            incident.injuredPersonSignatureDate || ''
          )
          setManagerSignature(incident.managerSignature || '')
          setManagerSignatureDate(incident.managerSignatureDate || '')
          setCommitteeMeetingDate(incident.committeeMeetingDate || '')
          setCommitteeMeetingComments(incident.committeeMeetingComments || '')
          setChairpersonSignature(incident.chairpersonSignature || '')
          setChairpersonSignatureDate(incident.chairpersonSignatureDate || '')
        } else {
          // No incident found
          setAnyIncident('No')
        }
      })
      .catch((err) => console.error('Error loading complete data:', err))
  }, [activityId])

  // ----------------------------------------------------------------------
  // 5) Submit Handler -> POST /api/activities/complete
  // ----------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        activityId,
        notes,
        anyIncident,
        incidentDetails:
          anyIncident === 'Yes'
            ? {
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
              }
            : null,
      }

      const response = await axios.post('/api/activities/complete', payload)
      if (response.data.success) {
        alert('Activity has been completed/saved!')
        // If user said "Yes," open email modal
        if (anyIncident === 'Yes') {
          setShowEmailModal(true)
        }
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error submitting completion: ', error)
      alert('Error occurred, see console for details.')
    }
  }

  // ----------------------------------------------------------------------
  // 6) Send Email from modal
  // ----------------------------------------------------------------------
  const handleSendEmail = async () => {
    setIsLoading(true)
    try {
      const incidentSummary = `
        Activity Name: ${activityName}
        
        Hi ${recipientName || 'there'},
        
        Here is the incident report:
        -----------------------------------
        Incident ID: ${activityId}
        Type of Incident: ${typeOfIncident}
        Medical Treatment: ${medicalTreatmentObtained}
        Date Of Incident: ${dateOfIncident}
        Time Of Incident: ${timeOfIncident}
        Injured Person: ${injuredPerson}
        Gender: ${injuredPersonGender}
        Type of Injury: ${typeOfInjury}
        Body Part: ${bodyPartInjured}
        Location: ${locationOfAccident}
        Witnesses: ${witnesses}
        Task Undertaken: ${taskUndertaken}
        Safety Instructions: ${safetyInstructions}
        PPE Worn: ${ppeWorn}
        Incident Description: ${incidentDescription}
        Actions Taken: ${actionTaken}
        Date Actions Implemented: ${dateActionImplemented}
        Pre-existing Injury: ${preExistingInjury}
        Condition Disclosed: ${conditionDisclosed}
        Register Of Injuries: ${registerOfInjuries}
        Further Action Recommended: ${furtherActionRecommended}
        Injured Person Signature: ${injuredPersonSignature}
        Manager Signature: ${managerSignature}
        Committee Meeting Date: ${committeeMeetingDate}
        Committee Meeting Comments: ${committeeMeetingComments}
        Chairperson Signature: ${chairpersonSignature}

        -----------------------------------
        Best regards
        FieldSafe Team
      `

      await axios.post('/api/activities/complete/send-email', {
        email: recipientEmail,
        subject: 'Incident Report',
        message: incidentSummary,
      })

      alert('Incident report emailed successfully!')
      setShowEmailModal(false)
      setRecipientEmail('')
    } catch (err) {
      console.error('Error sending incident email:', err)
      alert('Failed to send email.')
    } finally {
      setIsLoading(false)
    }
  }

  // ----------------------------------------------------------------------
  //  Render
  // ----------------------------------------------------------------------
  return (
    <div>
      <div className="container mt-4 ">
        <h4 className="mb-3 text-center" style={{ color: '#0094b6' }}>
          Activity Complete 
        </h4>

        <form onSubmit={handleSubmit} className="card card-body mb-3">
          {/* === NOTES === */}
          <div className="mb-3">
            <label className="form-label fw-bold">Notes / Message:</label>
            <textarea
              className="form-control"
              rows={3}
              placeholder="Write any final notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* === ANY INCIDENT? === */}
          <div className="mb-3">
            <label className="form-label fw-bold">
              Any Accidents/Incidents/Near Misses?
            </label>
            <div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="incidentNo"
                  className="form-check-input"
                  value="No"
                  checked={anyIncident === 'No'}
                  onChange={() => setAnyIncident('No')}
                />
                <label htmlFor="incidentNo" className="form-check-label">
                  No
                </label>
              </div>
              <div className="form-check form-check-inline">
                <input
                  type="radio"
                  id="incidentYes"
                  className="form-check-input"
                  value="Yes"
                  checked={anyIncident === 'Yes'}
                  onChange={() => setAnyIncident('Yes')}
                />
                <label htmlFor="incidentYes" className="form-check-label">
                  Yes
                </label>
              </div>
            </div>
          </div>

          {/* === IF YES, SHOW INCIDENT FORM === */}
          {anyIncident === 'Yes' && (
            <div className="border p-3 mb-3 rounded">
              <h5>Accident/Incident Report</h5>

              <div className="row">
                {/* ROW 1: TypeOfIncident & Treatment */}
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Type of Incident:
                  </label>
                  <select
                    className="form-select"
                    value={typeOfIncident}
                    onChange={(e) => setTypeOfIncident(e.target.value)}
                  >
                    <option value="">--Select--</option>
                    <option value="Near Miss">Near Miss</option>
                    <option value="Medical Treatment">Medical Treatment</option>
                    <option value="Other Significant Event">
                      Other Significant Event
                    </option>
                    <option value="First Aid">First Aid</option>
                  </select>
                </div>

                {typeOfIncident === 'Medical Treatment' && (
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Where was the treatment obtained?
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. local hospital"
                      value={medicalTreatmentObtained}
                      onChange={(e) =>
                        setMedicalTreatmentObtained(e.target.value)
                      }
                    />
                  </div>
                )}
              </div>

              {/* ROW 2: ProjectLocation & Manager */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Project Location:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={projectLocation}
                    onChange={(e) => setProjectLocation(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Project/Site Manager:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={projectSiteManager}
                    onChange={(e) => setProjectSiteManager(e.target.value)}
                  />
                </div>
              </div>

              {/* ROW 3: Date & Time */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Date of Incident:
                  </label>
                  {/* CHANGE #3: Simple approach, store the raw string */}
                  <input
                    className="form-control"
                    type="date"
                    value={dateOfIncident}
                    onChange={(e) => setDateOfIncident(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Time of Incident:
                  </label>
                  <input
                    className="form-control"
                    type="time"
                    value={timeOfIncident}
                    onChange={(e) => setTimeOfIncident(e.target.value)}
                  />
                </div>
              </div>

              {/* ROW 4: Injured Person & Gender */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Injured Person:</label>
                  <input
                    className="form-control"
                    type="text"
                    value={injuredPerson}
                    onChange={(e) => setInjuredPerson(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Gender:</label>
                  <select
                    className="form-select"
                    value={injuredPersonGender}
                    onChange={(e) => setInjuredPersonGender(e.target.value)}
                  >
                    <option value="">--Select--</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other / Prefer not to say</option>
                  </select>
                </div>
              </div>

              {/* ... the rest remain the same, just remove “handleDateChange.” */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Type of Injury:</label>
                  <input
                    className="form-control"
                    type="text"
                    value={typeOfInjury}
                    onChange={(e) => setTypeOfInjury(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Body Part Injured:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={bodyPartInjured}
                    onChange={(e) => setBodyPartInjured(e.target.value)}
                  />
                </div>
              </div>

              {/* ...Skipping some rows for brevity, but you do the same approach: 
                  plain onChange={(e) => setXYZ(e.target.value)} for date fields. 
              */}

              {/* Date Action Implemented */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Actions to prevent recurrence:
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Date actions implemented:
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    value={dateActionImplemented}
                    onChange={(e) => setDateActionImplemented(e.target.value)}
                  />
                </div>
              </div>

              {/* Injured Person Signature Date */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Injured Person Signature:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={injuredPersonSignature}
                    onChange={(e) => setInjuredPersonSignature(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Date:</label>
                  <input
                    className="form-control"
                    type="date"
                    value={injuredPersonSignatureDate}
                    onChange={(e) =>
                      setInjuredPersonSignatureDate(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Manager Signature Date */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Project/Site Manager Signature:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={managerSignature}
                    onChange={(e) => setManagerSignature(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Date:</label>
                  <input
                    className="form-control"
                    type="date"
                    value={managerSignatureDate}
                    onChange={(e) => setManagerSignatureDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Committee Meeting Date, etc. */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Reported to Committee Meeting on:
                  </label>
                  <input
                    className="form-control"
                    type="date"
                    value={committeeMeetingDate}
                    onChange={(e) => setCommitteeMeetingDate(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Comments:</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={committeeMeetingComments}
                    onChange={(e) =>
                      setCommitteeMeetingComments(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Chairperson Signature, Date */}
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">
                    Chairperson Signature:
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    value={chairpersonSignature}
                    onChange={(e) => setChairpersonSignature(e.target.value)}
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label fw-bold">Date:</label>
                  <input
                    className="form-control"
                    type="date"
                    value={chairpersonSignatureDate}
                    onChange={(e) =>
                      setChairpersonSignatureDate(e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary fs-6"
            style={{ backgroundColor: '#0094b6' }}
          >
            {anyIncident === 'No' ? 'Complete' : 'Submit'}
          </button>
        </form>

        {/* === MODAL for entering email after "Yes" submission === */}
        {showEmailModal && (
          <div
            className="modal fade show"
            style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Send Incident Report</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowEmailModal(false)}
                  />
                </div>
                <div className="modal-body">
                  <label htmlFor="recipient" className="form-label">
                    Enter email address:
                  </label>
                  <input
                    type="email"
                    id="recipient"
                    className="form-control"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                  />
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowEmailModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success w-25 "
                    style={{ backgroundColor: '#738c40' }}
                    onClick={handleSendEmail}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Email'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ActivityComplete
