import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

// Types
type Role = 'Group Admin' | 'Field Staff' | 'Team Leader' | 'Volunteer'
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: Role
}

interface FieldstaffProps {
  isSidebarOpen: boolean
}

const Fieldstaff: React.FC<FieldstaffProps> = ({ isSidebarOpen }) => {
  // All fieldstaff (for the main table below)
  const [allAdmins, setAllAdmins] = useState<User[]>([])
  // Search results (for the table on top)
  const [searchResults, setSearchResults] = useState<User[]>([])
  // Search input
  const [searchQuery, setSearchQuery] = useState('')
  // Notification bar
  const [notification, setNotification] = useState<string | null>(null)

  const navigate = useNavigate()

  // 1. On mount, fetch ALL group admins for the "main table"
  const fetchAllAdmins = async () => {
    try {
      const res = await axios.get('/api/users', {
        params: { role: 'Group Admin' },
      })
      // You might want to sort them by name
      const sorted = res.data.sort((a: User, b: User) =>
        a.firstname.localeCompare(b.firstname)
      )
      setAllAdmins(sorted)
    } catch (error) {
      console.error('Error fetching all group admins:', error)
      setNotification('Failed to load data for main table.')
    }
  }

  // 2. Searching for a name/keyword. Called on "Search" button
  const handleSearch = async () => {
    if (!searchQuery) {
      // If search is empty, clear the top table & do nothing else
      setSearchResults([])
      return
    }
    try {
      const res = await axios.get('/api/users', {
        params: { role: 'Group Admin', search: searchQuery },
      })
      setSearchResults(res.data)
    } catch (error) {
      console.error('Error searching for group admins:', error)
      setNotification('Failed to load data.')
    }
  }

  // 3. Change user role
  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      await axios.put(`/api/users/${userId}`, { role: newRole })
      setNotification(`Role updated to ${newRole} successfully!`)
      // If user is no longer Group Admin => navigate
      if (newRole !== 'Field Staff') {
        if (newRole === 'Group Admin') {
          navigate('/groupadmin')
        } else if (newRole === 'Team Leader') {
          navigate('/teamlead')
        } else if (newRole === 'Volunteer') {
          navigate('/volunteer')
        }
      } else {
        // If still "Group Admin," just refresh both lists
        fetchAllAdmins()
        if (searchQuery) handleSearch()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      setNotification('Failed to update user role.')
    }
  }

  // 4. Delete user
  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await axios.delete(`/api/users/${userId}`)
      setNotification('User deleted successfully!')
      // Re-fetch
      fetchAllAdmins()
      if (searchQuery) handleSearch()
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification('Failed to delete user.')
    }
  }

  // Load all admins on mount
  useEffect(() => {
    fetchAllAdmins()
  }, [])

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Re-usable table renderer
  const renderTable = (users: User[]) => {
    return (
      <table className="table table-bordered table-striped align-middle">
        <thead className="text-center">
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Edit / Delete</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                {u.firstname} {u.lastname}
              </td>
              <td>{u.email}</td>
              <td>{u.phone}</td>
              <td>
                <select
                  className="form-select"
                  value={u.role}
                  onChange={(e) =>
                    handleRoleChange(u.id, e.target.value as Role)
                  }
                >
                  <option value="Group Admin">Group Admin</option>
                  <option value="Field Staff">Field Staff</option>
                  <option value="Team Leader">Team Leader</option>
                  <option value="Volunteer">Volunteer</option>
                </select>
              </td>
              <td className="text-center">
                <button
                  className="btn btn-warning btn-sm me-2"
                  onClick={() =>
                    navigate('/registerroles', {
                      state: { user: u, isEdit: true },
                    })
                  }
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(u.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )
  }

  return (
    <div
      className="container-fluid"
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        padding: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      <h2 className="text-center mb-2">Group Admin</h2>
      <p className="text-center text-muted">
        Search for Group Admins by name or any keyword
      </p>

      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}

      {/* Search bar */}
      <div className="d-flex justify-content-center align-items-center mb-4">
        <input
          type="text"
          className="form-control w-50 me-2"
          placeholder="Search name, or a letter."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="btn btn-success" onClick={handleSearch}>
          Search
        </button>
      </div>

      {/* Search Results Table (top) - Only show if user typed something */}
      {searchQuery.trim() && (
        <>
          <h5 className="text-center">Search Results</h5>
          {searchResults.length > 0 ? (
            renderTable(searchResults)
          ) : (
            <p className="text-center text-muted">
              No results found for "{searchQuery}"
            </p>
          )}
          <hr />
        </>
      )}

      {/* Full Group Admin Table (below) */}
      <h5 className="text-center">All Group Admins</h5>
      {allAdmins.length > 0 ? (
        renderTable(allAdmins)
      ) : (
        <p className="text-center text-muted">No Group Admins found.</p>
      )}
    </div>
  )
}

export default Fieldstaff
