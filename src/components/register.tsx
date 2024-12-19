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
  role: 'Volunteer' | 'Field Staff' | 'Team Leader' | 'Group Admin'
}

const Register: React.FC<RegisterProps> = ({ isSidebarOpen }) => {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<User>({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'Volunteer',
  })
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [notification, setNotification] = useState<string>('')

  // Load users from localStorage on mount
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

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Validate form fields
  const validateForm = (): string => {
    const { firstname, lastname, email, phone } = formData
    if (!firstname || !lastname || !email || !phone)
      return 'All fields are required.'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format.'
    if (!/^\d{10}$/.test(phone)) return 'Phone must be exactly 10 digits.'
    return ''
  }

  // Reset form
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

  // Add or update user
  const handleSubmit = () => {
    const error = validateForm()
    if (error) {
      setNotification(error)
      return
    }
    // Check if email is unique
    const isEmailTaken = users.some(
      (user) => user.email === formData.email && user.id !== editingUserId
    )
    if (isEmailTaken) {
      setNotification(
        'The email address is already in use. Please use a unique email.'
      )
      return
    }
    if (editingUserId) {
      const originalUser = users.find((user) => user.id === editingUserId)
      // Check if there are any changes
      if (
        originalUser &&
        originalUser.firstname === formData.firstname &&
        originalUser.lastname === formData.lastname &&
        originalUser.email === formData.email &&
        originalUser.phone === formData.phone &&
        originalUser.role === formData.role
      ) {
        // Ask for confirmation if no changes are made
        const confirmNoChanges = window.confirm(
          'No changes detected. Are you okay with saving without any edits?'
        )
        if (!confirmNoChanges) {
          return
        }
      }

      // Update existing user
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUserId ? { ...formData, id: editingUserId } : user
        )
      )
      setNotification(
        `${formData.firstname} ${formData.lastname} updated successfully!`
      )
    } else {
      const newUser: User = { ...formData, id: Date.now() }
      setUsers((prev) => [...prev, newUser])
      setNotification(
        `${formData.firstname} ${formData.lastname} added successfully!`
      )
    }

    resetForm()
  }

  // Change role
  const handleRoleChange = (id: number, newRole: User['role']) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, role: newRole } : user))
    )
    setNotification(`Role updated to ${newRole} successfully!`)
  }

  // Edit user
  const handleEdit = (id: number) => {
    const userToEdit = users.find((user) => user.id === id)
    if (userToEdit) {
      setFormData(userToEdit)
      setEditingUserId(id)
    }
  }

  // Delete user
  const handleDelete = (id: number) => {
    const userToDelete = users.find((user) => user.id === id)
    if (
      window.confirm(
        `Are you sure you want to delete ${userToDelete?.firstname} ${userToDelete?.lastname}?`
      )
    ) {
      setUsers((prev) => prev.filter((user) => user.id !== id))

      setNotification(
        `${userToDelete?.firstname} ${userToDelete?.lastname} deleted successfully!`
      )
    }
  }

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timeout = setTimeout(() => setNotification(''), 5000)
      return () => clearTimeout(timeout)
    }
  }, [notification])
  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
    >
      {/* Notification Section */}
      {notification && (
        <div className="alert alert-success" role="alert">
          {notification}
        </div>
      )}
      {/* Form Section */}
      <div style={{ maxWidth: '500px', margin: 'auto' }}>
        <h3 className="text-center my-3">
          {editingUserId ? 'Edit User' : 'Add User'}
        </h3>
        <form className="row g-2">
          <div className="col-12 col-md-6">
            <input
              name="firstname"
              placeholder="First Name"
              value={formData.firstname}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-12 col-md-6">
            <input
              name="lastname"
              placeholder="Last Name"
              value={formData.lastname}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-12 col-md-6">
            <input
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="col-12 col-md-6">
            <input
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
      </div>

      {/* Table Section */}
      <div className="mt-5">
        <h3 className="text-left py-3">Registered Users</h3>
        <div className="table-responsive">
          <table className="table table-striped table-hover text-center p-5">
            <thead className="table-light">
              <tr>
                <th className="px-4">Name</th>
                <th className="px-4">Email</th>
                <th className="px-4">Phone</th>
                <th className="px-4">Role</th>
                <th className="px-4">Edit</th>
                <th className="px-4">Delete</th>
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
                        handleRoleChange(
                          user.id,
                          e.target.value as User['role']
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
    </div>
  )
}

export default Register
