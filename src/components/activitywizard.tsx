// src/components/ActivityWizard.tsx
import React, { useState } from 'react'
import { Button } from 'react-bootstrap'
// import ProjectRisk from './projectrisk'
// import ProjectStaffs from './projectstaffs'
// import ProjectHazards from './projecthazards'
// import Projectvolunteerss from './projectvolunteers'
// import ProjectChecklist from './projectchecklist'
// import ProjectOutcome from './projectoutcome'
// import ProjectComplete from './projectcomplete'

const steps = [
  'Details',
  'Risk',
  'Staff',
  'Volunteer',
  'Check List',
  'Outcome',
  'Complete',
]

const ActivityWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0)
  

  const handleStepClick = (index: number) => {
    // for forbiding jumping ahead, can add logic
    setCurrentStep(index)
  }
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Display circles
  const renderStepNav = () => {
    return (
      <div className="d-flex justify-content-between align-items-center mb-4">
        {steps.map((label, index) => {
          const isActive = index === currentStep
          const isCompleted = index < currentStep
          return (
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
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <div>Pick a project in ProjectDetails </div>
      case 1:
        return <div>Risk Step</div>
      case 2:
        return <div>Staff Step</div>
      case 3:
        return <div>Volunteer Step</div>
      case 4:
        return <div>Check List Step</div>
      case 5:
        return <div>Outcome Step</div>
      case 6:
        return <div>Complete Step</div>
      default:
        return <div>Unknown step</div>
    }
  }

  return (
    <div className="container mt-4">
      <h2
        style={{
          color: '#0094B6',
          fontWeight: 'bold',
          paddingTop: '1rem',
          paddingBottom: '3rem',
        }}
      >
        Activity Notes Wizard
      </h2>
      {renderStepNav()}
      <div className="p-3 border rounded bg-white">{renderStepContent()}</div>
      {currentStep < steps.length - 1 && (
        <div className="text-end mt-3">
          <Button variant="primary" onClick={handleNext}>
            Next &raquo;
          </Button>
        </div>
      )}
    </div>
  )
}

export default ActivityWizard
