import React, { useState, FormEvent } from 'react'
import axios from 'axios'

const ActivityComplete: React.FC = () => {
  // --- Simple states (we’re skipping project selection since it's from earlier tabs) ---
  const [notes, setNotes] = useState('')
  const [anyIncident, setAnyIncident] = useState<'No' | 'Yes'>('No')

  // --- Incident form fields ---
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

  // --- Submit Handler ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        // If your backend already knows the projectId from earlier, you might not need this
        // projectId: <some ID from state or props>,
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
        // Optionally reset or navigate away
      } else {
        alert('Error: ' + response.data.message)
      }
    } catch (error) {
      console.error('Error submitting completion: ', error)
      alert('Error occurred, see console for details.')
    }
  }

  // --- Some inline style objects to make the form more visually appealing ---
  const containerStyle: React.CSSProperties = {
    maxWidth: '900px',
    margin: 'auto',
    padding: '1rem',
    fontFamily: 'Arial, sans-serif',
  }

  const cardStyle: React.CSSProperties = {
    background: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    padding: '20px',
    marginTop: '1rem',
  }

  const headingStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: '1rem',
    color: '#2c3e50',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.25rem',
    fontWeight: 'bold',
    marginTop: '1rem',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    marginBottom: '0.5rem',
    borderRadius: '4px',
    border: '1px solid #ccc',
  }

  const textAreaStyle: React.CSSProperties = {
    ...inputStyle,
    resize: 'vertical',
  }

  const radioContainer: React.CSSProperties = {
    display: 'inline-block',
    marginRight: '1rem',
  }

  const submitButtonStyle: React.CSSProperties = {
    marginTop: '1.5rem',
    padding: '0.75rem 2rem',
    backgroundColor: '#27ae60',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
  }

  // If you want better spacing or a grid, you might wrap fields in <div style={{ marginBottom: '0.5rem' }}>.

  return (
    <div style={containerStyle}>
      {/* Outer Card */}
      <div style={cardStyle}>
        <h2 style={headingStyle}>Complete Activity</h2>
        <form onSubmit={handleSubmit}>
          {/* Notes text area (Message) */}
          <label style={labelStyle}>Notes / Message:</label>
          <textarea
            placeholder="Write any final notes or comments here..."
            rows={4}
            style={textAreaStyle}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          {/* Accident/Incident/Near Miss question */}
          <label style={labelStyle}>Any Accidents/Incidents/Near misses?</label>
          <div>
            <label style={radioContainer}>
              <input
                type="radio"
                value="No"
                checked={anyIncident === 'No'}
                onChange={() => setAnyIncident('No')}
              />
              &nbsp;No
            </label>
            <label style={radioContainer}>
              <input
                type="radio"
                value="Yes"
                checked={anyIncident === 'Yes'}
                onChange={() => setAnyIncident('Yes')}
              />
              &nbsp;Yes
            </label>
          </div>

          {/* Conditionally render the Incident Form if "Yes" */}
          {anyIncident === 'Yes' && (
            <div style={cardStyle}>
              <h3 style={headingStyle}>Accident/Incident Report</h3>

              {/* Type of Incident */}
              <label style={labelStyle}>Type of Incident:</label>
              <select
                style={inputStyle}
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

              {typeOfIncident === 'Medical Treatment' && (
                <>
                  <label style={labelStyle}>
                    If Medical Treatment, where was it obtained?
                  </label>
                  <input
                    style={inputStyle}
                    type="text"
                    placeholder="e.g. Local clinic, hospital name..."
                    value={medicalTreatmentObtained}
                    onChange={(e) =>
                      setMedicalTreatmentObtained(e.target.value)
                    }
                  />
                </>
              )}

              <label style={labelStyle}>Project Location:</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. North Auckland Reserve"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
              />

              <label style={labelStyle}>Project/Site Manager:</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Name of manager or supervisor"
                value={projectSiteManager}
                onChange={(e) => setProjectSiteManager(e.target.value)}
              />

              <label style={labelStyle}>Date of Incident:</label>
              <input
                style={inputStyle}
                type="date"
                value={dateOfIncident}
                onChange={(e) => setDateOfIncident(e.target.value)}
              />

              <label style={labelStyle}>Time of Incident:</label>
              <input
                style={inputStyle}
                type="time"
                value={timeOfIncident}
                onChange={(e) => setTimeOfIncident(e.target.value)}
              />

              <label style={labelStyle}>Injured Person:</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Full name"
                value={injuredPerson}
                onChange={(e) => setInjuredPerson(e.target.value)}
              />

              <label style={labelStyle}>Gender:</label>
              <select
                style={inputStyle}
                value={injuredPersonGender}
                onChange={(e) => setInjuredPersonGender(e.target.value)}
              >
                <option value="">--Select--</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Prefer not to say</option>
              </select>

              <label style={labelStyle}>Type of Injury:</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Sprain, cut, bruise..."
                value={typeOfInjury}
                onChange={(e) => setTypeOfInjury(e.target.value)}
              />

              <label style={labelStyle}>Body Part Injured:</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Left arm, right ankle..."
                value={bodyPartInjured}
                onChange={(e) => setBodyPartInjured(e.target.value)}
              />

              <label style={labelStyle}>Location of Accident/Incident:</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. By the tool shed"
                value={locationOfAccident}
                onChange={(e) => setLocationOfAccident(e.target.value)}
              />

              <label style={labelStyle}>Witness(es):</label>
              <input
                style={inputStyle}
                type="text"
                placeholder="Separate names with commas"
                value={witnesses}
                onChange={(e) => setWitnesses(e.target.value)}
              />

              <label style={labelStyle}>
                Task undertaken by injured party:
              </label>
              <input
                style={inputStyle}
                type="text"
                placeholder="e.g. Clearing debris, planting trees..."
                value={taskUndertaken}
                onChange={(e) => setTaskUndertaken(e.target.value)}
              />

              <label style={labelStyle}>
                What safety instructions/training were given prior?
              </label>
              <textarea
                style={textAreaStyle}
                rows={2}
                placeholder="Describe any safety briefing..."
                value={safetyInstructions}
                onChange={(e) => setSafetyInstructions(e.target.value)}
              />

              <label style={labelStyle}>PPE worn:</label>
              <textarea
                style={textAreaStyle}
                rows={1}
                placeholder="e.g. Gloves, safety glasses..."
                value={ppeWorn}
                onChange={(e) => setPpeWorn(e.target.value)}
              />

              <label style={labelStyle}>Describe the Incident/Accident:</label>
              <textarea
                style={textAreaStyle}
                rows={3}
                placeholder="Detailed description..."
                value={incidentDescription}
                onChange={(e) => setIncidentDescription(e.target.value)}
              />

              <label style={labelStyle}>
                What actions have been taken to prevent recurrence?
              </label>
              <textarea
                style={textAreaStyle}
                rows={2}
                placeholder="Describe corrective actions..."
                value={actionTaken}
                onChange={(e) => setActionTaken(e.target.value)}
              />

              <label style={labelStyle}>Date actions implemented:</label>
              <input
                style={inputStyle}
                type="date"
                value={dateActionImplemented}
                onChange={(e) => setDateActionImplemented(e.target.value)}
              />

              <label style={labelStyle}>
                Did the injury relate to a pre-existing condition?
              </label>
              <select
                style={inputStyle}
                value={preExistingInjury}
                onChange={(e) =>
                  setPreExistingInjury(e.target.value as 'No' | 'Yes')
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>

              {preExistingInjury === 'Yes' && (
                <>
                  <label style={labelStyle}>
                    Was this condition disclosed to the group?
                  </label>
                  <select
                    style={inputStyle}
                    value={conditionDisclosed}
                    onChange={(e) =>
                      setConditionDisclosed(e.target.value as 'No' | 'Yes')
                    }
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </>
              )}

              <label style={labelStyle}>
                Was an entry made in the Register of Injuries?
              </label>
              <select
                style={inputStyle}
                value={registerOfInjuries}
                onChange={(e) =>
                  setRegisterOfInjuries(e.target.value as 'No' | 'Yes')
                }
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>

              <label style={labelStyle}>
                Further action recommended by Project/Site Manager:
              </label>
              <textarea
                style={textAreaStyle}
                rows={2}
                placeholder="Recommendations..."
                value={furtherActionRecommended}
                onChange={(e) => setFurtherActionRecommended(e.target.value)}
              />

              {/* Signatures */}
              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Injured Person Signature:</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Full name or digital signature"
                  value={injuredPersonSignature}
                  onChange={(e) => setInjuredPersonSignature(e.target.value)}
                />
                <label style={labelStyle}>Date:</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={injuredPersonSignatureDate}
                  onChange={(e) =>
                    setInjuredPersonSignatureDate(e.target.value)
                  }
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>
                  Project/Site Manager Signature:
                </label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Manager's name or e-sign"
                  value={managerSignature}
                  onChange={(e) => setManagerSignature(e.target.value)}
                />
                <label style={labelStyle}>Date:</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={managerSignatureDate}
                  onChange={(e) => setManagerSignatureDate(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>
                  Reported to Committee Meeting on:
                </label>
                <input
                  style={inputStyle}
                  type="date"
                  value={committeeMeetingDate}
                  onChange={(e) => setCommitteeMeetingDate(e.target.value)}
                />
                <label style={labelStyle}>Comments:</label>
                <textarea
                  style={textAreaStyle}
                  rows={2}
                  placeholder="Any relevant committee notes"
                  value={committeeMeetingComments}
                  onChange={(e) => setCommitteeMeetingComments(e.target.value)}
                />
              </div>

              <div style={{ marginTop: '1rem' }}>
                <label style={labelStyle}>Chairperson Signature:</label>
                <input
                  style={inputStyle}
                  type="text"
                  placeholder="Chairperson's name or e-sign"
                  value={chairpersonSignature}
                  onChange={(e) => setChairpersonSignature(e.target.value)}
                />
                <label style={labelStyle}>Date:</label>
                <input
                  style={inputStyle}
                  type="date"
                  value={chairpersonSignatureDate}
                  onChange={(e) => setChairpersonSignatureDate(e.target.value)}
                />
              </div>
            </div>
          )}

          <button type="submit" style={submitButtonStyle}>
            Submit
          </button>
        </form>
      </div>
    </div>
  )
}

export default ActivityComplete
