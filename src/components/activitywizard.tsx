// src/components/ActivityWizard.tsx
import React, { useState, useEffect } from 'react'
import { Table, Button } from 'react-bootstrap'
import axios from 'axios'

interface Project {
  id: number
  name: string
  location: string
  startDate: string
  status: string
  primaryContactName: string
  // add any other fields you need
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

const ActivityWizard: React.FC = () => {
  // Which step is active? 0-based index
  const [currentStep, setCurrentStep] = useState(0)

  // Data for the “Details” step
  const [projects, setProjects] = useState<Project[]>([])

  // Load project list once on mount, for the “Details” table
  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      // E.g. GET /api/projects => or maybe /api/projects/list
      const res = await axios.get('/api/projects')
      // or: const res = await axios.get('/api/projects/list');
      setProjects(res.data)
    } catch (err) {
      console.error('Error fetching projects:', err)
    }
  }

  // Move to a specific step
  const handleStepClick = (index: number) => {
    if (index > currentStep + 1) {
      // Optionally forbid jumping ahead more than one step
      // return;
    }
    setCurrentStep(index)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  // Render the horizontal steps
  // Each circle is either completed, active, or upcoming
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
                {/* Circle */}
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
                {/* Label */}
                <div
                  style={{
                    fontWeight: isActive ? 'bold' : 'normal',
                    color: isActive || isCompleted ? '#000' : '#555',
                  }}
                >
                  {label}
                </div>
              </div>
              {/* Horizontal line except after last step */}
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

  // Render content for each step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return renderDetailsStep()
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

  // Step 0: “Details” => show a table of projects
  const renderDetailsStep = () => {
    return (
      <div>
        <h4>Project Details</h4>
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Project Name</th>
              <th>Location</th>
              <th>Start Date</th>
              <th>Status</th>
              <th>Primary Contact</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((proj) => (
              <tr key={proj.id}>
                <td>{proj.id}</td>
                <td>{proj.name}</td>
                <td>{proj.location}</td>
                <td>{proj.startDate}</td>
                <td>{proj.status}</td>
                <td>{proj.primaryContactName}</td>
              </tr>
            ))}
          </tbody>
        </Table>

        <p>Select a project above or do whatever logic you need here...</p>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      <h2>Activity Notes Wizard</h2>
      {/* Step Navigation */}
      {renderStepNav()}

      {/* Step Content */}
      <div className="p-3 border rounded bg-white">{renderStepContent()}</div>

      {/* Next Button */}
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
