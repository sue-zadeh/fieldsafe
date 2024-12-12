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

  const displayName =
    firstname && lastname ? `${firstname} ${lastname}` : 'Admin'

  const sidebarStyle: React.CSSProperties = {
    backgroundColor: '#738C40',
    width: isOpen ? '250px' : '60px',
    transition: 'width 0.3s',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
  }

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '20px',
    left: isOpen ? '210px' : '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#F4F7F1',
    fontSize: '1.5rem',
    cursor: 'pointer',
    zIndex: 9999,
  }

  const headingStyle: React.CSSProperties = {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    textAlign: 'center',
    color: '#F4F7F1',
  }

  const welcomeStyle: React.CSSProperties = {
    fontSize: '1.2rem',
    color: '#F4F7F1',
    textAlign: 'center',
    marginBottom: '2rem',
  }

  const navItemContainerStyle: React.CSSProperties = {
    marginTop: '3rem',
  }

  const navLinkStyle: React.CSSProperties = {
    color: '#F4F7F1',
    fontSize: '1.1rem',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  }

  const activeLinkStyle: React.CSSProperties = {
    fontWeight: 'bold',
  }

  const dropdownListStyle: React.CSSProperties = {
    backgroundColor: '#F4F7F1',
    listStyle: 'none',
    margin: '0.5rem 0 0 0',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
  }

  const dropdownLinkStyle: React.CSSProperties = {
    color: '#1A1A1A',
    textDecoration: 'none',
    display: 'block',
    padding: '0.3rem 0',
    transition: 'background-color 0.2s',
  }

  const topNavHoverBg = 'rgba(244,247,241,0.2)'
  const dropdownHoverBg = '#e0e0e0'

  const mergeStyles = (
    ...styles: (React.CSSProperties | undefined)[]
  ): React.CSSProperties => Object.assign({}, ...styles)

  const NavItem: React.FC<{
    icon: string
    label: string
    dropdownId?: string
    marginTop?: string
    children?: React.ReactNode
  }> = ({ icon, label, dropdownId, marginTop, children }) => {
    const isDropdownOpen = dropdownId && openDropdown === dropdownId
    const handleClick = () => {
      if (dropdownId) toggleDropdown(dropdownId)
    }

    return (
      <>
        <div
          onClick={dropdownId ? handleClick : undefined}
          title={!isOpen ? label : ''} // Tooltip when collapsed
          style={mergeStyles(
            navLinkStyle,
            marginTop ? { marginTop } : {},
            isDropdownOpen ? activeLinkStyle : {}
          )}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = topNavHoverBg)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'transparent')
          }
        >
          <i className={`${icon} me-2`}></i>
          {isOpen && label}
        </div>
        {isOpen && children}
      </>
    )
  }

  const DropdownLink: React.FC<{ to: string; label: string }> = ({
    to,
    label,
  }) => {
    return (
      <li>
        <Link
          to={to}
          style={dropdownLinkStyle}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = dropdownHoverBg)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'transparent')
          }
          className={isActive(to) ? 'active' : ''}
        >
          {label}
        </Link>
      </li>
    )
  }

  return (
    <div style={sidebarStyle} className="d-flex flex-column vh-100">
      <button
        style={toggleButtonStyle}
        onClick={() => setIsOpen(!isOpen)}
        title="Toggle Menu"
      >
        <i className="bi bi-list"></i>
      </button>

      {isOpen && (
        <>
          <h2 style={headingStyle}>FieldBase</h2>
          <p style={welcomeStyle}>Welcome, {displayName}</p>
        </>
      )}

      <div style={navItemContainerStyle}>
        <NavItem
          icon="bi bi-building"
          label="Organization Profile"
          dropdownId="organization"
          marginTop="5.5em"
        >
          {openDropdown === 'organization' && (
            <ul style={dropdownListStyle}>
              <DropdownLink to="/register" label="Group Admin" />
              <DropdownLink to="/team-leader" label="Team Leader" />
              <DropdownLink to="/field-staff" label="Field Staff" />
              <DropdownLink to="/volunteer" label="Volunteer" />
              <DropdownLink to="/objectives" label="Objectives" />
            </ul>
          )}
        </NavItem>

        <NavItem
          icon="bi bi-folder"
          label="Projects"
          dropdownId="project"
          marginTop="1.5rem"
        >
          {openDropdown === 'project' && (
            <ul style={dropdownListStyle}>
              <DropdownLink to="/projects/add" label="Add Project" />
              <DropdownLink to="/projects/search" label="Search Project" />
            </ul>
          )}
        </NavItem>

        <NavItem
          icon="bi bi-journal-text"
          label="Activities Notes"
          dropdownId="activity"
          marginTop="1.5rem"
        >
          {openDropdown === 'activity' && (
            <ul style={dropdownListStyle}>
              <DropdownLink to="/activities/add" label="Add Activity" />
              <DropdownLink to="/activities/search" label="Search Activity" />
            </ul>
          )}
        </NavItem>
      </div>
    </div>
  )
}

export default Sidebar
