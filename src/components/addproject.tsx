// src/components/AddProject.tsx
import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import {
  GoogleMap,
  Marker,
  Autocomplete,
  LoadScript,
} from '@react-google-maps/api'
import { Form, Button, Row, Col } from 'react-bootstrap'

type Objective = {
  id: number
  title: string
  measurement: string
}

interface AddProjectProps {
  isSidebarOpen: boolean
}

// For the map
const containerStyle = { width: '100%', height: '300px' }
const defaultCenter = { lat: -36.8485, lng: 174.7633 } // Auckland center?

const AddProject: React.FC<AddProjectProps> = ({ isSidebarOpen }) => {
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState<'inprogress' | 'completed' | 'onhold'>(
    'inprogress'
  )
  const [createdBy, setCreatedBy] = useState<number>()
  const [emergencyServices, setEmergencyServices] = useState(
    '111 will contact all emergency services'
  )
  const [localMedicalCenterAddress, setLocalMedicalCenterAddress] = useState('')
  const [localMedicalCenterPhone, setLocalMedicalCenterPhone] = useState('')
  const [localHospital, setLocalHospital] = useState('')
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [inductionFile, setInductionFile] = useState<File | null>(null)

  // Objectives
  const [allObjectives, setAllObjectives] = useState<Objective[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([])

  // Map
  const [mapCenter, setMapCenter] = useState(defaultCenter)
  const [markerPos, setMarkerPos] = useState(defaultCenter)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null)

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

  // When user picks a place from Autocomplete
  const onPlaceChanged = () => {
    if (autocompleteRef.current !== null) {
      const place = autocompleteRef.current.getPlace()
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat()
        const lng = place.geometry.location.lng()
        setMapCenter({ lat, lng })
        setMarkerPos({ lat, lng })

        // If there's a formatted address, set it to 'location' field
        if (place.formatted_address) {
          setLocation(place.formatted_address)
        }
      }
    }
  }

  // For the map onLoad callback
  const handleMapLoad = (map: google.maps.Map) => {
    setMapRef(map)
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

      if (imageFile) formData.append('image', imageFile)
      if (inductionFile) formData.append('inductionFile', inductionFile)

      const res = await axios.post('/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      alert(`Project created! ID = ${res.data.id}`)

      // Clear form
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
    } catch (error) {
      console.error('Error creating project:', error)
      alert('Failed to create project.')
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
      }}
    >
      <h2>Create Project</h2>

      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Project Name</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>

        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Start Date</Form.Label>
              <Form.Control
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={status}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setStatus(
                    e.target.value as 'inprogress' | 'completed' | 'onhold'
                  )
                }
              >
                <option value="inprogress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="onhold">On Hold</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

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
                onChange={(e) => setLocalMedicalCenterAddress(e.target.value)}
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

        {/* Project Location + Map with Autocomplete */}
        <Form.Group className="mb-3">
          <Form.Label>Project Location</Form.Label>
          <Autocomplete
            onLoad={(auto) => (autocompleteRef.current = auto)}
            onPlaceChanged={onPlaceChanged}
          >
            <Form.Control
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </Autocomplete>
        </Form.Group>

        <div style={{ marginBottom: '20px' }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={12}
            onLoad={handleMapLoad}
          >
            <Marker position={markerPos} />
          </GoogleMap>
        </div>

        {/* Image & Induction doc */}
        <Form.Group className="mb-3">
          <Form.Label>Project Image</Form.Label>
          <Form.Control
            type="file"
            accept="image/*"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files.length > 0) {
                setImageFile(e.target.files[0])
              }
            }}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Induction Document</Form.Label>
          <Form.Control
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files.length > 0) {
                setInductionFile(e.target.files[0])
              }
            }}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Save Project
        </Button>
      </Form>
    </div>
  )
}

export default function WrappedAddProject() {
  return (
    <LoadScript googleMapsApiKey="YOUR_API_KEY" libraries={['places']}>
      <AddProject isSidebarOpen={false} />
    </LoadScript>
  )
}
