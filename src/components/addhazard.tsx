import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert, ButtonGroup } from 'react-bootstrap'

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
      <div className="d-flex column form-container bg-white p-4 g-4 rounded shadow">
        <div className="col-md-6">
          <div className="d-flex row form-container">
            {/* Site Hazards */}
            <h3 style={{ color: '#0094B6' }}>
              <b>Add Site Hazard</b>
            </h3>
            <Form onSubmit={handleAddSiteHazard}>
              <Form.Control
                type="text"
                style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                  maxWidth: '100%',
                }}
                placeholder="Write a site hazard"
                value={siteHazardDesc}
                onChange={(e) => setSiteHazardDesc(e.target.value)}
              />
              <Button className="m-3 px-4" type="submit">
                Save
              </Button>
            </Form>
          </div>
          <Table
            bordered
            hover
            className="bg-white px-5 p-4 rounded shadow"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '50%',
            }}
          >
            <thead>
              <tr>
                <th className="text-center">#</th>
                <th className="text-center w-80">Hazard Description</th>
                <th className="text-center w-25">Actions</th>
              </tr>
            </thead>
            <tbody
              style={{
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
                maxWidth: '100%',
              }}
            >
              {siteHazards.map((hazard, index) => (
                <tr
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    maxWidth: '100%',
                  }}
                  key={hazard.id}
                >
                  <td>{index + 1}</td>
                  <td
                    className="align-item-center"
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                    }}
                  >
                    {editSiteHazard?.id === hazard.id ? (
                      <Form.Control
                        value={editSiteHazard.hazard_description}
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          maxWidth: '100%',
                        }}
                        onChange={(e) =>
                          setEditSiteHazard((prev) =>
                            prev
                              ? { ...prev, hazard_description: e.target.value }
                              : null
                          )
                        }
                      />
                    ) : (
                      hazard.hazard_description
                    )}
                  </td>
                  <td>
                    {editSiteHazard?.id === hazard.id ? (
                      <Button
                        onClick={() => handleEditSave(editSiteHazard, 'site')}
                      >
                        Save
                      </Button>
                    ) : (
                      <Button onClick={() => setEditSiteHazard(hazard)}>
                        Edit
                      </Button>
                    )}
                    <Button onClick={() => handleDelete(hazard.id, 'site')}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
        {/* Activity Hazards */}
        {/* <div className="d-flex row form-container bg-white p-4 g-2 rounded shadow"> */}
          <div className="col-md-6">
          {/* <div className=" form-container"> */}

            <h3 style={{ color: '#0094B6' }}>
              <b>Add Activity/People Hazard</b>
            </h3>
            <Form onSubmit={handleAddActivityHazard}>
              <Form.Control
                type="text"
                placeholder="Write an activity hazard"
                value={activityHazardDesc}
                onChange={(e) => setActivityHazardDesc(e.target.value)}
              />
              <Button className="m-3 px-4" type="submit">
                Save
              </Button>
            </Form>
            <Table bordered hover className="bg-white px-5 p-4 rounded shadow">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th className="text-center w-90">Hazard Description</th>
                  <th className="text-center w-25">Actions</th>
                </tr>
              </thead>
              <tbody>
                {activityHazards.map((hazard, index) => (
                  <tr key={hazard.id}>
                    <td className="text-center">{index + 1}</td>
                    <td className="align-item-center">
                      {editActivityHazard?.id === hazard.id ? (
                        <Form.Control
                          value={editActivityHazard.hazard_description}
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
                    <td>
                      {editActivityHazard?.id === hazard.id ? (
                        <Button
                          onClick={() =>
                            handleEditSave(editActivityHazard, 'activity')
                          }
                        >
                          Save
                        </Button>
                      ) : (
                        <Button onClick={() => setEditActivityHazard(hazard)}>
                          Edit
                        </Button>
                      )}
                      <Button
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
      // </div>
    // </div>
  )
}

export default AddHazard
