import React, { useEffect } from 'react'
import Welcompage from '../assets/welcompage2.jpg'
import AOS from 'aos'
import 'aos/dist/aos.css'

interface FirstPageProps {
  isSidebarOpen: boolean
}

const FirstPage: React.FC<FirstPageProps> = ({ isSidebarOpen }) => {
  // Initialize AOS once
  useEffect(() => {
    AOS.init({ duration: 1200 })
  }, [])

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        position: 'relative',
        marginLeft: isSidebarOpen ? '240px' : '40px',
        transition: 'margin 0.3s ease',
        height: '100vh',
        width: '100%',
        // overflow: 'hidden',
        padding: 0, // remove extra padding
      }}
    >
      {/* Background container with an overlay */}
      <div
        data-aos="fade-down"
        style={{
          position: 'fixed',
          width: '100%',
          height: '95%',
          backgroundImage: `url(${Welcompage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          borderBottom: '5px solid darkred',
        }}
      >
        {/* Dark overlay for readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 1,
          }}
        />
      </div>

      {/* Centered text with AOS animations */}
      <div
        className="container-fluid position-fixed position-absolute top-50 start-50 translate-middle text-center text-light"
        style={{ zIndex: 1 }} // above the overlay
      >
        <h1
          style={{ fontSize: '4rem', textAlign: 'center' }}
          data-aos="fade-down-right"
        >
          Welcome
        </h1>
        <h2 className=" fw-bold" data-aos="fade-up">
          Nau mai, Haere mai
        </h2>
      </div>
    </div>
  )
}

export default FirstPage
