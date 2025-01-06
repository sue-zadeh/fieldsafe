import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { LoadScript } from '@react-google-maps/api'
import { Modal, Button } from 'react-bootstrap'

import Navbar from './components/navbar'
import Login from './components/login'
import Sidebar from './components/sidebar'
import Registerroles from './components/registerroles'
import Groupadmin from './components/groupadmin'
import Fieldstaff from './components/fieldstaff'
import Teamlead from './components/teamlead'
import Registervolunteer from './components/registervolunteer'
import Volunteer from './components/volunteer'
import AddProject from './components/AddProject'
import SearchProject from './components/searchproject'
import AddObjective from './components/addobjective'
import Objective from './components/objectives'
// import ArchiveProj from './components/archiveprojects'
// import Layout from './components/layout'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)
  const navigate = useNavigate()

  // For inactivity:
  const [inactivityTimeout, setInactivityTimeout] = useState<number>(
    10 * 60_000
  )
  // ^ e.g. 10 minutes, in ms
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [countdown, setCountdown] = useState(30) // seconds left in the warning modal
  const [showSessionExpiredAlert, setShowSessionExpiredAlert] = useState(false)

  // references for timeouts so we can clear them
  const sessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ------------------------------------------
  // On mount: handle window resize for sidebar responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOpen(window.innerWidth >= 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // ------------------------------------------
  // Inactivity watchers
  useEffect(() => {
    const startInactivityTimer = () => {
      // 1) Show modal 30 secs before logout
      const sessionTimer = setTimeout(() => {
        setShowSessionModal(true)
      }, inactivityTimeout - 30_000) // e.g. 9.5 minutes if inactivityTimeout=10 min

      // 2) Then auto-logout at inactivityTimeout
      const logoutTimer = setTimeout(() => {
        // If we reached here, user never clicked "Stay Logged In"
        handleAutoLogout()
      }, inactivityTimeout)

      sessionTimeoutRef.current = sessionTimer
      logoutTimeoutRef.current = logoutTimer
    }

    const resetTimer = () => {
      // user moved mouse or typed => reset everything
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current)
      }
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current)
      }
      setShowSessionModal(false)
      setCountdown(30)
      startInactivityTimer()
    }

    // Start timers on mount
    startInactivityTimer()
    // Reset if user interacts
    window.addEventListener('mousemove', resetTimer)
    window.addEventListener('keydown', resetTimer)

    return () => {
      // cleanup
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current)
      if (logoutTimeoutRef.current) clearTimeout(logoutTimeoutRef.current)
      window.removeEventListener('mousemove', resetTimer)
      window.removeEventListener('keydown', resetTimer)
    }
  }, [inactivityTimeout])

  // If the session modal is visible, start the 30-sec countdown
  useEffect(() => {
    if (showSessionModal) {
      const intervalId = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId)
          }
          return prev > 0 ? prev - 1 : 0
        })
      }, 1000)
      return () => clearInterval(intervalId)
    }
  }, [showSessionModal])

  // If countdown hits 0, auto-logout
  useEffect(() => {
    if (countdown === 0 && showSessionModal) {
      handleAutoLogout()
    }
    // eslint-disable-next-line
  }, [countdown])

  const handleStayLoggedIn = () => {
    setShowSessionModal(false)
    setCountdown(30)
    // The timers themselves get reset by the user’s mouse or key press
  }

  const handleAutoLogout = () => {
    setShowSessionModal(false)
    setCountdown(30)
    // Actually do the logout
    setShowSessionExpiredAlert(true) // show a one-time alert that session expired
    handleLogout()
  }

  // ------------------------------------------
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
            // So if user had a stale token, show an alert once:
            setShowSessionExpiredAlert(true)
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

    // Redirect after a slight delay
    setTimeout(() => {
      setLogoutMessage(null)
      setIsLoggingOut(false)
      navigate('/')
    }, 1500)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev)
  }

  const mainContentStyle: React.CSSProperties = {
    marginLeft: isSidebarOpen ? '20px' : '5px',
    width: isSidebarOpen ? 'calc(100% - 240px)' : '100%',
    padding: '15px',
    marginTop: '2.5rem',
    transition: 'all 0.3s ease',
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      {/* If the session just expired, show an alert once */}
      {showSessionExpiredAlert && (
        <div className="alert alert-warning text-center">
          Your session has expired due to inactivity. Please log in again.
        </div>
      )}
      {/* If we just logged out, show a success message */}
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
              <LoadScript
                googleMapsApiKey={GOOGLE_MAPS_API_KEY}
                libraries={['places']}
              >
                <Routes>
                  <Route
                    path="/registerroles"
                    element={<Registerroles isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/groupadmin"
                    element={<Groupadmin isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/fieldstaff"
                    element={<Fieldstaff isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/teamlead"
                    element={<Teamlead isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/registervolunteer"
                    element={
                      <Registervolunteer isSidebarOpen={isSidebarOpen} />
                    }
                  />
                  <Route
                    path="/volunteer"
                    element={<Volunteer isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/AddProject"
                    element={<AddProject isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/Addobjective"
                    element={<AddObjective isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/objectives"
                    element={<Objective isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/SearchProject"
                    element={<SearchProject isSidebarOpen={isSidebarOpen} />}
                  />
                  {/* etc. */}
                </Routes>
              </LoadScript>
            </div>
          </div>
        </div>
      )}

      {/* Session Timeout Warning Modal */}
      <Modal show={showSessionModal} onHide={handleAutoLogout}>
        <Modal.Header closeButton>
          <Modal.Title>Session Timeout Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Your session will expire in {countdown} seconds. Do you want to stay
          logged in?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleStayLoggedIn}>
            Stay Logged In
          </Button>
          <Button variant="danger" onClick={handleAutoLogout}>
            Logout
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default App
