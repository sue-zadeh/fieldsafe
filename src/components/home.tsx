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
        // Push content to the right if sidebar is open
        marginLeft: isSidebarOpen ? '220px' : '20px',

        // Push content down so it appears *below* the navbar
        // Your navbar is typically ~56px tall, so 5rem is a safe offset
        paddingTop: '5rem',

        minHeight: '100vh',
        transition: 'margin 0.3s ease',

        // Set the background to your welcome image:
        backgroundImage: `url(${Welcompage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Center content with flexbox */}
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: '80vh' }}
      >
        {/* A card in the middle */}
        <div
          className="shadow"
          style={{
            width: '350px',
            backgroundColor: 'rgba(230, 243, 243, 0.85)',
            borderRadius: '8px',
            padding: '2rem',
            textAlign: 'center',
            zIndex: '1',
          }}
        >
          <h1
            className="mb-3 fw-bold"
            style={{ color: '#738C40', wordSpacing: '4px' }}
          >
            Welcome
          </h1>
          <h3 className="mb-0" style={{ color: '#444' }}>
            Nau mai, Haere mai
          </h3>
        </div>
      </div>
    </div>
  )
}

export default Home
