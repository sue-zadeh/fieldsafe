import React, { useState, useEffect } from 'react'

interface Groupadmin {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: 'Volunteer' | 'Field Staff' | 'Team Leader' | 'Group Admin'
}

interface GroupadminsPageProps {
  isSidebarOpen: boolean
}


const GroupadminPage: React.FC<GroupadminsPageProps> = ({ isSidebarOpen }) => {
  const [groupadmins, setGroupadmins] = useState<Groupadmin[]>([])

  useEffect(() => {
    fetch('/api/groupadmins')
      .then((response) => response.json())
      .then((data) => setGroupadmins(data))
      .catch((error) => console.error('Error fetching groupadmins:', error))
  }, [])

  const handleRoleChange = (id: number, newRole: Groupadmin['role']) => {
    setGroupadmins((prev) =>
      prev.map((groupadmin) =>
        groupadmin.id === id ? { ...groupadmin, role: newRole } : groupadmin
      )
    )
  }

  const handleEdit = (id: number) => {
    const groupadminToEdit = groupadmins.find((v) => v.id === id)
    console.log('Editing groupadmin:', groupadminToEdit)
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this volunteer?')) {
      setGroupadmins((prev) => prev.filter((v) => v.id !== id))
    }
  }

  return (
    <div style={{ marginLeft: isSidebarOpen ? '20px' : '10px', transition: 'all 0.3s ease' }}>
      <h3 className="mt-5">Group Admin</h3>
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
            {groupadmins.map((groupadmin) => (
              <tr key={groupadmin.id}>
                <td>{`${groupadmin.firstname} ${groupadmin.lastname}`}</td>
                <td>{groupadmin.email}</td>
                <td>{groupadmin.phone}</td>
                <td>
                  <select
                    value={groupadmin.role}
                    onChange={(e) =>
                      handleRoleChange(
                        groupadmin.id,
                        e.target.value as Groupadmin['role']
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
                    onClick={() => handleEdit(groupadmin.id)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(groupadmin.id)}
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

export default GroupadminPage
