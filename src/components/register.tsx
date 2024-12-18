import React, { useState, useEffect } from 'react'

// Props for sidebar state
interface RegisterProps {
  isSidebarOpen: boolean
}

// User type definition
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: 'Volunteer' | 'Field Staff' | 'Team Leader' | 'Group Admin' // Allowed role values
}

const Register: React.FC<RegisterProps> = ({ isSidebarOpen }) => {
  // State to store list of users
  const [users, setUsers] = useState<User[]>([])

  // State for form data
  const [formData, setFormData] = useState<User>({
    id: 0, // Placeholder id, will be replaced when adding
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'Volunteer', // Default role
  })

  // State to track editing user ID
  const [editingUserId, setEditingUserId] = useState<number | null>(null)

  // Load users from localStorage on component mount
  useEffect(() => {
    const savedUsers = JSON.parse(
      localStorage.getItem('users') || '[]'
    ) as User[]
    setUsers(savedUsers)
  }, [])

  // Save users to localStorage whenever the users list changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  // Handles input changes in the form
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Form validation to ensure fields are filled correctly
  const validateForm = (): string => {
    const { firstname, lastname, email, phone } = formData
    if (!firstname || !lastname || !email || !phone)
      return 'All fields are required.'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format.'
    if (!/^\d{10}$/.test(phone)) return 'Phone must be exactly 10 digits.'
    return ''
  }

  // Reset form after submission
  const resetForm = () => {
    setFormData({
      id: 0,
      firstname: '',
      lastname: '',
      email: '',
      phone: '',
      role: 'Volunteer',
    })
    setEditingUserId(null)
  }

  // Handles adding or updating a user
  const handleSubmit = () => {
    const error = validateForm()
    if (error) {
      alert(error)
      return
    }

    if (editingUserId) {
      // Update existing user
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUserId ? { ...formData, id: editingUserId } : user
        )
      )
    } else {
      // Add new user
      const newUser: User = { ...formData, id: Date.now() }
      setUsers((prev) => [...prev, newUser])
    }

    resetForm()
  }

  // Handles deleting a user
  const handleDelete = (id: number) => {
    const updatedUsers = users.filter((user) => user.id !== id)
    setUsers(updatedUsers)
  }

  // Handles editing a user
  const handleEdit = (id: number) => {
    const userToEdit = users.find((user) => user.id === id)
    if (userToEdit) {
      setFormData({ ...userToEdit }) // Populate form with user data
      setEditingUserId(id)
    }
  }

  // Handles changing a user's role
  const handleRoleChange = (id: number, newRole: User['role']) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    )
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
      {/* Page header */}
      <h3 className="text-left my-3">
        {editingUserId ? 'Edit User' : 'Add User'}
      </h3>

      {/* User registration form */}
      <form className="row g-2" style={{ maxWidth: '700px', margin: 'auto' }}>
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
            <option value="Group Admin">Group Admin</option>
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

      {/* Registered users table */}
      <h3 className="mt-5">Registered Users</h3>
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
            {users.map((user) => (
              <tr key={user.id}>
                <td>{`${user.firstname} ${user.lastname}`}</td>
                <td>{user.email}</td>
                <td>{user.phone}</td>
                <td>
                  <select
                    value={user.role}
                    onChange={(e) =>
                      handleRoleChange(user.id, e.target.value as User['role'])
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
                    onClick={() => handleEdit(user.id)}
                  >
                    Edit
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
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
  )
}

export default Register
