import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert } from 'react-bootstrap'

interface Hazard {
  id: number
  hazard_description: string
}

interface AddHazardsProps {
  isSidebarOpen: boolean
}

const AddHazard: React.FC<AddHazardsProps> = ({ isSidebarOpen }) => {
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

  // Fetch hazards on load
  useEffect(() => {
    fetchSiteHazards()
    fetchActivityHazards()
  }, [])

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
        marginLeft: isSidebarOpen ? '0px' : '0px',
        transition: 'margin 0.3s ease',
        paddingTop: '2px',
      }}
    >
      <h2
        style={{ color: '#0094B6', fontWeight: 'bold', paddingBottom: '4rem' }}
      >
        Add Hazards
      </h2>

      {notification && <Alert variant="info">{notification}</Alert>}

      {/* 
        Row + 2 columns: site hazards in left col, activity hazards in right col 
        We also add .col-md-6 {minWidth: '500px'} if you want each table to
        at least be 500px wide so they won't overlap.
      */}
      <div className="row g-4">
        {/* ============ Site Hazards Column =========== */}
        <div className="col-md-6" style={{ minWidth: '500px' /* CHANGED */ }}>
          <div className="bg-white rounded shadow p-3 mb-4">
            <h4 style={{ color: '#0094B6', paddingBottom: '2rem' }}>
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
              <Button className="mt-3 align-self-start" type="submit">
                Save
              </Button>
            </Form>
          </div>

          {/* -------------- TABLE FOR SITE HAZARDS --------------- */}
          <div className="table-responsive">
            {' '}
            {/* CHANGED: .table-responsive wrapper */}
            <Table
              bordered
              hover
              striped
              size="sm"
              className="bg-white rounded shadow w-100"
              style={{
                marginBottom: '2rem',
                tableLayout: 'fixed', // CHANGED
                width: '100%',
              }}
            >
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '30px' }}>
                    #
                  </th>
                  <th
                    className="text-center"
                    style={{
                      width: '300px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-all', // CHANGED, helps super-long words
                    }}
                  >
                    Hazard Description
                  </th>
                  <th className="text-center" style={{ width: '80px' }}>
                    Actions
                  </th>
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
                        wordBreak: 'break-all', // CHANGED
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
                    <td className="text-center" style={{ width: '200px' }}>
                      {editSiteHazard?.id === hazard.id ? (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditSave(editSiteHazard, 'site')}
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => setEditSiteHazard(hazard)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
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
        </div>

        {/* ============ Activity/People Hazards Column =========== */}
        <div className="col-md-6" style={{ minWidth: '500px' }}>
          <div className="bg-white rounded shadow p-3 mb-4">
            <h4 style={{ color: '#0094B6', paddingBottom: '2rem' }}>
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
              <Button className="mt-3 align-self-start" type="submit">
                Save
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
                  <th className="text-center" style={{ width: '30px' }}>
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
                  <th className="text-center" style={{ width: '80px' }}>
                    Actions
                  </th>
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
                    <td className="text-center" style={{ width: '200px' }}>
                      {editActivityHazard?.id === hazard.id ? (
                        <Button
                          variant="success"
                          size="sm"
                          className="me-2"
                          onClick={() =>
                            handleEditSave(editActivityHazard, 'activity')
                          }
                        >
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="warning"
                          size="sm"
                          className="me-2"
                          onClick={() => setEditActivityHazard(hazard)}
                        >
                          Edit
                        </Button>
                      )}
                      <Button
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
        </div>
      </div>
    </div>
  )
}

export default AddHazard
