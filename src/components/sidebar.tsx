import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

interface SidebarProps {
  isOpen: boolean // State for sidebar open/collapse
  toggleSidebar: () => void // Callback to toggle sidebar
  firstname?: string
  lastname?: string
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  toggleSidebar,
  firstname = '',
  lastname = '',
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()

  // Toggles the dropdown menu
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  // Display admin's name or fallback to "Admin"
  const displayName =
    firstname && lastname ? `${firstname} ${lastname}` : 'Admin'

  // Check if path is active
  const isActive = (path: string) => location.pathname === path

  // Sidebar container styling
  const sidebarStyle: React.CSSProperties = {
    backgroundColor: '#738C40',
    width: isOpen ? '250px' : '25px',
    transition: 'width 0.3s',
    position: 'fixed',
    height: '100%',
    overflowY: 'auto',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
  }

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: '-15px',
    backgroundColor: '#F4F7F1',
    border: 'none',
    color: '#738C40',
    fontSize: '1.5rem',
    cursor: 'pointer',
    padding: '0.25rem',
    borderRadius: '50%',
  }

  const headingStyle: React.CSSProperties = {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    color: '#F4F7F1',
    marginBottom: '1rem',
    marginLeft: '1rem',
    marginTop: '3rem',
    textAlign: 'left',
  }

  const welcomeStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: '#F4F7F1',
    textAlign: 'center',
    marginBottom: '4rem',
  }

  const navItemStyle = (isActive: boolean): React.CSSProperties => ({
    color: '#F4F7F1',
    fontSize: '1.25rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    fontWeight: isActive ? 'bold' : 'normal',
    backgroundColor: isActive ? 'rgba(244,247,241,0.2)' : 'transparent',
  })

  const dropdownListStyle: React.CSSProperties = {
    backgroundColor: '#F4F7F1',
    listStyle: 'none',
    margin: '0.5rem 0',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
  }

  const dropdownLinkStyle: React.CSSProperties = {
    color: '#1A1A1A',
    textDecoration: 'none',
    display: 'block',
    padding: '0.3rem 0',
    fontSize: '1rem',
  }

  const NavItem: React.FC<{
    label: string
    dropdownId?: string
    children?: React.ReactNode
  }> = ({ label, dropdownId, children }) => {
    const handleClick = () => {
      if (dropdownId) toggleDropdown(dropdownId)
    }

    return (
      <>
        <div
          onClick={dropdownId ? handleClick : undefined}
          style={navItemStyle(openDropdown === dropdownId)}
        >
          {isOpen && label}
        </div>
        {isOpen && openDropdown === dropdownId && (
          <div style={{ paddingLeft: '1rem' }}>{children}</div>
        )}
      </>
    )
  }

  return (
    <div style={sidebarStyle}>
      <button style={toggleButtonStyle} onClick={toggleSidebar}>
        {isOpen ? '←' : '→'}
      </button>

      {isOpen && (
        <>
          <h2 style={headingStyle}>FieldBase</h2>
          <p style={welcomeStyle}>Welcome, {displayName}</p>
        </>
      )}

      <div>
        <NavItem label="Organization Profile" dropdownId="organization">
          <ul style={dropdownListStyle}>
            <li>
              <Link
                to="/register"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/register')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                Add User
              </Link>
            </li>
            <li>
              <Link to="/groupadmin" style={dropdownLinkStyle}>
                Group Admin
              </Link>
            </li>
            <li>
              <Link to="/teamleader" style={dropdownLinkStyle}>
                Team Leader
              </Link>
            </li>
            <li>
              <Link to="/fieldstaff" style={dropdownLinkStyle}>
                Field Staff
              </Link>
            </li>
            <li>
              <Link to="/volunteer" style={dropdownLinkStyle}>
                Volunteer
              </Link>
            </li>
          </ul>
        </NavItem>
        <NavItem label="Projects" dropdownId="project">
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
        </NavItem>
        <NavItem label="Activities Notes" dropdownId="activity">
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
        </NavItem>
      </div>
    </div>
  )
}

export default Sidebar
