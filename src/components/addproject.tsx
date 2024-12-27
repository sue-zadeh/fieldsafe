// src/components/AddProject.tsx
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  GoogleMap,
  Marker,
  Autocomplete,
  LoadScript,
} from '@react-google-maps/api'
import { Navbar, Nav, Form, Button, Col, Row } from 'react-bootstrap'

// color palette
const OCEAN_BLUE = '#0094B6'
const SKY_BLUE = '#76D6E2'
const FOREST_GREEN = '#738c40'

type ProjectStatus = 'inprogress' | 'completed' | 'onhold'

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
  lat: -37.8136, // Melbourne
  lng: 144.9631,
}
interface AddProjectProps {
  isSidebarOpen: boolean
}

const AddProject: React.FC<AddProjectProps> = ({ isSidebarOpen }) => {
  const [activeTab, setActiveTab] = useState('details')

  // form fields
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('inprogress')
  // Objectives
  const [allObjectives, setAllObjectives] = useState<Objective[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([])
  const [location, setLocation] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [inductionFile, setInductionFile] = useState<File | null>(null)
  const [createdBy, setCreatedBy] = useState<number>()
  const [emergencyServices, setEmergencyServices] = useState(
    '111 will contact all emergency services'
  )
  const [localMedicalCenterAddress, setLocalMedicalCenterAddress] = useState('')
  const [localMedicalCenterPhone, setLocalMedicalCenterPhone] = useState('')
  const [localHospital, setLocalHospital] = useState('')
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')

  useEffect(() => {
    // Load admin ID
    const adminId = localStorage.getItem('adminId')
    if (adminId) {
      setCreatedBy(parseInt(adminId, 10))
    }
    // Load objectives
    axios
      .get('/api/objectives')
      .then((res) => setAllObjectives(res.data))
      .catch((err) => console.error('Error fetching objectives:', err))
  }, [])

  const handleCheckboxChange = (objId: number) => {
    setSelectedObjectives((prev) =>
      prev.includes(objId)
        ? prev.filter((id) => id !== objId)
        : [...prev, objId]
    )
  }

  // map stuff
  const [mapCenter, setMapCenter] = useState(centerDefault)
  const [markerPos, setMarkerPos] = useState(centerDefault)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const handleNavClick = (tab: string) => setActiveTab(tab)

  const handlePlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace()
      if (place && place.geometry) {
        const lat = place.geometry.location?.lat() || centerDefault.lat
        const lng = place.geometry.location?.lng() || centerDefault.lng

        setMapCenter({ lat, lng })
        setMarkerPos({ lat, lng })

        setLocation(place.formatted_address || '')
      } else {
        console.log('No geometry for that place')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
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
      // Convert objectives array -> JSON string
      formData.append('objectives', JSON.stringify(selectedObjectives))
      //formData for uploding immage and induction
      if (imageFile) formData.append('image', imageFile)
      if (inductionFile) formData.append('inductionFile', inductionFile)

      const res = await axios.post('/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert('Project created successfully! ID=' + res.data.id)

      // clear form
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
      alert('Failed to create project. Check console.')
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        paddingTop: '20px',
        transition: 'margin 0.3s ease',
        minHeight: '100vh',
      }}
    >
      {' '}
      {/* top navbar */}
      <Navbar bg="light" expand="lg" style={{ backgroundColor: SKY_BLUE }}>
        <Navbar.Brand style={{ color: OCEAN_BLUE, fontWeight: 'bold' }}>
          Create Project
        </Navbar.Brand>
        <Nav className="ml-auto">
          <Nav.Link
            onClick={() => handleNavClick('details')}
            style={{
              fontWeight: activeTab === 'details' ? 'bold' : 'normal',
              color: FOREST_GREEN,
            }}
          >
            Details
          </Nav.Link>
          <Nav.Link
            onClick={() => handleNavClick('objectives')}
            style={{
              fontWeight: activeTab === 'objectives' ? 'bold' : 'normal',
              color: FOREST_GREEN,
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
        <div className="row mt-4">
          {/* left side preview */}
          <div className="col-md-6 mb-4">
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
                <p className="text-muted">Click to upload project image</p>
              )}
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

            {/* Emergency / Local Info */}
            <Form.Group className="mb-3">
              <Form.Label>Emergency Services</Form.Label>
              <Form.Control
                type="text"
                value={emergencyServices}
                onChange={(e) => setEmergencyServices(e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Local Medical Center (Address)</Form.Label>
                  <Form.Control
                    type="text"
                    value={localMedicalCenterAddress}
                    onChange={(e) =>
                      setLocalMedicalCenterAddress(e.target.value)
                    }
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Local Medical Center (Phone)</Form.Label>
                  <Form.Control
                    type="text"
                    value={localMedicalCenterPhone}
                    onChange={(e) => setLocalMedicalCenterPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Local Hospital</Form.Label>
              <Form.Control
                type="text"
                value={localHospital}
                onChange={(e) => setLocalHospital(e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Contact Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={primaryContactName}
                    onChange={(e) => setPrimaryContactName(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Primary Contact Phone</Form.Label>
                  <Form.Control
                    type="text"
                    value={primaryContactPhone}
                    onChange={(e) => setPrimaryContactPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="border p-2">
              <p className="mb-1 fw-bold">
                Upload Project Induction Instructions
              </p>
              {inductionFile ? (
                <p>{inductionFile.name}</p>
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

          {/* right side form */}
          <div className="col-md-6">
            <Form onSubmit={handleSubmit}>
              <Form.Group controlId="projectName" className="mb-3">
                <Form.Label>Project Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter project name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Group>

              {/* Objectives checklist */}
              <Form.Group className="mb-3">
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

              {/* location + map */}
              <Form.Group controlId="location" className="mb-3">
                <Form.Label>Project Location</Form.Label>
                {/* The Autocomplete component from @react-google-maps/api */}
                <Autocomplete
                  onLoad={(autocomplete) =>
                    (autocompleteRef.current = autocomplete)
                  }
                  onPlaceChanged={handlePlaceChanged}
                >
                  <Form.Control
                    type="text"
                    placeholder="Type an address"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </Autocomplete>
              </Form.Group>

              <div style={{ width: '100%', height: '200px' }}>
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={mapCenter}
                  zoom={12}
                >
                  <Marker position={markerPos} />
                </GoogleMap>
              </div>

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
          <p>... placeholder content ...</p>
        </div>
      )}
      {activeTab === 'risks' && (
        <div className="p-4">
          <h3>Project Risks</h3>
          <p>... placeholder content ...</p>
        </div>
      )}
    </div>
  )
}

export default function WrappedAddProject() {
  return (
    <LoadScript
      googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY"
      libraries={['places']}
    >
      <AddProject />
    </LoadScript>
  )
}
