import React, { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/sidebar'
import Login from './components/login'
import Register from './components/Register'

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLoginSuccess = () => {
    setIsLoggedIn(true)
  }

  return (
    <Router>
      <div>
        {!isLoggedIn ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : (
          <div className="d-flex">
            <Sidebar />
            <div className="p-4 flex-grow-1">
              <Routes>
                <Route path="/register" element={<Register />} />
                {/* Add more routes as needed */}
              </Routes>
            </div>
          </div>
        )}
      </div>
    </Router>
  )
}

export default App
