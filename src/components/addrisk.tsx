import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert, Dropdown } from 'react-bootstrap'

interface Hazard {
  id: number
  siteHazard: string
  activityPeopleHazard: string
}

interface Risk {
  id: number
  title: string
  likelihood: string
  consequences: string
  riskRating: string
  additionalControls: string
}

interface RisksProps {
  isSidebarOpen: boolean
}

const AddHazardsAndRisks: React.FC<RisksProps> = ({
  isSidebarOpen,
}) => {
  // const [hazards, setHazards] = useState<Hazard[]>([])
  // const [siteHazard, setSiteHazard] = useState('')
  // const [activityPeopleHazard, setActivityPeopleHazard] = useState('')
  const [risks, setRisks] = useState<Risk[]>([])
  const [riskTitle, setRiskTitle] = useState('')
  const [likelihood, setLikelihood] = useState('')
  const [consequences, setConsequences] = useState('')
  const [additionalControls, setAdditionalControls] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    // fetchHazards()
    fetchRisks()
  }, [])

  // const fetchHazards = async () => {
  //   try {
  //     const res = await axios.get('/api/hazards')
  //     setHazards(res.data)
  //   } catch (err) {
  //     console.error('Error fetching hazards:', err)
  //     setNotification('Failed to load hazards.')
  //   }
  // }

  const fetchRisks = async () => {
    try {
      const res = await axios.get('/api/risks')
      setRisks(res.data)
    } catch (err) {
      console.error('Error fetching risks:', err)
      setNotification('Failed to load risks.')
    }
  }

  // // Auto-clear notification
  // useEffect(() => {
  //   if (notification) {
  //     const timer = setTimeout(() => setNotification(null), 4000)
  //     return () => clearTimeout(timer)
  //   }
  // }, [notification])

  // const handleHazardSubmit = async (e: FormEvent) => {
  //   e.preventDefault()
  //   if (!siteHazard.trim() || !activityPeopleHazard.trim()) {
  //     setNotification('Please fill in both hazard fields.')
  //     return
  //   }

  //   try {
  //     await axios.post('/api/hazards', {
  //       siteHazard: siteHazard.trim(),
  //       activityPeopleHazard: activityPeopleHazard.trim(),
  //     })
  //     setNotification('Hazard added successfully!')
  //     setSiteHazard('')
  //     setActivityPeopleHazard('')
  //     fetchHazards()
  //   } catch (err) {
  //     console.error('Error adding hazard:', err)
  //     setNotification('Failed to add hazard.')
  //   }
  // }

  const handleRiskSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!riskTitle.trim() || !likelihood || !consequences) {
      setNotification('Please fill in all risk fields.')
      return
    }

    // Calculate risk rating
    const riskMatrix: { [key: string]: number } = {
      insignificant: 1,
      minor: 2,
      moderate: 3,
      major: 4,
      catastrophic: 5,
    }

    const likelihoodWeight: { [key: string]: number } = {
      'highly unlikely': 1,
      unlikely: 2,
      'quite possible': 3,
      likely: 4,
      'almost certain': 5,
    }

    const riskRating =
      likelihoodWeight[likelihood.toLowerCase()] *
      riskMatrix[consequences.toLowerCase()]

    try {
      await axios.post('/api/risks', {
        title: riskTitle.trim(),
        likelihood,
        consequences,
        riskRating,
        additionalControls: additionalControls.trim(),
      })
      setNotification('Risk added successfully!')
      setRiskTitle('')
      setLikelihood('')
      setConsequences('')
      setAdditionalControls('')
      fetchRisks()
    } catch (err) {
      console.error('Error adding risk:', err)
      setNotification('Failed to add risk.')
    }
  }

  return (
    <div
      className="container-fluid"
      style={{
        transition: 'margin 0.3s ease',
        paddingTop: '0px',
      }}
    >
      <h2
        style={{ color: '#0094B6', fontWeight: 'bold', paddingBottom: '4rem' }}
      >
        Add Hazards & Risks
      </h2>

      {notification && (
        <Alert variant="info" className="text-center">
          {notification}
        </Alert>
      )}

      
        {/* Risks Section */}
        <div className="col-md-6">
          <h4>Risks</h4>
          <Form onSubmit={handleRiskSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Risk Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="E.g., Working near water"
                value={riskTitle}
                onChange={(e) => setRiskTitle(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Likelihood</Form.Label>
              <Form.Control
                as="select"
                value={likelihood}
                onChange={(e) => setLikelihood(e.target.value)}
              >
                <option value="">Select Likelihood</option>
                <option>Highly Unlikely</option>
                <option>Unlikely</option>
                <option>Quite Possible</option>
                <option>Likely</option>
                <option>Almost Certain</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Consequences</Form.Label>
              <Form.Control
                as="select"
                value={consequences}
                onChange={(e) => setConsequences(e.target.value)}
              >
                <option value="">Select Consequences</option>
                <option>Insignificant</option>
                <option>Minor</option>
                <option>Moderate</option>
                <option>Major</option>
                <option>Catastrophic</option>
              </Form.Control>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Additional Controls</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="E.g., Wear gloves, carry sanitizer"
                value={additionalControls}
                onChange={(e) => setAdditionalControls(e.target.value)}
              />
            </Form.Group>
            <Button type="submit">Add Risk</Button>
          </Form>

          <Table bordered hover className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
              </tr>
            </thead>
            <tbody>
              {risks.map((risk, index) => (
                <tr key={risk.id}>
                  <td>{index + 1}</td>
                  <td>{risk.title}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </div>
    
  )
}

export default AddHazardsAndRisks
