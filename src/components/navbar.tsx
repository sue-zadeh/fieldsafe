import React from 'react'
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
// import Logo from '../assets/logo3.png'
import Logo from '../assets/logo1.png'

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
  const location = useLocation()

  // Simple helper to see if the current route matches:
  const isActive = (path: string) => location.pathname === path

  // get role from localStorage after login
  const role = localStorage.getItem('userRole') // or 'authRole'

  return (
    <nav
      className="navbar navbar-expand-lg"
      style={{
        backgroundColor: '#76D6E2',
        color: '#1A1A1A',
        padding: '0.15rem 3rem',
        position: 'fixed',
        top: 0,
        width: '100%',
        zIndex: 1050,
      }}
    >
      <div className="container-fluid">
        {/* Logo on the left */}
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img
            src={Logo}
            alt="logo"
            className="img-fluid me-2"
            style={{ maxHeight: '50px' }}
          />
        </Link>

        {/* Hamburger toggler for small screens */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNavDropdown"
          aria-controls="navbarNavDropdown"
          aria-expanded="false"
          aria-label="Toggle navigation"
          style={{ backgroundColor: '#F4F7F1' }}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Collapsible area */}
        <div className="collapse navbar-collapse" id="navbarNavDropdown">
          <ul className="navbar-nav ms-auto fs-6">
            {/* Projects */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="projectsDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/addproject') || isActive('/searchproject')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <BsCalendar2Plus style={{ marginRight: '5px' }} />
                Projects
              </a>
              <ul className="dropdown-menu" aria-labelledby="projectsDropdown">
                <li>
                  <Link
                    to="/addproject"
                    className="dropdown-item "
                    style={{
                      fontWeight: isActive('/addproject') ? 'bold' : 'normal',
                    }}
                  >
                    <BsCalendar2Plus style={{ marginRight: '5px' }} />
                    {location.pathname === '/editproject'
                      ? 'Edit Project'
                      : 'Add Project'}
                  </Link>
                </li>

                <li>
                  <Link
                    to="/searchproject"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/searchproject')
                        ? 'bold'
                        : 'normal',
                    }}
                  >
                    <BsCalendarCheck style={{ marginRight: '5px' }} />
                    Search Project
                  </Link>
                </li>
              </ul>
            </li>

            {/* Activity Notes */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="activityDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/addactivity') || isActive('/searchactivity')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <MdLocalActivity style={{ marginRight: '5px' }} />
                Activity Notes
              </a>
              <ul className="dropdown-menu" aria-labelledby="activityDropdown">
                <li>
                  <Link
                    to="/addactivity"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/addactivity') ? 'bold' : 'normal',
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
            </li>

            {/* Organization Profile */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle w-100"
                href="#"
                id="organizationDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/registerroles') ||
                    isActive('/groupadmin') ||
                    isActive('/teamlead') ||
                    isActive('/fieldstaff') ||
                    isActive('/objectives')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <MdGroups style={{ marginRight: '5px' }} />
                Organization Profile
              </a>
              <ul
                className="dropdown-menu"
                aria-labelledby="organizationDropdown"
              >
                {role === 'Group Admin' && (
                  <li>
                    <Link
                      to="/registerroles"
                      className="dropdown-item"
                      style={{
                        fontWeight: isActive('/registerroles')
                          ? 'bold'
                          : 'normal',
                      }}
                    >
                      <FaUserPlus style={{ marginRight: '5px' }} />
                      Add User
                    </Link>
                  </li>
                )}
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

                <li>
                  <Link
                    to="/objectives"
                    className="dropdown-item"
                    style={{
                      fontWeight: isActive('/objectives') ? 'bold' : 'normal',
                    }}
                  >
                    <FaBullseye style={{ marginRight: '5px' }} />
                    Add Objective
                  </Link>
                </li>
              </ul>
            </li>

            {/* Volunteer */}
            <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="volunteerDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/registervolunteer') || isActive('/volunteer')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <MdVolunteerActivism style={{ marginRight: '5px' }} />
                Volunteer
              </a>
              <ul className="dropdown-menu" aria-labelledby="volunteerDropdown">
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
            </li>

            {/*===== Objectives ======= */}
            {/* <li className="nav-item dropdown px-3">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="objectiveDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{
                  color: '#1A1A1A',
                  fontWeight:
                    isActive('/objectives') || isActive('/objectives')
                      ? 'bold'
                      : 'normal',
                }}
              >
                <FaBullseye style={{ marginRight: '5px' }} />
                Objectives
              </a>
              <ul
                className="dropdown-menu"
                aria-labelledby="objectiveDropdown"
              ></ul>
            </li> */}
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
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
