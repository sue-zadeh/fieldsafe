import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Table, Form } from 'react-bootstrap'

interface ProjectCheckListProps {
  isSidebarOpen: boolean
  projectId: number
  projectName: string
}

interface ChecklistItem {
  id: number
  description: string
  is_checked: boolean
}

const ProjectChecklist: React.FC<ProjectCheckListProps> = ({
  isSidebarOpen,
  projectId,
}) => {
  const [loading, setLoading] = useState(true)
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])

  useEffect(() => {
    const fetchChecklist = async () => {
      try {
        const response = await axios.get(`/api/project/${projectId}/checklist`)
        setChecklist(response.data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching checklist:', error)
      }
    }
    fetchChecklist()
  }, [projectId])

  const handleCheckToggle = async (checklistId: number) => {
    try {
      const response = await axios.put(
        `/api/project/${projectId}/checklist/${checklistId}`
      )
      if (response.status === 200) {
        setChecklist((prevChecklist) =>
          prevChecklist.map((item) =>
            item.id === checklistId
              ? { ...item, is_checked: !item.is_checked }
              : item
          )
        )
      }
    } catch (error) {
      console.error('Error updating checklist item:', error)
    }
  }

  if (loading) {
    return <p>Loading checklist...</p>
  }

  return (
    <div
      className={`${isSidebarOpen ? 'content-expanded' : 'content-collapsed'}`}
    >
      <div className="checklist-container">
        <h2>Checklist</h2>
        <Table bordered hover>
          <thead>
            <tr>
              <th>#</th>
              <th>Description</th>
              <th>Completed</th>
            </tr>
          </thead>
          <tbody>
            {checklist.map((item, index) => (
              <tr key={item.id}>
                <td>{index + 1}</td>
                <td>{item.description}</td>
                <td>
                  <Form.Check
                    type="checkbox"
                    checked={item.is_checked}
                    onChange={() => handleCheckToggle(item.id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  )
}

export default ProjectChecklist
