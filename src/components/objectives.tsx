import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert, ButtonGroup } from 'react-bootstrap'

interface Objectives {
  id: number
  title: string
  measurement: string
  dateStart?: string
  dateEnd?: string
}

interface ObjectivesProps {
  isSidebarOpen: boolean
}

const AddObjectives: React.FC<ObjectivesProps> = ({ isSidebarOpen }) => {
  const [objectives, setObjectives] = useState<Objectives[]>([])
  const [title, setTitle] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // For editing an existing objective
  const [editObj, setEditObj] = useState<Objectives | null>(null)

  useEffect(() => {
    fetchObjectives()
  }, [])

  const fetchObjectives = async () => {
    try {
      const res = await axios.get('/api/objectives')
      setObjectives(res.data)
    } catch (err) {
      console.error('Error fetching objectives:', err)
      setNotification('Failed to load objectives.')
    }
  }

  // auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // ADD NEW OBJECTIVE
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !measurement.trim()) {
      setNotification('Please fill in both Title and Measurement.')
      return
    }

    try {
      await axios.post('/api/objectives', {
        title: title.trim(),
        measurement: measurement.trim(),
      })
      setNotification('Objective added successfully!')
      setTitle('')
      setMeasurement('')
      fetchObjectives()
    } catch (err: any) {
      console.error('Error adding objective:', err.response?.data || err)
      setNotification(err.response?.data?.message || 'Failed to add objective.')
    }
  }

  // EDIT MODE
  const handleEditClick = (obj: Objectives) => {
    setEditObj({ ...obj })
  }

  const handleEditCancel = () => {
    setEditObj(null)
  }

  const handleEditSave = async () => {
    if (!editObj) return
    const { id, title, measurement } = editObj
    if (!title.trim() || !measurement.trim()) {
      setNotification('Please fill in both Title and Measurement for editing.')
      return
    }

    try {
      await axios.put(`/api/objectives/${id}`, {
        title: title.trim(),
        measurement: measurement.trim(),
      })
      setNotification('Objective updated successfully!')
      setEditObj(null)
      fetchObjectives()
    } catch (err: any) {
      console.error('Error updating objective:', err.response?.data || err)
      setNotification(
        err.response?.data?.message || 'Failed to update objective.'
      )
    }
  }

  // DELETE
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this objective?')) {
      return
    }

    try {
      await axios.delete(`/api/objectives/${id}`)
      setNotification('Objective deleted successfully!')
      fetchObjectives()
    } catch (err: any) {
      console.error('Error deleting objective:', err.response?.data || err)
      setNotification(
        err.response?.data?.message || 'Failed to delete objective.'
      )
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '0rem',
        // minHeight: '100vh',
      }}
    >
      <h2
        style={{ color: '#0094B6', fontWeight: 'bold', paddingBottom: '4rem' }}
      >
        Add Objectives
      </h2>

      {notification && (
        <Alert variant="info" className="text-center">
          {notification}
        </Alert>
      )}

      <div className="row form-container bg-white p-4 g-4 rounded shadow">
        {/* LEFT: objectives list */}
        <div className="col-md-6">
          <h4 className="pb-3">
            <b>Objectives List</b>
          </h4>
          {objectives.length === 0 ? (
            <p className="text-muted">No objectives yet</p>
          ) : (
            <Table bordered hover className="bg-white px-5 p-4 rounded shadow">
              <thead>
                <tr>
                  <th className="text-center">#</th>
                  <th className="text-center">Title</th>
                  <th className="text-center">Measurement</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {objectives.map((obj, index) => {
                  const isEditing = editObj && editObj.id === obj.id
                  return (
                    <tr key={obj.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            value={editObj.title}
                            onChange={(e) =>
                              setEditObj((prev) =>
                                prev ? { ...prev, title: e.target.value } : null
                              )
                            }
                          />
                        ) : (
                          obj.title
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            value={editObj.measurement}
                            onChange={(e) =>
                              setEditObj((prev) =>
                                prev
                                  ? { ...prev, measurement: e.target.value }
                                  : null
                              )
                            }
                          />
                        ) : (
                          obj.measurement
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <ButtonGroup>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={handleEditSave}
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleEditCancel}
                            >
                              Cancel
                            </Button>
                          </ButtonGroup>
                        ) : (
                          <ButtonGroup>
                            <Button
                              variant="warning"
                              size="sm"
                              onClick={() => handleEditClick(obj)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(obj.id)}
                            >
                              Delete
                            </Button>
                          </ButtonGroup>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}
        </div>

        {/* RIGHT: add form */}
        <div className="col-md-6 bg-white px-5 pt-5 rounded shadow ">
          <h4>Add a New Objective</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="m-3" controlId="objectiveTitle">
              <Form.Label>
                <b>Objective Title</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Write a new objective here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="measurement">
              <Form.Label>
                <b>Measurement</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Units, e.g. 'Hours', 'Hectares'..."
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
              />
            </Form.Group>

            <Button
              type="submit"
              className="w-100 mt-3 text-dark fs-5"
              style={{ backgroundColor: '#76D6E2', color: '#fff' }}
            >
              Save
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default AddObjectives
