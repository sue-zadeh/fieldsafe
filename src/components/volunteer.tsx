import React, { useState, useEffect } from 'react'

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

  useEffect(() => {
    fetch('/api/volunteers')
      .then((response) => response.json())
      .then((data) => setVolunteers(data))
      .catch((error) => console.error('Error fetching volunteers:', error))
  }, [])

  const handleRoleChange = (id: number, newRole: Volunteer['role']) => {
    setVolunteers((prev) =>
      prev.map((volunteer) =>
        volunteer.id === id ? { ...volunteer, role: newRole } : volunteer
      )
    )
  }

  const handleEdit = (id: number) => {
    const volunteerToEdit = volunteers.find((v) => v.id === id)
    console.log('Editing volunteer:', volunteerToEdit)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      setVolunteers((prev) => prev.filter((v) => v.id !== id))
    }
  }

  return (
    <div
      style={{
        marginLeft: isSidebarOpen ? '20px' : '10px',
        transition: 'all 0.3s ease',
      }}
    >
      
      <h3 className="mt-5">Volunteers</h3>
      <input
        type="text"
        placeholder="Search volunteers..."
        className="form-control mb-3"
      />
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center">
          <thead className="table-light">
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
            {volunteers.map((volunteer) => (
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
                    onClick={() => handleEdit(volunteer.id)}
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default VolunteerPage
