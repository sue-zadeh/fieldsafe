// src/components/AddProject.tsx
import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
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

// Colors and Types
const OCEAN_BLUE = '#0094B6'
const SKY_BLUE = '#76D6E2'

type ProjectStatus = 'inprogress' | 'completed' | 'onhold'

interface Objective {
  id: number
  title: string
  measurement: string
}

interface AddProjectProps {
  isSidebarOpen: boolean
}

interface OriginalData {
  name: string
  location: string
  startDate: string
  status: ProjectStatus
  emergencyServices: string
  localMedicalCenterAddress: string
  localMedicalCenterPhone: string
  localHospital: string
  primaryContactName: string
  primaryContactPhone: string
  objectiveIds: number[]
}

const containerStyle = {
  width: '100%',
  height: '200px',
}

// Default center => Auckland
const centerDefault = { lat: -36.8485, lng: 174.7633 }

const AddProject: React.FC<AddProjectProps> = ({ isSidebarOpen }) => {
  const locationState = useLocation().state as {
    isEdit?: boolean
    projectId?: number
  }
  const navigate = useNavigate()

  // Are we editing?
  const [isEdit, setIsEdit] = useState(false)
  const [projectId, setProjectId] = useState<number | null>(null)

  // Form states
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('inprogress')
  const [notification, setNotification] = useState<string | null>(null)

  // Objectives
  const [allObjectives, setAllObjectives] = useState<Objective[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([])

  // Location & map
  const [location, setLocation] = useState('')
  const [mapCenter, setMapCenter] = useState(centerDefault)
  const [markerPos, setMarkerPos] = useState(centerDefault)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // Emergency & local info
  const [emergencyServices, setEmergencyServices] = useState(
    '111 will contact all emergency services'
  )
  const [localMedicalCenterAddress, setLocalMedicalCenterAddress] = useState('')
  const [localMedicalCenterPhone, setLocalMedicalCenterPhone] = useState('')
  const [localHospital, setLocalHospital] = useState('')
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')

  // File uploads
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [inductionFile, setInductionFile] = useState<File | null>(null)

  // Existing file paths if editing
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [existingInductionUrl, setExistingInductionUrl] = useState<
    string | null
  >(null)

  // Original data for “no changes” detection
  const [originalData, setOriginalData] = useState<OriginalData | null>(null)

  // For objectives modal
  const [showObjModal, setShowObjModal] = useState(false)

  // Block past date in the date input
  const todayString = new Date().toISOString().split('T')[0]

  // On mount: load objectives, check if editing
  useEffect(() => {
    // Load objectives
    axios
      .get('/api/objectives')
      .then((res) => setAllObjectives(res.data))
      .catch((err) => console.error('Error fetching objectives:', err))

    // If editing
    if (locationState?.isEdit && locationState.projectId) {
      setIsEdit(true)
      setProjectId(locationState.projectId)
      axios
        .get(`/api/projects/${locationState.projectId}`)
        .then((res) => {
          const { project, objectiveIds } = res.data
          // Fill states
          setName(project.name || '')
          // slice(0,10) ensures we get "YYYY-MM-DD" for <input type="date">
          setStartDate((project.startDate || '').slice(0, 10))
          setStatus(project.status || 'inprogress')
          setLocation(project.location || '')
          setEmergencyServices(project.emergencyServices || '')
          setLocalMedicalCenterAddress(project.localMedicalCenterAddress || '')
          setLocalMedicalCenterPhone(project.localMedicalCenterPhone || '')
          setLocalHospital(project.localHospital || '')
          setPrimaryContactName(project.primaryContactName || '')
          setPrimaryContactPhone(project.primaryContactPhone || '')

          if (project.imageUrl) {
            setExistingImageUrl(project.imageUrl)
          }
          if (project.inductionFileUrl) {
            setExistingInductionUrl(project.inductionFileUrl)
          }

          setSelectedObjectives(objectiveIds || [])

          // Save original data
          setOriginalData({
            name: project.name,
            location: project.location,
            startDate: (project.startDate || '').slice(0, 10),
            status: project.status,
            emergencyServices: project.emergencyServices,
            localMedicalCenterAddress: project.localMedicalCenterAddress,
            localMedicalCenterPhone: project.localMedicalCenterPhone,
            localHospital: project.localHospital,
            primaryContactName: project.primaryContactName,
            primaryContactPhone: project.primaryContactPhone,
            objectiveIds: objectiveIds || [],
          })
        })
        .catch((err) => console.error('Error loading project for edit:', err))
    }
  }, [locationState])

  // auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Active tab in the local nav
  const [activeTab, setActiveTab] = useState('details')
  const handleNavClick = (tab: string) => setActiveTab(tab)

  // Toggle objectives
  const toggleObjective = (objId: number) => {
    setSelectedObjectives((prev) =>
      prev.includes(objId)
        ? prev.filter((id) => id !== objId)
        : [...prev, objId]
    )
  }
  const openObjModal = () => setShowObjModal(true)
  const closeObjModal = () => setShowObjModal(false)

  // Summarize objectives in multiline
  const selectedObjectivesText = allObjectives
    .filter((obj) => selectedObjectives.includes(obj.id))
    .map((o) => `${o.title} (${o.measurement})`)
    .join('\n')

  // handle google places
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

  // handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // required checks
    if (!name || !location || !startDate || !emergencyServices) {
      setNotification('All fields are required, including Emergency Services.')
      return
    }
    // phone checks
    if (!/^\d{10}$/.test(primaryContactPhone)) {
      setNotification('Primary Contact Phone must be exactly 10 digits.')
      return
    }
    if (!/^\d{10}$/.test(localMedicalCenterPhone)) {
      setNotification('Local Medical Center Phone must be exactly 10 digits.')
      return
    }

    // check uniqueness (client side)
    try {
      const checkRes = await axios.get(
        `/api/projects?name=${encodeURIComponent(name)}`
      )
      if (checkRes.data?.exists && !isEdit) {
        setNotification('Project name already exists. Choose another.')
        return
      }
    } catch (err) {
      console.warn('Uniqueness check error', err)
    }

    // build formData
    const formData = new FormData()
    formData.append('name', name)
    formData.append('location', location)
    formData.append('startDate', startDate)
    formData.append('status', status)
    const adminId = localStorage.getItem('adminId')
    if (adminId) {
      formData.append('createdBy', adminId)
    }
    formData.append('emergencyServices', emergencyServices)
    formData.append('localMedicalCenterAddress', localMedicalCenterAddress)
    formData.append('localMedicalCenterPhone', localMedicalCenterPhone)
    formData.append('localHospital', localHospital)
    formData.append('primaryContactName', primaryContactName)
    formData.append('primaryContactPhone', primaryContactPhone)
    formData.append('objectives', JSON.stringify(selectedObjectives))

    // new files => override existing
    if (imageFile) {
      formData.append('image', imageFile)
    }
    if (inductionFile) {
      formData.append('inductionFile', inductionFile)
    }

    if (isEdit && projectId) {
      // “no changes” check
      if (originalData) {
        const isNoChange =
          originalData.name === name &&
          originalData.location === location &&
          originalData.startDate === startDate &&
          originalData.status === status &&
          originalData.emergencyServices === emergencyServices &&
          originalData.localMedicalCenterAddress ===
            localMedicalCenterAddress &&
          originalData.localMedicalCenterPhone === localMedicalCenterPhone &&
          originalData.localHospital === localHospital &&
          originalData.primaryContactName === primaryContactName &&
          originalData.primaryContactPhone === primaryContactPhone &&
          JSON.stringify(originalData.objectiveIds.slice().sort()) ===
            JSON.stringify(selectedObjectives.slice().sort())

        if (isNoChange) {
          if (!window.confirm('No changes detected. Save anyway?')) {
            return
          }
        }
      }
      // do PUT
      try {
        await axios.put(`/api/projects/${projectId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setNotification('Project updated successfully!')
        // After 1 second => navigate to SearchProject
        setTimeout(() => {
          navigate('/searchproject')
        }, 1000)
      } catch (err) {
        console.error('Error updating project:', err)
        setNotification('Failed to update project.')
      }
    } else {
      // create new
      try {
        await axios.post('/api/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        setNotification('Project created successfully!')
        // reset
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
        setExistingImageUrl(null)
        setExistingInductionUrl(null)
        setSelectedObjectives([])

        // optionally navigate to /searchproject
        setTimeout(() => {
          navigate('/searchproject')
        }, 1000)
      } catch (err) {
        console.error('Error creating project:', err)
        setNotification('Failed to create project.')
      }
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
        paddingTop: '20px',
        minHeight: '100vh',
      }}
    >
      {/* Fixed top navbar with toggler */}
      {/* Local nav for details/objectives/risks */}

      <Navbar
        expand="lg"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 999,
          backgroundColor: SKY_BLUE,
        }}
        className="d-flex d-block justify-content-center align-items-center px-4 py-1"
      >
        <Navbar.Brand
          className="me-0"
          style={{
            color: OCEAN_BLUE,
            fontWeight: 'bold',
            fontSize: '1.50rem',
          }}
        >
          {isEdit ? 'Edit Project' : 'Create Project'}
        </Navbar.Brand>
        <Nav className="mx-auto justify-content-center">
          {/* Hamburger toggler for small screens */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbar.brand"
            aria-controls="navbar.brand"
            aria-expanded="false"
            aria-label="Toggle navigation"
            style={{ backgroundColor: '#F4F7F1' }}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <Nav.Link
            onClick={() => handleNavClick('details')}
            style={{
              fontWeight: activeTab === 'details' ? 'bold' : 'normal',
              color: '#1A1A1A',
              marginRight: '1rem',
            }}
          >
            Details
          </Nav.Link>
          <Nav.Link
            onClick={() => handleNavClick('objectives')}
            style={{
              fontWeight: activeTab === 'objectives' ? 'bold' : 'normal',
              color: '#1A1A1A',
              marginRight: '1rem',
            }}
          >
            Objectives
          </Nav.Link>
          <Nav.Link
            onClick={() => handleNavClick('risks')}
            style={{
              fontWeight: activeTab === 'risks' ? 'bold' : 'normal',
              color: '#1A1A1A',
            }}
          >
            Risks
          </Nav.Link>
        </Nav>
      </Navbar>
      {/* offset content so it isn't behind the fixed navbar */}
      <div style={{ marginTop: '1rem', padding: '1rem' }}>
        {notification && (
          <div className="alert alert-info text-center fs-5">
            {notification}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="row g-4">
            {/* LEFT COLUMN */}
            <div className="col-md-5 p-0 rounded">
              <h4 style={{ color: OCEAN_BLUE }}>{name || '[Project Name]'}</h4>

              <div className="border pt-0 mb-3" style={{ textAlign: 'center' }}>
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="preview"
                    // style={{ maxWidth: '100%', maxHeight: '100px' }}
                  />
                ) : existingImageUrl ? (
                  <img
                    src={`/${existingImageUrl}`}
                    alt="existing"
                    style={{ maxWidth: '100%', maxHeight: '200px' }}
                  />
                ) : (
                  <p className="text-muted fs-5">
                    No image selected or uploaded
                  </p>
                )}
                <div className="mt-2 d-flex justify-content-center">
                  <label htmlFor="imageUpload" className="btn btn-secondary">
                    {imageFile || existingImageUrl
                      ? 'Replace Image'
                      : 'Upload Image'}
                  </label>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0])
                        setExistingImageUrl(null)
                      }
                    }}
                  />
                </div>
              </div>

              <h5>Emergency Services</h5>
              <Form.Group className="mb-3" controlId="emergencyServices">
                <Form.Control
                  required
                  type="text"
                  value={emergencyServices}
                  onChange={(e) => setEmergencyServices(e.target.value)}
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group
                    className="mb-3"
                    controlId="localMedicalCenterAddress"
                  >
                    <Form.Label>Local Medical Center (Address)</Form.Label>
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
                    <Form.Label>Local Medical Center (Phone)</Form.Label>
                    <Form.Control
                      required
                      pattern="^\d{10}$"
                      type="text"
                      value={localMedicalCenterPhone}
                      onChange={(e) =>
                        setLocalMedicalCenterPhone(e.target.value)
                      }
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="localHospital">
                <Form.Label>Local Hospital</Form.Label>
                <Form.Control
                  required
                  type="text"
                  value={localHospital}
                  onChange={(e) => setLocalHospital(e.target.value)}
                />
              </Form.Group>

              {/* Induction doc area */}
              <div className="border p-2">
                <p className="mb-1 fw-bold text-center fs-6">
                  Upload Project Induction Instructions
                </p>
                {inductionFile ? (
                  <div className="mb-2 text-center">
                    <Button
                      variant="primary"
                      onClick={() => {
                        const fileUrl = URL.createObjectURL(inductionFile)
                        window.open(fileUrl, '_blank')
                      }}
                    >
                      View Document
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (
                          !window.confirm(
                            'Are you sure you want to delete the induction doc?'
                          )
                        ) {
                          return
                        }
                        setInductionFile(null)
                        setNotification('Induction doc removed.')
                      }}
                      className="ms-2"
                    >
                      Delete
                    </Button>
                  </div>
                ) : existingInductionUrl ? (
                  <div className="mb-2 text-center">
                    <Button
                      variant="info"
                      onClick={() => {
                        window.open(`/${existingInductionUrl}`, '_blank')
                      }}
                    >
                      View Existing Doc
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => {
                        if (!window.confirm('Remove existing doc?')) return
                        setExistingInductionUrl(null)
                        setNotification(
                          'Existing doc removed. Will be overwritten if you upload a new doc.'
                        )
                      }}
                      className="ms-2"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted text-center">
                    No induction doc uploaded.
                  </p>
                )}

                <div className="d-flex justify-content-center">
                  <label
                    htmlFor="inductionUpload"
                    className="btn btn-secondary"
                  >
                    {inductionFile || existingInductionUrl
                      ? 'Replace Doc'
                      : 'Upload Induction'}
                  </label>
                  <input
                    id="inductionUpload"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setInductionFile(e.target.files[0])
                        setExistingInductionUrl(null)
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="col-md-7 p-3">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="projectName" className="mb-3">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    required
                    type="text"
                    placeholder="Enter project name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </Form.Group>

                <Form.Group className="mb-3 fw-bold">
                  <Form.Label>Objectives</Form.Label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Form.Control
                      readOnly
                      as="textarea"
                      rows={3}
                      value={selectedObjectivesText}
                      placeholder="(No objectives selected)"
                      onClick={openObjModal}
                    />
                    <Button variant="secondary" onClick={openObjModal}>
                      Edit
                    </Button>
                  </div>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group controlId="startDate" className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        required
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={todayString}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="status" className="mb-3">
                      <Form.Label>Status</Form.Label>
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
                      <Form.Label>Primary Contact Name</Form.Label>
                      <Form.Control
                        required
                        type="text"
                        value={primaryContactName}
                        onChange={(e) => setPrimaryContactName(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group
                      className="mb-3"
                      controlId="primaryContactPhone"
                    >
                      <Form.Label>Primary Contact Phone</Form.Label>
                      <Form.Control
                        required
                        pattern="^\d{10}$"
                        type="text"
                        value={primaryContactPhone}
                        onChange={(e) => setPrimaryContactPhone(e.target.value)}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mb-3">
                  <Form.Label>Map Location</Form.Label>
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
                  <Form.Label>Project Location</Form.Label>
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

                <Button
                  type="submit"
                  className="w-100 mt-3"
                  style={{ backgroundColor: OCEAN_BLUE, color: '#fff' }}
                >
                  {isEdit ? 'Save Changes' : 'Save'}
                </Button>
              </Form>
            </div>
          </div>
        )}

        {activeTab === 'objectives' && (
          <div className="p-4">
            <h3>Project Objectives</h3>
            <p>More detailed editor for objectives the user selected.</p>
          </div>
        )}
        {activeTab === 'risks' && (
          <div className="p-4">
            <h3>Project Risks</h3>
            <p>Placeholder for risks tab.</p>
          </div>
        )}
      </div>

      {/* MODAL for objectives */}
      <Modal show={showObjModal} onHide={closeObjModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Select Objectives</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted mb-3 fs-5 fw-bold text-center">
            Please choose objectives related to your project
          </p>
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
        <Modal.Footer className="d-flex justify-content-center">
          <Button variant="success" className="w-50" onClick={closeObjModal}>
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default AddProject
