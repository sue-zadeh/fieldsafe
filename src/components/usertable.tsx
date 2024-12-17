import React, { useState, useEffect } from 'react'

type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: string
}

interface UserTableProps {
  role: string
}

const UserTable: React.FC<UserTableProps> = ({ role }) => {
  const [users, setUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: role,
  })

  useEffect(() => {
    fetch(`/api/users?role=${encodeURIComponent(role)}`)
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error))
  }, [role])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    try {
      const response = await fetch(
        editingUserId ? `/api/users/${editingUserId}` : '/api/users',
        {
          method: editingUserId ? 'PUT' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        }
      )

      if (!response.ok) throw new Error('Failed to save user')

      const updatedUser = await response.json()

      if (editingUserId) {
        // If the role has changed, remove the user from the current list
        if (updatedUser.role !== role) {
          setUsers((prev) => prev.filter((user) => user.id !== editingUserId))
        } else {
          setUsers((prev) =>
            prev.map((user) => (user.id === editingUserId ? updatedUser : user))
          )
        }
      } else {
        // Add new user to list if role matches
        if (updatedUser.role === role) {
          setUsers((prev) => [...prev, updatedUser])
        }
      }

      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        role: role,
      })
      setEditingUserId(null)
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  const handleEdit = (id: number) => {
    const userToEdit = users.find((user) => user.id === id)
    if (userToEdit) {
      setFormData({
        firstname: userToEdit.firstname,
        lastname: userToEdit.lastname,
        email: userToEdit.email,
        phone: userToEdit.phone,
        role: userToEdit.role,
      })
      setEditingUserId(id)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete user')

      setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase()
    const query = searchQuery.toLowerCase()
    return (
      fullName.includes(query) ||
      user.firstname.toLowerCase().includes(query) ||
      user.lastname.toLowerCase().includes(query)
    )
  })

  return (
    <div>
      {/* Search Bar */}
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            placeholder="Search by name"
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control"
          />
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-bordered table-hover text-center align-middle">
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
            {filteredUsers.map((user) => (
              <tr key={user.id}>
                <td>{`${user.firstname} ${user.lastname}`}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={async (e) => {
                      const newRole = e.target.value
                      try {
                        const response = await fetch(`/api/users/${user.id}`, {
                          method: 'PUT',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ ...user, role: newRole }),
                        })
                        if (!response.ok)
                          throw new Error('Failed to update role')
                        const updatedUser = await response.json()
                        // Remove user from current list if role has changed
                        if (updatedUser.role !== role) {
                          setUsers((prev) =>
                            prev.filter((u) => u.id !== user.id)
                          )
                        } else {
                          setUsers((prev) =>
                            prev.map((u) =>
                              u.id === user.id ? updatedUser : u
                            )
                          )
                        }
                      } catch (error) {
                        console.error('Error updating role:', error)
                      }
                    }}
                  >
                    <option value="Volunteer">Volunteer</option>
                    <option value="Field Staff">Field Staff</option>
                    <option value="Team Leader">Team Leader</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: '#f4F993' }}
                    onClick={() => handleEdit(user.id)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-sm"
                    style={{ backgroundColor: '#D37B40' }}
                    onClick={() => handleDelete(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form for Adding/Editing User */}
      <h3 className="text-left my-3">
        {editingUserId ? 'Edit User' : 'Add User'}
      </h3>
      <form className="row g-2 mx-auto px-2" style={{ maxWidth: '700px' }}>
        <div className="col-12 col-md-6">
          <input
            type="text"
            name="firstname"
            placeholder="First Name"
            value={formData.firstname}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="col-12 col-md-6">
          <input
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="col-12 col-md-6">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="col-12 col-md-6">
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="form-control"
          />
        </div>
        <div className="col-12 col-md-6">
          <select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="form-select"
          >
            <option value="Volunteer">Volunteer</option>
            <option value="Field Staff">Field Staff</option>
            <option value="Team Leader">Team Leader</option>
          </select>
        </div>
        <div className="col-12 col-md-6 d-grid">
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            type="button"
          >
            {editingUserId ? 'Save Changes' : 'Register and Send Email'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default UserTable
