import React, { useState, useEffect } from 'react'
import { FaEye, FaEyeSlash } from 'react-icons/fa' // Icons for password toggle

interface LoginProps {
  onLoginSuccess: () => void
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)
  const [showPassword, setShowPassword] = useState(false) // For toggling password visibility

  // Load saved username and password from localStorage
  useEffect(() => {
    const savedUsername = localStorage.getItem('username')
    const savedPassword = localStorage.getItem('password')
    if (savedUsername && savedPassword) {
      setUsername(savedUsername)
      setPassword(savedPassword)
      setRememberMe(true)
    }
  }, [])

  // Login handler
  const handleLogin = async () => {
    if (!username || !password) {
      setError('Please enter a username and password.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setError(errorData.message || 'Login failed.')
        setIsLoading(false)
        return
      }

      const data = await response.json()
      setIsLoading(false)

      if (data.message === 'Login successful') {
        onLoginSuccess()
        if (rememberMe) {
          localStorage.setItem('username', username)
          localStorage.setItem('password', password)
        } else {
          localStorage.removeItem('username')
          localStorage.removeItem('password')
        }
        setError('')
      } else {
        setError(data.message || 'Login failed.')
      }
    } catch (err) {
      console.error('Error during login:', err)
      setError('Server error. Please try again.')
      setIsLoading(false)
    }
  }

  // Handle Forgot Password functionality
  const handleForgotPassword = async () => {
    if (!username) {
      setError('Please enter your email.')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: username }),
      })

      const data = await response.json()
      setIsLoading(false)

      if (data.message === 'Password reset email sent successfully') {
        alert('Password reset email sent. Check your inbox.')
        setError('')
      } else {
        setError(data.message || 'Failed to send password reset email.')
      }
    } catch (err) {
      console.error('Error during password reset:', err)
      setIsLoading(false)
      setError('Server error. Please try again.')
    }
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
        <h2 className="text-center mb-4" style={{ color: '#76D6E2' }}>
          Welcome to FieldBase
        </h2>
        <h3 className="text-center my-4" style={{ color: '#76D6E2' }}>
          {isForgotPassword ? 'Forgot Password' : 'Login'}
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

        {/* Password Input */}
        {!isForgotPassword && (
          <div className="form-group mb-3 position-relative">
            <label htmlFor="password">Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {/* Eye Icon */}
            <span
              className="position-absolute top-50 end-0 translate-middle-y pe-3"
              style={{
                cursor: 'pointer',
                fontSize: '1.5rem',
              }}
              onClick={() => setShowPassword(!showPassword)}
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

        {/* Buttons */}
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
        {isForgotPassword && (
          <button
            className="btn w-100 mt-3"
            style={{ backgroundColor: '#0094B6', color: 'white' }}
            onClick={handleForgotPassword}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Send Password Reset Email'}
          </button>
        )}

        {/* Forgot Password Toggle */}
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
