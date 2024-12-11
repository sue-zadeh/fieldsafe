import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Example user data - replace with actual user data from context or props
  const firstName = 'John'
  const lastName = 'Doe'

  const location = useLocation()

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  // A helper to check if a route is active
  const isActive = (path: string) => location.pathname === path

  // Styles for active links
  const activeLinkStyle: React.CSSProperties = {
    color: '#D37B40',
    fontWeight: 'bold',
  }

  // Common nav link style
  const navLinkStyle: React.CSSProperties = {
    color: '#F4F7F1',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '0.5rem 0',
    borderRadius: '1rem',
  }

  const dropdownListStyle: React.CSSProperties = {
    backgroundColor: '#F4F7F1',
    listStyle: 'none',
    paddingLeft: '1rem',
    marginTop: '0.5rem',
    fontSize: '1.1rem',
    borderRadius: '1rem',
  }

  const dropdownLinkStyle: React.CSSProperties = {
    color: '#1A1A1A',
    textDecoration: 'none',
    display: 'block',
    padding: '0.3rem 0',
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
      {isOpen && (
        <h2
          className="text-center mb-4 text-white"
          style={{ fontSize: '1.5rem' }}
        >
          FieldBase
        </h2>
      )}
      {isOpen && (
        <p className="text-white" style={{ fontSize: '1.2rem' }}>
          Welcome, {firstName} {lastName}
        </p>
      )}
      <ul className="nav flex-column" style={{ fontSize: '1.2rem' }}>
        {/* Organization Profile */}
        <li className="nav-item">
          <div
            className="nav-link"
            onClick={() => toggleDropdown('organization')}
            style={{
              ...navLinkStyle,
              ...(openDropdown === 'organization' ? activeLinkStyle : {}),
              cursor: 'pointer',
            }}
          >
            <i className="bi bi-building me-2"></i>
            {isOpen && 'Organization Profile'}
          </div>
          {openDropdown === 'organization' && (
            <ul style={dropdownListStyle}>
              {/* Group Admin */}
              <li>
                <Link
                  to="/register"
                  className="nav-link"
                  style={{
                    ...dropdownLinkStyle,
                    ...(isActive('/register') ? activeLinkStyle : {}),
                  }}
                >
                  <i className="bi bi-people me-2"></i>
                  {isOpen && 'Group Admin'}
                </Link>
              </li>

              <li>
                <Link to="/team-leader" style={dropdownLinkStyle}>
                  Team Leader
                </Link>
              </li>
              <li>
                <Link to="/field-staff" style={dropdownLinkStyle}>
                  Field Staff
                </Link>
              </li>
              <li>
                <Link to="/volunteer" style={dropdownLinkStyle}>
                  Volunteer
                </Link>
              </li>
              <li>
                <Link to="/objectives" style={dropdownLinkStyle}>
                  Objectives
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Projects */}
        <li className="nav-item mt-2">
          <div
            className="nav-link"
            onClick={() => toggleDropdown('project')}
            style={{
              ...navLinkStyle,
              ...(openDropdown === 'project' ? activeLinkStyle : {}),
              cursor: 'pointer',
            }}
          >
            <i className="bi bi-folder me-2"></i>
            {isOpen && 'Projects'}
          </div>
          {openDropdown === 'project' && (
            <ul style={dropdownListStyle}>
              <li>
                <Link to="/projects/add" style={dropdownLinkStyle}>
                  Add Project
                </Link>
              </li>
              <li>
                <Link to="/projects/search" style={dropdownLinkStyle}>
                  Search Project
                </Link>
              </li>
            </ul>
          )}
        </li>

        {/* Activities Notes */}
        <li className="nav-item mt-2">
          <div
            className="nav-link"
            onClick={() => toggleDropdown('activity')}
            style={{
              ...navLinkStyle,
              ...(openDropdown === 'activity' ? activeLinkStyle : {}),
              cursor: 'pointer',
            }}
          >
            <i className="bi bi-journal-text me-2"></i>
            {isOpen && 'Activities Notes'}
          </div>
          {openDropdown === 'activity' && (
            <ul style={dropdownListStyle}>
              <li>
                <Link to="/activities/add" style={dropdownLinkStyle}>
                  Add Activity
                </Link>
              </li>
              <li>
                <Link to="/activities/search" style={dropdownLinkStyle}>
                  Search Activity
                </Link>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  )
}

export default Sidebar
