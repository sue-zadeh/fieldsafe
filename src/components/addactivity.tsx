// src/components/AddActivity.tsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Form, Button, Row, Col, Card, Modal } from 'react-bootstrap'

// Google Maps
import { GoogleMap, Marker } from '@react-google-maps/api'

interface ProjectOption {
  id: number
  name: string
  location: string
}

interface ActivityData {
  id?: number
  activity_name: string
  project_id: number
  activity_date: string
  notes: string
  createdBy: string
  status: string
  projectLocation?: string
  projectName?: string
}

const containerStyle = {
  width: '100%',
  height: '220px',
}

// Default center: e.g. Auckland
const defaultCenter = { lat: -36.8485, lng: 174.7633 }

// If you have the key in an .env, do something like:
// const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_MAPS_API_KEY || ''

const AddActivity: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation() as {
    state?: { activityId?: number; fromSearch?: boolean }
  }
  const [projects, setProjects] = useState<ProjectOption[]>([])
  const [activity, setActivity] = useState<ActivityData>({
    activity_name: '',
    project_id: 0,
    activity_date: '',
    notes: '',
    createdBy: '',
    status: 'InProgress',
  })

  // For read-only vs. edit modes
  const [readOnly, setReadOnly] = useState(false)
  // For the “already in progress” modal
  const [showModal, setShowModal] = useState(false)

  // Are we editing?
  const activityId = location.state?.activityId
  // If we came from search => no “in-progress” modal
  const fromSearch = location.state?.fromSearch

  // For the map
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [markerPos, setMarkerPos] = useState(defaultCenter)

  // 1) Show in-progress modal only if:
  // - we do NOT have an activityId
  // - we did NOT come from search
  useEffect(() => {
    if (!activityId && !fromSearch) {
      setShowModal(true)
    }
  }, [activityId, fromSearch])

  // 2) Fetch all projects => for dropdown
  useEffect(() => {
    axios
      .get<ProjectOption[]>('/api/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Error fetching projects', err))
  }, [])

  // 3) If we have an activityId => fetch that activity, read-only
  useEffect(() => {
    if (activityId) {
      axios
        .get(`/api/activities/${activityId}`)
        .then((res) => {
          const data = res.data
          setActivity({
            id: data.id,
            activity_name: data.activity_name,
            project_id: data.project_id,
            activity_date: data.activity_date,
            notes: data.notes || '',
            createdBy: data.createdBy || '',
            status: data.status || 'InProgress',
            projectLocation: data.projectLocation,
            projectName: data.projectName,
          })
          setReadOnly(true)
        })
        .catch((err) => {
          console.error('Error fetching activity', err)
          alert('Failed to load the requested activity.')
        })
    }
  }, [activityId])

  // 4) Whenever projectLocation changes, geocode it => update mapCenter & marker
  useEffect(() => {
    if (activity.projectLocation) {
      geocodeAddress(activity.projectLocation)
    }
  }, [activity.projectLocation])

  // Quick function to geocode a string:
  async function geocodeAddress(address: string) {
    try {
      // If you keep an environment variable:
      // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      //   address
      // )}&key=${GOOGLE_MAPS_API_KEY}`
      // For demo, removing the key param so it might require a dev key:
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address
      )}`
      const resp = await fetch(url)
      const json = await resp.json()
      if (json.status === 'OK' && json.results[0]?.geometry?.location) {
        const { lat, lng } = json.results[0].geometry.location
        setMapCenter({ lat, lng })
        setMarkerPos({ lat, lng })
      } else {
        console.warn('Geocode failed or no results for:', address)
        setMapCenter(defaultCenter)
        setMarkerPos(defaultCenter)
      }
    } catch (err) {
      console.error('Geocoding error:', err)
      setMapCenter(defaultCenter)
      setMarkerPos(defaultCenter)
    }
  }

  /** Handle changes in form fields */
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target
    setActivity((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /** If project changes => auto-fill location from that project. */
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projId = Number(e.target.value)
    const proj = projects.find((p) => p.id === projId)
    setActivity((prev) => ({
      ...prev,
      project_id: projId,
      projectLocation: proj ? proj.location : '',
    }))
  }

  // 5) Save new or update existing
  const handleSave = async () => {
    try {
      if (
        !activity.activity_date ||
        !activity.activity_name ||
        !activity.project_id
      ) {
        alert('Please fill Activity Name, Project, and Activity Date.')
        return
      }

      // CREATE
      if (!activityId) {
        await axios.post('/api/activities', {
          activity_name: activity.activity_name,
          project_id: activity.project_id,
          activity_date: activity.activity_date,
          notes: activity.notes,
          createdBy: activity.createdBy,
          status: activity.status,
        })
        alert('Activity created successfully!')
        navigate('/searchactivity')
      }
      // UPDATE
      else if (activityId && !readOnly) {
        await axios.put(`/api/activities/${activityId}`, {
          activity_name: activity.activity_name,
          project_id: activity.project_id,
          activity_date: activity.activity_date,
          notes: activity.notes,
          createdBy: activity.createdBy,
          status: activity.status,
        })
        alert('Activity updated successfully!')
        navigate('/searchactivity')
      }
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.status === 409) {
        alert('Activity name already in use. Must be unique.')
      } else {
        alert('Failed to save activity.')
      }
    }
  }

  /** Save as Copy => just POST with a new name. */
  const handleSaveAsCopy = async () => {
    if (!activityId) return
    try {
      const copyName = activity.activity_name + '-copy'
      await axios.post('/api/activities', {
        activity_name: copyName,
        project_id: activity.project_id,
        activity_date: activity.activity_date,
        notes: activity.notes,
        createdBy: activity.createdBy,
        status: activity.status,
      })
      alert('Activity duplicated successfully!')
      navigate('/searchactivity')
    } catch (err: any) {
      console.error(err)
      if (err.response && err.response.status === 409) {
        alert('Copy name also conflicts. Please change it manually.')
      } else {
        alert('Failed to duplicate activity.')
      }
    }
  }

  /** Make form editable again (when user clicks "Edit") */
  const handleEdit = () => {
    setReadOnly(false)
  }

  /** Modal handling */
  const handleCancelModal = () => {
    setShowModal(false)
  }
  const handleConfirmModal = () => {
    // user wants a brand-new form
    setActivity({
      activity_name: '',
      project_id: 0,
      activity_date: '',
      notes: '',
      createdBy: '',
      status: 'InProgress',
      projectLocation: '',
    })
    setReadOnly(false)
    setShowModal(false)
  }

  // Minimum date is 2024-01-01
  const minDate = '2024-01-01'

  return (
    <div style={{ margin: '2rem' }}>
      {/* "In progress" modal if user didn't come from search and no activityId */}
      <Modal show={showModal} onHide={handleCancelModal}>
        <Modal.Header closeButton>
          <Modal.Title>Field Note In Progress</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          You already have a Field Note in progress. Would you like to start a
          new one?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => navigate('/searchactivity')}
          >
            Go To List
          </Button>
          <Button variant="primary" onClick={handleConfirmModal}>
            New Field Note
          </Button>
        </Modal.Footer>
      </Modal>

      <Card>
        <Card.Header>
          <h4 style={{ margin: 0 }}>
            {activityId ? 'Activity Detail' : 'Add Activity'}
          </h4>
        </Card.Header>
        <Card.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="activityName">
                  <Form.Label>Activity Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="activity_name"
                    value={activity.activity_name}
                    onChange={handleChange}
                    placeholder="Unique Activity Name"
                    readOnly={readOnly}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="status">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={activity.status}
                    onChange={handleChange}
                    disabled={readOnly}
                  >
                    <option value="InProgress">InProgress</option>
                    <option value="onhold">onhold</option>
                    <option value="Completed">Completed</option>
                    <option value="archived">archived</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="projectSelect">
                  <Form.Label>Project *</Form.Label>
                  <Form.Select
                    name="project_id"
                    value={activity.project_id}
                    onChange={handleProjectChange}
                    disabled={readOnly}
                  >
                    <option value="">-- Select a Project --</option>
                    {projects.map((proj) => (
                      <option key={proj.id} value={proj.id}>
                        {proj.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="activityDate">
                  <Form.Label>Activity Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="activity_date"
                    value={activity.activity_date?.substring(0, 10) || ''}
                    onChange={handleChange}
                    min={minDate}
                    disabled={readOnly}
                  />
                  <Form.Text className="text-muted">
                    Date cannot be earlier than 2024.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {/* Show location read-only & Google Map */}
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group controlId="location">
                  <Form.Label>Location (auto-filled)</Form.Label>
                  <Form.Control
                    type="text"
                    name="projectLocation"
                    value={activity.projectLocation || ''}
                    readOnly
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="createdBy">
                  <Form.Label>Created By (Name)</Form.Label>
                  <Form.Control
                    type="text"
                    name="createdBy"
                    value={activity.createdBy}
                    onChange={handleChange}
                    disabled={readOnly}
                    placeholder="Who is creating this note?"
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Show a small map with marker */}
            <div className="mb-3">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={12}
              >
                <Marker position={markerPos} />
              </GoogleMap>
            </div>

            <Form.Group controlId="notes" className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="notes"
                value={activity.notes}
                onChange={handleChange}
                readOnly={readOnly}
                placeholder="Any notes for this activity..."
              />
            </Form.Group>

            {/* Buttons */}
            {activityId && readOnly && (
              <div className="mt-3">
                <Button variant="warning" onClick={handleEdit}>
                  Edit
                </Button>
              </div>
            )}
            {activityId && !readOnly && (
              <div className="mt-3">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>{' '}
                <Button variant="info" onClick={handleSaveAsCopy}>
                  Save as Copy
                </Button>
              </div>
            )}
            {!activityId && (
              <div className="mt-3">
                <Button variant="success" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
    </div>
  )
}

export default AddActivity
