import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  FaUserPlus,
  FaUsers,
  FaUserCog,
  FaTasks,
  FaBullseye,
} from 'react-icons/fa'
import { MdGroups, MdVolunteerActivism, MdLocalActivity } from 'react-icons/md'
import {
  BsCalendar2Plus,
  BsCalendarCheck,
  BsPersonFillAdd,
} from 'react-icons/bs'
import Logo from '../assets/logo3.png'

interface NavbarProps {
  onLogout: () => void
  isLoggedIn: boolean
  isLoggingOut: boolean
}

const Navbar: React.FC<NavbarProps> = ({
  onLogout,
  isLoggedIn,
  isLoggingOut,
}) => {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(
    null as null
  )
  const location = useLocation()

  const toggleDropdown = (dropdown: string) => {
    setActiveDropdown((prev) => (prev === dropdown ? (null as null) : dropdown))
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: '#76D6E2',
        color: '#1A1A1A',
        padding: '0.5rem 1.5rem',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1050,
      }}
    >
      <div className="container-fluid">
        <img
          src={Logo}
          alt="logo"
          className="img-fluid me-3"
          style={{ maxHeight: '50px' }}
        />
        <div className="navbar-nav ms-auto d-flex align-items-center">
          {/* Organization Profile */}
          <div
            className={`nav-item dropdown ${
              activeDropdown === 'organization' ? 'show' : ''
            }`}
            onMouseEnter={() => toggleDropdown('organization')}
            onMouseLeave={() => setActiveDropdown(null as null)}
          >
            <a
              href="#"
              className="nav-link dropdown-toggle"
              id="organizationDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded={activeDropdown === 'organization'}
              style={{
                color: '#1A1A1A',
                fontWeight:
                  activeDropdown === 'organization' ? 'bold' : 'normal',
                marginRight: '0.5rem',
                marginLeft: '1rem',
              }}
            >
              <MdGroups style={{ marginRight: '5px' }} />
              Organization Profile
            </a>
            <ul
              className={`dropdown-menu ${
                activeDropdown === 'organization' ? 'show' : ''
              }`}
            >
              <li>
                <Link
                  to="/registerroles"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/registerroles') ? 'bold' : 'normal',
                  }}
                >
                  <FaUserPlus style={{ marginRight: '5px' }} />
                  Add User
                </Link>
              </li>
              <li>
                <Link
                  to="/groupadmin"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/groupadmin') ? 'bold' : 'normal',
                  }}
                >
                  <MdGroups style={{ marginRight: '5px' }} />
                  Group Admin
                </Link>
              </li>
              <li>
                <Link
                  to="/teamlead"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/teamlead') ? 'bold' : 'normal',
                  }}
                >
                  <FaUsers style={{ marginRight: '5px' }} />
                  Team Leader
                </Link>
              </li>
              <li>
                <Link
                  to="/fieldstaff"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/fieldstaff') ? 'bold' : 'normal',
                  }}
                >
                  <FaUserCog style={{ marginRight: '5px' }} />
                  Field Staff
                </Link>
              </li>
            </ul>
          </div>

          {/* Volunteer */}
          <div
            className={`nav-item dropdown ${
              activeDropdown === 'volunteer' ? 'show' : ''
            }`}
            onMouseEnter={() => toggleDropdown('volunteer')}
            onMouseLeave={() => setActiveDropdown(null as null)}
          >
            <a
              href="#"
              className="nav-link dropdown-toggle"
              id="volunteerDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded={activeDropdown === 'volunteer'}
              style={{
                color: '#1A1A1A',
                fontWeight: activeDropdown === 'volunteer' ? 'bold' : 'normal',
                marginRight: '0.5rem',
                marginLeft: '1rem',
              }}
            >
              <MdVolunteerActivism style={{ marginRight: '5px' }} />
              Volunteer
            </a>
            <ul
              className={`dropdown-menu ${
                activeDropdown === 'volunteer' ? 'show' : ''
              }`}
            >
              <li>
                <Link
                  to="/registervolunteer"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/registervolunteer')
                      ? 'bold'
                      : 'normal',
                  }}
                >
                  <BsPersonFillAdd style={{ marginRight: '5px' }} />
                  Add Volunteer
                </Link>
              </li>
              <li>
                <Link
                  to="/volunteer"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/volunteer') ? 'bold' : 'normal',
                  }}
                >
                  <MdVolunteerActivism style={{ marginRight: '5px' }} />
                  Volunteer
                </Link>
              </li>
            </ul>
          </div>

          {/* Projects */}
          <div
            className={`nav-item dropdown ${
              activeDropdown === 'projects' ? 'show' : ''
            }`}
            onMouseEnter={() => toggleDropdown('projects')}
            onMouseLeave={() => setActiveDropdown(null as null)}
          >
            <a
              href="#"
              className="nav-link dropdown-toggle"
              id="projectDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded={activeDropdown === 'projects'}
              style={{
                color: '#1A1A1A',
                fontWeight: activeDropdown === 'projects' ? 'bold' : 'normal',
                marginRight: '0.5rem',
                marginLeft: '1rem',
              }}
            >
              <BsCalendar2Plus style={{ marginRight: '5px' }} />
              Projects
            </a>
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="addproject"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/projects/addproject')
                      ? 'bold'
                      : 'normal',
                  }}
                >
                  <BsCalendar2Plus style={{ marginRight: '5px' }} />
                  Add Project
                </Link>
              </li>
              <li>
                <Link
                  to="searchproject"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/projects/searchproject')
                      ? 'bold'
                      : 'normal',
                  }}
                >
                  <BsCalendarCheck style={{ marginRight: '5px' }} />
                  Search Project
                </Link>
              </li>
            </ul>
          </div>

          {/* Activity Notes */}
          <div
            className={`nav-item dropdown ${
              activeDropdown === 'activity' ? 'show' : ''
            }`}
            onMouseEnter={() => toggleDropdown('activity')}
            onMouseLeave={() => setActiveDropdown(null as null)}
          >
            <a
              href="#"
              className="nav-link dropdown-toggle"
              id="activityDropdown"
              role="button"
              data-bs-toggle="dropdown"
              aria-expanded={activeDropdown === 'activity'}
              style={{
                color: '#1A1A1A',
                fontWeight: activeDropdown === 'activity' ? 'bold' : 'normal',
                marginRight: '0.5rem',
                marginLeft: '1rem',
              }}
            >
              <MdLocalActivity style={{ marginRight: '5px' }} />
              Activity Notes
            </a>
            <ul className="dropdown-menu">
              <li>
                <Link
                  to="addactivity"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/addactivity')
                      ? 'bold'
                      : 'normal',
                  }}
                >
                  <MdLocalActivity style={{ marginRight: '5px' }} />
                  Add Activity
                </Link>
              </li>
              <li>
                <Link
                  to="/searchactivity"
                  className="dropdown-item"
                  style={{
                    fontWeight: isActive('/searchactivity')
                      ? 'bold'
                      : 'normal',
                  }}
                >
                  <FaTasks style={{ marginRight: '5px' }} />
                  Search Activity
                </Link>
              </li>
            </ul>
          </div>

          {/* Objectives */}
          <div className="nav-item">
            <Link
              to="/objectives"
              className="nav-link"
              style={{
                color: '#1A1A1A',
                fontWeight: isActive('/objectives') ? 'bold' : 'normal',
                marginRight: '0.5rem',
                marginLeft: '1rem',
              }}
            >
              <FaBullseye style={{ marginRight: '5px' }} />
              Objectives
            </Link>
          </div>

          {/* Logout */}
          {isLoggedIn && (
            <li className="nav-item">
              <button
                className="btn btn-outline-danger ms-3"
                onClick={onLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </li>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
