import React, { useState, useEffect } from 'react'

// Volunteer Type
interface Volunteer {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: 'Volunteer' | 'Field Staff' | 'Team Leader' | 'Group Admin'
}

interface VolunteerPageProps {
  isSidebarOpen: boolean
}

const VolunteerPage: React.FC<VolunteerPageProps> = ({ isSidebarOpen }) => {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Fetch volunteers from the database on component load
  useEffect(() => {
    fetch('/api/volunteers')
      .then((response) => response.json())
      .then((data) => setVolunteers(data))
      .catch((error) => console.error('Error fetching volunteers:', error))
  }, [])

  // Filter volunteers based on the search term
  const filteredVolunteers = volunteers.filter((v) =>
    `${v.firstname} ${v.lastname}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  // Handle role change
  const handleRoleChange = (id: number, newRole: Volunteer['role']) => {
    fetch(`/api/volunteers/${id}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    })
      .then(() => {
        setVolunteers((prev) =>
          prev.map((volunteer) =>
            volunteer.id === id ? { ...volunteer, role: newRole } : volunteer
          )
        )
        alert(`Role updated to ${newRole} successfully!`)
      })
      .catch((error) => console.error('Error updating role:', error))
  }

  // Handle delete
  const handleDelete = (id: number) => {
    const volunteerToDelete = volunteers.find((v) => v.id === id)
    if (
      window.confirm(
        `Are you sure you want to delete ${volunteerToDelete?.firstname} ${volunteerToDelete?.lastname}?`
      )
    ) {
      fetch(`/api/volunteers/${id}`, { method: 'DELETE' })
        .then(() => {
          setVolunteers((prev) => prev.filter((v) => v.id !== id))
          alert(
            `${volunteerToDelete?.firstname} ${volunteerToDelete?.lastname} deleted successfully!`
          )
        })
        .catch((error) => console.error('Error deleting volunteer:', error))
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '20px' : '10px',
        transition: 'margin 0.3s ease',
      }}
    >
      {/* Page Header */}
      <h3 className="my-4">Volunteers</h3>

      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search volunteers by name..."
          className="form-control"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Volunteers Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover table-striped text-center">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {filteredVolunteers.length > 0 ? (
              filteredVolunteers.map((volunteer) => (
                <tr key={volunteer.id}>
                  <td>{`${volunteer.firstname} ${volunteer.lastname}`}</td>
                  <td>{volunteer.email}</td>
                  <td>{volunteer.phone}</td>
                  <td>
                    <select
                      value={volunteer.role}
                      onChange={(e) =>
                        handleRoleChange(
                          volunteer.id,
                          e.target.value as Volunteer['role']
                        )
                      }
                      className="form-select"
                    >
                      <option value="Volunteer">Volunteer</option>
                      <option value="Field Staff">Field Staff</option>
                      <option value="Team Leader">Team Leader</option>
                      <option value="Group Admin">Group Admin</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() =>
                        alert(
                          `Editing volunteer: ${volunteer.firstname} ${volunteer.lastname}`
                        )
                      }
                    >
                      Edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(volunteer.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No volunteers found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VolunteerPage
