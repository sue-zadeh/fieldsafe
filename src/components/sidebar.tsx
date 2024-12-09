import React, { useState } from 'react'
// import { Link } from 'react-router-dom';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  return (
    <div
      className={`d-flex flex-column vh-100 p-3 ${isOpen ? '' : 'collapsed'}`}
      style={{
        backgroundColor: '#738C40',
        width: isOpen ? '250px' : '60px',
        transition: 'width 0.3s',
      }}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn btn-primary mb-3"
        style={{ width: '100%' }}
      >
        {isOpen ? 'Collapse' : 'Expand'}
      </button>
      <h2 className={`text-center mb-4 text-white ${isOpen ? '' : 'd-none'}`}>
        FieldBase
      </h2>
      <p className="text-white">Welcome, Admin</p>
      <ul className="nav flex-column">
        <li className="nav-item">
          <a
            href="#"
            className="nav-link text-white"
            onClick={() => toggleDropdown('organization')}
          >
            <i className="bi bi-building me-2"></i> Organization Profile
          </a>
          {openDropdown === 'organization' && (
            <ul className="list-unstyled ps-4">
              <li className="nav-item">Group Admin</li>
              <li className="nav-item">Team Leader</li>
              <li className="nav-item">Field Staff</li>
              <li className="nav-item">Volunteer</li>
              <li className="nav-item">Objectives</li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <a
            href="#"
            className="nav-link text-white"
            onClick={() => toggleDropdown('project')}
          >
            <i className="bi bi-building me-2"></i> Projects
          </a>
          {openDropdown === 'Projects' && (
            <ul className="list-unstyled ps-4">
              <li>Add Project</li>
              <li>Search Project</li>
            </ul>
          )}
        </li>
        <li className="nav-item">
          <a
            href="#"
            className="nav-link text-white"
            onClick={() => toggleDropdown('activity')}
          >
            <i className="bi bi-building me-2"></i> Activities Notes
          </a>
          {openDropdown === 'Activities Notes' && (
            <ul className="list-unstyled ps-4">
              <li>Add Activity</li>
              <li>Search Activity</li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
