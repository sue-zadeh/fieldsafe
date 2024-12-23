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

interface FieldStaffProps {
  isSidebarOpen: boolean
}

const FieldStaff: React.FC<FieldStaffProps> = ({ isSidebarOpen }) => {
  // 1) Full list of "Field Staff"
  const [allStaff, setAllStaff] = useState<User[]>([])

  // 2) Filtered "search results"
  const [searchResults, setSearchResults] = useState<User[]>([])

  // 3) The user's search text
  const [searchQuery, setSearchQuery] = useState('')

  // 4) Notification
  const [notification, setNotification] = useState<string | null>(null)

  const navigate = useNavigate()

  //------------------------------------------------------------
  // (A) On mount, fetch ALL "Field Staff"
  const fetchAllStaff = async () => {
    try {
      const res = await axios.get('/api/users', {
        params: { role: 'Field Staff' },
      })
      const sorted = res.data.sort((a: User, b: User) =>
        a.firstname.localeCompare(b.firstname)
      )
      setAllStaff(sorted)
    } catch (err) {
      console.error('Error fetching Field Staff:', err)
      setNotification('Failed to load data.')
    }
  }

  useEffect(() => {
    fetchAllStaff()
  }, [])

  //------------------------------------------------------------
  // (B) Immediate search on typing
  useEffect(() => {
    const doSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        return
      }
      try {
        const res = await axios.get('/api/users', {
          params: { role: 'Field Staff', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      } catch (error) {
        console.error('Error searching Field Staff:', error)
        setNotification('Failed to load data.')
      }
    }

    doSearch()
  }, [searchQuery])

  //------------------------------------------------------------
  // (C) Change role
  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      // Optimistic update
      setAllStaff((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      setSearchResults((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )

      // PUT request
      await axios.put(`/api/users/${userId}`, { role: newRole })
      setNotification(`Role updated to ${newRole} successfully!`)

      // If user is no longer Field Staff => navigate
      if (newRole === 'Group Admin') {
        navigate('/groupadmin')
      } else if (newRole === 'Team Leader') {
        navigate('/teamlead')
      } else if (newRole === 'Volunteer') {
        navigate('/volunteer')
      } else {
        // still Field Staff => re-fetch
        fetchAllStaff()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      setNotification('Failed to update user role.')
    }
  }

  //------------------------------------------------------------
  // (D) Delete user
  const handleDelete = async (userId: number) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await axios.delete(`/api/users/${userId}`)
      setNotification('User deleted successfully!')

      fetchAllStaff()
      // Re-run the search if we had anything typed
      if (searchQuery.trim()) {
        const res = await axios.get('/api/users', {
          params: { role: 'Field Staff', search: searchQuery.trim() },
        })
        setSearchResults(res.data)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      setNotification('Failed to delete user.')
    }
  }

  //------------------------------------------------------------
  // Auto-clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  //------------------------------------------------------------
  // Reusable table
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
            <td>
              {u.firstname} {u.lastname}
            </td>
            <td>{u.email}</td>
            <td>{u.phone}</td>
            <td>
              <select
                className="form-select"
                value={u.role}
                onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
              >
                <option value="Field Staff">Field Staff</option>
                <option value="Group Admin">Group Admin</option>
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

  //------------------------------------------------------------
  // Render
  return (
    <div
      className="container-fluid"
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        padding: '20px',
        transition: 'all 0.3s ease',
      }}
    >
      <h2 className="text-center mb-2">Field Staff</h2>
      <p className="text-center text-muted">
        *Instant Search* - type something in the box below
      </p>

      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}

      {/* The search bar (no button). Searching as you type */}
      <div className="mb-4 d-flex justify-content-center">
        <input
          className="form-control w-50 me-2"
          placeholder="Search by name, letter, etc."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Search Results, if user typed something */}
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

      {/* Full Field Staff table below */}
      <h4 className="text-center">All Field Staff</h4>
      {allStaff.length > 0 ? (
        renderTable(allStaff)
      ) : (
        <p className="text-center text-muted">No Field Staff found.</p>
      )}
    </div>
  )
}

export default FieldStaff
