import React, {FormEvent, useEffect, useState} from 'react'
import axios from 'axios'
import {Alert, Button, Card, Col, Form, Modal, Row, Table} from 'react-bootstrap'

interface Objective {
  id: number
  title: string
  measurement: string
  dateStart?: string
  dateEnd?: string
}

interface AddObjectivesProps {
  isSidebarOpen: boolean
  OCEAN_BLUE: string
  projectId: number
}

const AddObjectives: React.FC<AddObjectivesProps> = ({
                                                       isSidebarOpen,
                                                       OCEAN_BLUE,
                                                       projectId
                                                     }) => {

  const [allObjectives, setAllObjectives] = useState<Objective[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([])

  const [objectives, setObjectives] = useState<Objective[]>([])
  const [title, setTitle] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // For editing an existing objective
  const [editObj, setEditObj] = useState<Objective | null>(null)

  // For objectives modal
  const [showObjModal, setShowObjModal] = useState(false)
  const closeObjModal = () => setShowObjModal(false)

  const fetchObjectives = async () => {
    try {
      const res = await axios.get('/api/objectives')
      setObjectives(res.data)
    } catch (err) {
      console.error('Error fetching objectives:', err)
      setNotification('Failed to load objectives.')
    }
  }

  const toggleObjective = (objId: number) => {
    setSelectedObjectives((prev) =>
      prev.includes(objId) ? prev.filter((x) => x !== objId) : [...prev, objId]
    )
  }

  useEffect(() => {
    axios.get('/api/objectives')
      .then(res => setAllObjectives(res.data))
      .catch(err => console.error('Error fetching objectives:', err))

    axios.get(`/api/projects/${projectId}/objectives`)
      .then(res => setSelectedObjectives(res.data))
      .catch(err => console.error('Error fetching project objectives:', err))
  }, [projectId])

    useEffect(() => {
      if (!notification) return
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }, [notification])


  // ADD NEW OBJECTIVE
  const handleSubmitNewObjective = async (e: FormEvent) => {
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
      await fetchObjectives()

    } catch (err: any) {
      console.error('Error adding objective:', err.response?.data || err)
      setNotification(err.response?.data?.message || 'Failed to add objective.')
    }
  }

  // EDIT MODE
  const handleEditClick = (obj: Objective) => {
    setEditObj({...obj})
  }

  const handleEditCancel = () => {
    setEditObj(null)
  }

  const handleEditSave = async () => {
    if (!editObj) return
    const {id, title, measurement} = editObj
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
      await fetchObjectives()
      // onObjectivesEdited?.()
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

      // To updates the child’s local objective list
      await fetchObjectives()
      // tell the parent to re-fetch
      // onObjectivesChanged?.()
    } catch (err: any) {
      console.error('Error deleting objective:', err.response?.data || err)
      setNotification(
        err.response?.data?.message || 'Failed to delete objective.'
      )
    }
  }

  function handleSubmitProjectObjectives() {
    try {
      axios.post(`/api/projects/${projectId}/objectives`, selectedObjectives).then(r => {
        setNotification('Objectives set successfully!')
      })
    } catch (err: any) {
      console.error('Error settings objectives:', err.response?.data || err)
      setNotification(
        err.response?.data?.message || 'Failed to set objectives.'
      )
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        transition: 'margin 0.3s ease',
        // paddingTop: '1rem',
        paddingBottom: '2rem',
      }}
    >
      {/* Notification (displays for 10s) */}
      {notification && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            zIndex: 9999,
          }}
        >
          <Alert variant="info" className="text-center m-0 rounded-0">
            {notification}
          </Alert>
        </div>
      )}
      <Row className="g-4">
        {/* Column 1 */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h2
              className="fw-bold mb-4"
              style={{
                color: OCEAN_BLUE,
                fontWeight: 'bold',
              }}
            >
              Add Objectives
            </h2>
          </div>

        </div>
        <Col md={9} className="order-1 order-md-1 form-container bg-white rounded shadow p-4" style={{maxWidth: '700px'}}>
          <h4 style={{color: OCEAN_BLUE, paddingBottom: '0.5rem'}}>
            <b>Select Project Objectives</b>
          </h4>
          <Form>
            {allObjectives.map((obj: Objective) => {
              const checkboxId = `objective-${obj.id}`;
              return (
                <Form.Check
                  key={obj.id}
                  type="checkbox"
                  id={checkboxId}
                  label={`${obj.title} (${obj.measurement})`}
                  checked={selectedObjectives.includes(obj.id)}
                  onChange={() => toggleObjective(obj.id)}
                  className="my-2 py-1"
                />
              )
            })}
          </Form>
        </Col>

        {/* Column 2 */}
        <Col md={3} className="order-2 order-md-2 p-0 rounded p-3">
          <Button
            variant="secondary"
            onClick={() => {
              setShowObjModal(true)
            }}
          >
            Manage Global Objectives
          </Button>
          {/* Modal for global objectives */}
          <Modal show={showObjModal} onHide={closeObjModal} size="xl">
            <Modal.Header closeButton>
              <Modal.Title>Manage Global Objectives</Modal.Title>
            </Modal.Header>
            <Modal.Body>

              <Row className="g-4 px-3">
                {/* Modal, left Side: Objectives List */}
                <Col xs={12} md={6}>
                  <Card className="shadow">
                    <Card.Header style={{backgroundColor: '#F4F7F1'}}>
                      <h5 className="fw-bold mb-0">Objectives List</h5>
                    </Card.Header>
                    <Card.Body style={{padding: '0.75rem'}}>
                      {objectives.length === 0 ? (
                        <p className="text-muted text-center my-3">
                          No objectives have been added yet.
                        </p>
                      ) : (
                        <div className="table-responsive">
                          <Table bordered hover striped size="sm" className="mb-0">
                            <thead>
                            <tr>
                              <th className="text-center" style={{width: '40px'}}>
                                #
                              </th>
                              <th>Title</th>
                              <th>Measurement</th>
                              <th className="text-center" style={{width: '130px'}}>
                                Action
                              </th>
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
                                        value={editObj?.title}
                                        onChange={(e) =>
                                          setEditObj((prev) =>
                                            prev
                                              ? {
                                                ...prev,
                                                title: e.target.value
                                              }
                                              : null
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
                                        value={editObj?.measurement}
                                        onChange={(e) =>
                                          setEditObj((prev) =>
                                            prev
                                              ? {
                                                ...prev,
                                                measurement: e.target.value,
                                              }
                                              : null
                                          )
                                        }
                                      />
                                    ) : (
                                      obj.measurement
                                    )}
                                  </td>
                                  <td className="d-flex justify-content-center align-items-center">
                                    {isEditing ? (
                                      <>
                                        <Button
                                          style={{backgroundColor: '#738c40'}}
                                          className="me-1"
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
                                      </>
                                    ) : (
                                      <>
                                        <Button
                                          style={{backgroundColor: '#0094b6'}}
                                          className="me-1 text-light"
                                          variant="info"
                                          size="sm"
                                          onClick={() => handleEditClick(obj)}
                                        >
                                          Edit
                                        </Button>
                                        {/*FIXME this is a known unsaved-objective deletion race, resolve during navigation refactor*/}
                                        <Button
                                          style={{
                                            backgroundColor: '#D37B49',
                                            color: 'white',
                                          }}
                                          variant="danger"
                                          size="sm"
                                          onClick={() => handleDelete(obj.id)}
                                        >
                                          Delete
                                        </Button>
                                      </>
                                    )}
                                  </td>
                                </tr>
                              )
                            })}
                            </tbody>
                          </Table>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                </Col>

                {/* Modal, right Side: Add form */}
                <Col xs={12} md={6}>
                  <Card className="shadow">
                    <Card.Header style={{backgroundColor: '#F4F7F1'}}>
                      <h5 className="fw-bold mb-0">Add a New Objective</h5>
                    </Card.Header>
                    <Card.Body>
                      <Form onSubmit={handleSubmitNewObjective}>
                        <Form.Group className="mb-3" controlId="objectiveTitle">
                          <Form.Label>Objective Title</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter a new objective"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                          />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="measurement">
                          <Form.Label>Measurement</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Units, e.g. 'Hours', 'm2'..."
                            value={measurement}
                            onChange={(e) => setMeasurement(e.target.value)}
                          />
                        </Form.Group>

                        <Button
                          type="submit"
                          className="w-100 mt-2"
                          style={{backgroundColor: '#76D6E2', color: '#1A1A1A'}}
                        >
                          + Add Objective
                        </Button>
                      </Form>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Modal.Body>
            <Modal.Footer className="d-flex justify-content-center">
              <Button variant="success" className="w-50" onClick={closeObjModal}>
                Done
              </Button>
            </Modal.Footer>
          </Modal>
        </Col>

      </Row>

      {/* FIXME template this and make it linear nav? */}
      <div className="d-flex justify-content-center mt-3">
        <Button
          variant="success"
          className="px-4"
          onClick={handleSubmitProjectObjectives}
        >
          Save Changes
        </Button>
      </div>

    </div>
  )
}

export default AddObjectives
