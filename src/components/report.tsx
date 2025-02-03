import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Form, Button, Alert, Table, Row, Col } from 'react-bootstrap'

interface IProject {
  id: number
  name: string
  location?: string
}

interface IObjective {
  projectObjectiveId: number
  objective_id: number
  title: string
  measurement: string
  amount?: number | null
}

interface ReportRow {
  totalAmount?: number
  trapsEstablishedTotal?: number
  trapsCheckedTotal?: number
  catchesBreakdown?: {
    rats: number
    possums: number
    mustelids: number
    hedgehogs: number
    others: number
  }
}

interface ReportProps {
  isSidebarOpen: boolean
}

const Report: React.FC<ReportProps> = ({ isSidebarOpen }) => {
  const [projects, setProjects] = useState<IProject[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(
    null
  )
  const [objectives, setObjectives] = useState<IObjective[]>([])
  const [selectedObjectiveId, setSelectedObjectiveId] = useState<number | null>(
    null
  )

  // For date picking
  // to prevent picking any "past" date,we should set them to today at minimum
  const [todayString] = useState(() => {
    const d = new Date()
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}` // e.g. "2025-09-04"
  })

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notification, setNotification] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ReportRow | null>(null)

  // On mount => load all projects
  useEffect(() => {
    axios
      .get('/api/projects') // must match your server route
      .then((res) => setProjects(res.data))
      .catch((err) => {
        console.error('Error loading projects:', err)
        setNotification('Failed to load projects.')
      })
  }, [])

  // When user picks a project => load that project’s objectives
  useEffect(() => {
    if (!selectedProjectId) {
      setObjectives([])
      setSelectedObjectiveId(null)
      return
    }

    axios
      .get<IObjective[]>(`/api/projects/${selectedProjectId}/objectives`)
      .then((res) => {
        setObjectives(res.data || [])
      })
      .catch((err) => {
        console.error('Error fetching objectives for project:', err)
        setNotification('Failed to load objectives for this project.')
      })
  }, [selectedProjectId])

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Generate the report
  const handleGenerateReport = async () => {
    if (!selectedProjectId || !selectedObjectiveId) {
      setNotification('Please select both project and objective.')
      return
    }
    if (!startDate || !endDate) {
      setNotification('Please pick both start and end dates.')
      return
    }
    if (endDate < startDate) {
      setNotification('End Date cannot be before Start Date.')
      return
    }

    try {
      const resp = await axios.get('/api/report/objective', {
        params: {
          projectId: selectedProjectId,
          objectiveId: selectedObjectiveId,
          startDate,
          endDate,
        },
      })
      setReportData(resp.data)
    } catch (err: any) {
      console.error('Error generating report:', err)
      setNotification(
        err.response?.data?.message || 'Failed to generate the report.'
      )
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        marginLeft: isSidebarOpen ? '220px' : '30px',
        transition: 'margin 0.3s ease',
        paddingTop: '2rem',
        minHeight: '100vh',
        width: '98%',
      }}
    >
      <h3 className="fw-bold mb-4 text-center" style={{ color: '#0094B6' }}>
        Project Objective Report
      </h3>

      {notification && (
        <Alert variant="info" className="text-center">
          {notification}
        </Alert>
      )}

      {/* Center the filter card with d-flex justify-content-center */}
      <div className="d-flex justify-content-center mb-3">
        <div
          className="card p-3 shadow"
          style={{ width: '480px', backgroundColor: '#F4F7F1' }}
        >
          <h5 className="mb-3" style={{ color: '#0094B6' }}>
            Filters
          </h5>
          <Row className="mb-3">
            <Col sm={6}>
              <Form.Group>
                <Form.Label>Project</Form.Label>
                <Form.Select
                  value={selectedProjectId ?? ''}
                  onChange={(e) =>
                    setSelectedProjectId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">-- select project --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col sm={6}>
              <Form.Group>
                <Form.Label>Objective</Form.Label>
                <Form.Select
                  value={selectedObjectiveId ?? ''}
                  onChange={(e) =>
                    setSelectedObjectiveId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                >
                  <option value="">-- select objective --</option>
                  {objectives.map((o) => (
                    <option key={o.projectObjectiveId} value={o.objective_id}>
                      {o.title} ({o.measurement})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col sm={6}>
              <Form.Group>
                <Form.Label>Start Date</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  // min={todayString}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group>
                <Form.Label>End Date</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  min={startDate} // ensures user can't pick < start date
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <div className="mt-3 text-end">
            <Button
              onClick={handleGenerateReport}
              style={{
                backgroundColor: '#76D6E2',
                color: '#1A1A1A',
                border: 'none',
              }}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </div>

      {/* If we have reportData, show the results */}
      {reportData && (
        <div className="card p-3 shadow w-75 mx-auto">
          <h5 style={{ color: '#0094B6' }}>Report Result</h5>

          {/* Normal Objective */}
          {reportData.totalAmount !== undefined && (
            <p className="fs-5">
              Total Completed: <b>{reportData.totalAmount}</b>
            </p>
          )}

          {/* Predator “Traps Established / Checked” + Catches breakdown */}
          {(reportData.trapsEstablishedTotal !== undefined ||
            reportData.trapsCheckedTotal !== undefined ||
            reportData.catchesBreakdown) && (
            <Table bordered hover className="mt-2">
              <thead>
                <tr style={{ backgroundColor: '#76D6E2', color: '#1A1A1A' }}>
                  <th>Traps Established</th>
                  <th>Traps Checked</th>
                  <th>Rats</th>
                  <th>Possums</th>
                  <th>Mustelids</th>
                  <th>Hedgehogs</th>
                  <th>Others</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{reportData.trapsEstablishedTotal || 0}</td>
                  <td>{reportData.trapsCheckedTotal || 0}</td>
                  <td>{reportData.catchesBreakdown?.rats || 0}</td>
                  <td>{reportData.catchesBreakdown?.possums || 0}</td>
                  <td>{reportData.catchesBreakdown?.mustelids || 0}</td>
                  <td>{reportData.catchesBreakdown?.hedgehogs || 0}</td>
                  <td>{reportData.catchesBreakdown?.others || 0}</td>
                </tr>
              </tbody>
            </Table>
          )}
        </div>
      )}
    </div>
  )
}

export default Report
