// src/components/ProjectDetails.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import ActivityWizard from './activitywizard'
import ProjectRisk from './projectrisk'
// import ProjectStaffs from './projectstaffs'
// import ProjectHazards from './projecthazards'
// import Projectvolunteerss from './projectvolunteers'
// import ProjectChecklist from './projectchecklist'
// import ProjectOutcome from './projectoutcome'
// import ProjectComplete from './projectcomplete'

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
}

const ProjectDetails: React.FC<ProjectDetailProps> = ({ isSidebarOpen }) => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // On mount, get a simple list from /api/projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true)
        // calls GET /api/projects => returns all in descending order
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

  // If user clicks anywhere on row => go risk project
  const handleRowClick = (projectId: number) => {
    navigate('/projectrisk', { state: { projectId } })
  }

  if (loading) return <div>Loading projects...</div>
  if (error) return <div className="alert alert-danger">{error}</div>

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '2rem',
      }}
    >
      <ActivityWizard />
      <h3 className="mb-4" style={{
          color: '#0094B6',
          fontWeight: 'bold',
          paddingTop: '0.25rem',
          paddingBottom: '1rem',
        }}>Project Details</h3>
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
            <tr
              key={proj.id}
              style={{ cursor: 'pointer' }}
              onClick={() => handleRowClick(proj.id)}
            >
              <td>{formatDate(proj.startDate)}</td>
              <td>{proj.name}</td>
              <td>{proj.location}</td>
              <td>{proj.status}</td>
              <td>{proj.primaryContactName || 'N/A'}</td>

              {/* Arrow in last cell */}
              <td
                onClick={(e) => {
                  // Stop row-click if we only want arrow click:
                  e.stopPropagation()
                  handleRowClick(proj.id)
                }}
                className="text-end"
              >
                <span style={{ fontSize: '2.5rem', paddingRight: '1rem' }}>&rarr;</span>
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
