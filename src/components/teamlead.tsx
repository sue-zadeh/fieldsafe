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

interface TeamleadProps {
  isSidebarOpen: boolean
}

const Teamlead: React.FC<TeamleadProps> = ({ isSidebarOpen }) => {
  const [allLeads, setAllLeads] = useState<User[]>([])
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  const navigate = useNavigate()

  // Fetch all Team Leaders
  const fetchAllLeads = async () => {
    try {
      const res = await axios.get('/api/users', {
        params: { role: 'Team Leader' }, // <--- KEY
      })
      setAllLeads(res.data)
    } catch (error) {
      console.error('Error fetching team leads:', error)
      setNotification('Failed to load data.')
    }
  }

  // Handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }
    try {
      // role = 'Team Leader' plus search param
      const res = await axios.get('/api/users', {
        params: { role: 'Team Leader', search: searchQuery.trim() },
      })
      setSearchResults(res.data)
    } catch (error) {
      console.error('Error searching team leads:', error)
      setNotification('Failed to load data.')
    }
  }

  //  Role change
  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      // Put request: *be sure your backend can handle partial updates*
      await axios.put(`/api/users/${userId}`, { role: newRole })

      setNotification(`Role updated to ${newRole} successfully!`)

      // If the user is no longer "Team Leader", navigate to the new page or refresh:
      if (newRole !== 'Team Leader') {
        if (newRole === 'Group Admin') {
          navigate('/groupadmin')
        } else if (newRole === 'Field Staff') {
          navigate('/fieldstaff')
        } else if (newRole === 'Volunteer') {
          navigate('/volunteer')
        }
      } else {
        // still a Team Leader => re-fetch
        fetchAllLeads()
        if (searchQuery) handleSearch()
      }
    } catch (error) {
      console.error('Error updating user role:', error)
      setNotification('Failed to update user role.')
    }
  }

  //  Delete
  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await axios.delete(`/api/users/${userId}`)
      setNotification('User deleted successfully!')
      fetchAllLeads()
      if (searchQuery) handleSearch()
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification('Failed to delete user.')
    }
  }

  // onMount
  useEffect(() => {
    fetchAllLeads()
  }, [])

  // auto-hide notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Render table
  const renderTable = (list: User[]) => (
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
        {list.map((u) => (
          <tr key={u.id}>
            <td>{u.firstname} {u.lastname}</td>
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
                <option value="Team Leader">Team Leader</option>
                <option value="Group Admin">Group Admin</option>
                <option value="Field Staff">Field Staff</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </td>
            <td>
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

      {/* If user typed something, show search results table */}
      {searchQuery.trim() && (
        <>
          <h5 className="text-center">Search Results</h5>
          {searchResults.length > 0
            ? renderTable(searchResults)
            : <p className="text-center text-muted">No results found for "{searchQuery}"</p>
          }
          <hr />
        </>
      )}

      <h5 className="text-center">All Team Leaders</h5>
      {allLeads.length > 0
        ? renderTable(allLeads)
        : <p className="text-center text-muted">No Team Leaders found.</p>
      }
    </div>
  )
}

export default Teamlead
