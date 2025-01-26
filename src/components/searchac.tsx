// src/components/searchactivity.tsx

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, InputGroup, FormControl, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaTrash } from 'react-icons/fa'

interface Activity {
  id: number
  name: string // Activity Name
  location: string
  activityDate: string // e.g. your Start Date or creation date
  status: string // inProgress | onHold | complete | archived
  createdBy: string // Instead of ‘User’ or ‘primaryContactName’
}
interface SearchActivityProps {
  isSidebarOpen: boolean
}
const SearchActivity: React.FC<SearchActivityProps> = ({ isSidebarOpen }) => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/activities')
        setActivities(res.data)
      } catch (err) {
        console.error('Error fetching activities:', err)
        setError('Failed to load activities.')
      } finally {
        setLoading(false)
      }
    }
    fetchActivities()
  }, [])

  /** Handle searching by name, location, createdBy, or status */
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  /** Filter results to match the search term */
  const filteredActivities = activities.filter((act) => {
    const lowerSearch = searchTerm.toLowerCase()
    return (
      act.name.toLowerCase().includes(lowerSearch) ||
      act.location.toLowerCase().includes(lowerSearch) ||
      act.createdBy.toLowerCase().includes(lowerSearch) ||
      act.status.toLowerCase().includes(lowerSearch)
    )
  })

  /** Navigate to Add Activity form (read/edit mode) when arrow is clicked */
  const handleRowClick = (act: Activity, e: React.MouseEvent) => {
    e.stopPropagation()
    // Save selected ID/Name in localStorage or pass via state
    localStorage.setItem('selectedActivityId', String(act.id))
    localStorage.setItem('selectedActivityName', act.name)
    // Navigate to your Add Activity route (adjust path as needed)
    navigate('/add-activity', { state: { activityId: act.id } })
  }

  /** Delete an activity row */
  const handleDelete = async (act: Activity, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      // For example: DELETE /api/activities/:id
      await axios.delete(`/api/activities/${act.id}`)
      // Remove from local state
      setActivities((prev) => prev.filter((item) => item.id !== act.id))
    } catch (err) {
      console.error('Error deleting activity:', err)
      alert('Failed to delete activity.')
    }
  }

  if (loading) {
    return <div>Loading activities...</div>
  }
  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '30px',
        transition: 'margin 0.3s ease',
        paddingTop: '2px',
        height: '100vh',
        width: '95%',
      }}
    >
      <h3
        className="mb-4"
        style={{
          color: '#0094B6',
          fontWeight: 'bold',
          paddingTop: '0.25rem',
          paddingBottom: '1rem',
        }}
      >
        Search Activity
      </h3>

      {/* Search Box */}
      <InputGroup className="mb-3">
        <FormControl
          placeholder="Search activity by name, location, status..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Button variant="outline-secondary" onClick={() => setSearchTerm('')}>
          Clear
        </Button>
      </InputGroup>

      {/* Activities Table */}
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Activity Date</th>
            <th>Activity Name</th>
            <th>Location</th>
            <th>Status</th>
            <th>Created By</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.map((act) => (
            <tr
              key={act.id}
              style={{ cursor: 'pointer' }}
              onClick={(e) => handleRowClick(act, e)}
            >
              <td>{formatDate(act.activityDate)}</td>
              <td>{act.name}</td>
              <td>{act.location}</td>
              <td>{act.status}</td>
              <td>{act.createdBy}</td>

              {/* Arrow + Delete icons in the last cell */}
              <td className="text-end">
                <span
                  style={{
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    marginRight: '1rem',
                  }}
                  onClick={(e) => handleRowClick(act, e)}
                >
                  <FaArrowRight />
                </span>
                <span
                  style={{
                    fontSize: '1.2rem',
                    cursor: 'pointer',
                    color: 'red',
                  }}
                  onClick={(e) => handleDelete(act, e)}
                >
                  <FaTrash />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

/** Date formatter helper */
function formatDate(isoString: string) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString // Fallback if invalid
  const day = d.getDate().toString().padStart(2, '0')
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const month = monthNames[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${month}-${year}`
}

export default SearchActivity
