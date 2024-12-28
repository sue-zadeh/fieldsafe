// src/components/AddProject.tsx
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api'
import { Navbar, Nav, Form, Button, Col, Row } from 'react-bootstrap'

// color palette
const OCEAN_BLUE = '#0094B6'
const SKY_BLUE = '#76D6E2'
const FOREST_GREEN = '#738c40'

// the statuses
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

  // objectives
  const [allObjectives, setAllObjectives] = useState<Objective[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([])

  // location & map
  const [location, setLocation] = useState('')
  const [mapCenter, setMapCenter] = useState(centerDefault)
  const [markerPos, setMarkerPos] = useState(centerDefault)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  // emergency & local contacts
  const [emergencyServices, setEmergencyServices] = useState(
    '111 will contact all emergency services'
  )
  const [localMedicalCenterAddress, setLocalMedicalCenterAddress] = useState('')
  const [localMedicalCenterPhone, setLocalMedicalCenterPhone] = useState('')
  const [localHospital, setLocalHospital] = useState('')
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')

  // files
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [inductionFile, setInductionFile] = useState<File | null>(null)

  // createdBy
  const [createdBy, setCreatedBy] = useState<number | null>(null)

  useEffect(() => {
    // load admin ID from localStorage
    const adminId = localStorage.getItem('adminId')
    if (adminId) {
      setCreatedBy(Number(adminId))
    }

    // fetch objectives from /api/objectives
    axios
      .get('/api/objectives')
      .then((res) => setAllObjectives(res.data))
      .catch((err) => console.error('Error fetching objectives:', err))
  }, [])

  const handleNavClick = (tab: string) => setActiveTab(tab)

  const handleCheckboxChange = (objId: number) => {
    setSelectedObjectives((prev) =>
      prev.includes(objId)
        ? prev.filter((id) => id !== objId)
        : [...prev, objId]
    )
  }

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace()
      if (place && place.geometry) {
        const lat = place.geometry.location?.lat() ?? centerDefault.lat
        const lng = place.geometry.location?.lng() ?? centerDefault.lng

        setMapCenter({ lat, lng })
        setMarkerPos({ lat, lng })
        setLocation(place.formatted_address || '')
      } else {
        console.log('No geometry for that place or place is null')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // build form data
      const formData = new FormData()
      formData.append('name', name)
      formData.append('location', location)
      formData.append('startDate', startDate)
      formData.append('status', status)
      if (createdBy) {
        formData.append('createdBy', String(createdBy))
      }
      formData.append('emergencyServices', emergencyServices)
      formData.append('localMedicalCenterAddress', localMedicalCenterAddress)
      formData.append('localMedicalCenterPhone', localMedicalCenterPhone)
      formData.append('localHospital', localHospital)
      formData.append('primaryContactName', primaryContactName)
      formData.append('primaryContactPhone', primaryContactPhone)
      formData.append('objectives', JSON.stringify(selectedObjectives))

      if (imageFile) formData.append('image', imageFile)
      if (inductionFile) formData.append('inductionFile', inductionFile)

      const res = await axios.post('/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('Project created successfully! ID=' + res.data.id)

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
      setSelectedObjectives([])
    } catch (err) {
      console.error('Error creating project:', err)
      alert('Failed to create project. See console.')
    }
  }

  // styling for the local nav
  const stickyNavStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    zIndex: 999,
    backgroundColor: SKY_BLUE,
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
      {/* local navbar for details/objectives/risks */}
      <Navbar
        expand="lg"
        style={stickyNavStyle}
        className="mb-2 px-5 text-left "
      >
        <Navbar.Brand
          style={{
            color: OCEAN_BLUE,
            fontWeight: 'bold',
            width: '100%',
            fontSize: '1.8rem',
          }}
        >
          Create Project
        </Navbar.Brand>
        <Nav className="mx-auto">
          {' '}
          {/* center nav items */}
          <Nav.Link
            onClick={() => handleNavClick('details')}
            style={{
              fontWeight: activeTab === 'details' ? 'bold' : 'normal',
              color: FOREST_GREEN,
              marginRight: '2rem',
              textAlign: 'left',
              padding: '0.5rem 2rem',
              position: 'relative' ,            }}
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

            {/* EMERGENCY / LOCAL INFO */}
            <h4>Emergency Services</h4>
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
                    pattern="^[0-9+()\-\s]*$"
                    type="text"
                    value={localMedicalCenterPhone}
                    onChange={(e) => setLocalMedicalCenterPhone(e.target.value)}
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

            {/* Induction doc */}
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
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              {/* CHECKLIST OF OBJECTIVES */}
              <Form.Group className="mb-3" controlId="objectivesCheck">
                <Form.Label>Objectives (check all that apply)</Form.Label>
                <div className="d-flex flex-wrap">
                  {allObjectives.map((obj) => (
                    <Form.Check
                      key={obj.id}
                      type="checkbox"
                      label={`${obj.title} (${obj.measurement})`}
                      checked={selectedObjectives.includes(obj.id)}
                      onChange={() => handleCheckboxChange(obj.id)}
                      className="me-4 mb-2"
                    />
                  ))}
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
                  <Form.Group className="mb-3" controlId="primaryContactPhone">
                    <Form.Label>Primary Contact Phone</Form.Label>
                    <Form.Control
                      required
                      pattern="^[0-9+()\-\s]*$"
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
            Here you might display a more detailed editor for the objectives the
            user selected.
          </p>
        </div>
      )}
      {activeTab === 'risks' && (
        <div className="p-4">
          <h3>Project Risks</h3>
          <p>Placeholder content for risks tab.</p>
        </div>
      )}
    </div>
  )
}

export default AddProject
