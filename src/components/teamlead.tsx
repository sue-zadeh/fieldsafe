// TeamLead.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

type Role = 'Group Admin' | 'Field Staff' | 'Team Leader' | 'Volunteer'
type User = {
  id: number
  firstname: string
  lastname: string
  email: string
  phone: string
  role: Role
}

interface TeamLeadProps {
  isSidebarOpen: boolean
}

const TeamLead: React.FC<TeamLeadProps> = ({ isSidebarOpen }) => {
  // List of all Team Leaders
  const [allLeads, setAllLeads] = useState<User[]>([])
  // Search results
  const [searchResults, setSearchResults] = useState<User[]>([])
  // Search text
  const [searchQuery, setSearchQuery] = useState('')
  // Fetch users for validation
  const [users, setUsers] = useState<User[]>([]) 
  // Notification (e.g. success or error)
  const [notification, setNotification] = useState<string | null>(null)

  const navigate = useNavigate()

  // -------------------------
  // 1) Fetch all Team Leaders on mount
  const fetchAllLeads = async () => {
    try {
      const res = await axios.get('/api/users', {
        params: { role: 'Team Leader' }, // <-- important
      })
      // Sort by firstname or however you want
      const sorted = res.data.sort((a: User, b: User) =>
        a.firstname.localeCompare(b.firstname)
      )
      setAllLeads(sorted)
    } catch (error) {
      console.error('Error fetching Team Leaders:', error)
      setNotification('Failed to load Team Leader data.')
    }
  }

  useEffect(() => {
    fetchAllLeads()
  }, [])

  // 2) Searching
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      // If no search term, clear search results
      setSearchResults([])
      return
    }
    try {
      const res = await axios.get('/api/users', {
        params: {
          role: 'Team Leader', // <-- important
          search: searchQuery.trim(),
        },
      })
      setSearchResults(res.data)
    } catch (error) {
      console.error('Error searching Team Leaders:', error)
      setNotification('Failed to load data.')
    }
  }

  // 3) Handle role change (partial update)
  const handleRoleChange = (id: number, newRole: Role) => {
    // 1) Update local state
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, role: newRole } : u))
    )
  
    // 2) PUT request
    axios
      .put(`/api/users/${id}`, { role: newRole })
      .then(() => {
        setNotification(`Role updated to ${newRole} successfully!`)
        // If needed, navigate or re-fetch
      })
      .catch(() => {
        setNotification('Failed to update user role.')
        // Optionally revert local state
      })
  }
  

  // 4) Delete user
  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await axios.delete(`/api/users/${userId}`)
      setNotification('User deleted successfully!')

      // Re-fetch lists
      fetchAllLeads()
      if (searchQuery) handleSearch()
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification('Failed to delete user.')
    }
  }

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Utility to render a table
  const renderTable = (users: User[]) => (
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
                onChange={(e) => handleRoleChange(u, e.target.value as Role)}
              >
                <option value="Team Leader">Team Leader</option>
                <option value="Group Admin">Group Admin</option>
                <option value="Field Staff">Field Staff</option>
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

  return (
    <div
      className="container-fluid"
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        padding: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      <h2 className="text-center mb-2">Team Leader</h2>
      <p className="text-center text-muted">
        Search for Team Leaders by name or keyword
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

      {/* If user typed something, show search results */}
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

      {/* Full table of Team Leaders */}
      <h5 className="text-center">All Team Leaders</h5>
      {allLeads.length > 0 ? (
        renderTable(allLeads)
      ) : (
        <p className="text-center text-muted">No Team Leaders found.</p>
      )}
    </div>
  )
}

export default TeamLead
