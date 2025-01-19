import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Staff {
  id: number
  firstname: string
  lastname: string
  phone: string
  role: string
}

interface StaffTabProps {
  projectId: number
}

const StaffTab: React.FC<StaffTabProps> = ({ projectId }) => {
  const [unassignedStaff, setUnassignedStaff] = useState<Staff[]>([])
  const [projectStaffs, setProjectStaffs] = useState<Staff[]>([])
  const [selectedGroupAdmin, setSelectedGroupAdmin] = useState<number | null>(
    null
  )
  const [selectedFieldStaff, setSelectedFieldStaff] = useState<number | null>(
    null
  )
  const [selectedTeamLeader, setSelectedTeamLeader] = useState<number | null>(
    null
  )

  // Fetch unassigned staff for the project
  useEffect(() => {
    const fetchUnassignedStaff = async () => {
      try {
        const res = await axios.get(`/api/unassigned_staff/${projectId}`)
        setUnassignedStaff(res.data) // Unassigned staff for the dropdown
      } catch (err) {
        console.error('Error fetching unassigned staff:', err)
      }
    }

    fetchUnassignedStaff()
  }, [projectId, projectStaffs]) // Re-fetch unassigned staff whenever projectStaffs change

  // Fetch staff already assigned to the project
  useEffect(() => {
    const fetchProjectStaffs = async () => {
      try {
        const res = await axios.get(`/api/project_staff/${projectId}`)
        setProjectStaffs(res.data) // Staff assigned to the project
      } catch (err) {
        console.error('Error fetching project staffs:', err)
      }
    }

    fetchProjectStaffs()
  }, [projectId])

  // Add staff to the project
  const handleAddStaff = async (staffId: number | null) => {
    if (!staffId) return

    try {
      await axios.post('/api/project_staff', {
        project_id: projectId,
        staff_id: staffId,
      })
      // Refresh the project staff list
      const res = await axios.get(`/api/project_staff/${projectId}`)
      setProjectStaffs(res.data)
      // Reset dropdowns
      setSelectedGroupAdmin(null)
      setSelectedFieldStaff(null)
      setSelectedTeamLeader(null)
    } catch (err) {
      console.error('Error assigning staff to project:', err)
    }
  }

  // Remove staff from the project
  const handleRemoveStaff = async (id: number) => {
    const staffToRemove = projectStaffs.find((staff) => staff.id === id)
    if (!staffToRemove) return

    const confirmRemoval = window.confirm(
      `Are you sure you want to remove ${staffToRemove.firstname} ${staffToRemove.lastname} from this project?`
    )
    if (!confirmRemoval) return

    try {
      await axios.delete(`/api/project_staff/${id}`)
      setProjectStaffs((prev) => prev.filter((staff) => staff.id !== id))
    } catch (err) {
      console.error('Error removing staff from project:', err)
    }
  }

  // Filter unassigned staff by role
  const filterUnassignedStaffByRole = (role: string) => {
    return unassignedStaff.filter((staff) => staff.role === role)
  }

  return (
    <div>
      <h3>Assign Staff to Project</h3>
      <p className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        Selected Project: {projectId}
      </p>

      {/* Dropdowns for each staff type */}
      <div className="row mb-3">
        {/* Group Admins */}
        <div className="col-md-4">
          <h5>Group Admins</h5>
          <select
            className="form-select mb-2"
            value={selectedGroupAdmin || ''}
            onChange={(e) => setSelectedGroupAdmin(Number(e.target.value))}
          >
            <option value="">Select a Group Admin</option>
            {filterUnassignedStaffByRole('Group Admin').map((staff) => (
              <option key={staff.id} value={staff.id}>
                {`${staff.firstname} ${staff.lastname}`}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleAddStaff(selectedGroupAdmin)}
            disabled={!selectedGroupAdmin}
          >
            Add Group Admin
          </button>
        </div>

        {/* Field Staff */}
        <div className="col-md-4">
          <h5>Field Staff</h5>
          <select
            className="form-select mb-2"
            value={selectedFieldStaff || ''}
            onChange={(e) => setSelectedFieldStaff(Number(e.target.value))}
          >
            <option value="">Select a Field Staff</option>
            {filterUnassignedStaffByRole('Field Staff').map((staff) => (
              <option key={staff.id} value={staff.id}>
                {`${staff.firstname} ${staff.lastname}`}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleAddStaff(selectedFieldStaff)}
            disabled={!selectedFieldStaff}
          >
            Add Field Staff
          </button>
        </div>

        {/* Team Leaders */}
        <div className="col-md-4">
          <h5>Team Leaders</h5>
          <select
            className="form-select mb-2"
            value={selectedTeamLeader || ''}
            onChange={(e) => setSelectedTeamLeader(Number(e.target.value))}
          >
            <option value="">Select a Team Leader</option>
            {filterUnassignedStaffByRole('Team Leader').map((staff) => (
              <option key={staff.id} value={staff.id}>
                {`${staff.firstname} ${staff.lastname}`}
              </option>
            ))}
          </select>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleAddStaff(selectedTeamLeader)}
            disabled={!selectedTeamLeader}
          >
            Add Team Leader
          </button>
        </div>
      </div>

      {/* Table of assigned staff */}
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projectStaffs.map((staff) => (
            <tr key={staff.id}>
              <td>{`${staff.firstname} ${staff.lastname}`}</td>
              <td>{staff.phone}</td>
              <td>{staff.role}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveStaff(staff.id)}
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

export default StaffTab
