import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

// Props
interface RegisterroleProps {
  isSidebarOpen: boolean
}

// User type
type Role = 'Group Admin' | 'Field Staff' | 'Team Leader'
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: Role
}

const RegisterRoles: React.FC<RegisterroleProps> = ({ isSidebarOpen }) => {
  const [users, setUsers] = useState<User[]>([])
  const [formData, setFormData] = useState<User>({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'Group Admin',
  })
  const [notification, setNotification] = useState<string | null>(null)

  const location = useLocation()
  const navigate = useNavigate()

  // ----------------------------------------
  // On first render or if editing user
  useEffect(() => {
    // If there's a "user" in location.state, fill the form for editing
    if (location.state?.user) {
      setFormData(location.state.user)
    }

    // Fetch all users for email uniqueness check
    axios
      .get('/api/staff')
      .then((res) => setUsers(res.data))
      .catch((err) => console.error('Error fetching users:', err))
  }, [location])

  // ----------------------------------------
  // Clear notification after a few seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // ----------------------------------------
  // Form validation to ensure fields are filled correctly
  const validateForm = (): string | null => {
    const { firstname, lastname, email, phone } = formData

    if (!firstname || !lastname || !email || !phone) {
      return 'All fields are required.'
    }
    // Basic email check
    if (!/\S+@\S+\.\S+/.test(email)) {
      return 'Invalid email format.'
    }
    // Exactly 10 digits for phone
    if (!/^\d{10}$/.test(phone)) {
      return 'Phone must be exactly 10 digits.'
    }
    return ''
  }

  // Save users to localStorage whenever the users list changes
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users))
  }, [users])

  // ----------------------------------------
  // Generic input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // ----------------------------------------
  // Email on new user creation only
  const sendEmail = async () => {
    try {
      await axios.post('/api/send-email', {
        email: formData.email,
        subject: 'Registration Confirmation',
        message: `Dear ${formData.firstname} ${formData.lastname},\n\nYou have been successfully registered as a ${formData.role}.\n\nBest regards,\nYour Team`,
      })
    } catch (error) {
      console.error('Error sending email:', error)
      // Not critical. We won't setNotification for email errors here
    }
  }

  // ----------------------------------------
  // Save (Add or Edit user)
  const handleSubmit = async () => {
    // Validate first
    const validationError = validateForm()
    if (validationError) {
      setNotification(validationError)
      return
    }

    // Check email uniqueness
    const isEmailTaken = users.some(
      (u) => u.email === formData.email && u.id !== formData.id
    )
    if (isEmailTaken) {
      setNotification('The email address is already in use.')
      return
    }

    try {
      // If editing (formData.id), do PUT; else do POST
      if (formData.id) {
        // Optional check if "no changes" were made
        const originalUser = users.find((u) => u.id === formData.id)
        if (
          originalUser &&
          originalUser.firstname === formData.firstname &&
          originalUser.lastname === formData.lastname &&
          originalUser.email === formData.email &&
          originalUser.phone === formData.phone &&
          originalUser.role === formData.role
        ) {
          const confirmNoChanges = window.confirm(
            'No changes detected. Save anyway?'
          )
          if (!confirmNoChanges) return
        }

        await axios.put(`/api/staff/${formData.id}`, formData)
        setNotification(`Successfully updated ${formData.firstname}!`)
      } else {
        // It's a new user => POST
        await axios.post('/api/staff', formData)
        await sendEmail() // For newly added users only
        setNotification(`${formData.firstname} added successfully!`)
      }

      // Navigate to the correct page based on the final role
      //    (Wait a little so user sees the success message)
      setTimeout(() => {
        if (formData.role === 'Group Admin') {
          navigate('/groupadmin')
        } else if (formData.role === 'Field Staff') {
          navigate('/fieldstaff')
        } else {
          // Team Leader
          navigate('/teamlead')
        }
      }, 1000)
    } catch (error) {
      console.error('Error saving user:', error)
      setNotification('Failed to save user.')
    }
  }

  // ----------------------------------------
  // Render
  return (
    <div
      className={`container-fluid d-flex align-items-center justify-content-center mt-5 ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        paddingTop: '20px',
        marginTop: '2.5rem',
        transition: 'margin 0.3s ease',
      }}
    >
      <div
        className="form-container bg-white p-4 rounded shadow"
        style={{ maxWidth: '500px', width: '100%' }}
      >
        <h2 className="text-center">
          {formData.id ? 'Edit Staff' : 'Add Staff'}
        </h2>

        {/* Notification banner */}
        {notification && (
          <div className="alert alert-primary text-center">{notification}</div>
        )}

        {/* Fields */}
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

        {/* Button */}
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
