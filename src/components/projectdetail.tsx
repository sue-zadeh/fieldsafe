// // src/components/ProjectDetails.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import ActivityWizard from './activitywizard'
import ProjectRisk from './projectrisk'
import ProjectStaffs from './projectstaffs'
import ProjectHazards from './projecthazards'
import Projectvolunteerss from './projectvolunteers'
import ProjectChecklist from './projectchecklist'
interface Project {
  id: number
  name: string
  location: string
  startDate: string
  status: string
  primaryContactName?: string
  // Any other columns from the DB you want to display
}
interface ProjectDetailProps {
  isSidebarOpen: boolean
}


const ProjectDetails: React.FC<ProjectDetailProps> = ({isSidebarOpen}) => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch projects from backend on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        const res = await axios.get('/api/projects')
        // or: '/api/projects/list' if that's how you retrieve them
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

  const handleRowClick = (projectId: number) => {
    // For example, navigate to a single-project details/edit page
    navigate(`/addproject`, { state: { isEdit: true, projectId } })
  }

  // Render a loading indicator or an error if needed
  if (loading) {
    return <div>Loading projects...</div>
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
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '4rem',
      }}
    >
      <ActivityWizard />
      <h3 className="mb-3">Project Details</h3>
      <Table striped hover responsive>
        <thead>
          <tr>
            {/* Adjust column headings as needed */}
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
            <tr
              key={proj.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRowClick(proj.id)}
            >
              {/* “Field Note Date” → Use startDate or whichever date column you prefer */}
              <td>{formatDate(proj.startDate)}</td>
              <td>{proj.name}</td>
              <td>{proj.location}</td>
              <td>{proj.status}</td>
              {/* “User” → Possibly your 'primaryContactName' or something else */}
              <td>{proj.primaryContactName || 'N/A'}</td>

              {/* Arrow icon in last column */}
              <td
                onClick={(e) => {
                  // Stop row-click from triggering if we only want arrow click
                  e.stopPropagation()
                  handleRowClick(proj.id)
                }}
                className="text-end"
              >
                {/* Just a simple arrow → You can use react-icons if you like */}
                <span style={{ fontSize: '1.25rem' }}>&rarr;</span>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  )
}

// Helper to format date as "DD-MMMM-YYYY" or similar
function formatDate(isoString: string) {
  if (!isoString) return ''
  // e.g. "2025-01-09" -> "09-January-2025"
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
