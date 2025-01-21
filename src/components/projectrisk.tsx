import React, { useState, useEffect } from 'react'
import Select from 'react-select'
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
  projectRiskId: number
  riskId: number
  riskTitleId: number // from the backend
  risk_title_label: string
  likelihood: string
  consequences: string
  risk_rating: string
}

interface DetailedRiskControl {
  projectRiskControlId: number
  project_id: number
  risk_control_id: number
  control_text: string
  riskId: number
}

interface RiskControlForTitle {
  id: number
  control_text: string
}

interface Hazard {
  [key: string]: any
  hazard_description: string
}

interface OptionType {
  value: number
  label: string
}

const ProjectRisk: React.FC<ProjectRiskProps> = ({
  isSidebarOpen,
  projectId,
  projectName,
}) => {
  // -------------------------------------------
  // Inline <style> to override active tab color
  // -------------------------------------------
  return (
    <>
      <style>{`
        /* Override .nav-link.active to have #0094B6 color */
        .nav-tabs .nav-link.active {
          color: #0094B6 !important;
          font-weight: bold;
          background-color: #eef8fb !important;
          border-color: #0094B6 #0094B6 transparent !important;
        }
        .nav-tabs .nav-link {
          color: #333;
        }
      `}</style>

      <ProjectRiskInner
        isSidebarOpen={isSidebarOpen}
        projectId={projectId}
        projectName={projectName}
      />
    </>
  )
}

////////////////////////////////////////////////////////////////
// We'll separate the logic into an inner component
// so we can place <style> above easily.
////////////////////////////////////////////////////////////////
const ProjectRiskInner: React.FC<ProjectRiskProps> = ({
  isSidebarOpen,
  projectId,
  projectName,
}) => {
  const [message, setMessage] = useState<string | null>(null)

  // ============ RISK DATA ============
  const [allRiskTitles, setAllRiskTitles] = useState<RiskTitle[]>([])
  const [projectRisks, setProjectRisks] = useState<RiskRow[]>([])
  const [detailedRiskControls, setDetailedRiskControls] = useState<
    DetailedRiskControl[]
  >([])

  // ============ MODAL STATES ============
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingRisk, setEditingRisk] = useState<RiskRow | null>(null)

  // For the form in the modal
  const [selectedRiskTitleId, setSelectedRiskTitleId] = useState<number | null>(
    null
  )
  const [riskControlsForTitle, setRiskControlsForTitle] = useState<
    RiskControlForTitle[]
  >([])
  const [chosenControlIds, setChosenControlIds] = useState<number[]>([])
  const [likelihood, setLikelihood] = useState('')
  const [consequences, setConsequences] = useState('')
  const [localRiskRating, setLocalRiskRating] = useState('')
  const [newControlText, setNewControlText] = useState('')

  // ============ HAZARDS ============
  const [siteHazards, setSiteHazards] = useState<Hazard[]>([])
  const [activityHazards, setActivityHazards] = useState<Hazard[]>([])
  const [projectSiteHazards, setProjectSiteHazards] = useState<Hazard[]>([])
  const [projectActivityHazards, setProjectActivityHazards] = useState<
    Hazard[]
  >([])
  const [showHazardModal, setShowHazardModal] = useState(false)
  const [hazardTab, setHazardTab] = useState<'site' | 'activity'>('site')
  const [selectedHazardIds, setSelectedHazardIds] = useState<number[]>([])

  //=====================================
  //           LOAD ON MOUNT
  //=====================================
  useEffect(() => {
    loadAllRiskTitles()
    loadProjectRisks()
    loadDetailedRiskControls()
    loadAllHazards()
    loadProjectHazards()
  }, [])

  async function loadAllRiskTitles() {
    try {
      const res = await axios.get('/api/risks')
      setAllRiskTitles(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load risk titles.')
    }
  }

  async function loadProjectRisks() {
    try {
      const res = await axios.get(`/api/project_risks?projectId=${projectId}`)
      setProjectRisks(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load project risks.')
    }
  }

  async function loadDetailedRiskControls() {
    try {
      const res = await axios.get(
        `/api/project_risk_controls/detailed?projectId=${projectId}`
      )
      setDetailedRiskControls(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  async function loadAllHazards() {
    try {
      const siteRes = await axios.get('/api/site_hazards')
      setSiteHazards(siteRes.data)
      const actRes = await axios.get('/api/activity_people_hazards')
      setActivityHazards(actRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load hazards.')
    }
  }

  async function loadProjectHazards() {
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
      console.error(err)
      setMessage('Failed to load project hazards.')
    }
  }

  //=====================================
  //         RISK RATING
  //=====================================
  useEffect(() => {
    setLocalRiskRating(computeLocalRiskRating(likelihood, consequences))
  }, [likelihood, consequences])

  function computeLocalRiskRating(like: string, cons: string): string {
    if (!like || !cons) return ''
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

  //=====================================
  //        ADD RISK
  //=====================================
  function openAddRiskModal() {
    setShowRiskModal(true)
    setIsEditing(false)
    setEditingRisk(null)

    // Clear the form
    setSelectedRiskTitleId(null)
    setRiskControlsForTitle([])
    setChosenControlIds([])
    setLikelihood('')
    setConsequences('')
    setNewControlText('')
    setLocalRiskRating('')
  }

  async function handlePickRiskTitle(riskTitleId: number) {
    setSelectedRiskTitleId(riskTitleId)
    try {
      const res = await axios.get(`/api/risks/${riskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
      setChosenControlIds([])
    } catch (err) {
      console.error(err)
      setMessage('Failed to load risk controls for chosen title.')
    }
  }

  function toggleChooseControl(ctrlId: number) {
    setChosenControlIds((prev) =>
      prev.includes(ctrlId)
        ? prev.filter((x) => x !== ctrlId)
        : [...prev, ctrlId]
    )
  }

  async function handleAddNewControl() {
    if (!selectedRiskTitleId || !newControlText.trim()) return
    try {
      await axios.post(`/api/risks/${selectedRiskTitleId}/controls`, {
        control_text: newControlText.trim(),
      })
      setNewControlText('')
      // re-fetch
      const res = await axios.get(`/api/risks/${selectedRiskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new control.')
    }
  }

  //=====================================
  //        EDIT RISK (including controls)
  //=====================================
  function openEditRiskModal(r: RiskRow) {
    setShowRiskModal(true)
    setIsEditing(true)
    setEditingRisk(r)

    setLikelihood(r.likelihood)
    setConsequences(r.consequences)
    setLocalRiskRating(r.risk_rating)

    // fetch that risk title’s controls
    setSelectedRiskTitleId(r.riskTitleId)

    if (r.riskTitleId) {
      axios
        .get(`/api/risks/${r.riskTitleId}/controls`)
        .then((resp) => {
          setRiskControlsForTitle(resp.data)
          // find chosen controls for this risk
          const relevant = detailedRiskControls.filter(
            (dc) => dc.riskId === r.riskId
          )
          setChosenControlIds(relevant.map((dc) => dc.risk_control_id))
        })
        .catch((e) => {
          console.error(e)
          setMessage('Failed to load controls for editing.')
        })
    }
    setNewControlText('')
  }

  async function handleSaveRisk() {
    // Debug logging:
    if (isEditing && editingRisk) {
      console.log(
        'Editing risk ID:',
        editingRisk.riskId,
        'with values => likelihood:',
        likelihood,
        'consequences:',
        consequences
      )
    }

    if (!likelihood || !consequences) {
      setMessage('Please pick a likelihood and consequence.')
      return
    }

    try {
      if (!isEditing) {
        // == ADD MODE ==
        if (!selectedRiskTitleId) {
          setMessage('Please pick a risk title first.')
          return
        }
        const createRes = await axios.post('/api/risks-create-row', {
          risk_title_id: selectedRiskTitleId,
          likelihood,
          consequences,
        })
        const newRiskId = createRes.data.riskId

        await axios.post('/api/project_risks', {
          project_id: projectId,
          risk_id: newRiskId,
        })

        for (const cid of chosenControlIds) {
          await axios.post('/api/project_risk_controls', {
            project_id: projectId,
            risk_control_id: cid,
            is_checked: true,
          })
        }

        setMessage('Project risk added successfully.')
      } else {
        // == EDIT MODE ==
        if (!editingRisk) return
        // Log the ID to confirm it's not undefined
        console.log('PUT /api/risks/', editingRisk.riskId)

        // update the "risks" row
        await axios.put(`/api/risks/${editingRisk.riskId}`, {
          likelihood,
          consequences,
        })

        // remove old controls
        await axios.delete(
          `/api/project_risk_controls?projectId=${projectId}&riskId=${editingRisk.riskId}`
        )

        // re-add newly chosen
        for (const cid of chosenControlIds) {
          await axios.post('/api/project_risk_controls', {
            project_id: projectId,
            risk_control_id: cid,
            is_checked: true,
          })
        }
        setMessage('Project risk updated successfully.')
      }

      setShowRiskModal(false)
      loadProjectRisks()
      loadDetailedRiskControls()
    } catch (err) {
      console.error(err)
      setMessage(isEditing ? 'Failed to update risk.' : 'Failed to add risk.')
    }
  }

  //=====================================
  //        REMOVE RISK
  //=====================================
  async function handleRemoveRisk(r: RiskRow) {
    if (!window.confirm(`Remove risk "${r.risk_title_label}"?`)) return
    try {
      await axios.delete(
        `/api/project_risk_controls?projectId=${projectId}&riskId=${r.riskId}`
      )
      await axios.delete(
        `/api/project_risks?projectId=${projectId}&riskId=${r.riskId}`
      )
      setMessage('Removed risk from project.')
      loadProjectRisks()
      loadDetailedRiskControls()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove risk.')
    }
  }

  //=====================================
  //            HAZARDS
  //=====================================
  function openHazardModal(type: 'site' | 'activity') {
    setHazardTab(type)
    setSelectedHazardIds([])
    setShowHazardModal(true)
  }

  function closeHazardModal() {
    setShowHazardModal(false)
  }

  function toggleHazardSelected(hid: number) {
    setSelectedHazardIds((prev) =>
      prev.includes(hid) ? prev.filter((x) => x !== hid) : [...prev, hid]
    )
  }

  async function handleSaveHazards() {
    try {
      if (hazardTab === 'site') {
        for (const hid of selectedHazardIds) {
          await axios.post('/api/project_site_hazards', {
            project_id: projectId,
            site_hazard_id: hid,
          })
        }
      } else {
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

  async function handleRemoveSiteHazard(h: any) {
    if (!window.confirm(`Remove site hazard "${h.hazard_description}"?`)) return
    try {
      await axios.delete(`/api/project_site_hazards?id=${h.pshId}`)
      setMessage('Removed site hazard.')
      loadProjectHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove site hazard.')
    }
  }

  async function handleRemoveActivityHazard(h: any) {
    if (!window.confirm(`Remove activity hazard "${h.hazard_description}"?`))
      return
    try {
      await axios.delete(`/api/project_activity_people_hazards?id=${h.pahId}`)
      setMessage('Removed activity hazard.')
      loadProjectHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove activity hazard.')
    }
  }

  //=====================================
  //  AUTO-HIDE ALERT
  //=====================================
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(t)
    }
  }, [message])

  //=====================================
  //  RISK TITLE OPTIONS (for react-select)
  //=====================================
  const riskTitleOptions: OptionType[] = allRiskTitles.map((rt) => ({
    value: rt.id,
    label: rt.title,
  }))

  function isOptionDisabled(option: OptionType) {
    const found = projectRisks.find(
      (pr) => pr.risk_title_label === option.label
    )
    return !!found
  }

  //=====================================
  //  HAZARD DISABLE CHECKS
  //=====================================
  function isSiteHazardUsed(hid: number) {
    return projectSiteHazards.some((ph: any) => ph.site_hazard_id === hid)
  }
  function isActivityHazardUsed(hid: number) {
    return projectActivityHazards.some(
      (ph: any) => ph.activity_people_hazard_id === hid
    )
  }

  return (
    <div
      className={isSidebarOpen ? 'content-expanded' : 'content-collapsed'}
      style={{ transition: 'margin 0.3s ease', paddingTop: '1rem' }}
    >
      {message && (
        <Alert variant="info" dismissible onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <h3 style={{ fontWeight: 'bold', color: '#0094B6' }} className="mb-3">
        Determine “Risk” & Hazards for Project: {projectName}
      </h3>

      {/* ==================== RISKS TABLE ==================== */}
      <div>
        <h4 style={{ color: '#0094B6' }}>Risks</h4>
        <Button className='px-4'
          style={{ backgroundColor: '#0094B6'}}
          variant="primary"
          onClick={openAddRiskModal}
        >
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
          {projectRisks.map((r) => {
            const relevantControls = detailedRiskControls.filter(
              (dc) => dc.riskId === r.riskId
            )
            return (
              <tr key={r.riskId}>
                <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {r.risk_title_label}
                </td>
                <td>
                  {relevantControls.map((c, idx) => (
                    <React.Fragment key={idx}>
                      {c.control_text}
                      <br />
                    </React.Fragment>
                  ))}
                </td>
                <td>{r.likelihood}</td>
                <td>{r.consequences}</td>
                <td>{r.risk_rating}</td>
                <td>
                  <ButtonGroup>
                    <Button
                      variant="warning"
                      size="sm"
                      onClick={() => openEditRiskModal(r)}
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
            )
          })}
        </tbody>
      </Table>

      {/* ==================== HAZARDS TABLES ==================== */}
      <h4 style={{ color: '#0094B6' }} className="mt-4">
        Hazards
      </h4>
      <Tabs
        activeKey={hazardTab}
        onSelect={(k) => {
          if (k === 'site' || k === 'activity') {
            setHazardTab(k)
          }
        }}
        className="mb-3 fw-bold"
      >
        <Tab eventKey="site" title="Site Hazards">
          <Button
            variant="secondary"
            size="sm"
            className="mb-2" style={{ backgroundColor: '#0094B6'}}
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
              {projectSiteHazards.map((h: any) => (
                <tr key={h.pshId}>
                  <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {h.hazard_description}
                  </td>
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
          <Button style={{ backgroundColor: '#0094B6'}}
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
              {projectActivityHazards.map((h: any) => (
                <tr key={h.pahId}>
                  <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                    {h.hazard_description}
                  </td>
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

      {/* ===== ADD/EDIT RISK MODAL ===== */}
      <Modal show={showRiskModal} onHide={() => setShowRiskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#0094B6' }}>
            {isEditing ? 'Edit Project Risk' : 'Add Project Risk'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {/* If not editing, let them pick a risk title */}
          {!isEditing && (
            <Form.Group className="mb-3">
              <Form.Label>Risk Title</Form.Label>
              <Select
                options={riskTitleOptions}
                value={
                  selectedRiskTitleId
                    ? riskTitleOptions.find(
                        (op) => op.value === selectedRiskTitleId
                      )
                    : null
                }
                onChange={(option) => {
                  if (option) handlePickRiskTitle(option.value)
                  else setSelectedRiskTitleId(null)
                }}
                isOptionDisabled={(option) => isOptionDisabled(option)}
                placeholder="Select a Risk Title..."
                isClearable
              />
            </Form.Group>
          )}

          {/* Likelihood + Consequence */}
          <div className="d-flex gap-3">
            <Form.Group className="mb-3 flex-fill">
              <Form.Label>Likelihood</Form.Label>
              <Form.Select
                value={likelihood}
                onChange={(e) => setLikelihood(e.target.value)}
              >
                <option value="">-- Select Likelihood --</option>
                <option>highly unlikely</option>
                <option>unlikely</option>
                <option>quite possible</option>
                <option>likely</option>
                <option>almost certain</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3 flex-fill">
              <Form.Label>Consequence</Form.Label>
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
          </div>

          {/* Risk Rating */}
          <Form.Group className="mb-3">
            <Form.Label>Risk Rating</Form.Label>
            <Form.Control type="text" readOnly value={localRiskRating} />
          </Form.Group>

          {/* Show controls if we have a risk title */}
          {selectedRiskTitleId && (
            <div className="mb-3">
              <h5 style={{ color: '#0094B6' }}>Risk Controls</h5>
              <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                Check/uncheck the controls for this risk
              </p>
              <div
                style={{
                  maxHeight: '150px',
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '6px',
                  marginBottom: '0.5rem',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                {riskControlsForTitle.map((ctrl) => (
                  <Form.Check
                    key={ctrl.id}
                    type="checkbox"
                    id={`ctrl-${ctrl.id}`} // unique ID for label toggling
                    label={ctrl.control_text}
                    checked={chosenControlIds.includes(ctrl.id)}
                    onChange={() => toggleChooseControl(ctrl.id)}
                    style={{ cursor: 'pointer', marginBottom: '5px' }}
                  />
                ))}
              </div>
              {/* Add new control text */}
              <div className="d-flex gap-2">
                <Form.Control
                  type="text"
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
          <Button variant="secondary" onClick={() => setShowRiskModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSaveRisk}>
            {isEditing ? 'Update' : 'Add'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ===== ADD HAZARDS MODAL ===== */}
      <Modal show={showHazardModal} onHide={closeHazardModal}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#0094B6' }}>
            {hazardTab === 'site'
              ? 'Add Site Hazards'
              : 'Add Activity/People Hazards'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          style={{
            maxHeight: '400px',
            overflowY: 'auto',
            whiteSpace: 'normal',
            wordBreak: 'break-word',
          }}
        >
          {hazardTab === 'site'
            ? siteHazards.map((h) => {
                const isUsed = projectSiteHazards.some(
                  (ph: any) => ph.site_hazard_id === h.id
                )
                return (
                  <Form.Check
                    key={h.id}
                    id={`site-haz-${h.id}`} // unique ID
                    type="checkbox"
                    label={
                      h.hazard_description + (isUsed ? ' (already added)' : '')
                    }
                    disabled={isUsed}
                    checked={selectedHazardIds.includes(h.id)}
                    onChange={() => toggleHazardSelected(h.id)}
                    style={{ cursor: 'pointer', marginBottom: '5px' }}
                  />
                )
              })
            : activityHazards.map((h) => {
                const isUsed = projectActivityHazards.some(
                  (ph: any) => ph.activity_people_hazard_id === h.id
                )
                return (
                  <Form.Check
                    key={h.id}
                    id={`act-haz-${h.id}`} // unique ID
                    type="checkbox"
                    label={
                      h.hazard_description + (isUsed ? ' (already added)' : '')
                    }
                    disabled={isUsed}
                    checked={selectedHazardIds.includes(h.id)}
                    onChange={() => toggleHazardSelected(h.id)}
                    style={{ cursor: 'pointer', marginBottom: '5px' }}
                  />
                )
              })}
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
