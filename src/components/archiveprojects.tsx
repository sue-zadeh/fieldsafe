// import React, { useEffect, useState } from 'react'
// import axios from 'axios'

// interface Project {
//   id: number
//   name: string
//   location: string
//   startDate: string
//   imageUrl?: string
//   inductionFileUrl?: string
//   status: string
//   primaryContactName?: string
//   primaryContactPhone?: string
//   emergencyServices?: string
//   objectiveTitles?: string
//   localMedicalCenterAddress?: string
//   localMedicalCenterPhone?: string
// }
// interface ArchProjectProps {
//   isSidebarOpen: boolean
// }

// const ArchiveProjects: React.FC<ArchProjectProps> = ({ isSidebarOpen }) => {
//   const [archivedProjects, setArchivedProjects] = useState([])

//   useEffect(() => {
//     const fetchProjects = async () => {
//       try {
//         const res = await axios.get('/api/projects/list')
//         const archived = res.data.filter((p: any) => p.status === 'archived')
//         setArchivedProjects(archived)
//       } catch (err) {
//         console.error('Failed to fetch archived projects:', err)
//       }
//     }
//     fetchProjects()
//   }, [])

//   return (
//     <div
//       className={`container-fluid ${
//         isSidebarOpen ? 'content-expanded' : 'content-collapsed'
//       }`}
//       style={{
//         marginLeft: isSidebarOpen ? '220px' : '20px',
//         transition: 'margin 0.3s ease',
//         minHeight: '100vh',
//         paddingTop: '10px',
//         backgroundColor: '#F4F7F1',
//       }}
//     >
//       <h2 className="my-4">Archived Projects</h2>
//       <div className="row">
//         {archivedProjects.map((project) => (
//           <div key={project.id} className="col-md-4">
//             <div className="card">
//               <div className="card-body">
//                 <h5 className="card-title">{project.name}</h5>
//                 <p className="card-text">{project.location}</p>
//                 <p className="card-text">
//                   Start Date: {new Date(project.startDate).toLocaleDateString()}
//                 </p>
//                 {/* Add more project details here */}
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default ArchiveProjects
