// src/components/AddProject.tsx

import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios, { AxiosError } from 'axios'
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api'
import AddObjectives from './addobjective'
import AddRisk from './addrisk'
import AddHazard from './addhazard'
import {
  Navbar,
  Nav,
  Form,
  Button,
  Col,
  Row,
  Modal,
  Alert,
  ListGroup,
} from 'react-bootstrap'

const OCEAN_BLUE = '#0094B6'

type ProjectStatus = 'inprogress' | 'completed' | 'onhold' | 'archived'

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
  imageUrl?: string
  inductionFileUrl?: string
}

// Google map container
const containerStyle = {
  width: '100%',
  height: '200px',
}

// Auckland default
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

  // Form fields
  const [name, setName] = useState('')
  const [startDate, setStartDate] = useState('')
  const [status, setStatus] = useState<ProjectStatus>('inprogress')
  const [expanded, setExpanded] = useState(false)

  const [notification, setNotification] = useState<string | null>(null)

  const [allObjectives, setAllObjectives] = useState<Objective[]>([])
  const [selectedObjectives, setSelectedObjectives] = useState<number[]>([])
  const [location, setLocation] = useState('')
  const [mapCenter, setMapCenter] = useState(centerDefault)
  const [markerPos, setMarkerPos] = useState(centerDefault)
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null)

  const [emergencyServices, setEmergencyServices] = useState(
    '111 will contact all emergency services'
  )
  const [localMedicalCenterAddress, setLocalMedicalCenterAddress] = useState('')
  const [localMedicalCenterPhone, setLocalMedicalCenterPhone] = useState('')
  const [localHospital, setLocalHospital] = useState('')
  const [primaryContactName, setPrimaryContactName] = useState('')
  const [primaryContactPhone, setPrimaryContactPhone] = useState('')
  const [imageUrl, setimageUrl] = useState('')

  // Files
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [inductionFile, setInductionFile] = useState<File | null>(null)
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null)
  const [existingInductionUrl, setExistingInductionUrl] = useState<
    string | null
  >(null)

  // Original data for no-changes detection
  const [originalData, setOriginalData] = useState<OriginalData | null>(null)

  // For objectives modal
  const [showObjModal, setShowObjModal] = useState(false)
  const todayString = new Date().toISOString().split('T')[0]

  // Tab switching
  const [activeTab, setActiveTab] = useState('details')
  const handleNavClick = (tab: string) => setActiveTab(tab)

  // LOAD objectives and project data if editing
  useEffect(() => {
    axios /// fetch objectives
      .get('/api/objectives')
      .then((res) => setAllObjectives(res.data))
      .catch((err) => console.error('Error fetching objectives:', err))

    if (locationState?.isEdit && locationState.projectId) {
      setIsEdit(true)
      setProjectId(locationState.projectId)
      axios
        .get(`/api/projects/${locationState.projectId}`)
        .then((res) => {
          const { project, objectiveIds } = res.data
          setName(project.name || '')
          setStartDate(project.startDate.slice(0, 10))
          setStatus(project.status || 'inprogress')
          setimageUrl(project.imageUrl || '')
          setInductionFile(project.inductionFileUrl || '')
          setLocation(project.location || '')
          setEmergencyServices(project.emergencyServices || '')
          setLocalMedicalCenterAddress(project.localMedicalCenterAddress || '')
          setLocalMedicalCenterPhone(project.localMedicalCenterPhone || '')
          setLocalHospital(project.localHospital || '')
          setPrimaryContactName(project.primaryContactName || '')
          setPrimaryContactPhone(project.primaryContactPhone || '')

          if (project.imageUrl) setExistingImageUrl(project.imageUrl)
          if (project.inductionFileUrl)
            setExistingInductionUrl(project.inductionFileUrl)

          setSelectedObjectives(objectiveIds || [])

          setOriginalData({
            name: project.name,
            location: project.location,
            startDate: (project.startDate || '').slice(0, 10),
            status: project.status,
            imageUrl: project.imageUrl,
            inductionFileUrl: project.inductionFileUrl,
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

  // re-fetch objectives so we can see new ones immediately
  const reloadObjectives = async () => {
    try {
      const response = await axios.get('/api/objectives')
      setAllObjectives(response.data)
    } catch (err) {
      console.error('Error reloading objectives:', err)
    }
  }

  // Auto-clear notification after 10s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Helper to show a notification
  const notify = (msg: string) => setNotification(msg)

  const toggleObjective = (objId: number) => {
    setSelectedObjectives((prev) =>
      prev.includes(objId) ? prev.filter((x) => x !== objId) : [...prev, objId]
    )
  }
  const openObjModal = () => setShowObjModal(true)
  const closeObjModal = () => setShowObjModal(false)

  const selectedObjectivesText = allObjectives
    .filter((obj) => selectedObjectives.includes(obj.id))
    .map((o) => `${o.title} (${o.measurement})`)
    .join('\n')

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

  // Navigate back to search after success
  const navigateToSearch = () => navigate('/searchproject')

  // ===========================
  //       CREATE OR EDIT
  // ===========================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // validations
    if (!name || !location || !startDate || !emergencyServices) {
      notify('All fields are required, including Emergency Services.')
      return
    }
    if (!/^[+\d]+$/.test(primaryContactPhone)) {
      notify(
        'Primary Contact Phone must contain only numbers and may start with +.'
      )
      return
    }

    if (!/^[+\d]+$/.test(localMedicalCenterPhone)) {
      notify(
        'Local Medical Center Phone must contain only numbers and may start with +.'
      )
      return
    }
    // check uniqueness if not editing
    if (!isEdit) {
      try {
        const checkRes = await axios.get(
          `/api/projects?name=${encodeURIComponent(name)}`
        )
        if (checkRes.data?.exists) {
          notify('Project name already exists. Please choose another.')
          return
        }
      } catch (error) {
        console.warn('Client uniqueness check error:', error)
      }
    }

    // Build formData
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

    if (imageFile) formData.append('image', imageFile)
    if (inductionFile) formData.append('inductionFile', inductionFile)

    // If editing => PUT
    if (isEdit && projectId) {
      // check for no changes first:
      if (originalData) {
        const isNoChange =
          originalData.name === name &&
          originalData.location === location &&
          originalData.startDate === startDate &&
          originalData.status === status &&
          originalData.imageUrl === imageUrl &&
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

      try {
        await axios.put(`/api/projects/${projectId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        notify('Project updated successfully!')
        setTimeout(() => {
          navigate('/searchproject', {
            state: {
              redirectTo:
                status === 'archived' ? 'archiveprojects' : 'activeprojects',
            },
          })
        }, 1000)
      } catch (err) {
        const axiosErr = err as AxiosError<{ message: string }>
        if (axiosErr.response?.status === 400) {
          notify('Project name already exists. Please choose another.')
        } else {
          console.error('Error updating project:', err)
          notify('Failed to update project.')
        }
      }
    } else {
      // CREATE
      try {
        await axios.post('/api/projects', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })

        notify('Project created successfully!')

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

        setTimeout(() => {
          navigate('/searchproject', {
            state: {
              redirectTo:
                status === 'archived' ? 'archiveprojects' : 'activeprojects',
            },
          })
        }, 1000)
      } catch (err) {
        const axiosErr = err as AxiosError<{ message: string }>
        if (axiosErr.response?.status === 400) {
          notify('Project name already exists. Please choose another.')
        } else {
          console.error('Error creating project:', err)
          notify('Failed to create project.')
        }
      }
    }
  }

  // ===========================
  //   SAVE as a new project in edit page
  // ===========================
  const handleSaveAsNewProject = async () => {
    // This duplicates the current form data into a new project
    if (!name || !location || !startDate || !emergencyServices) {
      notify('All fields are required, including Emergency Services.')
      return
    }
    if (!/^[+\d]+$/.test(primaryContactPhone)) {
      notify(
        'Primary Contact Phone must contain only numbers and may start with +.'
      )
      return
    }
    if (!/^[+\d]+$/.test(localMedicalCenterPhone)) {
      notify(
        'Local Medical Center Phone must contain only numbers and may start with +.'
      )
      return
    }

    try {
      const checkRes = await axios.get(
        `/api/projects?name=${encodeURIComponent(name)}`
      )
      if (checkRes.data?.exists) {
        notify('Project name already exists. Please choose another.')
        return
      }
    } catch (error) {
      console.warn('Uniqueness check error (save as new):', error)
    }

    // Build new formData
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

    if (imageFile) formData.append('image', imageFile)
    if (inductionFile) formData.append('inductionFile', inductionFile)

    try {
      await axios.post('/api/projects', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      notify('Project duplicated successfully!')
      setTimeout(navigateToSearch, 1000)
    } catch (err) {
      const axiosErr = err as AxiosError<{ message: string }>
      if (axiosErr.response?.status === 400) {
        notify('Project name already exists. Please choose another.')
      } else {
        console.error('Error duplicating project:', err)
        notify('Failed to duplicate project.')
      }
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '30px',
        transition: 'margin 0.3s ease',
        paddingTop: '2px',
        height: '100vh',
        width: '98%',
      }}
    >
      {/* Nav bar for projects page */}
      <Navbar
        collapseOnSelect
        expand="lg"
        expanded={expanded} // controls open/close
        onToggle={setExpanded} // updates state when nav is clicked
        style={{
          backgroundColor: '#c4edf2',
          width: '100%',
        }}
        className="py-2"
      >
        {/* Hamburger menu Toggle for small screens */}
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          style={{ backgroundColor: '#F4F7F1' }}
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto justify-content-center">
            <Nav.Link
              onClick={() => {
                handleNavClick('details')
                setExpanded(false) // close the nav
              }}
              style={{
                fontWeight: activeTab === 'details' ? 'bold' : 'normal',
                color: '#1A1A1A',
                marginRight: '1rem',
              }}
            >
              Details
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                handleNavClick('objectives')
                setExpanded(false) // close the nav
              }}
              style={{
                fontWeight: activeTab === 'objectives' ? 'bold' : 'normal',
                color: '#1A1A1A',
                marginRight: '1rem',
              }}
            >
              add Objectives
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                handleNavClick('hazards')
                setExpanded(false) // close the nav
              }}
              style={{
                fontWeight: activeTab === 'hazards' ? 'bold' : 'normal',
                color: '#1A1A1A',
                marginRight: '1rem',
              }}
            >
              Add Hazards
            </Nav.Link>
            <Nav.Link
              onClick={() => {
                handleNavClick('risks')
                setExpanded(false) // close the nav
              }}
              style={{
                fontWeight: activeTab === 'risks' ? 'bold' : 'normal',
                color: '#1A1A1A',
              }}
            >
              Add Risks
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
      {/* END Secondary Nav */}

      <div>
        <h3
          className="m-2 fw-4"
          style={{
            color: OCEAN_BLUE,
            fontWeight: 'bold',
          }}
        >
          {activeTab === 'details'
            ? isEdit
              ? 'Edit Project'
              : 'Create Project'
            : ''}
        </h3>
      </div>

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

      <div style={{ marginTop: '2rem' }}>
        {activeTab === 'details' && (
          <div className="row">
            {/* MAIN FORM - on the LEFT on desktops (order-md-1), but FIRST on mobile (order-1) */}
            <div className="col-md-7 order-1 order-md-1 form-container bg-white rounded shadow px-3 pt-0">
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="projectName" className="my-3 fw-bold">
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
                      rows={2}
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
                        name="startDate"
                        value={startDate || ''}
                        onChange={(e) => setStartDate(e.target.value)}
                        min={!isEdit ? todayString : undefined}
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
                        <option value="archived">Archived</option>
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
                        type="text"
                        value={primaryContactPhone}
                        onChange={(e) => setPrimaryContactPhone(e.target.value)}
                        placeholder="phone number (+ allowed)"
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

                {/* If editing => show two buttons: "Save Changes" and "Save as New Project" */}
                {isEdit ? (
                  <div className="d-flex flex-column pb-3 fs-5 gap-2">
                    <Button
                      type="submit"
                      style={{ backgroundColor: OCEAN_BLUE, color: '#fff' }}
                    >
                      Save Changes
                    </Button>
                    <Button variant="warning" onClick={handleSaveAsNewProject}>
                      Save as New Project
                    </Button>
                  </div>
                ) : (
                  /* If creating => single "Save" button */
                  <Button
                    type="submit"
                    className="w-100 m-3 fs-5"
                    style={{ backgroundColor: OCEAN_BLUE, color: '#fff' }}
                  >
                    Save
                  </Button>
                )}
              </Form>
            </div>

            {/* SMALLER SIDE - on the RIGHT on desktops (order-md-2), but SECOND on mobile (order-2) */}
            <div className="col-md-5 order-2 order-md-2 p-0 rounded p-3">
              <h4 style={{ color: OCEAN_BLUE }}>{name || '[Project Name]'}</h4>

              <div className="border pt-0 mb-3 text-center">
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="preview"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                    }}
                  />
                ) : existingImageUrl ? (
                  <img
                    src={`/${existingImageUrl}`}
                    alt="existing"
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '200px',
                    }}
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
                    <Form.Label>
                      Local Medical Center * <br />
                      (Address)
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
                    <Form.Label>
                      Local Medical Center <br />
                      (Phone) *
                    </Form.Label>
                    <Form.Control
                      required
                      type="text"
                      value={localMedicalCenterPhone}
                      onChange={(e) =>
                        setLocalMedicalCenterPhone(e.target.value)
                      }
                      placeholder="phone number (+ allowed)"
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
                        )
                          return
                        setInductionFile(null)
                        notify('Induction doc removed.')
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
                        notify(
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
          </div>
        )}

        {/* Additional tabs: Objectives, Hazards, Risks */}
        {activeTab === 'objectives' && (
          <div className="py-2">
            {/* Pass a callback so child can refresh objectives */}
            <AddObjectives
              isSidebarOpen={isSidebarOpen}
              onNewObjectiveCreated={reloadObjectives}
              onObjectivesChanged={reloadObjectives}
              onObjectivesEdited={reloadObjectives}
            />
          </div>
        )}
        {activeTab === 'hazards' && (
          <div className="d-f column pt-2">
            <AddHazard isSidebarOpen={isSidebarOpen} />
          </div>
        )}
        {activeTab === 'risks' && (
          <div className="d-f column pt-2">
            <AddRisk isSidebarOpen={isSidebarOpen} />
          </div>
        )}
      </div>

      {/* Modal for objectives */}
      <Modal show={showObjModal} onHide={closeObjModal} size="sm">
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
                className="d-flex justify-content-between align-items-center text-wrap"
                style={{
                  maxHeight: '400px',
                  overflowY: 'auto',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
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
