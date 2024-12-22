import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddVolunteer: React.FC<{ isSidebarOpen: boolean }> = ({ isSidebarOpen }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [formData, setFormData] = useState({
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyContactNo: '',
  });
  const [notification, setNotification] = useState('');

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    try {
      const response = await axios.get('/api/volunteers');
      setVolunteers(response.data);
    } catch (error) {
      console.error('Error fetching volunteers:', error.message);
      setNotification('Failed to load volunteers.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (formData.id) {
        await axios.put(`/api/volunteers/${formData.id}`, formData);
        setNotification('Volunteer updated successfully!');
      } else {
        await axios.post('/api/volunteers', formData);
        setNotification('Volunteer added successfully!');
      }
      fetchVolunteers();
      setFormData({
        id: 0,
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        emergencyContact: '',
        emergencyContactNo: '',
      });
    } catch (error) {
      console.error('Error saving volunteer:', error.message);
      setNotification('Failed to save volunteer.');
    }
  };

  
  return (
    <div className={`container-fluid ${isSidebarOpen ? 'content-expanded' : 'content-collapsed'}`}>
      <h3>{formData.id ? 'Edit Volunteer' : 'Add Volunteer'}</h3>
      <form>
    
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
    >
      {notification && (
        <div className="alert alert-success" role="alert">
          {notification}
        </div>
      )}
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
