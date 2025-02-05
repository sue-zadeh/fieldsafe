// src/components/Report.tsx
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

/**
 * For normal objectives:
 *   detailRows => each row from activity_objectives + activities
 *   totalAmount => sum of all those amounts
 *
 * For predator objectives:
 *   trapsEstablishedTotal, trapsCheckedTotal, etc.
 */
interface IReportRow {
  detailRows?: {
    activityId: number
    activityName: string
    activityDate: string
    amount: number
  }[]
  totalAmount?: number

  // If predator logic is implemented on the server, these might appear:
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

  // No restrictions on picking older or future dates in front-end
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // Data returned from the server
  const [reportData, setReportData] = useState<IReportRow | null>(null)

  /**
   * On mount => load all projects
   */
  useEffect(() => {
    axios
      .get('/api/projects')
      .then((res) => setProjects(res.data))
      .catch((err) => {
        console.error('Error loading projects:', err)
        setNotification('Failed to load projects.')
      })
  }, [])

  /**
   * When user picks a project => load that project's objectives.
   * This calls /api/report/report_outcome/:projectId
   * which returns { projectId, objectives: [ ... ] }
   */
  useEffect(() => {
    if (!selectedProjectId) {
      setObjectives([])
      setSelectedObjectiveId(null)
      return
    }

    axios
      .get(`/api/report/report_outcome/${selectedProjectId}`)
      .then((res) => {
        setObjectives(res.data.objectives || [])
      })
      .catch((err) => {
        console.error('Error fetching objectives for project:', err)
        setNotification('Failed to load objectives for this project.')
      })
  }, [selectedProjectId])

  /**
   * Auto-clear notification
   */
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  /**
   * "Generate Report" => calls /api/report/objective with query params
   */
  const handleGenerateReport = async () => {
    if (!selectedProjectId || !selectedObjectiveId) {
      setNotification('Please select both project and objective.')
      return
    }
    if (!startDate || !endDate) {
      setNotification('Please pick both start and end dates.')
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

      {/* Filter Card */}
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

      {/* The Results Card */}
      {reportData && (
        <div className="card p-3 shadow w-75 mx-auto">
          <h5 style={{ color: '#0094B6' }}>Report Result</h5>

          {/* (A) Normal Objective Rows */}
          {reportData.detailRows && reportData.detailRows.length > 0 && (
            <>
              <h6>Details by Activity</h6>
              <Table bordered hover className="mt-2">
                <thead>
                  <tr style={{ backgroundColor: '#76D6E2', color: '#1A1A1A' }}>
                    <th>Activity Name</th>
                    <th>Activity Date</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.detailRows.map((row) => (
                    <tr key={row.activityId}>
                      <td>{row.activityName}</td>
                      <td>{row.activityDate}</td>
                      <td>{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}

          {/* Show final total for normal objective */}
          {reportData.totalAmount !== undefined && (
            <p className="fs-5">
              Total Completed: <b>{reportData.totalAmount}</b>
            </p>
          )}

          {/* (B) Predator data (if the server returns it) */}
          {(reportData.trapsEstablishedTotal !== undefined ||
            reportData.trapsCheckedTotal !== undefined ||
            reportData.catchesBreakdown) && (
            <>
              <h6>Predator Control Summary</h6>
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
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default Report
