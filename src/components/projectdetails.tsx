import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table } from 'react-bootstrap'

interface Project {
  id: number
  name: string
  location: string
  startDate: string
  status: string
  primaryContactName?: string
}

interface ProjectDetailProps {
  isSidebarOpen: boolean
  // This callback is provided by ActivityWizard
  // so we can notify it which project we selected:
  onProjectSelected?: (projId: number, projName: string) => void
}

const ProjectDetails: React.FC<ProjectDetailProps> = ({
  isSidebarOpen,
  onProjectSelected,
}) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/projects')
        setProjects(res.data)
      } catch (err) {
        console.error('Error fetching projects:', err)
        setError('Failed to load projects.')
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
  }, [])

  const handleArrowClick = (
    e: React.MouseEvent<HTMLTableCellElement>,
    proj: Project
  ) => {
    e.stopPropagation()
    // Instead of direct routing, call the wizard callback
    if (onProjectSelected) {
      onProjectSelected(proj.id, proj.name)
    }
  }

  if (loading) return <div>Loading projects...</div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        // marginLeft: isSidebarOpen ? '0px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '2px',
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
        Project Details
      </h3>
      <Table striped hover responsive>
        <thead>
          <tr>
            <th>Start Date</th>
            <th>Project</th>
            <th>Location</th>
            <th>Status</th>
            <th>User</th>
            <th className="text-end">Action</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((proj) => (
            <tr key={proj.id}>
              <td>{formatDate(proj.startDate)}</td>
              <td>{proj.name}</td>
              <td>{proj.location}</td>
              <td>{proj.status}</td>
              <td>{proj.primaryContactName || 'N/A'}</td>
              <td
                onClick={(e) => handleArrowClick(e, proj)}
                className="text-end"
                style={{ cursor: 'pointer' }}
              >
                <span style={{ fontSize: '2.5rem', paddingRight: '1rem' }}>
                  &rarr;
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// A simple date-formatter
function formatDate(isoString: string) {
  if (!isoString) return ''
  const d = new Date(isoString)
  if (isNaN(d.getTime())) return isoString
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
  const monthName = monthNames[d.getMonth()]
  const year = d.getFullYear()
  return `${day}-${monthName}-${year}`
}

export default ProjectDetails
