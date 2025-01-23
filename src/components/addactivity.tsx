// src/components/AddActivity.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';
import { GoogleMap, Marker, Autocomplete } from '@react-google-maps/api';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Project {
  id: number;
  name: string;
}

interface AddActivityProps {
  isSidebarOpen: boolean;
}

// Basic inline styles for the map
const containerStyle = {
  width: '100%',
  height: '250px',
};

// Default center: Auckland
const centerDefault = { lat: -36.8485, lng: 174.7633 };

const AddActivity: React.FC<AddActivityProps> = ({ isSidebarOpen }) => {
  const navigate = useNavigate();

  // 1) For the initial modal
  const [showModal, setShowModal] = useState(true);
  const handleCloseModal = () => setShowModal(false);

  // 2) Form fields
  const [projectId, setProjectId] = useState<number | null>(null);
  const [activityDate, setActivityDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  // 3) Map + Autocomplete
  const [mapCenter, setMapCenter] = useState(centerDefault);
  const [markerPos, setMarkerPos] = useState(centerDefault);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // 4) Notification / error
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // 5) List of existing projects to populate <select>
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    // fetch all projects so user can select which project to attach this activity
    axios
      .get<Project[]>('/api/projects')
      .then((res) => {
        setProjects(res.data);
      })
      .catch((err) => {
        console.error('Error fetching projects:', err);
        setAlertMessage('Could not load projects.');
      });
  }, []);

  // ========== Google Maps Autocomplete callback =============
  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry) {
        const lat = place.geometry.location?.lat() ?? centerDefault.lat;
        const lng = place.geometry.location?.lng() ?? centerDefault.lng;
        setMapCenter({ lat, lng });
        setMarkerPos({ lat, lng });
        setLocation(place.formatted_address || '');
      }
    }
  };

  // ========== Handle Submit =============
  const handleSaveActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) {
      setAlertMessage('Please choose a project for this Activity.');
      return;
    }
    if (!activityDate) {
      setAlertMessage('Please pick an Activity Date.');
      return;
    }
    try {
      await axios.post('/api/activities', {
        project_id: projectId,
        activity_date: activityDate,
        location,
        notes,
        // If you track createdBy from localStorage, you can add that here:
        // createdBy: localStorage.getItem('adminId') ?? null
      });
      setAlertMessage('Activity saved successfully!');
      // Optional: navigate to your activity detail or search page
      setTimeout(() => {
        navigate('/searchactivity');
      }, 1500);
    } catch (error) {
      console.error('Error saving activity:', error);
      setAlertMessage('Failed to save activity.');
    }
  };

  // ========== Render =============
  return (
    <div
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s',
        padding: '1rem',
      }}
    >
      {/* INITIAL MODAL on page load */}
      <Modal show={showModal} onHide={handleCloseModal} backdrop="static" keyboard={false}>
        <Modal.Header>
          <Modal.Title>Create New Activity or Go to List</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please choose one of the following options:</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => {
              // close modal & remain on this page to create new
              setShowModal(false);
            }}
          >
            Create New Activity
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              // user wants to go to the list
              navigate('/searchactivity');
            }}
          >
            Go to List
          </Button>
        </Modal.Footer>
      </Modal>

      <h2 style={{ color: '#0094B6', fontWeight: 'bold' }}>Add Activity</h2>
      {alertMessage && <Alert variant="info">{alertMessage}</Alert>}

      <Form onSubmit={handleSaveActivity}>
        {/* Project dropdown */}
        <Form.Group className="mb-3" controlId="projectSelect">
          <Form.Label>Select Project</Form.Label>
          <Form.Select
            value={projectId ?? ''}
            onChange={(e) => setProjectId(Number(e.target.value) || null)}
            required
          >
            <option value="">--Choose a project--</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Activity Date */}
        <Form.Group className="mb-3" controlId="activityDate">
          <Form.Label>Activity Date</Form.Label>
          <Form.Control
            type="date"
            value={activityDate}
            onChange={(e) => setActivityDate(e.target.value)}
            required
          />
        </Form.Group>

        {/* Google Map */}
        <div className="mb-3">
          <Form.Label>Location (Autocomplete)</Form.Label>
          <Autocomplete
            onLoad={(auto) => (autocompleteRef.current = auto)}
            onPlaceChanged={handlePlaceChanged}
          >
            <Form.Control
              type="text"
              placeholder="Type an address..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </Autocomplete>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={12}
            onClick={(e) => {
              if (e.latLng) {
                const lat = e.latLng.lat();
                const lng = e.latLng.lng();
                setMarkerPos({ lat, lng });
                setMapCenter({ lat, lng });
              }
            }}
          >
            <Marker position={markerPos} />
          </GoogleMap>
        </div>

        {/* Notes field */}
        <Form.Group className="mb-3" controlId="notes">
          <Form.Label>Activity Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any relevant notes here..."
          />
        </Form.Group>

        {/* Save button */}
        <Button type="submit" style={{ backgroundColor: '#0094B6' }}>
          Save Activity
        </Button>
      </Form>
    </div>
  );
};

export default AddActivity;
