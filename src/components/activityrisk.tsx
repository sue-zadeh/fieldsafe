// src/components/ActivityRisk.tsx

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

/**
 * Because your new table "activity_risk_controls"
 * includes 'risk_id', each bridging row references one
 * specific risk instance (risks.id).
 */

// -------------------------------------------
// Inline <style> to override active tab color
// -------------------------------------------
// 

// A quick inline style for your tabs
const inlineTabStyle = `
  .nav-tabs .nav-link.active {
    color: #0094B6 !important;
    font-weight: bold;
    background-color: #eef8fb !important;
    border-color: #0094B6 #0094B6 transparent !important;
  }
     .nav-tabs .nav-link {
    color: #333;
  }
`

interface ActivityRiskProps {
  activityId: number
  activityName: string
}

// risk_titles table
interface RiskTitle {
  id: number
  title: string
  isReadOnly?: boolean
}

// Each row in "activity_risks" bridging
interface RiskRow {
  activityRiskId: number
  riskId: number // <-- ID from "risks" table
  riskTitleId: number // <-- ID from "risk_titles"
  risk_title_label: string
  likelihood: string
  consequences: string
  risk_rating: string
}

// The row from GET /api/activity_risk_controls/detailed
// Now includes risk_id
interface DetailedRiskControl {
  activityRiskControlId: number
  activity_id: number
  risk_id: number // <-- NEW: which risk instance?
  risk_control_id: number
  control_text: string
  is_checked: boolean
}

// The “risk_controls” rows for a given risk title
interface RiskControlForTitle {
  id: number
  control_text: string
}

// Basic hazard type
interface Hazard {
  id: number
  hazard_description: string
}

interface OptionType {
  value: number
  label: string
}

const ActivityRisk: React.FC<ActivityRiskProps> = ({
  activityId,
  activityName,
}) => {
  const [message, setMessage] = useState<string | null>(null)

  // ---------- RISK DATA ----------
  const [allRiskTitles, setAllRiskTitles] = useState<RiskTitle[]>([])
  const [activityRisks, setActivityRisks] = useState<RiskRow[]>([])
  const [detailedRiskControls, setDetailedRiskControls] = useState<
    DetailedRiskControl[]
  >([])

  // Modal states
  const [showRiskModal, setShowRiskModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingRisk, setEditingRisk] = useState<RiskRow | null>(null)

  // Form fields
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

  // ---------- HAZARDS ----------
  const [siteHazards, setSiteHazards] = useState<Hazard[]>([])
  const [activityHazards, setActivityHazards] = useState<Hazard[]>([])
  const [activitySiteHazards, setActivitySiteHazards] = useState<Hazard[]>([])
  const [activityPeopleHazards, setActivityPeopleHazards] = useState<Hazard[]>(
    []
  )

  const [showHazardModal, setShowHazardModal] = useState(false)
  const [hazardTab, setHazardTab] = useState<'site' | 'activity'>('site')
  const [selectedHazardIds, setSelectedHazardIds] = useState<number[]>([])
  const [newSiteHazard, setNewSiteHazard] = useState('')
  const [newActivityHazard, setNewActivityHazard] = useState('')

  /** On mount: load all data. */
  useEffect(() => {
    loadAllRiskTitles()
    loadActivityRisks()
    loadDetailedRiskControls()
    loadAllHazards()
    loadActivityHazards()
  }, [activityId])

  // ========== 1) Load risk titles ==========
  async function loadAllRiskTitles() {
    try {
      const res = await axios.get('/api/risks') // or your endpoint
      setAllRiskTitles(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load risk titles.')
    }
  }

  // ========== 2) Load "activity_risks" bridging ==========
  async function loadActivityRisks() {
    try {
      const res = await axios.get(
        `/api/activity_risks?activityId=${activityId}`
      )
      setActivityRisks(res.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load activity risks.')
    }
  }

  // ========== 3) Load "activity_risk_controls" (detailed) ==========
  async function loadDetailedRiskControls() {
    try {
      const res = await axios.get(
        `/api/activity_risk_controls/detailed?activityId=${activityId}`
      )
      setDetailedRiskControls(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  // ========== 4) Load hazards + activity hazards ==========
  async function loadAllHazards() {
    try {
      const siteRes = await axios.get('/api/site_hazards')
      setSiteHazards(siteRes.data)

      const actRes = await axios.get('/api/activity_people_hazards')
      setActivityHazards(actRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load hazard definitions.')
    }
  }

  async function loadActivityHazards() {
    try {
      const shRes = await axios.get(
        `/api/activity_site_hazards?activityId=${activityId}`
      )
      setActivitySiteHazards(shRes.data)

      const ahRes = await axios.get(
        `/api/activity_activity_people_hazards?activityId=${activityId}`
      )
      setActivityPeopleHazards(ahRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to load hazards for this activity.')
    }
  }

  // 5) Recompute local risk rating whenever likelihood/consequence changes
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

  // =====================================
  //        ADD RISK  (Create new)
  // =====================================
  function openAddRiskModal() {
    setShowRiskModal(true)
    setIsEditing(false)
    setEditingRisk(null)
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

  // =====================================
  //        EDIT RISK
  // =====================================
  function openEditRiskModal(r: RiskRow) {
    setShowRiskModal(true)
    setIsEditing(true)
    setEditingRisk(r)

    setLikelihood(r.likelihood)
    setConsequences(r.consequences)
    setLocalRiskRating(r.risk_rating)

    setSelectedRiskTitleId(r.riskTitleId)

    // load possible controls
    axios
      .get(`/api/risks/${r.riskTitleId}/controls`)
      .then((resp) => {
        setRiskControlsForTitle(resp.data)
        // find which controls are chosen
        const relevant = detailedRiskControls.filter(
          (dc) => dc.risk_id === r.riskId
        )
        setChosenControlIds(relevant.map((dc) => dc.risk_control_id))
      })
      .catch((e) => {
        console.error(e)
        setMessage('Failed to load controls for editing.')
      })

    setNewControlText('')
  }

  // =====================================
  //        SAVE RISK (Add or Edit)
  // =====================================
  async function handleSaveRisk() {
    if (!selectedRiskTitleId || !likelihood || !consequences) {
      setMessage('Please ensure all fields are filled.')
      return
    }

    try {
      if (!isEditing) {
        // ADD MODE
        const createRes = await axios.post('/api/risks-create-row', {
          risk_title_id: selectedRiskTitleId,
          likelihood,
          consequences,
        })
        const newRiskId = createRes.data.riskId

        // Link the new risk to this activity
        await axios.post('/api/activity_risks', {
          activity_id: activityId,
          risk_id: newRiskId,
        })

        // Link each chosen control to that new risk_id
        for (const cid of chosenControlIds) {
          await axios.post('/api/activity_risk_controls', {
            activity_id: activityId,
            risk_id: newRiskId, // <-- The key difference from before
            risk_control_id: cid,
            is_checked: true,
          })
        }

        setMessage('Activity risk added successfully.')
      } else {
        // EDIT MODE
        if (!editingRisk) return

        const selectedTitle = allRiskTitles.find(
          (title) => title.id === selectedRiskTitleId
        )?.title
        if (!selectedTitle) {
          setMessage('Invalid risk title selected.')
          return
        }

        // 1) Update the row in "risks" table
        await axios.put(`/api/risks/${editingRisk.riskId}`, {
          title: selectedTitle,
          likelihood,
          consequences,
        })

        // 2) Remove old bridging
        await axios.delete(
          `/api/activity_risk_controls?activityId=${activityId}&riskId=${editingRisk.riskId}`
        )

        // 3) Add the new bridging
        for (const cid of chosenControlIds) {
          await axios.post('/api/activity_risk_controls', {
            activity_id: activityId,
            risk_id: editingRisk.riskId, // <-- Tie these controls specifically
            risk_control_id: cid,
            is_checked: true,
          })
        }

        setMessage('Activity risk updated successfully.')
      }
      setShowRiskModal(false)
      loadActivityRisks()
      loadDetailedRiskControls()
    } catch (err) {
      console.error(err)
      setMessage(isEditing ? 'Failed to update risk.' : 'Failed to add risk.')
    }
  }

  // =====================================
  //   REMOVE RISK
  // =====================================
  async function handleRemoveRisk(r: RiskRow) {
    if (!window.confirm(`Remove risk "${r.risk_title_label}"?`)) return
    try {
      // remove bridging in activity_risk_controls
      await axios.delete(
        `/api/activity_risk_controls?activityId=${activityId}&riskId=${r.riskId}`
      )
      // remove bridging in activity_risks
      await axios.delete(
        `/api/activity_risks?activityId=${activityId}&riskId=${r.riskId}`
      )
      setMessage('Removed risk from activity.')
      loadActivityRisks()
      loadDetailedRiskControls()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove risk.')
    }
  }

  // =====================================
  //   HAZARDS
  // =====================================
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
          await axios.post('/api/activity_site_hazards', {
            activity_id: activityId,
            site_hazard_id: hid,
          })
        }
      } else {
        for (const hid of selectedHazardIds) {
          await axios.post('/api/activity_activity_people_hazards', {
            activity_id: activityId,
            activity_people_hazard_id: hid,
          })
        }
      }
      setMessage('Hazards added successfully.')
      closeHazardModal()
      loadActivityHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to save hazards.')
    }
  }

  async function handleRemoveSiteHazard(h: any) {
    if (!window.confirm(`Remove site hazard "${h.hazard_description}"?`)) return
    try {
      await axios.delete(`/api/activity_site_hazards?id=${h.id}`)
      setMessage('Removed site hazard.')
      loadActivityHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove site hazard.')
    }
  }

  async function handleRemoveActivityHazard(h: any) {
    if (!window.confirm(`Remove activity hazard "${h.hazard_description}"?`)) {
      return
    }
    try {
      await axios.delete(`/api/activity_activity_people_hazards?id=${h.id}`)
      setMessage('Removed activity hazard.')
      loadActivityHazards()
    } catch (err) {
      console.error(err)
      setMessage('Failed to remove activity hazard.')
    }
  }

  // Add new site hazard
  async function handleAddNewSiteHazard() {
    if (!newSiteHazard.trim()) return
    try {
      await axios.post('/api/site_hazards', {
        hazard_description: newSiteHazard.trim(),
      })
      setNewSiteHazard('')
      const siteRes = await axios.get('/api/site_hazards')
      setSiteHazards(siteRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new site hazard.')
    }
  }

  // Add new activity hazard
  async function handleAddNewActivityHazard() {
    if (!newActivityHazard.trim()) return
    try {
      await axios.post('/api/activity_people_hazards', {
        hazard_description: newActivityHazard.trim(),
      })
      setNewActivityHazard('')
      const actRes = await axios.get('/api/activity_people_hazards')
      setActivityHazards(actRes.data)
    } catch (err) {
      console.error(err)
      setMessage('Failed to add new activity hazard.')
    }
  }

  useEffect(() => {
    if (message) {
      const t = setTimeout(() => setMessage(null), 4000)
      return () => clearTimeout(t)
    }
  }, [message])

  // For the riskTitle <Select>
  const riskTitleOptions: OptionType[] = allRiskTitles.map((rt) => ({
    value: rt.id,
    label: rt.title,
  }))

  function isOptionDisabled(option: OptionType) {
    // If we already have that risk title in the activity
    // we can disable it so we don't add duplicates
    const found = activityRisks.find((r) => r.risk_title_label === option.label)
    return !!found
  }

  return (
    <div>
      <style>{inlineTabStyle}</style>

      {message && (
        <Alert variant="info" dismissible onClose={() => setMessage(null)}>
          {message}
        </Alert>
      )}

      <h3 style={{ fontWeight: 'bold', color: '#0094B6' }} className="mb-3">
        Determine 'Risk' & Hazards for Activity: {activityName || '(Untitled)'}
      </h3>

      {/* Hazards */}
      <h4 style={{ color: '#0094B6' }} className="mt-4 fw-bold">
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
            className="mb-2"
            style={{ backgroundColor: '#0094B6' }}
            onClick={() => openHazardModal('site')}
          >
            + Add Site Hazards
          </Button>

          <Table bordered striped hover responsive>
            <thead>
              <tr>
                <th>Hazard Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activitySiteHazards.map((h: any) => (
                <tr key={h.id}>
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
            style={{ backgroundColor: '#0094B6' }}
            variant="secondary"
            size="sm"
            className="mb-2"
            onClick={() => openHazardModal('activity')}
          >
            + Add Activity Hazards
          </Button>

          <Table bordered striped hover responsive>
            <thead>
              <tr>
                <th>Hazard Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activityPeopleHazards.map((h: any) => (
                <tr key={h.id}>
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

      {/* Risks */}
      <h4 className="m-2 fw-bold" style={{ color: '#0094B6' }}>
        Risks
      </h4>
      <Button
        className="px-4"
        style={{ backgroundColor: '#0094B6' }}
        variant="primary"
        onClick={openAddRiskModal}
      >
        + Add Risk
      </Button>

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
          {activityRisks.map((r) => {
            // gather relevant controls for just this risk
            const relevantControls = detailedRiskControls.filter(
              (dc) => dc.risk_id === r.riskId
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

      {/* ADD/EDIT RISK MODAL */}
      <Modal show={showRiskModal} onHide={() => setShowRiskModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title style={{ color: '#0094B6' }}>
            {isEditing ? 'Edit Activity Risk' : 'Add Activity Risk'}
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

          <Form.Group className="mb-3">
            <Form.Label>Risk Rating</Form.Label>
            <Form.Control type="text" readOnly value={localRiskRating} />
          </Form.Group>

          {/* Risk Controls */}
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
                    id={`ctrl-${ctrl.id}`}
                    label={ctrl.control_text}
                    checked={chosenControlIds.includes(ctrl.id)}
                    onChange={() => toggleChooseControl(ctrl.id)}
                    style={{ cursor: 'pointer', marginBottom: '5px' }}
                  />
                ))}
              </div>

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

      {/* ADD HAZARDS MODAL */}
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
          {hazardTab === 'site' ? (
            <>
              {siteHazards.map((h) => {
                const isUsed = activitySiteHazards.some(
                  (sh: any) => sh.site_hazard_id === h.id
                )
                return (
                  <Form.Check
                    key={h.id}
                    id={`site-haz-${h.id}`}
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

              <div className="d-flex mt-3">
                <Form.Control
                  type="text"
                  placeholder="New site hazard description..."
                  value={newSiteHazard}
                  onChange={(e) => setNewSiteHazard(e.target.value)}
                />
                <Button
                  variant="success"
                  onClick={handleAddNewSiteHazard}
                  style={{ marginLeft: '6px' }}
                >
                  +
                </Button>
              </div>
            </>
          ) : (
            <>
              {activityHazards.map((h) => {
                const isUsed = activityPeopleHazards.some(
                  (ah: any) => ah.activity_people_hazard_id === h.id
                )
                return (
                  <Form.Check
                    key={h.id}
                    id={`act-haz-${h.id}`}
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

              <div className="d-flex mt-3">
                <Form.Control
                  type="text"
                  placeholder="New activity/people hazard..."
                  value={newActivityHazard}
                  onChange={(e) => setNewActivityHazard(e.target.value)}
                />
                <Button
                  variant="success"
                  onClick={handleAddNewActivityHazard}
                  style={{ marginLeft: '6px' }}
                >
                  +
                </Button>
              </div>
            </>
          )}
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

export default ActivityRisk
