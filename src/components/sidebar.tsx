import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  firstname?: string
  lastname?: string
}

const Sidebar: React.FC<SidebarProps> = ({ firstname = '', lastname = '' }) => {
  const [isOpen, setIsOpen] = useState(true)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()

  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  const isActive = (path: string) => location.pathname === path

  // Active link style: just bold, no color
  const activeLinkStyle: React.CSSProperties = {
    fontWeight: 'bold',
  }

  // Common nav link style (top-level links)
  const navLinkStyle: React.CSSProperties = {
    color: '#F4F7F1',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    padding: '0.5rem 0',
    cursor: 'pointer',
  }

  // Dropdown style
  const dropdownListStyle: React.CSSProperties = {
    backgroundColor: '#F4F7F1',
    listStyle: 'none',
    paddingLeft: '1rem',
    marginTop: '0.5rem',
    fontSize: '1.1rem',
    borderRadius: '0.5rem',
    paddingBottom: '0.5rem',
    paddingTop: '0.5rem',
  }

  const dropdownLinkStyle: React.CSSProperties = {
    color: '#1A1A1A',
    textDecoration: 'none',
    display: 'block',
    padding: '0.3rem 0',
  }

  // Styles for the toggle "triangle"
  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    // If open, show the toggle on the right edge; if collapsed, on the left edge outside
    right: isOpen ? '-15px' : 'auto',
    left: isOpen ? 'auto' : '-15px',
    backgroundColor: '#738C40',
    border: '2px solid #F4F7F1',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    color: '#F4F7F1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: 9999,
  }

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#738C40',
    width: isOpen ? '250px' : '60px',
    transition: 'width 0.3s',
    position: 'relative',
    overflow: 'hidden', // For clean transitions
  }

  return (
    <div style={containerStyle} className="d-flex flex-column vh-100 p-3">
      {/* Toggle Button (Triangles) */}
      <div style={toggleButtonStyle} onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? (
          <i className="bi bi-chevron-right" style={{ fontSize: '1.2rem' }}></i>
        ) : (
          <i className="bi bi-chevron-left" style={{ fontSize: '1.2rem' }}></i>
        )}
      </div>

      {/* Logo and Welcome */}
      {isOpen && (
        <h2
          className="text-center text-white"
          style={{ fontSize: '1.5rem', marginBottom: '1rem' }}
        >
          FieldBase
        </h2>
      )}

      {isOpen && firstname && lastname && (
        <p className="text-white" style={{ fontSize: '1.2rem' }}>
          Welcome, {firstname} {lastname}
        </p>
      )}

      {/* Add some margin-top to push menu items lower */}
      <ul
        className="nav flex-column"
        style={{ fontSize: '1.2rem', marginTop: '2rem' }}
      >
        {/* Organization Profile */}
        <li className="nav-item">
          <div
            onClick={() => toggleDropdown('organization')}
            style={{
              ...navLinkStyle,
              ...(openDropdown === 'organization' ? activeLinkStyle : {}),
            }}
          >
            <i className="bi bi-building me-2"></i>
            {isOpen && 'Organization Profile'}
          </div>
          {openDropdown === 'organization' && (
            <ul style={dropdownListStyle}>
              <li>
                <Link
                  to="/register"
                  style={{
                    ...dropdownLinkStyle,
                    ...(isActive('/register') ? activeLinkStyle : {}),
                  }}
                >
                  Group Admin
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
        <li className="nav-item mt-3">
          <div
            onClick={() => toggleDropdown('project')}
            style={{
              ...navLinkStyle,
              ...(openDropdown === 'project' ? activeLinkStyle : {}),
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
        <li className="nav-item mt-3">
          <div
            onClick={() => toggleDropdown('activity')}
            style={{
              ...navLinkStyle,
              ...(openDropdown === 'activity' ? activeLinkStyle : {}),
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
