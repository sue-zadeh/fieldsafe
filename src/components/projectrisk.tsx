// src/components/ProjectRisk.tsx
import React, { useState, useEffect } from 'react'
import { Alert, Form, Button, Table } from 'react-bootstrap'
import axios from 'axios'
// import ActivityWizard from './activitywizard'

interface ProjectRiskProps {
  isSidebarOpen: boolean
  projectId: number | null
  projectName?: string
}

const ProjectRisk: React.FC<ProjectRiskProps> = ({
  isSidebarOpen,
  projectId,
  projectName = '',
}) => {
  const [notification, setNotification] = useState<string | null>(null)
  const [risks, setRisks] = useState<any[]>([])
  const [likelihood, setLikelihood] = useState('')
  const [consequences, setConsequences] = useState('')
  const [riskRating, setRiskRating] = useState('')
  const [riskTitle, setRiskTitle] = useState('')
  const [selectedHazards, setSelectedHazards] = useState<number[]>([])

  // For hazard selection, we might store hazards in state
  const [siteHazards, setSiteHazards] = useState<any[]>([])
  // etc. Then a function to push them into bridging table: project_site_hazards

  useEffect(() => {
    // optional: load existing "risks" for this project from some bridging table
    // or just do nothing if you store them differently
  }, [projectId])

  // Simple rating calculation:
  const calculateRiskRating = () => {
    // example
    const likeValue = likelihoodMap[likelihood.toLowerCase()] || 1
    const consValue = consequenceMap[consequences.toLowerCase()] || 1
    // pick a label
    const total = likeValue * consValue
    if (total <= 2) return 'Low Risk'
    if (total <= 6) return 'Medium Risk'
    if (total <= 10) return 'High Risk'
    return 'Extreme Risk'
  }

  const likelihoodMap: { [key: string]: number } = {
    'highly unlikely': 1,
    unlikely: 2,
    'quite possible': 3,
    likely: 4,
    'almost certain': 5,
  }
  const consequenceMap: { [key: string]: number } = {
    insignificant: 1,
    minor: 2,
    moderate: 3,
    major: 4,
    catastrophic: 5,
  }
  // const projectName =
  //   localStorage.getItem('selectedProjectName') || 'No project'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const rating = calculateRiskRating()
    setRiskRating(rating)
    // If you want to store in the DB bridging table:
    if (!projectId) {
      setNotification('No project chosen.')
      return
    }
    try {
      // Possibly do a POST to /api/project_risks or something
      const res = await axios.post('/api/project_risks', {
        project_id: projectId,
        title: riskTitle,
        likelihood,
        consequences,
        risk_rating: rating,
      })
      setNotification('Risk added to this project.')
      // then load them again
    } catch (err) {
      console.error(err)
      setNotification('Error adding risk to project.')
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '20px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '1rem',
      }}
    >
      {/* <ActivityWizard isSidebarOpen={isSidebarOpen} /> */}
      {notification && <Alert variant="info">{notification}</Alert>}
      {/* <h3
        style={{ color: '#0094B6', fontWeight: 'bold', paddingBottom: '1rem' }}
      >
        Project Risk for: {projectName || 'No Project Selected'}
      </h3> */}

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Risk Title</Form.Label>
          <Form.Control
            type="text"
            value={riskTitle}
            onChange={(e) => setRiskTitle(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Likelihood</Form.Label>
          <Form.Select
            value={likelihood}
            onChange={(e) => setLikelihood(e.target.value)}
          >
            <option value="">Select Likelihood</option>
            <option>Highly Unlikely</option>
            <option>Unlikely</option>
            <option>Quite Possible</option>
            <option>Likely</option>
            <option>Almost Certain</option>
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Consequences</Form.Label>
          <Form.Select
            value={consequences}
            onChange={(e) => setConsequences(e.target.value)}
          >
            <option value="">Select Consequence</option>
            <option>Insignificant</option>
            <option>Minor</option>
            <option>Moderate</option>
            <option>Major</option>
            <option>Catastrophic</option>
          </Form.Select>
        </Form.Group>

        <div className="mb-2">
          <strong>Calculated Risk Rating:</strong> {calculateRiskRating()}
        </div>

        <Button variant="primary" type="submit">
          Save Risk
        </Button>
      </Form>

      {/* Possibly a hazard selector for this project */}
      <hr />
      <h4>Project Hazards</h4>
      <p>
        Select site hazards or activity hazards to link to this project, etc.
      </p>
      {/* similar approach to your AddHazard logic, but store bridging in project_site_hazards */}
    </div>
  )
}

export default ProjectRisk
