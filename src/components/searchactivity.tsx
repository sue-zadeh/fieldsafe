// src/components/SearchActivity.tsx

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, Form, InputGroup, Button } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { FaSearch, FaTrashAlt, FaArrowRight } from 'react-icons/fa'

interface ActivityRow {
  id: number
  activity_date: string
  projectName: string
  projectLocation: string
  status: string // "InProgress" or "Completed", etc.
  createdBy?: string
}

interface SearchActivityProps {
  isSidebarOpen: boolean
}

const SearchActivity: React.FC<SearchActivityProps> = ({ isSidebarOpen }) => {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // For searching:
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const res = await axios.get<ActivityRow[]>('/api/activities')
        setActivities(res.data)
      } catch (err) {
        console.error('Error fetching activities:', err)
        setError('Failed to load activity notes.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filteredActivities = activities.filter((act) => {
    const dateStr = formatDate(act.activity_date).toLowerCase()
    const pName = (act.projectName || '').toLowerCase()
    const loc = (act.projectLocation || '').toLowerCase()
    const stat = (act.status || '').toLowerCase()
    const user = (act.createdBy || '').toLowerCase()
    const term = searchTerm.toLowerCase()
    return (
      dateStr.includes(term) ||
      pName.includes(term) ||
      loc.includes(term) ||
      stat.includes(term) ||
      user.includes(term)
    )
  })

  /** If user clicks arrow => jump to ActivityTabs detail page */
  const handleGoToDetail = (act: ActivityRow, e: React.MouseEvent) => {
    e.stopPropagation()
    navigate('/activity-notes', {
      state: {
        activityId: act.id,
        // pass fields for prefill
      },
    })
  }

  const handleDelete = async (act: ActivityRow, e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = window.confirm(
      `Are you sure you want to delete activity dated ${formatDate(
        act.activity_date
      )}?`
    )
    if (!confirmed) return
    try {
      await axios.delete(`/api/activities/${act.id}`)
      setActivities((prev) => prev.filter((a) => a.id !== act.id))
    } catch (err) {
      console.error('Error deleting activity:', err)
      alert('Failed to delete activity.')
    }
  }

  if (loading) return <div>Loading activity notes...</div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '30px',
        transition: 'margin 0.3s ease',
        paddingTop: '2rem',
        height: '100vh',
        width: '95%',
      }}
    >
   
      <h3 className="mb-4" style={{ color: '#0094B6', fontWeight: 'bold' }}>
        Field Notes
      </h3>

      {/* Search bar */}
      <InputGroup className="mb-3" style={{ maxWidth: '300px' }}>
        <Form.Control
          type="text"
          placeholder="Search field notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="secondary">
          <FaSearch />
        </Button>
      </InputGroup>

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Field Note Date</th>
            <th>Project</th>
            <th>Location</th>
            <th>Status</th>
            <th>User</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredActivities.map((act) => (
            <tr key={act.id} style={{ cursor: 'pointer' }}>
              <td>{formatDate(act.activity_date)}</td>
              <td>{act.projectName}</td>
              <td>{act.projectLocation}</td>
              <td>{act.status}</td>
              <td>{act.createdBy || 'N/A'}</td>
              <td className="text-end">
                {/* Delete */}
                <span
                  style={{
                    fontSize: '1.25rem',
                    color: 'red',
                    marginRight: '1rem',
                  }}
                  onClick={(e) => handleDelete(act, e)}
                >
                  <FaTrashAlt />
                </span>
                {/* Arrow => go to ActivityTabs detail */}
                <span
                  style={{ fontSize: '1.5rem', cursor: 'pointer' }}
                  onClick={(e) => handleGoToDetail(act, e)}
                >
                  <FaArrowRight />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// Simple date format
function formatDate(isoString: string) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString
  const day = String(d.getDate()).padStart(2, '0')
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
  const monthName = monthNames[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${monthName}-${year}`
}

export default SearchActivity
