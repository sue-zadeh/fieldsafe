import React, { useState, useEffect } from 'react'
import {
  Button,
  Table,
  Modal,
  Form,
  Tabs,
  Tab,
  Alert,
  ButtonGroup,
} from 'react-bootstrap'
import axios from 'axios'

interface ProjectRiskProps {
  isSidebarOpen: boolean
  projectId: number
  projectName: string
}

interface RiskTitle {
  id: number
  title: string
  isReadOnly?: boolean
}

interface RiskRow {
  projectRiskId: number // from project_risks
  riskId: number // from risks
  risk_title_id: number
  risk_title_label: string
  likelihood: string
  consequences: string
  risk_rating: string
}

interface ProjectRiskControl {
  id: number
  project_id: number
  risk_control_id: number
  control_text: string
}

interface Hazard {
  id: number
  hazard_description: string
}

export const ProjectRisk: React.FC<ProjectRiskProps> = ({
  isSidebarOpen,
  projectId,
  projectName,
}) => {
  const [message, setMessage] = useState<string | null>(null)

  //----- RISK data -----
  const [allRiskTitles, setAllRiskTitles] = useState<RiskTitle[]>([])
  const [projectRisks, setProjectRisks] = useState<RiskRow[]>([])
  const [projectRiskControls, setProjectRiskControls] = useState<
    ProjectRiskControl[]
  >([])

  //----- Add‐Risk Modal -----
  const [showAddRiskModal, setShowAddRiskModal] = useState(false)
  const [selectedRiskTitleId, setSelectedRiskTitleId] = useState<number | null>(
    null
  )
  const [riskControlsForTitle, setRiskControlsForTitle] = useState<
    { id: number; control_text: string }[]
  >([])
  const [chosenControlIds, setChosenControlIds] = useState<number[]>([])
  const [likelihood, setLikelihood] = useState('')
  const [consequences, setConsequences] = useState('')
  const [localRiskRating, setLocalRiskRating] = useState('') // computed locally
  const [newControlText, setNewControlText] = useState('')

  //----- Hazards -----
  const [siteHazards, setSiteHazards] = useState<Hazard[]>([])
  const [activityHazards, setActivityHazards] = useState<Hazard[]>([])
  const [projectSiteHazards, setProjectSiteHazards] = useState<Hazard[]>([])
  const [projectActivityHazards, setProjectActivityHazards] = useState<
    Hazard[]
  >([])
  const [showHazardModal, setShowHazardModal] = useState(false)
  const [hazardTab, setHazardTab] = useState<'site' | 'activity'>('site')
  const [selectedHazardIds, setSelectedHazardIds] = useState<number[]>([])

  //==================== MOUNT: load everything
  useEffect(() => {
    loadAllRiskTitles()
    loadProjectRisks()
    loadProjectRiskControls()
    loadAllHazards()
    loadProjectHazards()
  }, [])

  const loadAllRiskTitles = async () => {
    try {
      const res = await axios.get('/api/risks')
      setAllRiskTitles(res.data)
    } catch (err) {
      console.error('Error loadAllRiskTitles:', err)
      setMessage('Failed to load risk titles.')
    }
  }

  const loadProjectRisks = async () => {
    try {
      // e.g. /api/project_risks?projectId=...
      const res = await axios.get(`/api/project_risks?projectId=${projectId}`)
      setProjectRisks(res.data)
    } catch (err) {
      console.error('Error loadProjectRisks:', err)
      setMessage('Failed to load project risks.')
    }
  }

  const loadProjectRiskControls = async () => {
    try {
      const res = await axios.get(
        `/api/project_risk_controls?projectId=${projectId}`
      )
      setProjectRiskControls(res.data)
    } catch (err) {
      // optional
    }
  }

  //================= Local risk rating logic ================
  useEffect(() => {
    // whenever user changes "likelihood" or "consequences",
    // compute a local rating (matching your MySQL logic as closely as possible)
    setLocalRiskRating(computeLocalRiskRating(likelihood, consequences))
  }, [likelihood, consequences])

  // This function replicates your MySQL CASE logic
  // so the user sees the same rating label in the modal
  function computeLocalRiskRating(like: string, cons: string): string {
    if (!like || !cons) return ''
    // make them lower for matching
    const l = like.toLowerCase().trim()
    const c = cons.toLowerCase().trim()

    if (l === 'highly unlikely') {
      if (['insignificant', 'minor', 'moderate'].includes(c)) return 'Low risk'
      if (c === 'major') return 'moderate risk'
      if (c === 'catastrophic') return 'High risk'
    }
    if (l === 'unlikely') {
      if (c === 'insignificant') return 'Low risk'
      if (['minor', 'moderate'].includes(c)) return 'moderate risk'
      if (['major', 'catastrophic'].includes(c)) return 'High risk'
    }
    if (l === 'quite possible') {
      if (c === 'insignificant') return 'Low risk'
      if (c === 'minor') return 'moderate risk'
      if (['moderate', 'major'].includes(c)) return 'High risk'
      if (c === 'catastrophic') return 'Extreme risk'
    }
    if (l === 'likely') {
      if (['minor', 'moderate'].includes(c)) return 'High risk'
      if (c === 'insignificant') return 'moderate risk'
      if (['major', 'catastrophic'].includes(c)) return 'Extreme risk'
    }
    if (l === 'almost certain') {
      if (c === 'insignificant') return 'moderate risk'
      if (c === 'minor') return 'High risk'
      if (c === 'moderate') return 'Extreme risk'
      if (['major', 'catastrophic'].includes(c)) return 'Extreme risk'
    }
    return 'Unknown'
  }

  //================= Hazards
  const loadAllHazards = async () => {
    try {
      const siteRes = await axios.get('/api/site_hazards')
      setSiteHazards(siteRes.data)
      const actRes = await axios.get('/api/activity_people_hazards')
      setActivityHazards(actRes.data)
    } catch (err) {
      console.error('Error loadAllHazards:', err)
      setMessage('Failed to load hazards.')
    }
  }
  const loadProjectHazards = async () => {
    try {
      const shRes = await axios.get(
        `/api/project_site_hazards?projectId=${projectId}`
      )
      setProjectSiteHazards(shRes.data)
      const ahRes = await axios.get(
        `/api/project_activity_people_hazards?projectId=${projectId}`
      )
      setProjectActivityHazards(ahRes.data)
    } catch (err) {
      console.error('Error loadProjectHazards:', err)
      setMessage('Failed to load project hazards.')
    }
  }

  //================= Add Risk Modal
  const openAddRiskModal = () => {
    setShowAddRiskModal(true)
    setSelectedRiskTitleId(null)
    setRiskControlsForTitle([])
    setChosenControlIds([])
    setLikelihood('')
    setConsequences('')
    setNewControlText('')
    setLocalRiskRating('')
  }
  const closeAddRiskModal = () => {
    setShowAddRiskModal(false)
  }

  const handlePickRiskTitle = async (riskTitleId: number) => {
    setSelectedRiskTitleId(riskTitleId)
    try {
      const res = await axios.get(`/api/risks/${riskTitleId}/controls`)
      setRiskControlsForTitle(res.data) // array of {id, control_text}
      setChosenControlIds([])
    } catch (err) {
      console.error('Error handlePickRiskTitle:', err)
      setMessage('Failed to load controls for chosen risk title.')
    }
  }

  const toggleChooseControl = (ctrlId: number) => {
    setChosenControlIds((prev) =>
      prev.includes(ctrlId)
        ? prev.filter((x) => x !== ctrlId)
        : [...prev, ctrlId]
    )
  }

  // Add a new control text to the chosen risk title
  const handleAddNewControl = async () => {
    if (!selectedRiskTitleId || !newControlText.trim()) return
    try {
      await axios.post(`/api/risks/${selectedRiskTitleId}/controls`, {
        control_text: newControlText.trim(),
      })
      setNewControlText('')
      // reload that risk title’s controls
      const res = await axios.get(`/api/risks/${selectedRiskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
    } catch (err) {
      console.error('Error adding new control:', err)
      setMessage('Failed to add new control.')
    }
  }

  // Actually save the newly chosen risk to the project
  const handleSaveNewProjectRisk = async () => {
    if (!selectedRiskTitleId || !likelihood || !consequences) {
      setMessage('Please pick a risk title, likelihood, and consequence.')
      return
    }
    try {
      // 1) create row in `risks`
      const createRes = await axios.post('/api/risks-create-row', {
        risk_title_id: selectedRiskTitleId,
        likelihood,
        consequences,
        // The DB will compute actual risk_rating using your MySQL column
      })
      const newRiskId = createRes.data.riskId

      // 2) link to project
      await axios.post('/api/project_risks', {
        project_id: projectId,
        risk_id: newRiskId,
      })

      // 3) link chosen controls => project_risk_controls
      for (const cid of chosenControlIds) {
        await axios.post('/api/project_risk_controls', {
          project_id: projectId,
          risk_control_id: cid,
          is_checked: true,
        })
      }

      setMessage('Project risk saved successfully!')
      closeAddRiskModal()
      loadProjectRisks()
      loadProjectRiskControls()
    } catch (err) {
      console.error('Error handleSaveNewProjectRisk:', err)
      setMessage('Failed to save project risk.')
    }
  }

  //================= Remove Risk
  const handleRemoveRisk = async (risk: RiskRow) => {
    if (
      !window.confirm(`Remove risk "${risk.risk_title_label}" from project?`)
    ) {
      return
    }
    try {
      // 1) remove from project_risk_controls
      await axios.delete(
        `/api/project_risk_controls?projectId=${projectId}&riskId=${risk.riskId}`
      )
      // 2) remove from project_risks
      await axios.delete(
        `/api/project_risks?projectId=${projectId}&riskId=${risk.riskId}`
      )
      setMessage('Removed risk from project.')
      loadProjectRisks()
      loadProjectRiskControls()
    } catch (err) {
      console.error('Error removing risk:', err)
      setMessage('Failed to remove risk.')
    }
  }

  const handleEditRisk = (risk: RiskRow) => {
    // you’d open an “Edit Risk” modal, etc.
    setMessage('Edit risk not yet implemented.')
  }

  //================= Hazards
  const openHazardModal = (type: 'site' | 'activity') => {
    setHazardTab(type)
    setSelectedHazardIds([])
    setShowHazardModal(true)
  }
  const closeHazardModal = () => {
    setShowHazardModal(false)
  }
  const toggleHazardSelected = (hid: number) => {
    setSelectedHazardIds((prev) =>
      prev.includes(hid) ? prev.filter((x) => x !== hid) : [...prev, hid]
    )
  }
  const handleSaveHazards = async () => {
    try {
      if (hazardTab === 'site') {
        for (const hid of selectedHazardIds) {
          await axios.post('/api/project_site_hazards', {
            project_id: projectId,
            site_hazard_id: hid,
          })
        }
      } else {
        // activity
        for (const hid of selectedHazardIds) {
          await axios.post('/api/project_activity_people_hazards', {
            project_id: projectId,
            activity_people_hazard_id: hid,
          })
        }
      }
      setMessage('Hazards added successfully.')
      closeHazardModal()
      loadProjectHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to save hazards.')
    }
  }
  const handleRemoveSiteHazard = async (haz: Hazard) => {
    if (!window.confirm(`Remove site hazard "${haz.hazard_description}"?`))
      return
    try {
      await axios.delete(
        `/api/project_site_hazards?projectId=${projectId}&hazardId=${haz.id}`
      )
      setMessage('Removed site hazard.')
      loadProjectHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove site hazard.')
    }
  }
  const handleRemoveActivityHazard = async (haz: Hazard) => {
    if (!window.confirm(`Remove activity hazard "${haz.hazard_description}"?`))
      return
    try {
      await axios.delete(
        `/api/project_activity_people_hazards?projectId=${projectId}&hazardId=${haz.id}`
      )
      setMessage('Removed activity hazard.')
      loadProjectHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove activity hazard.')
    }
  }

  //================= auto-clear any <Alert> after 5s
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(t)
    }
  }, [message])

  return (
    <div
      className={` ${isSidebarOpen ? 'content-expanded' : 'content-collapsed'}`}
    >
      {message && (
        <Alert
          variant="info"
          onClose={() => setMessage(null)}
          dismissible
          className="text-center"
        >
          {message}
        </Alert>
      )}

      <h3 className="mb-3" style={{ fontWeight: 'bold' }}>
        Determine “Risk” and Hazards for the Project
      </h3>
      <h5 style={{ marginBottom: '1rem' }}>
        Selected Project:{' '}
        <span style={{ color: '#0094B6' }}>{projectName}</span>
      </h5>

      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>Risks</h4>
        <Button variant="primary" onClick={openAddRiskModal}>
          + Add Risk
        </Button>
      </div>
      <Table bordered hover responsive>
        <thead>
          <tr>
            <th>Risk Title</th>
            <th>Selected Controls</th>
            <th>Likelihood</th>
            <th>Consequence</th>
            <th>Risk Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {projectRisks.map((r) => (
            <tr key={r.riskId}>
              <td>{r.risk_title_label}</td>
              <td>(Placeholder for chosen controls)</td>
              <td>{r.likelihood}</td>
              <td>{r.consequences}</td>
              <td>{r.risk_rating}</td>
              <td>
                <ButtonGroup>
                  <Button
                    variant="warning"
                    size="sm"
                    onClick={() => handleEditRisk(r)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveRisk(r)}
                  >
                    Remove
                  </Button>
                </ButtonGroup>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <h4 className="mt-4">Hazards</h4>
      <Tabs
        activeKey={hazardTab}
        onSelect={(k) => {
          if (k === 'site' || k === 'activity') setHazardTab(k)
        }}
        className="mb-3"
      >
        <Tab eventKey="site" title="Site Hazards">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2"
            onClick={() => openHazardModal('site')}
          >
            + Add Site Hazards
          </Button>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Hazard Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectSiteHazards.map((h) => (
                <tr key={h.id}>
                  <td>{h.hazard_description}</td>
                  <td>
                    <ButtonGroup>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveSiteHazard(h)}
                      >
                        Remove
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
        <Tab eventKey="activity" title="Activity/People Hazards">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2"
            onClick={() => openHazardModal('activity')}
          >
            + Add Activity Hazards
          </Button>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Hazard Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projectActivityHazards.map((h) => (
                <tr key={h.id}>
                  <td>{h.hazard_description}</td>
                  <td>
                    <ButtonGroup>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemoveActivityHazard(h)}
                      >
                        Remove
                      </Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
      </Tabs>

      {/* ===== ADD RISK MODAL ===== */}
      <Modal show={showAddRiskModal} onHide={closeAddRiskModal}>
        <Modal.Header closeButton>
          <Modal.Title>Project Risk Assessment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* “Select risk” (risk title) */}
          <Form.Group
            className="mb-3"
            style={{
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              overflowX: 'hidden',
              maxWidth: '100%',
            }}
            controlId="riskTitleSelect"
          >
            <Form.Label>Select Risk Title</Form.Label>
            <Form.Select
              value={selectedRiskTitleId ?? ''}
              onChange={(e) => handlePickRiskTitle(Number(e.target.value))}
              style={{
                maxHeight: '150px',
                overflowY: 'auto',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                overflowWrap: 'break-word',
              }}
            >
              <option value="" style={{ whiteSpace: 'normal' }}>
                -- Select Risk --
              </option>
              {allRiskTitles.map((rt) => (
                <option
                  key={rt.id}
                  value={rt.id}
                  style={{
                    maxHeight: '150px',
                    maxWidth: '50%',
                    overflowY: 'auto',
                    whiteSpace: 'normal',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                >
                  {rt.title}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3 flex-fill">
            <Form.Label>Consequences</Form.Label>
            <Form.Select
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
            >
              <option value="">-- Select Consequence --</option>
              <option>insignificant</option>
              <option>minor</option>
              <option>moderate</option>
              <option>major</option>
              <option>catastrophic</option>
            </Form.Select>
          </Form.Group>

          {/* Risk Rating (read‐only) */}
          <Form.Group className="mb-3">
            <Form.Label>Risk Rating</Form.Label>
            <Form.Control
              type="text"
              placeholder=""
              readOnly
              value={localRiskRating}
            />
            <Form.Text className="text-muted"></Form.Text>
          </Form.Group>

          {/* Additional Risk Controls → show existing controls for chosen risk + let user pick or add */}
          {selectedRiskTitleId && (
            <div className="mb-3">
              <h5>Additional Risk Controls</h5>
              <div
                style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '6px',
                  marginBottom: '0.5rem',
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  overflowWrap: 'break-word',
                }}
              >
                {riskControlsForTitle.map((ctrl) => (
                  <Form.Check
                    key={ctrl.id}
                    type="checkbox"
                    label={ctrl.control_text}
                    checked={chosenControlIds.includes(ctrl.id)}
                    onChange={() => toggleChooseControl(ctrl.id)}
                  />
                ))}
              </div>
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                  }}
                  placeholder="Add new control text..."
                  value={newControlText}
                  onChange={(e) => setNewControlText(e.target.value)}
                />
                <Button variant="success" onClick={handleAddNewControl}>
                  +
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeAddRiskModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveNewProjectRisk}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== ADD HAZARDS MODAL ===== */}
      <Modal show={showHazardModal} onHide={closeHazardModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {hazardTab === 'site'
              ? 'Add Site Hazards'
              : 'Add Activity/People Hazards'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: '300px',
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {hazardTab === 'site'
            ? siteHazards.map((h) => (
                <Form.Check
                  key={h.id}
                  type="checkbox"
                  label={h.hazard_description}
                  checked={selectedHazardIds.includes(h.id)}
                  onChange={() => toggleHazardSelected(h.id)}
                />
              ))
            : activityHazards.map((h) => (
                <Form.Check
                  key={h.id}
                  type="checkbox"
                  label={h.hazard_description}
                  checked={selectedHazardIds.includes(h.id)}
                  onChange={() => toggleHazardSelected(h.id)}
                />
              ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeHazardModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveHazards}>
            Save Hazards
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default ProjectRisk
