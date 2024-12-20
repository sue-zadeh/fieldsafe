import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from './components/sidebar'
import Navbar from './components/navbar'
import Login from './components/login'
import Register from './components/registerroles'
import Volunteer from './components/volunteer'
import Groupadmin from './components/groupadmin'
import Usertable from './components/usertable'

// import Fieldstaff from './components/fieldstaff'
// import Teamlead from './components/teamlead'

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768) // Responsive sidebar
  const navigate = useNavigate()

  // Handle window resize for sidebar responsiveness
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Token validation on page load
  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('authToken')
      if (token) {
        try {
          const response = await fetch('/api/validate-token', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          if (response.ok) {
            setIsLoggedIn(true)
          } else {
            console.error('Invalid token or session expired')
            localStorage.removeItem('authToken')
          }
        } catch (error) {
          console.error('Error validating token:', error)
          localStorage.removeItem('authToken')
        }
      }
      setIsLoading(false)
    }
    validateToken()
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    navigate('/')
  }

  const handleLogout = () => {
    setIsLoggingOut(true)
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setLogoutMessage('You have successfully logged out.')

    setTimeout(() => {
      setLogoutMessage(null)
      setIsLoggingOut(false)
      navigate('/')
    }, 2000)
  }

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)

  const mainContentStyle: React.CSSProperties = {
    marginLeft: isSidebarOpen ? '225px' : '25px',
    transition: 'all 0.3s ease',
    padding: '10px',
  }

  if (isLoading) return <div>Loading...</div>

  return (
    <div>
      {logoutMessage && (
        <div className="alert alert-success text-center">{logoutMessage}</div>
      )}
      {!isLoggedIn ? (
        <Login onLoginSuccess={handleLoginSuccess} />
      ) : (
        <div className="d-flex flex-column vh-100">
          <Navbar
            onLogout={handleLogout}
            isLoggedIn={isLoggedIn}
            isLoggingOut={isLoggingOut}
          />
          <div className="d-flex flex-grow-1">
            <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <div style={mainContentStyle}>
              <Routes>
                <Route
                  path="/register"
                  element={<Register isSidebarOpen={isSidebarOpen} />}
                />

                <Route
                  path="/:role"
                  element={<Usertable isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/groupadmin"
                  element={<Groupadmin isSidebarOpen={isSidebarOpen} />}
                />
                <Route
                  path="/volunteer"
                  element={<Volunteer isSidebarOpen={isSidebarOpen} />}
                />
                {/* <Route
                  path="/fieldstaff"
                  element={<Fieldstaff isSidebarOpen={isSidebarOpen} />}
                />{' '}
                <Route
                  path="/teamlead"
                  element={<Teamlead isSidebarOpen={isSidebarOpen} />}
                />{' '} */}
              </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
