// src/components/AddRisk.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Button, Form, Row, Col, Alert, ListGroup } from 'react-bootstrap'

interface Risk {
  id: number
  title: string
  isReadOnly: boolean
}

interface RiskControl {
  id: number
  risk_id: number
  control_text: string
  isReadOnly: boolean
}

interface AddRiskProps {
  isSidebarOpen: boolean
}

const AddRisk: React.FC<AddRiskProps> = ({ isSidebarOpen }) => {
  const [allRisks, setAllRisks] = useState<Risk[]>([])
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null)
  const [riskControls, setRiskControls] = useState<RiskControl[]>([])
  const [newRiskTitle, setNewRiskTitle] = useState('')
  const [newRiskControls, setNewRiskControls] = useState<string[]>([])
  const [notification, setNotification] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [editingControlId, setEditingControlId] = useState<number | null>(null)
  const [editingControlText, setEditingControlText] = useState('')

  useEffect(() => {
    fetchAllRisks()
  }, [])

  const fetchAllRisks = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/risks')
      setAllRisks(res.data)
    } catch (err: any) {
      console.error('Error fetching risks:', err.message)
      setNotification('Failed to load risks.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectRisk = async (riskId: number) => {
    const foundRisk = allRisks.find((r) => r.id === riskId) || null
    setSelectedRisk(foundRisk)
    setRiskControls([])
    if (!foundRisk) return

    try {
      const res = await axios.get(`/api/risks/${foundRisk.id}/controls`)
      setRiskControls(res.data)
    } catch (err) {
      console.error('Error fetching risk controls:', err)
      setNotification('Failed to load risk controls.')
    }
  }

  const handleCreateRisk = async () => {
    if (!newRiskTitle.trim()) {
      setNotification('Please provide a risk title.')
      return
    }
    if (newRiskControls.every((c) => !c.trim())) {
      setNotification('Please provide at least one control.')
      return
    }

    try {
      const riskRes = await axios.post('/api/risks', {
        title: newRiskTitle,
        isReadOnly: 0,
      })
      const newRiskId = riskRes.data.id

      for (const ctrl of newRiskControls) {
        if (ctrl.trim()) {
          await axios.post(`/api/risks/${newRiskId}/controls`, {
            control_text: ctrl.trim(),
            isReadOnly: 0,
          })
        }
      }

      setNotification('New risk & controls created successfully!')
      setNewRiskTitle('')
      setNewRiskControls([])
      fetchAllRisks()
    } catch (err) {
      console.error('Error creating risk:', err)
      setNotification('Failed to create risk.')
    }
  }

  const handleDeleteRisk = async (risk: Risk) => {
    if (risk.isReadOnly) {
      setNotification('Cannot delete a read-only risk.')
      return
    }
    if (!window.confirm(`Delete risk "${risk.title}"?`)) return

    try {
      await axios.delete(`/api/risks/${risk.id}`)
      setNotification(`Risk "${risk.title}" deleted.`)
      setSelectedRisk(null)
      setRiskControls([])
      fetchAllRisks()
    } catch (err) {
      console.error('Error deleting risk:', err)
      setNotification('Failed to delete risk.')
    }
  }

  const addNewControlInput = () => setNewRiskControls((prev) => [...prev, ''])

  const handleControlChange = (value: string, index: number) => {
    setNewRiskControls((prev) => {
      const copy = [...prev]
      copy[index] = value
      return copy
    })
  }

  const startEditControl = (ctrl: RiskControl) => {
    if (ctrl.isReadOnly) {
      setNotification('Cannot edit a read-only control.')
      return
    }
    setEditingControlId(ctrl.id)
    setEditingControlText(ctrl.control_text)
  }

  const handleSaveControlEdit = async () => {
    if (!editingControlId) return
    try {
      await axios.put(`/api/risk_controls/${editingControlId}`, {
        control_text: editingControlText.trim(),
      })
      setEditingControlId(null)
      setEditingControlText('')
      if (selectedRisk) handleSelectRisk(selectedRisk.id)
    } catch (err) {
      console.error('Error saving control:', err)
      setNotification('Failed to save control.')
    }
  }

  const handleDeleteControl = async (ctrl: RiskControl) => {
    if (ctrl.isReadOnly) {
      setNotification('Cannot delete a read-only control.')
      return
    }
    if (!window.confirm(`Delete control "${ctrl.control_text}"?`)) return

    try {
      await axios.delete(`/api/risk_controls/${ctrl.id}`)
      setNotification('Control deleted.')
      if (selectedRisk) handleSelectRisk(selectedRisk.id)
    } catch (err) {
      console.error('Error deleting control:', err)
      setNotification('Failed to delete control.')
    }
  }

  return (
    <div>
      <h2>Add / Edit Risks</h2>
      {notification && <Alert variant="info">{notification}</Alert>}
      {loading && <div>Loading...</div>}

      <Row>
        <Col md={6}>
          <h5>Create Risk</h5>
          <Form.Group>
            <Form.Label>Risk Title</Form.Label>
            <Form.Control
              type="text"
              value={newRiskTitle}
              onChange={(e) => setNewRiskTitle(e.target.value)}
            />
          </Form.Group>
          {newRiskControls.map((ctrl, i) => (
            <Form.Group key={i}>
              <Form.Label>Control #{i + 1}</Form.Label>
              <Form.Control
                type="text"
                value={ctrl}
                onChange={(e) => handleControlChange(e.target.value, i)}
              />
            </Form.Group>
          ))}
          <Button onClick={addNewControlInput}>+ Add Control</Button>{' '}
          <Button onClick={handleCreateRisk}>Create Risk</Button>
        </Col>

        <Col md={6}>
          <h5>Existing Risks</h5>
          <Form.Select
            onChange={(e) => handleSelectRisk(Number(e.target.value))}
            value={selectedRisk?.id || ''}
          >
            <option value="">-- Select Risk --</option>
            {allRisks.map((risk) => (
              <option key={risk.id} value={risk.id}>
                {risk.title} {risk.isReadOnly ? '(Read-Only)' : ''}
              </option>
            ))}
          </Form.Select>

          {selectedRisk && (
            <div>
              <h5>Risk Controls</h5>
              {!selectedRisk.isReadOnly && (
                <Button
                  variant="danger"
                  onClick={() => handleDeleteRisk(selectedRisk)}
                >
                  Delete Risk
                </Button>
              )}
              <ListGroup>
                {riskControls.map((ctrl) => (
                  <ListGroup.Item key={ctrl.id}>
                    {editingControlId === ctrl.id ? (
                      <>
                        <Form.Control
                          value={editingControlText}
                          onChange={(e) =>
                            setEditingControlText(e.target.value)
                          }
                        />
                        <Button onClick={handleSaveControlEdit}>Save</Button>
                      </>
                    ) : (
                      <>
                        <span>{ctrl.control_text}</span>
                        {!ctrl.isReadOnly && (
                          <>
                            <Button
                              onClick={() => startEditControl(ctrl)}
                              variant="warning"
                            >
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteControl(ctrl)}
                              variant="danger"
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </div>
          )}
        </Col>
      </Row>
    </div>
  )
}

export default AddRisk
