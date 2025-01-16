import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import ActivityWizard from './activitywizard'

import {
  Navbar,
  Nav,
  Form,
  Button,
  Col,
  Row,
  Modal,
  Alert,
  ListGroup,
} from 'react-bootstrap'


// Calculate risk rating
const riskMatrix: { [key: string]: number } = {
  insignificant: 1,
  minor: 2,
  moderate: 3,
  major: 4,
  catastrophic: 5,
}


interface ProjectRiskProps {
  isSidebarOpen: boolean
}
const ProjectRisk: React.FC<ProjectRiskProps> = ({ isSidebarOpen }) => {
  const [notification, setNotification] = useState<string | null>(null)
  const [Likelihood, setLikelihood] = useState<string | null>(null)
  const [Consequences, setConsequences] = useState<string | null>(null)
  const [additionalControls, setAdditionalControls] = useState<string | null>(null)
  const [riskTitle, setRiskTitle] = useState('')
  const [likelihoodWeight, setLikelihoodWeight] = useState<string | null>(null)
  


  //To know which project is selected
  const location = useLocation()
const { projectId } = location.state || {}

const likelihoodWeight: { [key: string]: number } = {
  'highly unlikely': 1,
  unlikely: 2,
  'quite possible': 3,
  likely: 4,
  'almost certain': 5,
}

const riskRating =
  likelihoodWeight[likelihood.toLowerCase()] *
  riskMatrix[Consequences.toLowerCase()]

try {
  await axios.post('/api/risks', {
    title: riskTitle.trim(),
    likelihood,
    consequences,
    riskRating,
    additionalControls: additionalControls.trim(),
  })
  setNotification('Risk added successfully!')
  setRiskTitle('')
  setLikelihood('')
  setConsequences('')
  setAdditionalControls('')
  fetchRisks()
} catch (err) {
  console.error('Error adding risk:', err)
  setNotification('Failed to add risk.')
}
}


return (
<div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '0px' : '0px',
        transition: 'margin 0.3s ease',
        paddingTop: '2px',
      }}
    >
      <ActivityWizard />
  <h2
    style={{ color: '#0094B6', fontWeight: 'bold', paddingBottom: '4rem' }}
  >
    Add Hazards & Risks
  </h2> 
{notification && (
  <Alert variant="info" className="text-center">
    {notification}
  </Alert>
)}

{/* Risks Section */}
//  <div className="col-md-6">
//  <h4>Risks</h4>
//  <Form onSubmit={handleRiskSubmit}>
//    <Form.Group className="mb-3">
//      <Form.Label>Risk Title</Form.Label>
//      <Form.Control
       type="text"
       placeholder="E.g., Working near water"
       value={riskTitle}
       onChange={(e) => setRiskTitle(e.target.value)}
     />
   </Form.Group>
   <Form.Group className="mb-3">
     <Form.Label>Likelihood</Form.Label>
     <Form.Control
       as="select"
       value={likelihood}
       onChange={(e) => setLikelihood(e.target.value)}
     >
       <option value="">Select Likelihood</option>
       <option>Highly Unlikely</option>
       <option>Unlikely</option>
       <option>Quite Possible</option>
       <option>Likely</option>
       <option>Almost Certain</option>
     </Form.Control>
   </Form.Group>
   <Form.Group className="mb-3">
     <Form.Label>Consequences</Form.Label>
     <Form.Control
       as="select"
       value={consequences}
       onChange={(e) => setConsequences(e.target.value)}
     >
       <option value="">Select Consequences</option>
       <option>Insignificant</option>
       <option>Minor</option>
       <option>Moderate</option>
       <option>Major</option>
       <option>Catastrophic</option>
     </Form.Control>
   </Form.Group>
   <Form.Group className="mb-3">
     <Form.Label>Additional Controls</Form.Label>
     <Form.Control
       as="textarea"
       rows={3}
       placeholder="E.g., Wear gloves, carry sanitizer"
       value={additionalControls}
       onChange={(e) => setAdditionalControls(e.target.value)}
     />
   </Form.Group>
   <Button type="submit">Add Risk</Button>
 </Form>

 <Table bordered hover className="mt-3">
   <thead>
     <tr>
       <th>#</th>
       <th>Title</th>
     </tr>
   </thead>
   <tbody>
     {risks.map((risk, index) => (
       <tr key={risk.id}>
         <td>{index + 1}</td>
         <td>{risk.title}</td>
       </tr>
     ))}
   </tbody>
 </Table>
</div>
</div>
)
}

export default ProjectRisk
