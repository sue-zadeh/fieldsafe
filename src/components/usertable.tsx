// UserTable.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  role: string
}

interface UserTableProps {
  role: string
}

const UserTable: React.FC<UserTableProps> = ({ role }) => {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await axios.get('/api/users', {
        params: { role, search },
      })
      setUsers(response.data)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await axios.put(`/api/users/${id}`, { role: newRole })
      fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`/api/users/${id}`)
      fetchUsers()
    } catch (error) {
      console.error('Error deleting user:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [role, search])

  if (loading) return <p>Loading...</p>

  return (
    <div>
      <h2>{role} Users</h2>
      <input
        type="text"
        placeholder="Search by name..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table>
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
              <td>{`${user.firstName} ${user.lastName}`}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                >
                  <option value="Volunteer">Volunteer</option>
                  <option value="Group Admin">Group Admin</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Field Staff">Field Staff</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDelete(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UserTable
