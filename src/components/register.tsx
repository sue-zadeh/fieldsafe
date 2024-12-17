import React, { useState, useEffect } from 'react'

interface RegisterProps {
  isSidebarOpen: boolean // Passed down from App.tsx
}

type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: 'Volunteer' | 'Field Staff' | 'Team Leader'
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

  const contentStyle: React.CSSProperties = {
    marginLeft: isSidebarOpen ? '20px' : '50px',
    transition: 'margin 0.3s ease',
    padding: '10px',
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
      setUsers((prev) =>
        editingUserId
          ? prev.map((user) => (user.id === editingUserId ? updatedUser : user))
          : [...prev, updatedUser]
      )

      setFormData({
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        role: 'Volunteer',
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

  return (
    <div style={contentStyle} className="container-fluid">
      {/* Form Section */}
      <div className="row justify-content-center">
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
      {/* Table Section */}
      <div
        className="container-zone m-5 justify-content-center "
        style={{ maxWidth: '950px' }}
      >
        <h3 className="mt-5 mb-2 text-left">Registered Users</h3>
        <div className="table-responsive" px-2>
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
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{`${user.firstname} ${user.lastname}`}</td>
                  <td>{user.email}</td>
                  <td>{user.phone}</td>
                  <td>{user.role}</td>
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
      </div>
    </div>
  )
}

export default Register
