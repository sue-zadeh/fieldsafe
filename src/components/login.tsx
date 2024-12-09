import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa' // Import eye icons for password visibility toggle
// import axios from 'axios'

interface LoginProps {
  onLoginSuccess: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false) // State for remembering user
  const [isLoading, setIsLoading] = useState(false) // State to show loading during login
  const [isForgotPassword, setIsForgotPassword] = useState(false) // State for Forgot Password toggle
  const [showPassword, setShowPassword] = useState(false) // State for toggling password visibility

  // Load remembered username and password from localStorage on component mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    const savedPassword = localStorage.getItem('password')
    if (savedUsername && savedPassword) {
      setUsername(savedUsername)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  // Function to handle login
  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter a username and password.')
      return
    }

    setIsLoading(true) // Show loading spinner
    try {
      // const user = {username, password}
      // await axios.post('/api/login', user, {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }), // Send username and password to the server
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed. Please try again.')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setIsLoading(false)

      if (data.message === 'Login successful') {
        onLoginSuccess()
        setError('')

        // Save username and password if "Remember Me" is checked
        if (rememberMe) {
          localStorage.setItem('username', username)
          localStorage.setItem('password', password)
        } else {
          localStorage.removeItem('username')
          localStorage.removeItem('password')
        }
      } else {
        setError(data.message || 'Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Error during login:', err)
      setIsLoading(false)
      setError('Server error. Please try again.')
    }
  }

  // Function to toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <div
      className="login-container d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: '#F4F7F1' }}
    >
      <div
        className="login-box p-4 shadow rounded"
        style={{ backgroundColor: '#FFFFFF', width: '400px' }}
      >
        {/* Header */}
        <h2 className="text-center mb-4" style={{ color: '#76D6E2' }}>
          Welcome to FieldBase
        </h2>
        <h3 className="text-center my-4" style={{ color: '#76D6E2' }}>
          <i>{isForgotPassword ? 'Forgot Password' : 'Login'}</i>
        </h3>

        {/* Username Input */}
        <div className="form-group mb-3">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            className="form-control"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Password Input with Toggle Icon */}
        {!isForgotPassword && (
          <div className="form-group mb-3 position-relative">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'} // Dynamically change input type
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Eye Icon for Toggling Password Visibility */}
            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3"
              style={{ cursor: 'pointer', fontSize: '1.5rem' }} // Center and enlarge icon
              onClick={togglePasswordVisibility}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        )}

        {/* Error Message */}
        {error && <div className="text-danger">{error}</div>}

        {/* Remember Me Checkbox */}
        {!isForgotPassword && (
          <div className="form-group form-check">
            <input
              type="checkbox"
              id="rememberMe"
              className="form-check-input"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
            />
            <label htmlFor="rememberMe" className="form-check-label">
              Remember Me
            </label>
          </div>
        )}

        {/* Login Button */}
        {!isForgotPassword && (
          <button
            className="btn w-100 mt-3"
            style={{ backgroundColor: '#0094B6', color: 'white' }}
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        )}

        {/* Forgot Password Button */}
        <button
          className="btn w-100 mt-3 btn-link"
          style={{ color: '#0094B6' }}
          onClick={() => setIsForgotPassword(!isForgotPassword)}
        >
          {isForgotPassword ? 'Back to Login' : 'Forgot Password?'}
        </button>
      </div>
    </div>
  )
}

export default Login
