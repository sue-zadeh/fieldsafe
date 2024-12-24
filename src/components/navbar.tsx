import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaUserPlus, FaUsers, FaTasks, FaUserCog } from 'react-icons/fa'
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
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => setIsMenuOpen((prev) => !prev)

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light"
      style={{
        backgroundColor: '#76D6E2', 
        padding: '0.5rem 1rem', // for better spacing with sidebar
        position: 'fixed', // to stick with the sidebar
        width: '100%',
        zIndex: 1050,
      }}
    >
      <div className="container-fluid">
        <img
          src={Logo}
          alt="logo"
          className="img-fluid m-1"
          style={{
            maxHeight: '50px', // Restricts the maximum height
          }}
        />
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleMenu}
          aria-controls="navbarNavDropdown"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div
          className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`}
          id="navbarNavDropdown"
        >
          <ul className="navbar-nav ms-auto">
            <li className="nav-item dropdown">
              <Link
                to="#"
                className="nav-link dropdown-toggle"
                id="organizationDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <MdGroups style={{ marginRight: '5px' }} />
                Organization Profile
              </Link>
              <ul
                className="dropdown-menu"
                aria-labelledby="organizationDropdown"
              >
                <li>
                  <Link to="/registerroles" className="dropdown-item">
                    <FaUserPlus style={{ marginRight: '5px' }} />
                    Add User
                  </Link>
                </li>
                <li>
                  <Link to="/groupadmin" className="dropdown-item">
                    <MdGroups style={{ marginRight: '5px' }} />
                    Group Admin
                  </Link>
                </li>
                <li>
                  <Link to="/teamlead" className="dropdown-item">
                    <FaUsers style={{ marginRight: '5px' }} />
                    Team Leader
                  </Link>
                </li>
                <li>
                  <Link to="/fieldstaff" className="dropdown-item">
                    <FaUserCog style={{ marginRight: '5px' }} />
                    Field Staff
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <Link
                to="#"
                className="nav-link dropdown-toggle"
                id="volunteerDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <MdVolunteerActivism style={{ marginRight: '5px' }} />
                Volunteer
              </Link>
              <ul className="dropdown-menu" aria-labelledby="volunteerDropdown">
                <li>
                  <Link to="/registervolunteer" className="dropdown-item">
                    <BsPersonFillAdd style={{ marginRight: '5px' }} />
                    Add Volunteer
                  </Link>
                </li>
                <li>
                  <Link to="/volunteer" className="dropdown-item">
                    <MdVolunteerActivism style={{ marginRight: '5px' }} />
                    Volunteer
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <Link
                to="#"
                className="nav-link dropdown-toggle"
                id="projectDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <BsCalendar2Plus style={{ marginRight: '5px' }} />
                Projects
              </Link>
              <ul className="dropdown-menu" aria-labelledby="projectDropdown">
                <li>
                  <Link to="/projects/addproject" className="dropdown-item">
                    <BsCalendar2Plus style={{ marginRight: '5px' }} />
                    Add Project
                  </Link>
                </li>
                <li>
                  <Link to="/projects/searchproject" className="dropdown-item">
                    <BsCalendarCheck style={{ marginRight: '5px' }} />
                    Search Project
                  </Link>
                </li>
              </ul>
            </li>
            <li className="nav-item dropdown">
              <Link
                to="#"
                className="nav-link dropdown-toggle"
                id="activitiesDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <MdLocalActivity style={{ marginRight: '5px' }} />
                Activities Notes
              </Link>
              <ul
                className="dropdown-menu"
                aria-labelledby="activitiesDropdown"
              >
                <li>
                  <Link to="/activities/addactivity" className="dropdown-item">
                    <MdLocalActivity style={{ marginRight: '5px' }} />
                    Add Activity
                  </Link>
                </li>
                <li>
                  <Link
                    to="/activities/searchactivity"
                    className="dropdown-item"
                  >
                    <FaTasks style={{ marginRight: '5px' }} />
                    Search Activity
                  </Link>
                </li>
              </ul>
            </li>
            {isLoggedIn && (
              <li className="nav-item">
                <button
                  className="btn btn-outline-danger ms-2"
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
