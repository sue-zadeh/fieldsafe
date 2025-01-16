import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert, ButtonGroup } from 'react-bootstrap'

interface Objective {
  id: number
  title: string
  measurement: string
  dateStart?: string
  dateEnd?: string
}

interface AddObjectivesProps {
  isSidebarOpen: boolean
}

const AddObjectives: React.FC<AddObjectivesProps> = ({ isSidebarOpen }) => {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [title, setTitle] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // For editing an existing objective
  const [editObj, setEditObj] = useState<Objective | null>(null)

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
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // ADD NEW OBJECTIVE
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // If the user is currently editing an objective, block creating a new one
    if (editObj) {
      setNotification('Finish or cancel editing before adding a new objective.')
      return
    }
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
  const handleEditClick = (obj: Objective) => {
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
        marginLeft: isSidebarOpen ? '0px' : '0px',
        transition: 'margin 0.3s ease',
        paddingTop: '2px',
      }}
    >
      <h2
        style={{
          color: '#0094B6',
          fontWeight: 'bold',
          paddingTop: '2rem',
          paddingBottom: '3rem',
        }}
      >
        Add Objectives
      </h2>

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
      <div className="row form-container bg-white p-4 g-4 rounded shadow">
        {/* LEFT: objectives list */}
        <div className="col-md-6">
          <h4 className="pb-3">
            <b>Objectives List</b>
          </h4>
          {objectives.length === 0 ? (
            <p className="text-muted">No objectives yet</p>
          ) : (
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
              {' '}
              <thead>
                <tr>
                  <th className="text-center" style={{ width: '30px' }}>
                    #
                  </th>
                  <th
                    className="text-center"
                    style={{
                      width: '200px',
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      overflowWrap: 'break-word',
                      wordBreak: 'break-all',
                    }}
                  >
                    Title
                  </th>
                  <th className="text-center" style={{ width: '80px' }}>
                    Measurement
                  </th>
                  <th className="text-center" style={{ width: '80px' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {objectives.map((obj, index) => {
                  const isEditing = editObj && editObj.id === obj.id
                  return (
                    <tr key={obj.id}>
                      <td className="text-center">{index + 1}</td>
                      {/* Title cell with wrapping */}
                      <td
                        style={{
                          width: '200px',
                          whiteSpace: 'pre-wrap',
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-all',
                        }}
                      >
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            value={editObj.title}
                            style={{
                              whiteSpace: 'pre-wrap',
                              wordWrap: 'break-word',
                              overflowWrap: 'break-word',
                              wordBreak: 'break-all',
                            }}
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
                              className="mt-3 align-self-start"
                              variant="success"
                              size="sm"
                              onClick={handleEditSave}
                            >
                              Save
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="me-2"
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
          <h4
            style={{
              color: '#0094B6',
            }}
          >
            <b>Add a New Objective</b>
          </h4>
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
              className="w-100 mt-3 text-dark fs-6 "
              style={{ backgroundColor: '#76D6E2'  }}
            >
              Add New Objective
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default AddObjectives
