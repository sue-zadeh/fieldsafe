import React from 'react'
import Logo from '../assets/logo2.png'

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
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light"
      style={{
        backgroundColor: '#F4F7F1', // Set background color
        padding: '0.5rem 1rem', // Add padding for better spacing
      }}
    >
      <div className="container-fluid">
        <img
          src={Logo}
          alt="logo"
          className="img-fluid m-1" // Makes the image responsive
          style={{
            maxHeight: '50px', // Restricts the maximum height
          }}
        />

        {isLoggedIn && (
          <button
            className="btn btn-outline-danger"
            onClick={onLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
