import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { FaUserPlus, FaUsers, FaTasks, FaUserCog } from 'react-icons/fa'
import { MdGroups, MdVolunteerActivism, MdLocalActivity } from 'react-icons/md'
import {
  BsCalendar2Plus,
  BsCalendarCheck,
  BsPersonFillAdd,
} from 'react-icons/bs'

interface SidebarProps {
  isOpen: boolean // State for sidebar open/collapse
  toggleSidebar: () => void // Callback to toggle sidebar
  firstname?: string
  lastname?: string
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const location = useLocation()

  // Retrieve admin's name from localStorage
  const firstname = localStorage.getItem('firstname') || 'Admin'
  const lastname = localStorage.getItem('lastname') || ''
  console.log('Retrieved Firstname:', firstname) // Debugging
  console.log('Retrieved Lastname:', lastname) // Debugging

  // Display admin's name or fallback to "Admin"
  const displayName =
    firstname && lastname ? `${firstname} ${lastname}` : 'Admin'

  // Toggles the dropdown menu
  const toggleDropdown = (dropdown: string) => {
    setOpenDropdown((prev) => (prev === dropdown ? null : dropdown))
  }

  // Check if path is active
  const isActive = (path: string) => location.pathname === path

  // Sidebar container styling
  const sidebarStyle: React.CSSProperties = {
    backgroundColor: '#738C40',
    width: isOpen ? '225px' : '20px',
    transition: 'width 0.3s',
    position: 'fixed',
    // height: 'calc(100% - 56px)', // Adjust height to account for navbar
    height: '100vh',
    top: '56px', // Push sidebar below the navbar
    overflowY: 'auto', // Allow scroll only if content overflows
    overflowX: 'hidden', // Prevent horizontal scrolling
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    zIndex: 1000,
  }

  const toggleButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    right: '-9px',
    backgroundColor: '#F4F7F1',
    border: 'none',
    color: '#738C40',
    fontSize: '1.75rem',
    cursor: 'pointer',
    // padding: '0.35rem',
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
          <p style={welcomeStyle}>Welcome {displayName}</p>
        </>
      )}

      <div>
        <NavItem label="Organization Profile" dropdownId="organization">
          <ul style={dropdownListStyle}>
            <li>
              <Link
                to="/registerroles"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/registerroles')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <FaUserPlus style={{ marginRight: '8px' }} /> Add User
              </Link>
            </li>
            <li>
              <Link
                to="/groupadmin"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/groupadmin')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <i className=" fa-solid fa-user-group-crown"></i>
                <MdGroups style={{ marginRight: '8px' }} />
                Group Admin
              </Link>
            </li>
            <li>
              <Link
                to="/teamlead"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/teamlead')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <FaUsers style={{ marginRight: '8px' }} />
                Team Leader
              </Link>
            </li>
            <li>
              <Link
                to="/fieldstaff"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/fieldstaff')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <FaUserCog style={{ marginRight: '8px' }} />
                Field Staff
              </Link>
            </li>
          </ul>
        </NavItem>

        <NavItem label="Volunteer" dropdownId="volunteer">
          <ul style={dropdownListStyle}>
            <li>
              <Link
                to="/registervolunteer"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/registervolunteer')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <BsPersonFillAdd style={{ marginRight: '8px' }} />
                Add Volunteer
              </Link>
            </li>

            <li>
              <Link
                to="/volunteer"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/volunteer')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <MdVolunteerActivism style={{ marginRight: '8px' }} />
                Volunteer
              </Link>
            </li>
          </ul>
        </NavItem>

        <NavItem label="Projects" dropdownId="project">
          <ul style={dropdownListStyle}>
            <li>
              <Link
                to="/projects/addproject"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/projects/addproject')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                {' '}
                <BsCalendar2Plus style={{ marginRight: '8px' }} />
                Add Project
              </Link>
            </li>
            <li>
              <Link
                to="/projects/searchproject"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/projects/searchproject')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                {' '}
                <BsCalendarCheck style={{ marginRight: '8px' }} />
                Search Project
              </Link>
            </li>
          </ul>
        </NavItem>
        <NavItem label="Activities Notes" dropdownId="activity">
          <ul style={dropdownListStyle}>
            <li>
              <Link
                to="/activities/addactivity"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/activities/addactivity')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <MdLocalActivity style={{ marginRight: '8px' }} />
                Add Activity
              </Link>
            </li>
            <li>
              <Link
                to="/activities/searchactivity"
                style={{
                  ...dropdownLinkStyle,
                  ...(isActive('/activities/searchactivity')
                    ? { fontWeight: 'bold', color: '#000' }
                    : {}),
                }}
              >
                <FaTasks style={{ marginRight: '8px' }} />
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
