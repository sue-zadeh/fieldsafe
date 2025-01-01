import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert } from 'react-bootstrap'

interface Objective {
  id: number
  title: string
  measurement: string
  dateStart?: string
  dateEnd?: string
  // plus any other fields you want
}

interface AddObjectivesProps {
  isSidebarOpen: boolean
}

const AddObjectives: React.FC<AddObjectivesProps> = ({ isSidebarOpen }) => {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [title, setTitle] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

  // Load objectives on component mount
  useEffect(() => {
    fetchObjectives()
  }, [])

  const fetchObjectives = async () => {
    try {
      const res = await axios.get('/api/objectives')
      setObjectives(res.data)
    } catch (err) {
      console.error('Error fetching objectives:', err)
      setNotification('Failed to load objectives.')
    }
  }

  // Auto-clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !measurement.trim()) {
      setNotification('Please fill in both Title and Measurement.')
      return
    }

    try {
      await axios.post('/api/objectives', {
        title,
        measurement,
        // If your DB requires project_id or dateStart, dateEnd, pass them here
      })
      setNotification('Objective added successfully!')
      setTitle('')
      setMeasurement('')
      // Reload to see the newly added objective
      fetchObjectives()
    } catch (err) {
      console.error('Error adding objective:', err)
      setNotification('Failed to add objective.')
    }
  }

  return (
    <div
      className={`container-fluid ${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      }`}
      style={{
        // marginLeft: isSidebarOpen ? '220px' : '20px',
        transition: 'margin 0.3s ease',
        paddingTop: '10px',
        minHeight: '100vh',
      }}
    >
      <h2
        style={{ color: '#0094B6', fontWeight: 'bold', paddingBottom: '2rem ' }}
      >
        Add Objectives
      </h2>

      {notification && (
        <Alert variant="info" className="text-center">
          {notification}
        </Alert>
      )}

      <div className=" row form-container bg-white p-4 rounded shadow">
        {/* LEFT SIDE: the existing objectives in a box/table */}
        <div className="col-md-6 ">
          <h4 className="pb-3">
            <b>Objectives List</b>
          </h4>
          {objectives.length === 0 ? (
            <p className="text-muted">No objectives yet</p>
          ) : (
            <Table
              bordered
              hover
              className=" row form-container bg-white p-4 rounded shadow"
            >
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Measurement</th>
                  {/* we have dateStart/dateEnd, add columns in the objectives table,
                   we can add it here, if Dave wants  */}
                </tr>
              </thead>
              <tbody>
                {objectives.map((obj) => (
                  <tr key={obj.id}>
                    <td>{obj.id}</td>
                    <td>{obj.title}</td>
                    <td>{obj.measurement}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
        {/* RIGHT SIDE: the form */}
        <div className="col-md-6 form-container bg-white p-4 rounded shadow ">
          <h4>Add a New Objective</h4>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="m-3" controlId="objectiveTitle">
              <Form.Label>
                <b>Objective Title</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Write a new objective here"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="measurement">
              <Form.Label>
                <b>Measurement</b>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Units of measure, e.g. 'Hours', 'Hectares', etc."
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
              />
            </Form.Group>

            {/* If Dave wants dateStart and dateEnd, we can add fields here:
              <Form.Group className="mb-3" controlId="dateStart">
                <Form.Label>Date Start</Form.Label>
                <Form.Control
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                />
              </Form.Group>
              etc...
            */}

            <Button
              type="submit"
              // variant="primary"
              className="w-100 mt-3 text-dark fs-5"
              style={{ backgroundColor: '#76D6E2', color: '#fff' }}
            >
              Save
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}

export default AddObjectives
