import React, { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from './components/sidebar'
import Navbar from './components/navbar'
import Login from './components/login'
import Register from './components/register'

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState<string | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true) // Track loading state while checking the token
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('authToken')

    if (token) {
      // Simulate token validation (mocked API call or basic check)
      fetch('/api/validate-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          setIsLoading(false)
          if (response.ok) {
            setIsLoggedIn(true) // Token is valid
          } else {
            localStorage.removeItem('authToken') // Invalid token, clear it
          }
        })
        .catch(() => {
          setIsLoading(false)
          localStorage.removeItem('authToken') // Error or invalid token
        })
    } else {
      // No token present in localStorage
      setIsLoading(false) // Ensure the loading state ends
    }
  }, [])

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
    navigate('/') // Redirect to the home page after login
  }

  const handleLogout = () => {
    setIsLoggingOut(true) // Disable the logout button
    localStorage.removeItem('authToken')
    setIsLoggedIn(false)
    setLogoutMessage('You have successfully logged out.') // Set the confirmation message

    // Reset logout message and navigate to login page after 2 seconds
    setTimeout(() => {
      setLogoutMessage(null)
      setIsLoggingOut(false)
      navigate('/') // Redirect to login
    }, 2000)
  }

  if (isLoading) {
    return <div>Loading...</div> // Display a loading state while the token is being validated
  }

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
            <Sidebar />
            <div className="p-4 flex-grow-1">
              <Routes>
                <Route path="/register" element={<Register />} />
                {/* Add more protected routes as needed */}
              </Routes>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
