// src/components/SearchProject.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

const SearchProject: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]) // or type interface Project

  useEffect(() => {
    axios
      .get('/api/projects/list') // or whatever route
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Error fetching projects:', err))
  }, [])

  return (
    <div className="container mt-4">
      <h2>All Projects</h2>
      <div className="row g-3">
        {projects.map((p) => (
          <div key={p.id} className="col-md-4">
            <div className="card">
              {p.imageUrl && (
                <img
                  src={`/${p.imageUrl}`}
                  className="card-img-top"
                  alt="..."
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{p.name}</h5>
                <p className="card-text">
                  <strong>Location:</strong> {p.location} <br />
                  <strong>Start Date:</strong> {p.startDate} <br />
                  <strong>Objectives:</strong>{' '}
                  {/* parse from project_objectives? */}
                  <br />
                  {p.inductionFileUrl && (
                    <a
                      href={`/${p.inductionFileUrl}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Induction Doc
                    </a>
                  )}
                </p>
                <button className="btn btn-warning me-2">Edit</button>
                <button className="btn btn-danger">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchProject
