// // ParentLayout.tsx
// import React, { useState } from 'react'
// import Sidebar from './sidebar'
// import { Outlet } from 'react-router-dom'

// const ParentLayout: React.FC = () => {
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false)

//   return (
//     <div style={{ display: 'flex' }}>
//       <Sidebar
//         isOpen={isSidebarOpen}
//         toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//       />
//       {/* main content shifts based on isSidebarOpen */}
//       <div
//         style={{
//           marginLeft: isSidebarOpen ? '220px' : '40px',
//           transition: 'margin 0.3s ease',
//           width: '100%',
//           padding: '1rem',
//         }}
//       >
//         {/* <Outlet> is replaced by whichever child route is active */}
//         <Outlet />
//       </div>
//     </div>
//   )
// }

// export default ParentLayout
