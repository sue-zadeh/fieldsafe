import React, { useState, useEffect } from 'react'

type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: 'Volunteer' | 'Field Staff' | 'Team Leader'
}

const Register: React.FC = () => {
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
    // Fetch users from API on load
    fetch('/api/users')
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error('Error fetching users:', error))
  }, [])

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
        setUsers((prev) =>
          prev.map((user) => (user.id === editingUserId ? updatedUser : user))
        )
      } else {
        setUsers((prev) => [...prev, updatedUser])
      }
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
    <div className="container">
      <h3>Add User</h3>
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="First Name"
            name="firstname"
            value={formData.firstname}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Last Name"
            name="lastname"
            value={formData.lastname}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="email"
            className="form-control"
            placeholder="Email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
          />
        </div>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
          />
        </div>
      </div>
      <div className="row mb-3">
        <div className="col-md-3">
          <select
            className="form-control"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
          >
            <option value="Volunteer">Volunteer</option>
            <option value="Field Staff">Field Staff</option>
            <option value="Team Leader">Team Leader</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary" onClick={handleSubmit}>
            {editingUserId ? 'Edit and Send Email' : 'Register and Send Email'}
          </button>
        </div>
      </div>
      <h3>Registered Users</h3>
      <table className="table">
        <thead>
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
                  value={user.role}
                  onChange={(e) =>
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.id === user.id
                          ? { ...u, role: e.target.value as User['role'] }
                          : u
                      )
                    )
                  }
                >
                  <option value="Volunteer">Volunteer</option>
                  <option value="Field Staff">Field Staff</option>
                  <option value="Team Leader">Team Leader</option>
                </select>
              </td>
              <td>
                <button
                  className="btn btn-secondary"
                  onClick={() => setEditingUserId(user.id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
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
  )
}

export default Register
