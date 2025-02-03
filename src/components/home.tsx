import React, { useEffect } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Welcompage from '../assets/welcompage2.jpg'

interface HomeProps {
  isSidebarOpen: boolean
}

const Home: React.FC<HomeProps> = ({ isSidebarOpen }) => {
  useEffect(() => {
    AOS.init({ duration: 1200 })
  }, [])

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '50px',
        transition: 'margin 0.3s ease',
        padding: 0,
        // Make sure our container can fill the viewport
        minHeight: '100vh',
        width: '100%',
        // Next 3 lines: the full-page background
        backgroundImage: `url(${Welcompage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay to darken the background for readability */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: isSidebarOpen ? '220px' : '10px', // so overlay matches the offset
          // width: 'calc(100% - ' + (isSidebarOpen ? '0px' : '10px') + ')',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none', // so clicks pass through
          transition: 'left 0.3s ease',
        }}
      ></div>

      {/* Content container: center everything */}
      <div
        className="d-flex flex-column align-items-center justify-content-center"
        style={{
          position: 'relative',
          zIndex: 2, // above the overlay
          width: '100%',
          minHeight: '100vh',
          textAlign: 'center',
          color: '#fff',
        }}
      >
        <h1
          data-aos="fade-down-right"
          style={{
            fontSize: 'clamp(2rem, 6vw, 4rem)',
            marginBottom: '1rem',
            fontWeight: 'bold',
          }}
        >
          Welcome
        </h1>
        <h2
          data-aos="fade-up"
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}
        >
          Nau mai, Haere mai
        </h2>
      </div>
    </div>
  )
}

export default Home
