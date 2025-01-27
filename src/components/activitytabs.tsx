// src/components/ActivityTabs.tsx
import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import axios from 'axios'

import AddActivity from './addactivity' // Your detail/edit form
import ActivityRisk from './activityrisk' // Next steps
import ActivityStaffs from './activitystaffs'
import ActivityVolunteers from './activityvolunteers'
import ActivityCheckList from './activitychecklist'
import ActivityOutcome from './activityoutcome'
import ActivityComplete from './activitycomplete'

interface ActivityTabsProps {
  isSidebarOpen: boolean
}

const steps = [
  'Details',
  'Risk',
  'Staff',
  'Volunteer',
  'Check List',
  'Outcome',
  'Complete',
]

const ActivityTabs: React.FC<ActivityTabsProps> = ({ isSidebarOpen }) => {
  const location = useLocation() as {
    state?: {
      fromSearch?: boolean
      activityId?: number
      activityName?: string
      projectId?: number
      projectName?: string
      startStep?: number
    }
  }

  // States for the wizard
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(
    null
  )
  const [selectedActivityName, setSelectedActivityName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  )
  const [selectedProjectName, setSelectedProjectName] = useState('')

  // On mount, see if we have activity data from location.state
  useEffect(() => {
    if (location.state?.startStep !== undefined) {
      setCurrentStep(location.state.startStep)
    }
    if (location.state?.activityId) {
      // fetch from /api/activities/:id to get fresh data
      loadActivityDetails(location.state.activityId)
    }
  }, [location.state])

  async function loadActivityDetails(id: number) {
    try {
      const res = await axios.get(`/api/activities/${id}`)
      const data = res.data
      setSelectedActivityId(data.id)
      setSelectedActivityName(data.activity_name || '')
      setSelectedProjectId(data.project_id || null)
      setSelectedProjectName(data.projectName || '')
    } catch (err) {
      console.error('Error fetching activity detail:', err)
    }
  }

  // If user modifies the activity or picks a different project in AddActivity,
  // we can pass a callback to update here:
  const handleActivityUpdate = (
    activityId: number,
    activityName: string,
    projectId: number,
    projectName: string
  ) => {
    setSelectedActivityId(activityId)
    setSelectedActivityName(activityName)
    setSelectedProjectId(projectId)
    setSelectedProjectName(projectName)
  }

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }
// Tabs in small devices show with a Drop-Down List
  const renderStepNav = () => {
    const isSmallDevice = window.innerWidth < 768

    return isSmallDevice ? (
      // Dropdown for small devices
      // <div className="mb-4">
      <>
        <label htmlFor="step-selector" className="form-label mb-4">
          Navigate Steps
        </label>
        <select
          id="step-selector"
          className="form-select"
          value={currentStep}
          onChange={(e) => setCurrentStep(Number(e.target.value))}
        >
          {steps.map((label, index) => (
            <option key={index} value={index}>
              {`${index + 1}. ${label}`}
            </option>
          ))}
        </select>
        </>
      // </div>
    ) : (
      // Horizontal tab navigation for larger devices
      <div className="d-flex flex-wrap align-items-center justify-content-center gap-3 mb-4">
        {steps.map((label, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          return (
            <div
              key={index}
              className="d-flex align-items-center"
              onClick={() => handleStepClick(index)}
              style={{ cursor: 'pointer' }}
            >
              <div
                className={`d-flex align-items-center justify-content-center rounded-circle ${
                  isCompleted
                    ? 'bg-success text-white'
                    : isActive
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-white'
                }`}
                style={{
                  width: '2.15rem',
                  height: '2.15rem',
                  fontSize: '1.2rem',
                }}
              >
                {index + 1}
              </div>
              <span
                className={`ms-2 ${isActive ? 'fw-bold' : ''}`}
                style={{
                  fontSize: '1rem',
                  color: isActive ? '#0094B6' : '#555',
                }}
              >
                {label}
              </span>
              {index < steps.length - 1 && (
                <div
                  className="flex-grow-1 mx-2"
                  style={{
                    height: '2px',
                    backgroundColor: isCompleted ? '#28a745' : '#ccc',
                  }}
                ></div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: //Detail Tab
        return (
          <AddActivity
            // we pass the current activity/project data:
            activityId={selectedActivityId}
            initialActivityName={selectedActivityName}
            initialProjectId={selectedProjectId}
            initialProjectName={selectedProjectName}
            onActivityUpdated={handleActivityUpdate}
            // If no activityId => new activity
          />
        )

      case 1:
        // Risk Tab: we need an existing activity + project
        if (!selectedActivityId || !selectedProjectId) {
          return (
            <h5>
              Please fill "Details" tab first (create or select activity).
            </h5>
          )
        }
        return (
          <>
            <h5 className='my-3 fw-bold'>
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityRisk
              activityId={selectedActivityId}
              projectId={selectedProjectId}
            />
         </>
        )

      case 2:
        // Staff Tab
        if (!selectedActivityId || !selectedProjectId) {
          return <h5>Please complete the "Details" tab first.</h5>
        }
        return (
          <>
            <h5 className='my-3 fw-bold'>
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityStaffs
              activityId={selectedActivityId}
              projectId={selectedProjectId}
            />
         </>
        )

      case 3:
        // Volunteers Tab
        if (!selectedActivityId || !selectedProjectId) {
          return <div>Please complete the "Details" tab first.</div>
        }
        return (
          <>
            <h5 className='my-3 fw-bold'>
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityVolunteers
              activityId={selectedActivityId}
              projectId={selectedProjectId}
            />
          </>
        )

      case 4:
        // CheckList tab
        if (!selectedActivityId || !selectedProjectId) {
          return <p>Please complete the "Details" tab first.</p>
        }
        return (
          <>
            <h5 className='my-3 fw-bold'>
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityCheckList
              activityId={selectedActivityId}
              projectId={selectedProjectId}
            />
          
          </>
        )

      case 5:
        // Outcome Tab
        if (!selectedActivityId || !selectedProjectId) {
          return <div>Please complete the "Details" tab first.</div>
        }
        return (
          <>
            <h5 className='my-3 fw-bold'>
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
            <ActivityOutcome
              activityId={selectedActivityId}
              projectId={selectedProjectId}
            />
          </>
        )

      case 6:
      
        if (!selectedActivityId || !selectedProjectId) {
          return <div>Please complete the "Details" tab first.</div>
        }
        return (
          <>
            <h5 className='my-3 fw-bold'>
              Activity: {selectedActivityName || '(no name)'} — Project:{' '}
              {selectedProjectName || '(none)'}
            </h5>
          <ActivityComplete
            activityId={selectedActivityId}
            projectId={selectedProjectId}
          />
          </>
        )
        default:return <h5>Coming Soon...</h5>
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '30px',
        transition: 'margin 0.3s ease',
        paddingTop: '2rem',
        height: '100vh',
        width: '95%',
      }}
    >
      {renderStepNav()}
      <div className="p-3 border rounded bg-white mx-2">
        {renderStepContent()}
      </div>

      <div className="d-flex justify-content-end mt-3">
        {currentStep > 0 && (
          <Button
            className="px-4 me-3"
            style={{ backgroundColor: '#0094B6', border: 'none' }}
            onClick={handleBack}
          >
            &laquo; Back
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button
            className="px-4"
            style={{ backgroundColor: '#0094B6', border: 'none' }}
            onClick={handleNext}
          >
            Next &raquo;
          </Button>
        )}
      </div>
    </div>
  )
}

export default ActivityTabs
