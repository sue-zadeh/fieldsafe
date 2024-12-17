import React, { useState, useEffect } from 'react'

interface RegisterProps {
  isSidebarOpen: boolean
}

type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: string
}

const Register: React.FC<RegisterProps> = ({ isSidebarOpen }) => {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'Volunteer',
  })
  const [editingUserId, setEditingUserId] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRoleChange = (id: number, newRole: string) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    )
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
      setUsers((prev) =>
        editingUserId
          ? prev.map((user) => (user.id === editingUserId ? updatedUser : user))
          : [...prev, updatedUser]
      )

      setFormData({ firstname: '', lastname: '', email: '', phone: '', role: 'Volunteer' })
      setEditingUserId(null)
    } catch (error) {
      console.error('Error saving user:', error)
    }
  }

  return (
    <div className="container mt-4">
      {/* Form Section */}
      <div className="row justify-content-center mb-4">
        <div className="col-lg-6 col-md-8 col-12">
          <h3 className="text-center mb-3">{editingUserId ? 'Edit User' : 'Add User'}</h3>
          <form className="row g-3 p-3 border rounded bg-light">
            <div className="col-12 col-md-6">
              <input
                type="text"
                name="firstname"
                placeholder="First Name"
                value={formData.firstname}
                onChange={handleInputChange}
                className="form-control"
                required
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
                required
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
                required
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
                required
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
                type="button"
                onClick={handleSubmit}
              >
                {editingUserId ? 'Save Changes' : 'Register and Send Email'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Table Section */}
      <div className="table-responsive mt-4">
        <h4 className="text-center mb-3">Registered Users</h4>
        <table className="table table-bordered table-hover text-center">
          <thead className="table-dark">
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{`${user.firstname} ${user.lastname}`}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <select
                    className="form-select"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="Volunteer">Volunteer</option>
                    <option value="Field Staff">Field Staff</option>
                    <option value="Team Leader">Team Leader</option>
                  </select>
                </td>
                <td>
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => setEditingUserId(user.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => console.log('Delete', user.id)}
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

export default Register
