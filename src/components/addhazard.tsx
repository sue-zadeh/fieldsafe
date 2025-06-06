import React, {useState, useEffect, FormEvent} from 'react'
import axios from 'axios'
import {Table, Form, Button, Alert, Col, Row, Modal} from 'react-bootstrap'

interface Hazard {
  id: number
  hazard_description: string
}

interface AddHazardsProps {
  isSidebarOpen: boolean
  OCEAN_BLUE: string
  projectId: number
}

const AddHazard: React.FC<AddHazardsProps> = ({
                                                isSidebarOpen,
                                                OCEAN_BLUE,
                                                projectId
                                              }) => {
  const [siteHazards, setSiteHazards] = useState<Hazard[]>([])
  const [activityHazards, setActivityHazards] = useState<Hazard[]>([])
  const [siteHazardDesc, setSiteHazardDesc] = useState('')
  const [activityHazardDesc, setActivityHazardDesc] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // For editing
  const [editSiteHazard, setEditSiteHazard] = useState<Hazard | null>(null)
  const [editActivityHazard, setEditActivityHazard] = useState<Hazard | null>(
    null
  )

  const [selectedSiteHazards, setSelectedSiteHazards] = useState<number[]>([])
  const [selectedActivityHazards, setSelectedActivityHazards] = useState<number[]>([])

  const toggleSiteHazard = (hazId: number) => {
    setSelectedSiteHazards((prev) =>
      prev.includes(hazId) ? prev.filter((x) => x !== hazId) : [...prev, hazId]
    )
  }

  // DRY?
  const toggleActivityHazard = (hazId: number) => {
    setSelectedActivityHazards((prev) =>
      prev.includes(hazId) ? prev.filter((x) => x !== hazId) : [...prev, hazId]
    )
  }

  async function handleSubmitProjectHazards() {
    try {
      // yuck
      await axios.post(`/api/projects/${projectId}/site_hazards`, selectedSiteHazards)
      await axios.post(`/api/projects/${projectId}/activity_people_hazards`, selectedActivityHazards)
      setNotification('Hazards set successfully!')
    } catch (err: any) {
      console.error('Error setting project hazards:', err.response?.data || err)
      setNotification(
        err.response?.data?.message || 'Failed to set project hazards.'
      )
    }
  }

  useEffect(() => {
    axios.get(`/api/projects/${projectId}/site_hazards`)
      .then(res => setSelectedSiteHazards(res.data))
      .catch(err => console.error('Error fetching selected site hazards:', err))

    axios.get(`/api/projects/${projectId}/activity_people_hazards`)
      .then(res => setSelectedActivityHazards(res.data))
      .catch(err => console.error('Error fetching selected activity/people hazards:', err))
  }, [projectId])

  // Fetch hazards on load
  useEffect(() => {
    fetchSiteHazards()
    fetchActivityHazards()
  }, [])

  const [showHazardsModal, setShowHazardsModal] = useState(false)
  const closeHazardsModal = () => setShowHazardsModal(false)

  const fetchSiteHazards = async () => {
    try {
      const res = await axios.get('/api/site_hazards')
      setSiteHazards(res.data)
    } catch (err) {
      setNotification('Failed to load site hazards.')
    }
  }

  const fetchActivityHazards = async () => {
    try {
      const res = await axios.get('/api/activity_people_hazards')
      setActivityHazards(res.data)
    } catch (err) {
      setNotification('Failed to load activity hazards.')
    }
  }

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Add site hazard
  const handleAddSiteHazard = async (e: FormEvent) => {
    e.preventDefault()
    if (!siteHazardDesc.trim()) {
      setNotification('Please provide a site hazard description.')
      return
    }
    if (editSiteHazard || editActivityHazard) {
      setNotification('Finish or cancel editing before adding a new hazard.')
      return
    }

    try {
      await axios.post('/api/site_hazards', {
        hazard_description: siteHazardDesc.trim(),
      })
      setNotification('Site hazard added successfully!')
      setSiteHazardDesc('')
      fetchSiteHazards()
    } catch (err) {
      setNotification('Failed to add site hazard.')
    }
  }

  // Add activity hazard
  const handleAddActivityHazard = async (e: FormEvent) => {
    e.preventDefault()
    if (!activityHazardDesc.trim()) {
      setNotification('Please provide an activity/people hazard description.')
      return
    }
    if (editSiteHazard || editActivityHazard) {
      setNotification('Finish or cancel editing before adding a new hazard.')
      return
    }

    try {
      await axios.post('/api/activity_people_hazards', {
        hazard_description: activityHazardDesc.trim(),
      })
      setNotification('Activity/People hazard added successfully!')
      setActivityHazardDesc('')
      fetchActivityHazards()
    } catch (err) {
      setNotification('Failed to add activity/people hazard.')
    }
  }

  // Edit hazard
  const handleEditSave = async (hazard: Hazard, type: 'site' | 'activity') => {
    const url =
      type === 'site' ? '/api/site_hazards' : '/api/activity_people_hazards'
    try {
      await axios.put(`${url}/${hazard.id}`, {
        hazard_description: hazard.hazard_description.trim(),
      })
      setNotification(
        `${type === 'site' ? 'Site' : 'Activity'} hazard updated successfully!`
      )
      type === 'site' ? setEditSiteHazard(null) : setEditActivityHazard(null)

      type === 'site' ? fetchSiteHazards() : fetchActivityHazards()
    } catch (err) {
      setNotification('Failed to update hazard.')
    }
  }

  // Delete hazard
  const handleDelete = async (id: number, type: 'site' | 'activity') => {
    if (!window.confirm('Are you sure you want to delete this hazard?')) return
    const url =
      type === 'site' ? '/api/site_hazards' : '/api/activity_people_hazards'
    try {
      await axios.delete(`${url}/${id}`)
      setNotification(
        `${type === 'site' ? 'Site' : 'Activity'} hazard deleted successfully!`
      )
      type === 'site' ? fetchSiteHazards() : fetchActivityHazards()
    } catch (err) {
      setNotification('Failed to delete hazard.')
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        transition: 'margin 0.3s ease',
        paddingTop: '2px',
      }}
    >

      <div className="d-flex justify-content-between align-items-center">
      <h2
        style={{color: '#0094B6', fontWeight: 'bold', paddingBottom: '2rem'}}
      >
        Add Hazards
      </h2>
        <Button
          variant="secondary"
          onClick={() => {
            setShowHazardsModal(true)
          }}
        >
          Manage Global Hazards
        </Button>
      </div>

      <h6 className="pb-5">
        Reminder: A hazard is anything that has the potential to cause harm or
        damage if we interact with it
      </h6>

      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 9999, // so it's on top
          }}
        >
          <Alert variant="info" className="text-center m-0 rounded-0">
            {notification}
          </Alert>
        </div>
      )}

      <Row className="g-4">
        <Col md={6} className="form-container bg-white rounded shadow p-4">
          <h4 style={{color: OCEAN_BLUE, paddingBottom: '0.5rem'}}>
            <b>Select Site Hazards</b>
          </h4>
          <Form>
            {siteHazards.map((haz: Hazard) => {
              const checkboxId = `site-hazard-${haz.id}`;
              return (
                <Form.Check
                  key={haz.id}
                  type="checkbox"
                  id={checkboxId}
                  label={haz.hazard_description}
                  checked={selectedSiteHazards.includes(haz.id)}
                  onChange={() => toggleSiteHazard(haz.id)}
                  className="my-2 py-1"
                />
              )
            })}
          </Form>
        </Col>

        <Col md={6} className="form-container bg-white rounded shadow p-4">
          <h4 style={{color: OCEAN_BLUE, paddingBottom: '0.5rem'}}>
            <b>Select Activity/People Hazards</b>
          </h4>
          <Form>
            {activityHazards.map((haz: Hazard) => {
              const checkboxId = `activity-hazard-${haz.id}`;
              return (
                <Form.Check
                  key={haz.id}
                  type="checkbox"
                  id={checkboxId}
                  label={haz.hazard_description}
                  checked={selectedActivityHazards.includes(haz.id)}
                  onChange={() => toggleActivityHazard(haz.id)}
                  className="my-2 py-1"
                />
              )
            })}
          </Form>
        </Col>
      </Row>

      <Modal show={showHazardsModal} onHide={closeHazardsModal} size="xl">
        <Modal.Header closeButton>
          <Modal.Title>Manage Global Hazards</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/*
        site hazards in left col, activity hazards in right col
        .col-md-6 {minWidth: '500px'} for each table to
        at least be 500px wide to not overlap.
      */}
          <Row className="g-4">
            {/* ============ Site Hazards Column =========== */}
            <Col md={6} style={{minWidth: '500px'}}>
              <div className="bg-white rounded shadow p-3 mb-4">
                <h4 style={{color: '#0094B6', paddingBottom: '2rem'}}>
                  <b>Add Site Hazard</b>
                </h4>
                <Form onSubmit={handleAddSiteHazard} className="d-flex flex-column">
                  <Form.Control
                    type="text"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                    placeholder="Write a site hazard"
                    value={siteHazardDesc}
                    onChange={(e) => setSiteHazardDesc(e.target.value)}
                  />
                  <Button
                    className="mt-3 align-self-start w-100"
                    style={{backgroundColor: '#0094B6'}}
                    type="submit"
                  >
                    Add Site Hazard
                  </Button>
                </Form>
              </div>

              {/* -------------- TABLE FOR SITE HAZARDS --------------- */}
              <div className="table-responsive">
                {' '}
                <Table
                  bordered
                  hover
                  striped
                  size="sm"
                  className="bg-white rounded shadow w-100"
                  style={{
                    marginBottom: '2rem',
                    tableLayout: 'fixed',
                    width: '100%',
                  }}
                >
                  <thead>
                  <tr>
                    <th className="text-center" style={{width: '30px'}}>
                      #
                    </th>
                    <th
                      className="text-center"
                      style={{
                        width: '300px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-all', // for long words
                      }}
                    >
                      Hazard Description
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {siteHazards.map((hazard, index) => (
                    <tr key={hazard.id}>
                      <td className="text-center">{index + 1}</td>
                      <td
                        style={{
                          width: '300px',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-all',
                        }}
                      >
                        {editSiteHazard?.id === hazard.id ? (
                          <Form.Control
                            value={editSiteHazard.hazard_description}
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-all',
                            }}
                            onChange={(e) =>
                              setEditSiteHazard((prev) =>
                                prev
                                  ? {
                                    ...prev,
                                    hazard_description: e.target.value,
                                  }
                                  : null
                              )
                            }
                          />

                        ) : (
                          hazard.hazard_description
                        )}
                      </td>
                      <td className="text-center" style={{width: '200px'}}>
                        {editSiteHazard?.id === hazard.id ? (
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            style={{backgroundColor: '#738c40'}}
                            onClick={() => handleEditSave(editSiteHazard, 'site')}
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            style={{backgroundColor: '#0094b6'}}
                            variant="warning"
                            size="sm"
                            className="me-2 text-light"
                            onClick={() => setEditSiteHazard(hazard)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          style={{backgroundColor: '#D37B49', color: 'white'}}
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(hazard.id, 'site')}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              </div>
            </Col>

            {/* ============ Activity/People Hazards Column =========== */}
            <Col md={6} style={{minWidth: '500px'}}>
              <div className="bg-white rounded shadow p-3 mb-4">
                <h4 style={{color: '#0094B6', paddingBottom: '2rem'}}>
                  <b>Add Activity/People Hazard</b>
                </h4>
                <Form
                  onSubmit={handleAddActivityHazard}
                  className="d-flex flex-column"
                >
                  <Form.Control
                    type="text"
                    placeholder="Write an activity hazard"
                    value={activityHazardDesc}
                    onChange={(e) => setActivityHazardDesc(e.target.value)}
                  />
                  <Button
                    className="mt-3 align-self-start w-100"
                    style={{backgroundColor: '#0094B6'}}
                    type="submit"
                  >
                    Add Activity / People Hazard
                  </Button>
                </Form>
              </div>

              {/* -------------- TABLE FOR ACTIVITY HAZARDS --------------- */}
              <div className="table-responsive">
                {' '}
                <Table
                  bordered
                  hover
                  striped
                  size="sm"
                  className="bg-white rounded shadow w-100"
                  style={{
                    marginBottom: '2rem',
                    tableLayout: 'fixed',
                    width: '100%',
                  }}
                >
                  <thead>
                  <tr>
                    <th className="text-center" style={{width: '30px'}}>
                      #
                    </th>
                    <th
                      className="text-center"
                      style={{
                        width: '300px',
                        whiteSpace: 'pre-wrap',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-all',
                      }}
                    >
                      Hazard Description
                    </th>
                    <th className="text-center">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  {activityHazards.map((hazard, index) => (
                    <tr key={hazard.id}>
                      <td className="text-center">{index + 1}</td>
                      <td
                        style={{
                          width: '300px',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-all',
                        }}
                      >
                        {editActivityHazard?.id === hazard.id ? (
                          <Form.Control
                            value={editActivityHazard.hazard_description}
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-all',
                            }}
                            onChange={(e) =>
                              setEditActivityHazard((prev) =>
                                prev
                                  ? {
                                    ...prev,
                                    hazard_description: e.target.value,
                                  }
                                  : null
                              )
                            }
                          />
                        ) : (
                          hazard.hazard_description
                        )}
                      </td>
                      <td className="text-center" style={{width: '200px'}}>
                        {editActivityHazard?.id === hazard.id ? (
                          <Button
                            variant="success"
                            size="sm"
                            className="me-2"
                            style={{backgroundColor: '#738c40'}}
                            onClick={() =>
                              handleEditSave(editActivityHazard, 'activity')
                            }
                          >
                            Save
                          </Button>
                        ) : (
                          <Button
                            style={{backgroundColor: '#0094B6'}}
                            variant="warning"
                            size="sm"
                            className="me-2 text-light"
                            onClick={() => setEditActivityHazard(hazard)}
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          style={{backgroundColor: '#D37B49', color: 'white'}}
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(hazard.id, 'activity')}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="success" className="w-50" onClick={closeHazardsModal}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>

      {/* FIXME template this and make it linear nav? */}
      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="success"
          className="px-4"
          onClick={handleSubmitProjectHazards}
        >
          Save Changes
        </Button>
      </div>
    </div>
  )
}

export default AddHazard
