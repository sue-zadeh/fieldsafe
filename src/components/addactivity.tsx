// src/components/AddActivity.tsx
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Form, Button, Row, Col, Card, Modal } from 'react-bootstrap'

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
  createdBy?: string
  status: string
  projectLocation?: string
  projectName?: string
}

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

  // Are we editing an existing activity?
  const activityId = location.state?.activityId

  // If user didn’t come from search => show modal
  useEffect(() => {
    if (!location.state?.fromSearch) {
      setShowModal(true)
    }
  }, [location])

  // Fetch all projects for the dropdown
  useEffect(() => {
    axios
      .get<ProjectOption[]>('/api/projects')
      .then((res) => {
        setProjects(res.data)
      })
      .catch((err) => {
        console.error('Error fetching projects', err)
      })
  }, [])

  // If we have an activityId => fetch & show read‐only
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

  /** If project changes, auto‐fill that project’s location */
  const handleProjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const projId = Number(e.target.value)
    const proj = projects.find((p) => p.id === projId)
    setActivity((prev) => ({
      ...prev,
      project_id: projId,
      projectLocation: proj ? proj.location : '',
    }))
  }

  /** Save new or update existing */
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

      // CREATE NEW
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
        navigate('/searchactivity') // ensure route matches your actual route
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

  // Force date to be no earlier than 2024-01-01
  const minDate = '2024-01-01'

  return (
    <div style={{ margin: '2rem' }}>
      {/* "In progress" modal if user didn't come from search */}
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
                </Form.Group>
              </Col>
            </Row>

            {/* Show location read-only after project selection */}
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
                    value={activity.createdBy || ''}
                    onChange={handleChange}
                    disabled={readOnly}
                    placeholder="Who is creating this note?"
                  />
                </Form.Group>
              </Col>
            </Row>

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
