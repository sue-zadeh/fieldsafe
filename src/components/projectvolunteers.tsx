import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Volunteer {
  id: number
  firstname: string
  lastname: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
}

interface VolunteerTabProps {
  projectId: number
  isSidebarOpen: boolean
  projectName: string
}

const VolunteerTab: React.FC<VolunteerTabProps> = ({
  projectId,
  isSidebarOpen,
}) => {
  const [unassignedVolunteers, setUnassignedVolunteers] = useState<Volunteer[]>(
    []
  )
  const [projectVolunteers, setProjectVolunteers] = useState<Volunteer[]>([])
  const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([])

  // Fetch unassigned volunteers
  useEffect(() => {
    const fetchUnassignedVolunteers = async () => {
      try {
        const res = await axios.get(`/api/unassigned_volunteer/${projectId}`)
        setUnassignedVolunteers(res.data)
      } catch (err) {
        console.error('Error fetching unassigned volunteers:', err)
      }
    }

    fetchUnassignedVolunteers()
  }, [projectId, projectVolunteers])

  // Fetch volunteers assigned to the project
  useEffect(() => {
    const fetchProjectVolunteers = async () => {
      try {
        const res = await axios.get(`/api/project_volunteer/${projectId}`)
        setProjectVolunteers(res.data)
      } catch (err) {
        console.error('Error fetching project volunteers:', err)
      }
    }

    fetchProjectVolunteers()
  }, [projectId])

  // Add selected volunteers to the project
  const handleAddVolunteers = async () => {
    if (selectedVolunteers.length === 0) return

    try {
      await axios.post('/api/project_volunteer', {
        project_id: projectId,
        volunteer_ids: selectedVolunteers,
      })

      // Refresh volunteers
      const res = await axios.get(`/api/project_volunteer/${projectId}`)
      setProjectVolunteers(res.data)
      setSelectedVolunteers([])
    } catch (err) {
      console.error('Error assigning volunteers to project:', err)
    }
  }

  // Remove a volunteer from the project
  const handleRemoveVolunteer = async (id: number) => {
    const volunteerToRemove = projectVolunteers.find((v) => v.id === id)
    if (!volunteerToRemove) return

    const confirmRemoval = window.confirm(
      `Are you sure you want to remove ${volunteerToRemove.firstname} ${volunteerToRemove.lastname} from this project?`
    )
    if (!confirmRemoval) return

    try {
      await axios.delete(`/api/project_volunteer/${id}`)
      setProjectVolunteers((prev) =>
        prev.filter((volunteer) => volunteer.id !== id)
      )
    } catch (err) {
      console.error('Error removing volunteer from project:', err)
    }
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <h3 className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        Assign Volunteers to Project
      </h3>
      <h5 style={{ marginBottom: '1rem' }}>
        Hold the Ctrl key (or Cmd key on Mac) to select multiple options.
      </h5>

      <div className="mb-3 w-50">
        <h5 style={{ color: '#0094B6' }}>Available Volunteers</h5>
        <select
          className="form-select"
          multiple
          value={selectedVolunteers.map(String)}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(
              (opt) => Number(opt.value)
            )
            setSelectedVolunteers(selectedOptions)
          }}
        >
          {unassignedVolunteers.length > 0 ? (
            unassignedVolunteers.map((volunteer) => (
              <option key={volunteer.id} value={volunteer.id}>
                {volunteer.firstname} {volunteer.lastname}
              </option>
            ))
          ) : (
            <option disabled>No available volunteers</option>
          )}
        </select>

        <button
          style={{ backgroundColor: '#0094B6' }}
          className="btn btn-primary btn-sm mt-2"
          onClick={handleAddVolunteers}
          disabled={selectedVolunteers.length === 0}
        >
          Add Selected Volunteers
        </button>
      </div>

      <table
        className="table table-striped table-hover btn-sm"
        style={{ width: '80%' }}
      >
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Emergency Contact</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projectVolunteers.map((volunteer) => (
            <tr key={volunteer.id}>
              <td>{`${volunteer.firstname} ${volunteer.lastname}`}</td>
              <td>{volunteer.phone}</td>
              <td>
                {volunteer.emergencyContact} <br />
                {volunteer.emergencyContactNumber}
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveVolunteer(volunteer.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default VolunteerTab
