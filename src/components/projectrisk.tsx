import React, { useState, useEffect } from 'react'
import Select from 'react-select' // for the Risk Title dropdown
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
  projectRiskId: number // from project_risks.id
  riskId: number // from risks.id
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
  // We store any row-level ID plus hazard_description
  // For site hazards => pshId if possible
  // For activity hazards => pahId if possible
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
  const [message, setMessage] = useState<string | null>(null)

  //============ RISK data =============
  const [allRiskTitles, setAllRiskTitles] = useState<RiskTitle[]>([])
  const [projectRisks, setProjectRisks] = useState<RiskRow[]>([])
  const [detailedRiskControls, setDetailedRiskControls] = useState<
    DetailedRiskControl[]
  >([])

  //============ Add/Edit RISK Modal ============
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingRisk, setEditingRisk] = useState<RiskRow | null>(null)

  //--- State for the modal form:
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

  //============ Hazards =============
  const [siteHazards, setSiteHazards] = useState<Hazard[]>([])
  const [activityHazards, setActivityHazards] = useState<Hazard[]>([])
  const [projectSiteHazards, setProjectSiteHazards] = useState<Hazard[]>([])
  const [projectActivityHazards, setProjectActivityHazards] = useState<
    Hazard[]
  >([])
  const [showHazardModal, setShowHazardModal] = useState(false)
  const [hazardTab, setHazardTab] = useState<'site' | 'activity'>('site')
  const [selectedHazardIds, setSelectedHazardIds] = useState<number[]>([])

  //======================================
  //            LOAD on MOUNT
  //======================================
  useEffect(() => {
    loadAllRiskTitles()
    loadProjectRisks()
    loadDetailedRiskControls()
    loadAllHazards()
    loadProjectHazards()
  }, [])

  // ------------------- Load Risk Titles
  const loadAllRiskTitles = async () => {
    try {
      const res = await axios.get('/api/risks')
      setAllRiskTitles(res.data)
    } catch (err) {
      console.error('Error loadAllRiskTitles:', err)
      setMessage('Failed to load risk titles.')
    }
  }

  // ------------------- Load Project Risks
  const loadProjectRisks = async () => {
    try {
      const res = await axios.get(`/api/project_risks?projectId=${projectId}`)
      setProjectRisks(res.data)
    } catch (err) {
      console.error('Error loadProjectRisks:', err)
      setMessage('Failed to load project risks.')
    }
  }

  // ------------------- Load Detailed Project Risk Controls
  const loadDetailedRiskControls = async () => {
    try {
      const res = await axios.get(
        `/api/project_risk_controls/detailed?projectId=${projectId}`
      )
      setDetailedRiskControls(res.data)
    } catch (err) {
      console.error('Error loadDetailedRiskControls:', err)
    }
  }

  // ------------------- Load Hazards (site + activity)
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

  // ------------------- Load which hazards are chosen for this project
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

  //======================================
  //          RISK RATING Calculation
  //======================================
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

  //======================================
  //       ADD / EDIT RISK MODAL
  //======================================
  function openAddRiskModal() {
    setShowRiskModal(true)
    setIsEditing(false)
    setEditingRisk(null)

    // Clear form
    setSelectedRiskTitleId(null)
    setRiskControlsForTitle([])
    setChosenControlIds([])
    setLikelihood('')
    setConsequences('')
    setNewControlText('')
    setLocalRiskRating('')
  }

  function openEditRiskModal(r: RiskRow) {
    // We do not let them change the risk title (based on your statement),
    // so we won't reload that part, but we do want to let them change
    // likelihood, consequences, and chosen controls.
    setShowRiskModal(true)
    setIsEditing(true)
    setEditingRisk(r)

    // set the form fields from the existing risk
    setLikelihood(r.likelihood)
    setConsequences(r.consequences)
    setLocalRiskRating(r.risk_rating)

    // find which controls are currently chosen for this risk
    const relevantControls = detailedRiskControls.filter(
      (dc) => dc.riskId === r.riskId
    )
    const chosenIds = relevantControls.map((rc) => rc.risk_control_id)
    setChosenControlIds(chosenIds)

    // If you want to let them see the entire risk title's control set:
    // We have to figure out the risk_title_id for that risk from the DB or from
    // r.risk_title_label => but that is just the label. If we want the ID, we need
    // another approach. Let's skip that, or do a separate GET.
    // For now let's assume we can't re-pick new controls from the same title
    // if we don't know the title ID.
    // Or you can store them from the back-end. For demonstration, I'll just skip reloading:
    setRiskControlsForTitle([])
    setSelectedRiskTitleId(null)

    setNewControlText('')
  }

  function closeRiskModal() {
    setShowRiskModal(false)
  }

  async function handlePickRiskTitle(riskTitleId: number) {
    setSelectedRiskTitleId(riskTitleId)
    try {
      const res = await axios.get(`/api/risks/${riskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
      setChosenControlIds([])
    } catch (err) {
      console.error(err)
      setMessage('Failed to load controls for that title.')
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
      const res = await axios.get(`/api/risks/${selectedRiskTitleId}/controls`)
      setRiskControlsForTitle(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new control.')
    }
  }

  async function handleSaveRisk() {
    // We handle "Add" vs. "Edit" with isEditing
    if (!likelihood || !consequences) {
      setMessage('Please choose likelihood and consequence.')
      return
    }

    try {
      if (!isEditing) {
        // ========== ADD Mode ==========
        if (!selectedRiskTitleId) {
          setMessage('Please pick a risk title first.')
          return
        }
        // 1) create new row in `risks`
        const createRes = await axios.post('/api/risks-create-row', {
          risk_title_id: selectedRiskTitleId,
          likelihood,
          consequences,
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
      } else {
        // ========== EDIT Mode ==========
        if (!editingRisk) return
        const r = editingRisk
        // 1) update the existing "risks" row
        await axios.put(`/api/risks/${r.riskId}`, {
          likelihood,
          consequences,
        })

        // 2) remove old project_risk_controls for this risk
        await axios.delete(
          `/api/project_risk_controls?projectId=${projectId}&riskId=${r.riskId}`
        )

        // 3) re-add the newly chosen controls
        for (const cid of chosenControlIds) {
          await axios.post('/api/project_risk_controls', {
            project_id: projectId,
            risk_control_id: cid,
            is_checked: true,
          })
        }

        setMessage('Project risk updated successfully!')
      }

      closeRiskModal()
      loadProjectRisks()
      loadDetailedRiskControls()
    } catch (err) {
      console.error(err)
      setMessage(
        isEditing
          ? 'Failed to update project risk.'
          : 'Failed to save project risk.'
      )
    }
  }

  //======================================
  //            REMOVE RISK
  //======================================
  async function handleRemoveRisk(r: RiskRow) {
    if (!window.confirm(`Remove risk "${r.risk_title_label}"?`)) return
    try {
      // remove from project_risk_controls
      await axios.delete(
        `/api/project_risk_controls?projectId=${projectId}&riskId=${r.riskId}`
      )
      // remove from project_risks
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

  //======================================
  //            HAZARDS
  //======================================
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

  // Save chosen hazards to the project
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

  // Because we delete by row ID (pshId/pahId) for the chosen hazards:
  async function handleRemoveSiteHazard(h: any) {
    if (!window.confirm(`Remove site hazard "${h.hazard_description}"?`)) return
    try {
      // pass the row's primary key: h.pshId
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

  //======================================
  //  AUTO-HIDE ALERT AFTER 5s
  //======================================
  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 5000)
      return () => clearTimeout(t)
    }
  }, [message])

  //======================================
  //  REACT-SELECT Options for Risk Titles
  //  (disable those already used)
  //======================================
  const riskTitleOptions: OptionType[] = allRiskTitles.map((rt) => {
    return { value: rt.id, label: rt.title }
  })

  function isOptionDisabled(option: OptionType) {
    // If projectRisks already has a row whose risk_title_label matches this label
    // then disable it
    const found = projectRisks.find(
      (pr) => pr.risk_title_label === option.label
    )
    return !!found // disable if found
  }

  //======================================
  //  HAZARD Disabling: if already used
  //======================================
  function isSiteHazardUsed(hid: number) {
    // If it's in projectSiteHazards, disable
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
      style={{
        transition: 'margin 0.3s ease',
        paddingTop: '1rem',
      }}
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

      {/* ==================== RISKS TABLE ==================== */}
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
          {projectRisks.map((r) => {
            // find which controls match this risk's ID
            const relevantControls = detailedRiskControls.filter(
              (dc) => dc.riskId === r.riskId
            )

            return (
              <tr key={r.riskId}>
                <td style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>
                  {r.risk_title_label}
                </td>
                <td>
                  {/* Show each control text on separate lines */}
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

      {/* ==================== HAZARDS ==================== */}
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
      <Modal show={showRiskModal} onHide={closeRiskModal}>
        <Modal.Header closeButton>
          <Modal.Title>
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
          {/* If not editing, show react-select for picking a risk title */}
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
                isSearchable
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

          {/* Risk Rating (read-only) */}
          <Form.Group className="mb-3">
            <Form.Label>Risk Rating</Form.Label>
            <Form.Control type="text" readOnly value={localRiskRating} />
          </Form.Group>

          {/* If not editing, we can pick new controls for the chosen Risk Title */}
          {!isEditing && selectedRiskTitleId && (
            <div className="mb-3">
              <h5>Risk Controls for Selected Title</h5>
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
                    id={`ctrl-${ctrl.id}`}
                    label={ctrl.control_text}
                    checked={chosenControlIds.includes(ctrl.id)}
                    onChange={() => toggleChooseControl(ctrl.id)}
                    style={{ cursor: 'pointer' }}
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

          {/* If editing, we skip showing the risk title & controls for now
              or implement a separate approach for re-picking controls. */}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={closeRiskModal}>
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
          <Modal.Title>
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
                // disable if already used
                const isUsed = isSiteHazardUsed(h.id)
                return (
                  <Form.Check
                    key={h.id}
                    type="checkbox"
                    id={`site-hazard-${h.id}`}
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
                const isUsed = isActivityHazardUsed(h.id)
                return (
                  <Form.Check
                    key={h.id}
                    type="checkbox"
                    id={`act-hazard-${h.id}`}
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
