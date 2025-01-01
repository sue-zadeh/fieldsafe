// src/components/AddObjectives.tsx
import React, { useState, useEffect, FormEvent } from 'react'
import axios from 'axios'
import { Table, Form, Button, Alert } from 'react-bootstrap'

interface Objective {
  id: number
  title: string
  measurement: string
  dateStart?: string
  dateEnd?: string
}

interface AddObjectivesProps {
  isSidebarOpen: boolean
}

const AddObjectives: React.FC<AddObjectivesProps> = ({ isSidebarOpen }) => {
  const [objectives, setObjectives] = useState<Objective[]>([])
  const [title, setTitle] = useState('')
  const [measurement, setMeasurement] = useState('')
  const [notification, setNotification] = useState<string | null>(null)

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

  // auto-clear notification
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
        // no project_id needed
        title: title.trim(),
        measurement: measurement.trim(),
      })
      setNotification('Objective added successfully!')
      setTitle('')
      setMeasurement('')
      fetchObjectives() // reload list
    } catch (err) {
      console.error('Error adding objective:', err)
      setNotification('Failed to add objective.')
    }
  }

  return (
    <div
      className="container-fluid"
      style={{
        // no marginLeft so it doesn't push beyond your existing page layout
        transition: 'margin 0.3s ease',
        paddingTop: '10px',
        minHeight: '100vh',
      }}
    >
      <h2
        style={{
          color: '#0094B6',
          fontWeight: 'bold',
          paddingBottom: '2rem',
        }}
      >
        Add Objectives
      </h2>

      {notification && (
        <Alert variant="info" className="text-center">
          {notification}
        </Alert>
      )}

      <div className="row form-container bg-white p-4 rounded shadow">
        {/* LEFT: objectives list */}
        <div className="col-md-6">
          <h4 className="pb-3">
            <b>Objectives List</b>
          </h4>
          {objectives.length === 0 ? (
            <p className="text-muted">No objectives yet</p>
          ) : (
            <Table bordered hover className="bg-white p-4 rounded shadow">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Measurement</th>
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

        {/* RIGHT: add form */}
        <div className="col-md-6 bg-white p-4 rounded shadow">
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
                placeholder="Units, e.g. 'Hours', 'Hectares'... "
                value={measurement}
                onChange={(e) => setMeasurement(e.target.value)}
              />
            </Form.Group>

            <Button
              type="submit"
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
