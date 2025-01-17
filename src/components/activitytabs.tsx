import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import ProjectDetails from './projectdetails'
import ProjectRisk from './projectrisk'
// import Projectstaffs from './ProjectStaffs'
// import ProjectVolunteers from './ProjectVolunteers'
// import ProjectCheckList from './ProjectCheckList'
// import ProjectOutcome from './ProjectOutcome'
// import ProjectComplete from './ProjectComplete'

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

  // Store selected project from the table (step 0):
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  )
  const [selectedProjectName, setSelectedProjectName] = useState('')

  // If you pass route state from somewhere, read it here:
  useEffect(() => {
    if (location.state) {
      const st: any = location.state
      if (st.projectId) {
        setSelectedProjectId(st.projectId)
      }
      if (st.projectName) {
        setSelectedProjectName(st.projectName)
      }
      if (typeof st.startStep === 'number') {
        setCurrentStep(st.startStep)
      }
    }
  }, [location])

  // This callback is given to <ProjectDetails>.
  // When user clicks the arrow on a project row, we store
  // the chosen project & jump to step 1 (Risk).
  const handleProjectSelected = (projId: number, projName: string) => {
    setSelectedProjectId(projId)
    setSelectedProjectName(projName)
    // Jump to step 1 (Risk)
    setCurrentStep(1)
  }

  // User clicks on a step circle manually
  const handleStepClick = (index: number) => {
    setCurrentStep(index)
  }

  // Next button
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }
  // Back button
  const handleBack = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev - 1)
    }
  }
  // Top nav circles
  const renderStepNav = () => (
    <div className="d-flex justify-content-between align-items-center mb-4">
      {steps.map((label, index) => {
        const isActive = index === currentStep
        const isCompleted = index < currentStep

        return (
          //       <div
          //   className={`container-fluid ${
          //     isSidebarOpen ? 'content-expanded' : 'content-collapsed'
          //   }`}
          //   style={{
          //     marginLeft: isSidebarOpen ? '20px' : '20px',
          //     transition: 'margin 0.3s ease',
          //     paddingTop: '1rem',
          //   }}
          // >
          <React.Fragment key={index}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
              }}
              onClick={() => handleStepClick(index)}
            >
              <div
                style={{
                  width: '2.2rem',
                  height: '2.2rem',
                  borderRadius: '50%',
                  backgroundColor: isCompleted
                    ? '#738c40'
                    : isActive
                    ? '#4e1e8a'
                    : '#6c757d',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '4px',
                }}
              >
                {index + 1}
              </div>
              <div
                style={{
                  fontWeight: isActive ? 'bold' : 'normal',
                  color: isActive || isCompleted ? '#000' : '#555',
                }}
              >
                {label}
              </div>
            </div>
            {index < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: '2px',
                  backgroundColor: '#ccc',
                  margin: '0 1rem',
                  marginTop: '-1.2rem',
                }}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )

  // Content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // “Details” step => show the project table
        return (
          <div>
            <h4>Choose a Project by pressing Arrow Key</h4>
            <ProjectDetails
              isSidebarOpen={isSidebarOpen}
              onProjectSelected={handleProjectSelected}
            />
          </div>
        )
      case 1: // “Risk”
        return (
          <div>
            <h4>Determine Risk and Hazards for the Project</h4>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Selected Project: {selectedProjectName || '(none)'}
              {/* {selectedProjectId} */}
            </p>
            <ProjectRisk
              isSidebarOpen={isSidebarOpen}
              projectId={selectedProjectId}
              projectName={selectedProjectName}
            />
          </div>
        )
      case 2: // “Staff”
        return (
          <div>
            <h4>WHo are working on this Project?</h4>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Project: {selectedProjectName || '(none)'}
            </p>
            {/* <ProjectStaffs projectId={selectedProjectId} /> */}
          </div>
        )
      case 3: // “Volunteer”
        return (
          <div>
            <h4>Determine Volunteers for this Project</h4>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Project: {selectedProjectName || '(none)'}
            </p>
            {/* <ProjectVolunteers projectId={selectedProjectId} /> */}
          </div>
        )
      case 4: // “Check List”
        return (
          <div>
            <h4>Please fill up the Check List</h4>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Project: {selectedProjectName || '(none)'}
            </p>
            {/* <ProjectCheckList projectId={selectedProjectId} /> */}
          </div>
        )
      case 5: // “Outcome”
        return (
          <div>
            <h4>Determine Objectives (Outcome) for the Project</h4>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Project: {selectedProjectName || '(none)'}
            </p>
            {/* <ProjectOutcome projectId={selectedProjectId} /> */}
          </div>
        )
      case 6: // “Complete”
        return (
          <div>
            <h4>Complete Step</h4>
            <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
              Project: {selectedProjectName || '(none)'}
            </p>
            {/* <ProjectComplete projectId={selectedProjectId} /> */}
          </div>
        )
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '2rem',
      }}
    >
      <h2>Activity Wizard</h2>

      {/* Step Nav Circles */}
      {renderStepNav()}

      {/* Main Step Content */}
      <div className="p-3 border rounded bg-white">{renderStepContent()}</div>

      {/* Next Button */}
      <div className="d-flex justify-content-end ">
        {currentStep < steps.length - 1 && (
          <div className="text-end m-3">
            <Button
              variant="primary"
              style={{ backgroundColor: '#0094B6' }}
              onClick={handleNext}
            >
              Next &raquo;
            </Button>
          </div>
        )}
        {/* Next Button */}
        {currentStep < steps.length - 1 && (
          <div className="text-end m-3">
            <Button
              variant="primary"
              style={{ backgroundColor: '#0094B6' }}
              onClick={handleBack}
            >
              Back &raquo;
            </Button>
          </div>
        )}
      </div>
    </div>
    // </div>
  )
}

export default ActivityTabs
