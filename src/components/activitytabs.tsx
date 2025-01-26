import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
// import ProjectDetails from './projectdetails'
import AddActivity from './addactivity'
import ProjectRisk from './activityrisk'
import ProjectStaffs from './activitystaffs'
import ProjectVolunteers from './activityvolunteers'
import ProjectCheckList from './activitychecklist'
import ProjectOutcome from './activityoutcome'
// import { GiFlexibleL } from 'react-icons/gi'
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
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  )
  const [selectedProjectName, setSelectedProjectName] = useState('')

  useEffect(() => {
    if (location.state) {
      const st: any = location.state
      if (st.projectId) setSelectedProjectId(st.projectId)
      if (st.projectName) setSelectedProjectName(st.projectName)
      if (typeof st.startStep === 'number') setCurrentStep(st.startStep)
    }
  }, [location])

  const handleProjectSelected = (projId: number, projName: string) => {
    setSelectedProjectId(projId)
    setSelectedProjectName(projName)
    setCurrentStep(1)
  }

  const handleStepClick = (index: number) => {
    setCurrentStep(index)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) setCurrentStep(currentStep + 1)
  }

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1)
  }

  const renderStepNav = () => {
    const isSmallDevice = window.innerWidth < 768

    return isSmallDevice ? (
      // Dropdown for small devices
      <div className="mb-4">
        <label htmlFor="step-selector" className="form-label">
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
      </div>
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
      case 0: ///// Projects Details tab
        return (
          <div
            className={`container-fluid ${
              isSidebarOpen ? 'content-expanded' : 'content-collapsed'
            }`}
          >
            <h5>Choose a Project by pressing Arrow Key</h5>
            <AddActivity
              isSidebarOpen={isSidebarOpen}
              onProjectSelected={handleProjectSelected}
            />
          </div>
        )
      case 1: //// Risks and Hazards tab
        if (selectedProjectId === null) {
          return (
            <div>Please select a project before proceeding to "Risk" step.</div>
          )
        }
        return (
          <div
            className={`container-fluid ${
              isSidebarOpen ? 'content-expanded' : 'content-collapsed'
            }`}
          >
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Selected Project: {selectedProjectName || '(none)'}
            </p>
            <ProjectRisk
              isSidebarOpen={isSidebarOpen}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
            />
          </div>
        )
      case 2: //// Staffs Tab
        if (selectedProjectId === null) {
          return (
            <div
              className={`container-fluid ${
                isSidebarOpen ? 'content-expanded' : 'content-collapsed'
              }`}
            >
              Please select a project before proceeding to "Staff" step.
            </div>
          )
        }
        return (
          <div
            className={`container-fluid ${
              isSidebarOpen ? 'content-expanded' : 'content-collapsed'
            }`}
          >
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Selected Project: {selectedProjectName || '(none)'}
            </p>
            <ProjectStaffs
              isSidebarOpen={isSidebarOpen}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
            />
          </div>
        )

      case 3: //// Volunteers Tab
        if (selectedProjectId === null) {
          return (
            <div>
              Please select a project before proceeding to "Volunteer" step.
            </div>
          )
        }
        return (
          <div>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Selected Project: {selectedProjectName || '(none)'}
            </p>
            <ProjectVolunteers
              isSidebarOpen={isSidebarOpen}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
            />
          </div>
        )
      case 4: // Checklist Tab
        if (selectedProjectId === null) {
          return (
            <div>
              <h5 className="text-danger">
                Please select a project in the "Details" step before accessing
                the "Checklist" tab.
              </h5>
            </div>
          )
        }
        return (
          <div>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Selected Project: {selectedProjectName || '(none)'}
            </p>
            <ProjectCheckList
              isSidebarOpen={isSidebarOpen}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
            />
          </div>
        )
      case 5: // Outcome Tab
        if (selectedProjectId === null) {
          return (
            <div>
              <h5 className="text-danger">
                Please select a project in the "Details" step before accessing
                the "Outcome" tab.
              </h5>
            </div>
          )
        }
        return (
          <div>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Selected Project: {selectedProjectName || '(none)'}
            </p>
            <ProjectOutcome
              isSidebarOpen={isSidebarOpen}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
            />
          </div>
        )

      default:
        return <div>Coming Soon...</div>
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
            className="px-4"
            style={{ backgroundColor: '#0094B6', marginRight: '1rem' }}
            variant="secondary"
            onClick={handleBack}
          >
            &laquo; Back
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button
            className="px-4"
            style={{ backgroundColor: '#0094B6' }}
            variant="primary"
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
