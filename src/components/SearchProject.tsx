// src/components/SearchProject.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

interface Project {
  id: number
  name: string
  location: string
  startDate: string
  imageUrl?: string
  inductionFileUrl?: string
  status: string
  primaryContactName?: string
  primaryContactPhone?: string
  emergencyServices?: string
  objectiveTitles?: string // from GROUP_CONCAT
}
interface SearchProjectProps {
  isSidebarOpen: boolean
}

const SearchProject: React.FC<SearchProjectProps> = ({isSidebarOpen}) => {
  const [projects, setProjects] = useState<Project[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    axios
      .get('/api/projects/list')
      .then((res) => {
        console.log('SearchProject data =', res.data); // DEBUG
        setProjects(res.data)
      })
      .catch((err) => {
        console.error('Error fetching projects:', err)
        setNotification('Failed to fetch projects.')
      })
  }, [])

  // auto clear notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleEdit = (p: Project) => {
    // Navigate to /addproject with edit mode
    navigate('/addproject', {
      state: {
        isEdit: true,
        projectId: p.id,
      },
    })
  }

  const handleDelete = async (p: Project) => {
    if (!window.confirm(`Are you sure you want to delete "${p.name}"?`)) {
      return
    }
    try {
      await axios.delete(`/api/projects/${p.id}`)
      setNotification('Project deleted successfully!')
      // reload list
      setProjects((prev) => prev.filter((proj) => proj.id !== p.id))
    } catch (err) {
      console.error('Error deleting project:', err)
      setNotification('Failed to delete project.')
    }
  }

  return (
    <div
      className={`container-fluid ${isSidebarOpen ? 'content-expanded' : 'content-collapsed'}`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        minHeight: '100vh',
        paddingTop: '25px',
        backgroundColor: '#F4F7F1',
      }}
    >
    {/* <div className="container mt-4"> */}
      {notification && (
        <div className="alert alert-info text-center">{notification}</div>
      )}
      <h2 className="mb-4">All Projects</h2>

      <div className="row g-4">
        {projects.map((p) => (
          <div key={p.id} className="col-md-4">
            <div className="card h-100">
              <div className="position-relative">
                {p.imageUrl ? (
                  <img
                    src={`/${p.imageUrl}`}
                    className="card-img-top"
                    alt="Project"
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    style={{
                      height: '200px',
                      backgroundColor: '#ddd',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    No Image
                  </div>
                )}
                {/* status in bottom-right corner of image area */}
                <span
                  className="badge bg-info text-dark position-absolute"
                  style={{ bottom: '5px', right: '5px' }}
                >
                  {p.status}
                </span>
              </div>
              <div className="card-body">
                <h5 className="card-title mb-2">{p.name}</h5>
                {/* objectiveTitles from bridging table */}
                {p.objectiveTitles && (
                  <p className="text-muted fs-6">
                    <strong>Objectives:</strong> {p.objectiveTitles}
                  </p>
                )}
                <p className="mb-1">
                  <strong>Start Date:</strong> {p.startDate}
                </p>
                {p.primaryContactName && (
                  <p className="mb-1">
                    <strong>Contact:</strong> {p.primaryContactName} (
                    {p.primaryContactPhone})
                  </p>
                )}
                {p.emergencyServices && (
                  <p className="mb-1">
                    <strong>Emergency:</strong> {p.emergencyServices}
                  </p>
                )}
                {p.inductionFileUrl && (
                  <p className="mb-1">
                    <strong>Induction Doc:</strong>{' '}
                    <a
                      href={`/${p.inductionFileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View
                    </a>
                  </p>
                )}

                <div className="mt-3">
                  <button
                    className="btn btn-warning me-3"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(p)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchProject
