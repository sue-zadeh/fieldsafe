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
import AddRisk from './components/addrisk'
import AddHazard from './components/addhazard'
// import ProjectDetail from './components/projectdetails'
// import ProjectRisk from './components/projectrisk'
import ActivityWizard from './components/activitytabs'

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768)
  const navigate = useNavigate()

  // For inactivity:
  const INACTIVITY_LIMIT = 200 * 60_000 // 200 minutes in ms
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [countdown, setCountdown] = useState(120) // 2 minutes
  const [showSessionExpiredAlert, setShowSessionExpiredAlert] = useState(false)

  // references for timeouts so we can clear them
  const sessionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

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
    // 1) Start or reset the inactivity timers
    const startTimers = () => {
      // Timer #1: after (INACTIVITY_LIMIT - 120_000), show the modal
      // For 20 min total, show the modal after 19 min.
      sessionTimerRef.current = setTimeout(() => {
        setShowSessionModal(true)
        // Now we also start the logout timer:
        logoutTimerRef.current = setTimeout(() => {
          handleAutoLogout()
        }, 120_000) // 1 minute after the modal
      }, INACTIVITY_LIMIT - 120_000) // 200 minutes
    }
    // If the user does any mouse or key activity BEFORE the modal is shown,
    //    reset both timers. But if the modal is already visible,
    //    it do NOT reset (the user must click "Stay Logged In")
    const handleUserActivity = () => {
      if (!showSessionModal) {
        // reset timers
        if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
        if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
        setCountdown(60)
        // hide the modal if it was showing (shouldn't be if !showSessionModal, but just in case)
        setShowSessionModal(false)
        startTimers()
      }
    }

    // Start the timers when the component mounts
    startTimers()

    // Listen for user activity
    window.addEventListener('mousemove', handleUserActivity)
    window.addEventListener('keydown', handleUserActivity)

    return () => {
      // cleanup
      if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
      if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
      window.removeEventListener('mousemove', handleUserActivity)
      window.removeEventListener('keydown', handleUserActivity)
    }
  }, [showSessionModal]) //depends on showSessionModal

  // If the session modal is visible, start the 120-sec countdown
  useEffect(() => {
    if (showSessionModal) {
      setCountdown(120) // reset to 120
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

  // If countdown hits 0 while the modal is open, auto-logout
  useEffect(() => {
    if (countdown === 0 && showSessionModal) {
      handleAutoLogout()
    }
  }, [countdown, showSessionModal])

  const handleStayLoggedIn = () => {
    // user clicked "Stay Logged In"
    setShowSessionModal(false)
    setCountdown(60)
    // reset the inactivity timers for another full 20 minutes
    if (sessionTimerRef.current) clearTimeout(sessionTimerRef.current)
    if (logoutTimerRef.current) clearTimeout(logoutTimerRef.current)
  }

  const handleAutoLogout = () => {
    setShowSessionModal(false)
    setCountdown(60)
    setShowSessionExpiredAlert(true)
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
      {/* If just logged out, show a success message */}
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
                version="beta"
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
                    path="/SearchProject"
                    element={<SearchProject isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/addrisk"
                    element={<AddRisk isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/addhazard"
                    element={<AddHazard isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/activity-notes"
                    element={<ActivityWizard isSidebarOpen={true} />}
                  />

                  {/* <Route
                    path="/projectdetail"
                    element={<ProjectDetail isSidebarOpen={isSidebarOpen} />}
                  />
                  <Route
                    path="/projectrisk"
                    element={<ProjectRisk isSidebarOpen={isSidebarOpen} />}
                  /> */}
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
