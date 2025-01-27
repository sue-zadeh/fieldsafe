// src/components/ActivityTabs.tsx
import React, { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useLocation } from 'react-router-dom'
import AddActivity from './addactivity'
import ActivityRisk from './activityrisk'
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
  const location = useLocation()
  const [currentStep, setCurrentStep] = useState(0)
  const [activityId, setActivityId] = useState<number | null>(null)

  // Extract `activityId` from `location.state` on component mount
  useEffect(() => {
    const state = location.state as { activityId?: string } | null;
    if (state?.activityId) {
      setActivityId(Number(state.activityId)); // Convert to number
    }
    // Add any other fields you might want to store from location.state
  }, [location]);
  
  const handleStepClick = (index: number) => setCurrentStep(index)
  const handleNext = () =>
    currentStep < steps.length - 1 && setCurrentStep(currentStep + 1)
  const handleBack = () => currentStep > 0 && setCurrentStep(currentStep - 1)

  const renderStepNav = () => {
    const isSmallDevice = window.innerWidth < 768

    if (isSmallDevice) {
      return (
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
            {steps.map((label, i) => (
              <option key={i} value={i}>
                {`${i + 1}. ${label}`}
              </option>
            ))}
          </select>
        </div>
      )
    } else {
      return (
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
                    width: '2rem',
                    height: '2rem',
                    fontSize: '1.1rem',
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
  }

  const renderStepContent = () => {
    if (!activityId && currentStep > 0) {
      return (
        <p className="text-danger">
          Please create or select an activity first.
        </p>
      )
    }

    switch (currentStep) {
      case 0:
        return <AddActivity  activityId={activityId!} />
      case 1:
        return <ActivityRisk activityId={activityId!} />
      case 2:
        return <ActivityStaffs activityId={activityId!} />
      case 3:
        return <ActivityVolunteers activityId={activityId!} />
      case 4:
        return <ActivityCheckList activityId={activityId!} />
      case 5:
        return <ActivityOutcome activityId={activityId!} />
        case 6:
        return <ActivityComplete activityId={activityId!} />
      default:
        return <p>Coming Soon...</p>
    }
  }

  return (
    <div
      style={{
        marginLeft: isSidebarOpen ? '220px' : '30px',
        transition: 'margin 0.3s ease',
        paddingTop: '2rem',
        minHeight: '100vh',
        width: '95%',
      }}
      className="container-fluid"
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
