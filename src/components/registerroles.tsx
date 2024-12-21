import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: 'Group Admin' | 'Field Staff' | 'Team Leader';
}

const RegisterRoles: React.FC = () => {
  const [formData, setFormData] = useState<User>({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    role: 'Group Admin',
  });
  const [notification, setNotification] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]); // Fetch users for validation
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Pre-fill form data if editing a user
    if (location.state?.user) {
      setFormData(location.state.user);
    }
    // Fetch all users for email validation
    axios.get('/api/users').then((response) => setUsers(response.data));
  }, [location]);

  // Validate form fields
  const validateForm = (): string | null => {
    const { firstname, lastname, email, phone } = formData;
    if (!firstname || !lastname || !email || !phone) {
      return 'All fields are required.';
    }
    if (!/\S+@\S+\.\S+/.test(email)) return 'Invalid email format.';
    if (!/^\d{10}$/.test(phone)) return 'Phone must be exactly 10 digits.';
    return null;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const validationError = validateForm();
    if (validationError) {
      setNotification(validationError);
      return;
    }

    // Check if email is unique
    const isEmailTaken = users.some(
      (user) => user.email === formData.email && user.id !== formData.id
    );
    if (isEmailTaken) {
      setNotification('The email address is already in use.');
      return;
    }

    try {
      if (formData.id) {
        // Editing user
        const originalUser = users.find((user) => user.id === formData.id);
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
          );
          if (!confirmNoChanges) return;
        }
        await axios.put(`/api/users/${formData.id}`, formData);
        setNotification(`Editing ${formData.firstname} was successful!`);
      } else {
        // Adding new user
        await axios.post('/api/users', formData);
        setNotification(
          `${formData.firstname} ${formData.lastname} added successfully!`
        );
      }
      setTimeout(() => navigate('/groupadmin'), 1000);
    } catch (error) {
      console.error('Error saving user:', error);
      setNotification('Failed to save user.');
    }
  };

  return (
    <div className="container">
      <h2>{formData.id ? 'Edit User' : 'Add User'}</h2>
      {notification && (
        <div className="alert alert-primary text-center">{notification}</div>
      )}
      <form>
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
        <button type="button" className="btn btn-primary" onClick={handleSubmit}>
          {formData.id ? 'Save Changes' : 'Register User'}
        </button>
      </form>
    </div>
  );
};

export default RegisterRoles;
