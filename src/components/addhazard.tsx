import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert, Dropdown } from 'react-bootstrap'

interface Hazard {
  id: number
  siteHazard: string
  activityPeopleHazard: string
}
interface HazardsProps {
  isSidebarOpen: boolean
}

const AddHazards: React.FC<HazardsProps> = ({ isSidebarOpen }) => {
  const [hazards, setHazards] = useState<Hazard[]>([])
  const [siteHazard, setSiteHazard] = useState('')
  const [activityPeopleHazard, setActivityPeopleHazard] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  useEffect(() => {
    fetchHazards()
  }, [])

  const fetchHazards = async () => {
    try {
      const res = await axios.get('/api/hazards')
      setHazards(res.data)
    } catch (err) {
      console.error('Error fetching hazards:', err)
      setNotification('Failed to load hazards.')
    }
  }

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 6000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleHazardSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!siteHazard.trim() || !activityPeopleHazard.trim()) {
      setNotification('Please fill in both hazard fields.')
      return
    }

    try {
      await axios.post('/api/hazards', {
        siteHazard: siteHazard.trim(),
        activityPeopleHazard: activityPeopleHazard.trim(),
      })
      setNotification('Hazard added successfully!')
      setSiteHazard('')
      setActivityPeopleHazard('')
      fetchHazards()
    } catch (err) {
      console.error('Error adding hazard:', err)
      setNotification('Failed to add hazard.')
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
        Add Hazards
      </h2>

      {notification && (
        <Alert variant="info" className="text-center">
          {notification}
        </Alert>
      )}
      <div className="row">
        {/* Hazards Section */}
        <div className="col-md-6">
        <div className="d-flex row form-container justify-content-center shadow rounded g-1 p-4 ">
          <h4>Site Hazards</h4>
          <Form onSubmit={handleHazardSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Site Hazard</Form.Label>
              <Form.Control
                type="text"
                placeholder="E.g., Bad Weather"
                value={siteHazard}
                onChange={(e) => setSiteHazard(e.target.value)}
              />
            </Form.Group>
            <Button type="submit">Add Site Hazard</Button>
          </Form>
          <Table bordered hover className="mt-3 w-100">
            <thead>
              <tr>
                <th>#</th>
                <th>Site Hazard</th>
              </tr>
            </thead>
          </Table>
          </div>
        </div>
        <div className="col-md-6">
              <div className="d-flex row form-container justify-content-center shadow rounded g-1 p-4 ">
          <h4>Activity/People Hazard</h4>
          <Form onSubmit={handleHazardSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Activity/People Hazard</Form.Label>
              <Form.Control
                type="text"
                placeholder="E.g., Slippery Surface"
                value={activityPeopleHazard}
                onChange={(e) => setActivityPeopleHazard(e.target.value)}
              />
            </Form.Group>
            <Button type="submit">Add Activity/People Hazard</Button>
          </Form>
          <div className="d-flex row form-container justify-content-center p-4 ">
          <Table bordered hover className="mt-3 w-100">
            <thead>
              <tr>
                <th>#</th>
                <th>Activity/People Hazard</th>
              </tr>
            </thead>
            <tbody>
              {hazards.map((hazard, index) => (
                <tr key={hazard.id}>
                  <td>{index + 1}</td>
                  <td>{hazard.siteHazard}</td>
                  <td>{hazard.activityPeopleHazard}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        </div>
          
        </div>
        
      </div>
    </div>
  )
}

export default AddHazards
