import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
interface RegisterroleProps {
  isSidebarOpen: boolean
}

// type user
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: 'Group Admin' | 'Field Staff' | 'Team Leader'
}

const RegisterRoles: React.FC <RegisterroleProps> = ({ isSidebarOpen })=> {
  const [formData, setFormData] = useState<User>({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'Group Admin',
  })
  const [notification, setNotification] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([]) // Fetch users for validation
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Pre-fill form data if editing a user
    if (location.state?.user) {
      setFormData(location.state.user)
    }
    // Fetch all users for email validation
    axios.get('/api/users').then((response) => setUsers(response.data))
  }, [location])

  const validateForm = (): string | null => {
    const { firstname, lastname, email, phone } = formData
    if (!firstname || !lastname || !email || !phone) {
      return 'All fields are required.'
    }
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format.'
    if (!/^\d{10}$/.test(phone)) return 'Phone must be exactly 10 digits.'
    return null
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const sendEmail = async () => {
    try {
      await axios.post('/api/send-email', {
        email: formData.email,
        subject: 'Registration Confirmation',
        message: `Dear ${formData.firstname} ${formData.lastname},\n\nYou have been successfully registered as a ${formData.role}.\n\nBest regards,\nYour Team`,
      })
    } catch (error) {
      console.error('Error sending email:', error)
    }
  }

  const handleSubmit = async () => {
    const validationError = validateForm()
    if (validationError) {
      setNotification(validationError)
      return
    }

    const isEmailTaken = users.some(
      (user) => user.email === formData.email && user.id !== formData.id
    )
    if (isEmailTaken) {
      setNotification('The email address is already in use.')
      return
    }

    try {
      if (formData.id) {
        const originalUser = users.find((user) => user.id === formData.id)
        if (
          originalUser &&
          originalUser.firstname === formData.firstname &&
          originalUser.lastname === formData.lastname &&
          originalUser.email === formData.email &&
          originalUser.phone === formData.phone &&
          originalUser.role === formData.role
        ) {
          const confirmNoChanges = window.confirm(
            'No changes detected. Are you sure you want to save?'
          )
          if (!confirmNoChanges) return
        }
        await axios.put(`/api/users/${formData.id}`, formData)
        setNotification(`Editing ${formData.firstname} was successful!`)
      } else {
        await axios.post('/api/users', formData)
        await sendEmail() // Send email notification on user addition
        setNotification(
          `${formData.firstname} ${formData.lastname} added successfully!`
        )
      }
      setTimeout(() => navigate('/groupadmin'), 1000)
    } catch (error) {
      console.error('Error saving user:', error)
      setNotification('Failed to save user.')
    }
  }

  return (
    <div
      className={`container-fluid d-flex align-items-center justify-content-center  ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px', // Adjust marginto be responsive
        paddingTop: '20px',
        transition: 'margin 0.3s ease',
      }}
    >
      <div
        className="form-container bg-white p-4 rounded shadow"
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <h2 className="text-center">
          {formData.id ? 'Edit User' : 'Add User'}
        </h2>
        {notification && (
          <div className="alert alert-primary text-center">{notification}</div>
        )}
        <form className="form-container bg-white p-4 rounded shadow">
          <div className="mb-3">
            <label>First Name</label>
            <input
              type="text"
              name="firstname"
              value={formData.firstname}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Last Name</label>
            <input
              type="text"
              name="lastname"
              value={formData.lastname}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Group Admin">Group Admin</option>
              <option value="Field Staff">Field Staff</option>
              <option value="Team Leader">Team Leader</option>
            </select>
          </div>
          <button
            type="button"
            className="btn btn-primary w-100 mt-4"
            onClick={handleSubmit}
          >
            {formData.id ? 'Save Changes' : 'Register and Send Email'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RegisterRoles
