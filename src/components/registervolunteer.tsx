import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
interface AddvolunteerProps {
  isSidebarOpen: boolean
}

// type user
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  emergencyContact: string
  emergencyContactNumber: string
  role: 'Volunteer'
}

const Addvolunteer: React.FC<AddvolunteerProps> = ({ isSidebarOpen }) => {
  const [formData, setFormData] = useState<User>({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyContactNumber: '',
    role: 'Volunteer',
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
    axios.get('/api/volunteers').then((response) => setUsers(response.data))
  }, [location])

  const validateForm = (): string | null => {
    const {
      firstname,
      lastname,
      email,
      phone,
      emergencyContact,
      emergencyContactNumber,
    } = formData
    if (
      !firstname ||
      !lastname ||
      !email ||
      !phone ||
      !emergencyContact ||
      !emergencyContactNumber
    ) {
      return 'All fields are required.'
    }
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format.'
    if (!/^\d{10}$/.test(phone)) return 'Phone must be exactly 10 digits.'
    return null
  }

  // ----------------------------------------
  // Generic input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }
  // register button click
  // Save (Add or Edit user)
  const handleSubmit = async () => {
    // 1) Validate first
    const validationError = validateForm()
    if (validationError) {
      setNotification(validationError)
      return
    }
    // Ensure phone and emergency contact number are different
    if (formData.phone === formData.emergencyContactNumber) {
      setNotification(
        'Phone number and Emergency Contact Number must be different.'
      )
      return
    }
    //Email should be unique
    const isEmailTaken = users.some(
      (user) => user.email === formData.email && user.id !== formData.id
    )
    if (isEmailTaken) {
      setNotification('The email address is already in use.')
      return
    }

    //Check if no change in edit form
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
        await axios.put(`/api/volunteers/${formData.id}`, formData)
        setNotification(`Editing ${formData.firstname} was successful!`)
      } else {
        await axios.post('/api/volunteers', formData)
        // await sendEmail() // Send email notification on user addition
        setNotification(
          `${formData.firstname} ${formData.lastname} added successfully!`
        )
      } //Timeout for notifications
      setTimeout(() => navigate('/volunteer'), 1000)
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
          {formData.id ? 'Edit Voluteer' : 'Add Volunteer'}
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
            <label>Emergency Contact Name</label>
            <input
              type="text"
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Emergency Contact Number</label>
            <input
              type="text"
              name="emergencyContactNumber"
              value={formData.emergencyContactNumber}
              onChange={handleInputChange}
              className="form-control"
            />
          </div>
          <div className="mb-3">
            <label>Role</label>
            <div
              className="form-control fs-5"
              style={{ backgroundColor: '#f8f9fa' }}
            >
              Volunteer
            </div>
          </div>
          <button
            type="button"
            className="btn btn-primary w-100 mt-4"
            onClick={handleSubmit}
          >
            {formData.id ? 'Save Changes' : 'Register Volunteer'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default Addvolunteer
