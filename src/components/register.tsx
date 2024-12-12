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

      // Reset form
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
    <div className="container mt-4">
      <h3>{editingUserId ? 'Edit User' : 'Add User'}</h3>
      <div className="mb-3">
        <input
          type="text"
          name="firstname"
          placeholder="First Name"
          value={formData.firstname}
          onChange={handleInputChange}
          className="form-control mb-2"
        />
        <input
          type="text"
          name="lastname"
          placeholder="Last Name"
          value={formData.lastname}
          onChange={handleInputChange}
          className="form-control mb-2"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          className="form-control mb-2"
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={formData.phone}
          onChange={handleInputChange}
          className="form-control mb-2"
        />
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          className="form-control mb-2"
        >
          <option value="Volunteer">Volunteer</option>
          <option value="Field Staff">Field Staff</option>
          <option value="Team Leader">Team Leader</option>
        </select>
        <button className="btn btn-primary w-100" onClick={handleSubmit}>
          {editingUserId ? 'Edit and Send Email' : 'Register and Send Email'}
        </button>
      </div>
      <h3>Registered Users</h3>
      <table className="table table-bordered">
        <thead>
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
                  className="btn btn-sm btn-secondary"
                  onClick={() => handleEdit(user.id)}
                >
                  Edit
                </button>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
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
