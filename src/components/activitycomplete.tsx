import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import 'bootstrap/dist/css/bootstrap.min.css'

// Just an example interface if you want to store or show existing reports
interface ReportItem {
  id: number
  notes: string
  createdAt: string
  // etc. adapt to your real structure
}

const ActivityComplete: React.FC = () => {
  // -----------------------------------------------------------------------
  //  A) State for which tab is active
  // -----------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState<'complete' | 'reports'>('complete')

  // -----------------------------------------------------------------------
  //  B) If you need a valid projectId from earlier tabs:
  // -----------------------------------------------------------------------
  const [projectId, setProjectId] = useState<number>(0)
  // ^ Set this properly. For now, we just default to 0 to illustrate usage.

  // -----------------------------------------------------------------------
  //  C) For the "View Reports" tab
  // -----------------------------------------------------------------------
  const [reports, setReports] = useState<ReportItem[]>([])

  useEffect(() => {
    if (activeTab === 'reports') {
      // Example fetch, adapt endpoint to your actual route
      // e.g. GET /api/activities/completed?projectId=...
      axios
        .get(`/api/activities/completed?projectId=${projectId}`)
        .then((res) => {
          setReports(res.data || [])
        })
        .catch((err) => {
          console.error('Error fetching reports: ', err)
        })
    }
  }, [activeTab, projectId])

  // -----------------------------------------------------------------------
  //  D) "Complete" form states
  // -----------------------------------------------------------------------
  const [notes, setNotes] = useState('')
  const [anyIncident, setAnyIncident] = useState<'No' | 'Yes'>('No')

  // Incident form fields:
  const [typeOfIncident, setTypeOfIncident] = useState('')
  const [medicalTreatmentObtained, setMedicalTreatmentObtained] = useState('')
  const [projectLocation, setProjectLocation] = useState('')
  const [projectSiteManager, setProjectSiteManager] = useState('')
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

  // -----------------------------------------------------------------------
  //  E) Helper: Fix the "date off by one" issue
  //     We'll parse the <input type="date"> value and store it as UTC
  // -----------------------------------------------------------------------
  function handleDateChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) {
    const val = e.target.value // e.g. "2025-01-15"
    if (!val) {
      setter('')
      return
    }
    const [yyyy, mm, dd] = val.split('-')
    const newDate = new Date(Date.UTC(+yyyy, +mm - 1, +dd))
    // Store back in YYYY-MM-DD so that it's not offset by timezones
    setter(newDate.toISOString().split('T')[0])
  }

  // -----------------------------------------------------------------------
  //  F) Submit Handler
  // -----------------------------------------------------------------------
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      // We must pass a valid projectId or DB will complain if it's NOT NULL
      if (!projectId) {
        alert(
          'No valid projectId found. Please ensure project is selected earlier!'
        )
        return
      }

      const payload = {
        projectId,
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
        alert('Activity completion saved successfully!')
        // Optionally reset some fields or switch to the "reports" tab
        // setActiveTab('reports');
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error submitting completion: ', error)
      alert('Error occurred, see console for details.')
    }
  }

  // -----------------------------------------------------------------------
  //  G) Render
  // -----------------------------------------------------------------------
  return (
    <div className="container mt-4">
      {/* Bootstrap Nav Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'complete' ? 'active' : ''}`}
            onClick={() => setActiveTab('complete')}
          >
            Complete Form
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => setActiveTab('reports')}
          >
            View Reports
          </button>
        </li>
      </ul>

      {/* Tab Content */}
      {activeTab === 'complete' && (
        <div className="card card-body mt-3">
          <h2 className="text-center">Complete Activity</h2>
          <form onSubmit={handleSubmit}>
            {/* NOTES */}
            <div className="mb-3">
              <label className="form-label fw-bold">Notes / Message:</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Write any final notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* ANY INCIDENT? */}
            <div className="mb-3">
              <label className="form-label fw-bold">
                Any Accidents/Incidents/Near misses?
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

            {/* IF YES, SHOW INCIDENT FORM */}
            {anyIncident === 'Yes' && (
              <div className="border p-3 rounded">
                <h4 className="mb-3">Accident/Incident Report</h4>
                <div className="row">
                  {/* Type of Incident */}
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
                      <option value="Medical Treatment">
                        Medical Treatment
                      </option>
                      <option value="Other Significant Event">
                        Other Significant Event
                      </option>
                      <option value="First Aid">First Aid</option>
                    </select>
                  </div>

                  {/* If Medical Treatment */}
                  {typeOfIncident === 'Medical Treatment' && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        If Medical Treatment, where obtained?
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="e.g. Local hospital"
                        value={medicalTreatmentObtained}
                        onChange={(e) =>
                          setMedicalTreatmentObtained(e.target.value)
                        }
                      />
                    </div>
                  )}

                  {/* Project Location */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Project Location:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. North Auckland Reserve"
                      value={projectLocation}
                      onChange={(e) => setProjectLocation(e.target.value)}
                    />
                  </div>

 {/* Date of Incident */}
 <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Date of Incident:
                    </label>
                    <input
                      className="form-control"
                      type="date"
                      value={dateOfIncident}
                      onChange={(e) => handleDateChange(e, setDateOfIncident)}
                    />
                  </div>

                  {/* Project/Site Manager */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Project/Site Manager:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Name of manager or supervisor"
                      value={projectSiteManager}
                      onChange={(e) => setProjectSiteManager(e.target.value)}
                    />
                  </div>

                 
                  {/* Time of Incident */}
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

                  {/* Injured Person */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Injured Person:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Full name"
                      value={injuredPerson}
                      onChange={(e) => setInjuredPerson(e.target.value)}
                    />
                  </div>
                  
                   {/* Type of Injury */}
                   <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Type of Injury:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. Sprain, cut, bruise..."
                      value={typeOfInjury}
                      onChange={(e) => setTypeOfInjury(e.target.value)}
                    />
                  </div>

                  {/* Gender */}
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

                 

                  {/* Body Part Injured */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Body Part Injured:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. Left arm, right ankle"
                      value={bodyPartInjured}
                      onChange={(e) => setBodyPartInjured(e.target.value)}
                    />
                  </div>

                  {/* Location of Accident */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Location of Accident:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. By the tool shed"
                      value={locationOfAccident}
                      onChange={(e) => setLocationOfAccident(e.target.value)}
                    />
                  </div>

                  {/* Witnesses */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Witness(es):</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Separate names with commas"
                      value={witnesses}
                      onChange={(e) => setWitnesses(e.target.value)}
                    />
                  </div>

                  {/* Task Undertaken */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Task undertaken by injured party:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="e.g. Clearing debris..."
                      value={taskUndertaken}
                      onChange={(e) => setTaskUndertaken(e.target.value)}
                    />
                  </div>

                  {/* Safety Instructions */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      What safety instructions/training were given?
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Describe any safety briefing..."
                      value={safetyInstructions}
                      onChange={(e) => setSafetyInstructions(e.target.value)}
                    />
                  </div>

                  {/* PPE Worn */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">PPE Worn:</label>
                    <textarea
                      className="form-control"
                      rows={1}
                      placeholder="e.g. Gloves, safety glasses..."
                      value={ppeWorn}
                      onChange={(e) => setPpeWorn(e.target.value)}
                    />
                  </div>

                  {/* Incident Description */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Describe the Incident/Accident:
                    </label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Detailed description..."
                      value={incidentDescription}
                      onChange={(e) => setIncidentDescription(e.target.value)}
                    />
                  </div>

                  {/* Action Taken */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Actions taken to prevent recurrence:
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Describe corrective actions..."
                      value={actionTaken}
                      onChange={(e) => setActionTaken(e.target.value)}
                    />
                  </div>

                  {/* Date Action Implemented */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Date actions implemented:
                    </label>
                    <input
                      className="form-control"
                      type="date"
                      value={dateActionImplemented}
                      onChange={(e) =>
                        handleDateChange(e, setDateActionImplemented)
                      }
                    />
                  </div>

                  {/* Pre-existing Injury */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Injury related to pre-existing condition?
                    </label>
                    <select
                      className="form-select"
                      value={preExistingInjury}
                      onChange={(e) =>
                        setPreExistingInjury(e.target.value as 'No' | 'Yes')
                      }
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Condition Disclosed? */}
                  {preExistingInjury === 'Yes' && (
                    <div className="col-md-6 mb-3">
                      <label className="form-label fw-bold">
                        Was this condition disclosed to the group?
                      </label>
                      <select
                        className="form-select"
                        value={conditionDisclosed}
                        onChange={(e) =>
                          setConditionDisclosed(e.target.value as 'No' | 'Yes')
                        }
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>
                  )}

                  {/* Register of Injuries */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Entry made in the Register of Injuries?
                    </label>
                    <select
                      className="form-select"
                      value={registerOfInjuries}
                      onChange={(e) =>
                        setRegisterOfInjuries(e.target.value as 'No' | 'Yes')
                      }
                    >
                      <option value="No">No</option>
                      <option value="Yes">Yes</option>
                    </select>
                  </div>

                  {/* Further Action Recommended */}
                  <div className="col-md-12 mb-3">
                    <label className="form-label fw-bold">
                      Further action recommended by Project/Site Manager:
                    </label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Recommendations..."
                      value={furtherActionRecommended}
                      onChange={(e) =>
                        setFurtherActionRecommended(e.target.value)
                      }
                    />
                  </div>

                  {/* Signatures / Dates */}
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Injured Person Signature:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Full name or e-sign"
                      value={injuredPersonSignature}
                      onChange={(e) =>
                        setInjuredPersonSignature(e.target.value)
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Date:</label>
                    <input
                      className="form-control"
                      type="date"
                      value={injuredPersonSignatureDate}
                      onChange={(e) =>
                        handleDateChange(e, setInjuredPersonSignatureDate)
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Project/Site Manager Signature:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Manager's name or e-sign"
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
                      onChange={(e) =>
                        handleDateChange(e, setManagerSignatureDate)
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Reported to Committee Meeting on:
                    </label>
                    <input
                      className="form-control"
                      type="date"
                      value={committeeMeetingDate}
                      onChange={(e) =>
                        handleDateChange(e, setCommitteeMeetingDate)
                      }
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">Comments:</label>
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Any relevant committee notes"
                      value={committeeMeetingComments}
                      onChange={(e) =>
                        setCommitteeMeetingComments(e.target.value)
                      }
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label fw-bold">
                      Chairperson Signature:
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Chairperson's name or e-sign"
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
                        handleDateChange(e, setChairpersonSignatureDate)
                      }
                    />
                  </div>
                </div>
              </div>
            )}

            <button type="submit" className="btn btn-success mt-3">
              Submit
            </button>
          </form>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="mt-3">
          <h3>Previously Completed Reports</h3>
          {reports.length === 0 ? (
            <p>No completed reports found.</p>
          ) : (
            <div className="row">
              {reports.map((report) => (
                <div className="col-md-4 mb-3" key={report.id}>
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">Report #{report.id}</h5>
                      <p className="card-text">
                        <strong>Notes:</strong> {report.notes}
                      </p>
                      <p className="card-text">
                        <small className="text-muted">
                          Created at: {report.createdAt}
                        </small>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ActivityComplete
