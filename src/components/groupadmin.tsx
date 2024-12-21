import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  role: string;
}

const GroupAdmin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [notification, setNotification] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users', {
        params: { role: 'Group Admin', search },
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleEdit = (user: User) => {
    navigate('/registerroles', { state: { user, isEdit: true } });
  };

  const handleDelete = async (id: number, firstname: string, lastname: string) => {
    if (window.confirm(`Are you sure you want to delete ${firstname} ${lastname}?`)) {
      try {
        await axios.delete(`/api/users/${id}`);
        setNotification(`${firstname} ${lastname} deleted successfully!`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        setNotification('Failed to delete user.');
      }
    }
  };

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await axios.put(`/api/users/${id}`, { role: newRole });
      setUsers((prev) => prev.filter((user) => user.id !== id));
      setNotification(`Role updated to ${newRole} successfully!`);
      navigate(`/${newRole.toLowerCase().replace(' ', '')}`);
    } catch (error) {
      console.error('Error updating role:', error);
      setNotification('Failed to update role.');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="container">
      <h2>Group Admin Users</h2>
      {notification && (
        <div className="alert alert-primary text-center">{notification}</div>
      )}
      <div className="d-flex my-3">
        <input
          type="text"
          placeholder="Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
        <button className="btn btn-primary ms-2" onClick={fetchUsers}>
          Search
        </button>
      </div>
      <table className="table table-striped">
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
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="form-select form-select-sm"
                >
                  <option value="Group Admin">Group Admin</option>
                  <option value="Field Staff">Field Staff</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </td>
              <td>
                <button
                  className="btn btn-warning btn-sm"
                  onClick={() => handleEdit(user)}
                >
                  Edit
                </button>
              </td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() =>
                    handleDelete(user.id, user.firstname, user.lastname)
                  }
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupAdmin;
