// src/components/AddProject.tsx
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api'
import {
  Navbar,
  Nav,
  Form,
  Button,
  Col,
  Row,
  Modal,
  ListGroup,
} from 'react-bootstrap'

// color palette
const OCEAN_BLUE = '#0094B6'
const SKY_BLUE = '#76D6E2'
const FOREST_GREEN = '#738c40'

// statuses
type ProjectStatus = 'inprogress' | 'completed' | 'onhold'

// objective shape
type Objective = {
  id: number
  title: string
  measurement: string
}

interface AddProjectProps {
  isSidebarOpen: boolean
}

const containerStyle = {
  width: '100%',
  height: '200px',
}

const centerDefault = {
  lat: -37.8136,
  lng: 144.9631,
}

const AddProject: React.FC<AddProjectProps> = ({ isSidebarOpen }) => {
  const [activeTab, setActiveTab] = useState('details')

  // form fields
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('inprogress')

  // notifications (for success or errors)
  const [notification, setNotification] = useState<string | null>(null)

  // all objectives from DB
  const [allObjectives, setAllObjectives] = useState<Objective[]>([])
  // user’s chosen objective IDs
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([])

  // used to display a textual summary in the main form
  const selectedObjectivesText = allObjectives
    .filter((obj) => selectedObjectives.includes(obj.id))
    .map((o) => `${o.title} (${o.measurement})`)
    .join(', ')

  // location & map
  const [location, setLocation] = useState('')
  const [mapCenter, setMapCenter] = useState(centerDefault)
  const [markerPos, setMarkerPos] = useState(centerDefault)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // emergency & local info
  const [emergencyServices, setEmergencyServices] = useState(
    '111 will contact all emergency services'
  )
  const [localMedicalCenterAddress, setLocalMedicalCenterAddress] = useState('')
  const [localMedicalCenterPhone, setLocalMedicalCenterPhone] = useState('')
  const [localHospital, setLocalHospital] = useState('')
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')

  // file uploads
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [inductionFile, setInductionFile] = useState<File | null>(null)

  // createdBy
  const [createdBy, setCreatedBy] = useState<number | null>(null)

  // for the Objectives modal
  const [showObjModal, setShowObjModal] = useState(false)

  // ----------------------------------------------------------------
  // on mount, load adminID + fetch objectives
  useEffect(() => {
    const adminId = localStorage.getItem('adminId')
    if (adminId) {
      setCreatedBy(Number(adminId))
    }

    axios
      .get('/api/objectives')
      .then((res) => {
        setAllObjectives(res.data)
      })
      .catch((err) => console.error('Error fetching objectives:', err))
  }, [])

  // ----------------------------------------------------------------
  // Hide notification after ~4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // ----------------------------------------------------------------
  const handleNavClick = (tab: string) => setActiveTab(tab)

  // toggling objectives
  const toggleObjective = (objId: number) => {
    setSelectedObjectives((prev) =>
      prev.includes(objId)
        ? prev.filter((id) => id !== objId)
        : [...prev, objId]
    )
  }

  // open/close the modal
  const openObjModal = () => setShowObjModal(true)
  const closeObjModal = () => setShowObjModal(false)

  // map places
  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      if (place && place.geometry) {
        const lat = place.geometry.location?.lat() ?? centerDefault.lat
        const lng = place.geometry.location?.lng() ?? centerDefault.lng
        setMapCenter({ lat, lng })
        setMarkerPos({ lat, lng })
        setLocation(place.formatted_address || '')
      }
    }
  }

  // ----------------------------------------------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // 1) Check required fields
    if (!name || !location || !startDate || !emergencyServices) {
      setNotification('All fields are required, including Emergency Services.')
      return
    }
    // phone checks
    if (!/^[0-9+()\-\s]+$/.test(primaryContactPhone)) {
      setNotification('Primary Contact Phone is invalid format.')
      return
    }
    if (!/^[0-9+()\-\s]+$/.test(localMedicalCenterPhone)) {
      setNotification('Local Medical Center Phone is invalid format.')
      return
    }

    // 2) Check uniqueness of project name (client side, optional)
    try {
      const checkRes = await axios.get(
        `/api/projects?name=${encodeURIComponent(name)}`
      )
      if (checkRes.data?.exists) {
        // if the server returns { exists: true } for the name
        setNotification('Project name already exists. Choose another.')
        return
      }
    } catch (err) {
      console.warn('Client side uniqueness check error:', err)
    }

    // 3) Build formData
    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('location', location)
      formData.append('startDate', startDate)
      formData.append('status', status)
      if (createdBy) formData.append('createdBy', String(createdBy))

      formData.append('emergencyServices', emergencyServices)
      formData.append('localMedicalCenterAddress', localMedicalCenterAddress)
      formData.append('localMedicalCenterPhone', localMedicalCenterPhone)
      formData.append('localHospital', localHospital)
      formData.append('primaryContactName', primaryContactName)
      formData.append('primaryContactPhone', primaryContactPhone)
      formData.append('objectives', JSON.stringify(selectedObjectives))
      if (imageFile) formData.append('image', imageFile)
      if (inductionFile) formData.append('inductionFile', inductionFile)

      await axios.post('/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // show success for 4s, no numeric ID
      setNotification('Project created successfully!')

      // reset form
      setName('')
      setLocation('')
      setStartDate('')
      setStatus('inprogress')
      setEmergencyServices('111 will contact all emergency services')
      setLocalMedicalCenterAddress('')
      setLocalMedicalCenterPhone('')
      setLocalHospital('')
      setPrimaryContactName('')
      setPrimaryContactPhone('')
      setImageFile(null)
      setInductionFile(null)
      setSelectedObjectives([])
    } catch (err) {
      console.error('Error creating project:', err)
      setNotification('Failed to create project.')
    }
  }

  // sticky local nav
  const stickyNavStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 999,
    backgroundColor: SKY_BLUE,
    fontSize: '1.2rem',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '1.1rem', // bigger label font
    fontWeight: 500,
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        paddingTop: '0px',
        transition: 'margin 0.3s ease',
        minHeight: '100vh',
      }}
    >
      {notification && (
        <div className="alert alert-info text-center fs-5">{notification}</div>
      )}

      {/* Local nav for details/objectives/risks */}
      <Navbar expand="lg" style={stickyNavStyle} className="mb-2 px-5 py-2">
        <Navbar.Brand
          style={{
            color: OCEAN_BLUE,
            fontWeight: 'bold',
            width: '100%',
            fontSize: '2rem',
          }}
        >
          Create Project
        </Navbar.Brand>
        <Nav className="mx-auto">
          {/* Center nav items */}
          <Nav.Link
            onClick={() => handleNavClick('details')}
            style={{
              fontWeight: activeTab === 'details' ? 'bold' : 'normal',
              color: FOREST_GREEN,
              marginRight: '1rem',
            }}
          >
            Details
          </Nav.Link>
          <Nav.Link
            onClick={() => handleNavClick('objectives')}
            style={{
              fontWeight: activeTab === 'objectives' ? 'bold' : 'normal',
              color: FOREST_GREEN,
              marginRight: '1rem',
            }}
          >
            Objectives
          </Nav.Link>
          <Nav.Link
            onClick={() => handleNavClick('risks')}
            style={{
              fontWeight: activeTab === 'risks' ? 'bold' : 'normal',
              color: FOREST_GREEN,
            }}
          >
            Risks
          </Nav.Link>
        </Nav>
      </Navbar>

      {activeTab === 'details' && (
        <div className="row mt-4 g-4">
          {/* LEFT COLUMN */}
          <div className="col-md-5">
            <h3 style={{ color: OCEAN_BLUE }}>{name || '[Project Name]'}</h3>
            <div
              className="border p-2 mb-3"
              style={{ minHeight: '200px', textAlign: 'center' }}
            >
              {imageFile ? (
                <img
                  src={URL.createObjectURL(imageFile)}
                  alt="preview"
                  style={{ maxWidth: '100%', maxHeight: '200px' }}
                />
              ) : (
                <p className="text-muted fs-5">Click to upload project image</p>
              )}
              <div className="mt-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setImageFile(e.target.files[0])
                    }
                  }}
                />
              </div>
            </div>

            <h4>Emergency Services</h4>
            <Form.Group className="mb-3" controlId="emergencyServices">
              <Form.Control
                required
                type="text"
                value={emergencyServices}
                onChange={(e) => setEmergencyServices(e.target.value)}
                style={labelStyle}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="localMedicalCenterAddress"
                >
                  <Form.Label style={labelStyle}>
                    Local Medical Center (Address)
                  </Form.Label>
                  <Form.Control
                    required
                    type="text"
                    value={localMedicalCenterAddress}
                    onChange={(e) =>
                      setLocalMedicalCenterAddress(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group
                  className="mb-3"
                  controlId="localMedicalCenterPhone"
                >
                  <Form.Label style={labelStyle}>
                    Local Medical Center (Phone)
                  </Form.Label>
                  <Form.Control
                    required
                    pattern="^[0-9+()\-\s]{6,}$"
                    type="text"
                    value={localMedicalCenterPhone}
                    onChange={(e) => setLocalMedicalCenterPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="localHospital">
              <Form.Label style={labelStyle}>Local Hospital</Form.Label>
              <Form.Control
                required
                type="text"
                value={localHospital}
                onChange={(e) => setLocalHospital(e.target.value)}
              />
            </Form.Group>

            <div className="border p-2">
              <p className="mb-1 fw-bold fs-5">
                Upload Project Induction Instructions
              </p>
              {inductionFile ? (
                <Button
                  variant="link"
                  onClick={() => {
                    // open the file in a new tab if needed
                    const fileUrl = URL.createObjectURL(inductionFile)
                    window.open(fileUrl, '_blank')
                  }}
                >
                  View Document
                </Button>
              ) : (
                <p className="text-muted">No file chosen yet</p>
              )}
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    setInductionFile(e.target.files[0])
                  }
                }}
              />
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-md-7">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="projectName" className="mb-3">
                <Form.Label style={labelStyle}>Project Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              {/* Instead of direct checkboxes, we show a read-only field + 'Edit' button => modal */}
              <Form.Group className="mb-3">
                <Form.Label style={labelStyle}>Objectives</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    readOnly
                    type="text"
                    value={selectedObjectivesText}
                    placeholder="(No objectives selected)"
                    onClick={openObjModal}
                  />
                  <Button
                    variant="secondary"
                    className="ms-2"
                    onClick={openObjModal}
                  >
                    Edit
                  </Button>
                </div>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group controlId="startDate" className="mb-3">
                    <Form.Label style={labelStyle}>Start Date</Form.Label>
                    <Form.Control
                      required
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="status" className="mb-3">
                    <Form.Label style={labelStyle}>Status</Form.Label>
                    <Form.Select
                      required
                      value={status}
                      onChange={(e) =>
                        setStatus(e.target.value as ProjectStatus)
                      }
                    >
                      <option value="inprogress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="onhold">On Hold</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="primaryContactName">
                    <Form.Label style={labelStyle}>
                      Primary Contact Name
                    </Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={primaryContactName}
                      onChange={(e) => setPrimaryContactName(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3" controlId="primaryContactPhone">
                    <Form.Label style={labelStyle}>
                      Primary Contact Phone
                    </Form.Label>
                    <Form.Control
                      required
                      pattern="^[0-9+()\-\s]{6,}$"
                      type="text"
                      value={primaryContactPhone}
                      onChange={(e) => setPrimaryContactPhone(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* MAP */}
              <div className="mb-3">
                <div style={{ width: '100%', height: '200px' }}>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={mapCenter}
                    zoom={12}
                  >
                    <Marker position={markerPos} />
                  </GoogleMap>
                </div>
              </div>

              <Form.Group controlId="location" className="mb-3">
                <Form.Label style={labelStyle}>Project Location</Form.Label>
                <Autocomplete
                  onLoad={(auto) => (autocompleteRef.current = auto)}
                  onPlaceChanged={handlePlaceChanged}
                >
                  <Form.Control
                    required
                    type="text"
                    placeholder="Type an address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Autocomplete>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100 mt-3">
                Save
              </Button>
            </Form>
          </div>
        </div>
      )}

      {activeTab === 'objectives' && (
        <div className="p-4">
          <h3>Project Objectives</h3>
          <p>
            {' '}
            Here you might display a more detailed editor for the objectives the
            user selected.{' '}
          </p>
        </div>
      )}
      {activeTab === 'risks' && (
        <div className="p-4">
          <h3>Project Risks</h3>
          <p>Placeholder content for risks tab.</p>
        </div>
      )}

      {/* MODAL for objectives */}
      <Modal show={showObjModal} onHide={closeObjModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Objectives</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {allObjectives.map((obj) => (
              <ListGroup.Item
                key={obj.id}
                className="d-flex justify-content-between align-items-center"
                action
                onClick={() => toggleObjective(obj.id)}
                active={selectedObjectives.includes(obj.id)}
              >
                {obj.title} ({obj.measurement})
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeObjModal}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AddProject
