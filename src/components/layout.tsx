// src/components/Layout.tsx
import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './navbar'
import Sidebar from './sidebar'

interface LayoutProps {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

const Layout: React.FC<LayoutProps> = ({ isSidebarOpen, toggleSidebar }) => {
  return (
    <>
      <Navbar
        onLogout={() => {
          /* your logout logic */
        }}
        isLoggedIn={true}
        isLoggingOut={false}
      />
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        firstname="John"
        lastname="Doe"
      />
      <div
        style={{
          marginLeft: isSidebarOpen ? '227px' : '20px',
          marginTop: '56px',
          transition: 'margin-left 0.3s ease',
          padding: '20px',
          minHeight: '100vh',
        }}
      >
        <Outlet />
      </div>
    </>
  )
}

export default Layout
