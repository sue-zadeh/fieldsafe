import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Checklist {
  id: number
  description: string
}

interface ProjectChecklistProps {
  projectId: number
  isSidebarOpen: boolean
  projectName: string
}

const ProjectChecklist: React.FC<ProjectChecklistProps> = ({
  projectId,
  isSidebarOpen,
}) => {
  const [unassignedChecklists, setUnassignedChecklists] = useState<Checklist[]>(
    []
  )
  const [projectChecklists, setProjectChecklists] = useState<Checklist[]>([])
  const [selectedChecklists, setSelectedChecklists] = useState<number[]>([])

  // 1) Fetch unassigned checklists
  useEffect(() => {
    const fetchUnassignedChecklists = async () => {
      try {
        const res = await axios.get(`/api/unassigned_checklist/${projectId}`)
        setUnassignedChecklists(res.data)
      } catch (err) {
        console.error('Error fetching unassigned checklists:', err)
      }
    }

    // Only fetch if projectId is valid (non-zero)
    if (projectId) {
      fetchUnassignedChecklists()
    }
  }, [projectId, projectChecklists])
  // We include 'projectChecklists' so that whenever we add or remove items,
  // the "unassigned" list can re-update.

  // 2) Fetch assigned checklists
  useEffect(() => {
    const fetchProjectChecklists = async () => {
      try {
        const res = await axios.get(`/api/project_checklist/${projectId}`)
        setProjectChecklists(res.data)
      } catch (err) {
        console.error('Error fetching project checklists:', err)
      }
    }

    // Only fetch if projectId is valid
    if (projectId) {
      fetchProjectChecklists()
    }
  }, [projectId])

  // 3) Add selected checklists to the project
  const handleAddChecklists = async () => {
    if (selectedChecklists.length === 0) return
    try {
      await axios.post('/api/project_checklist', {
        project_id: projectId,
        checklist_ids: selectedChecklists,
      })

      // refresh the assigned checklists
      const assignedRes = await axios.get(`/api/project_checklist/${projectId}`)
      setProjectChecklists(assignedRes.data)

      // clear selected
      setSelectedChecklists([])
    } catch (err) {
      console.error('Error assigning checklists to project:', err)
    }
  }

  // 4) Remove a checklist from the project
  const handleRemoveChecklist = async (pcId: number) => {
    const checklistToRemove = projectChecklists.find((c) => c.id === pcId)
    if (!checklistToRemove) return

    const confirmRemoval = window.confirm(
      `Remove "${checklistToRemove.description}" from this project?`
    )
    if (!confirmRemoval) return

    try {
      await axios.delete(`/api/project_checklist/${pcId}`)
      // filter out from projectChecklists
      setProjectChecklists((prev) => prev.filter((item) => item.id !== pcId))
    } catch (err) {
      console.error('Error removing checklist from project:', err)
    }
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <h3 className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        Assign Checklists to Project
      </h3>

      <h5 style={{ marginBottom: '1rem' }}>Hold Ctrl/Cmd to select multiple</h5>

      {/* Available (Unassigned) Checklists */}
      <div className="mb-3 w-50">
        <h5 style={{ color: '#0094B6' }}>Available Checklist Items</h5>
        <select
          className="form-select"
          multiple
          value={selectedChecklists.map(String)}
          onChange={(e) => {
            const selectedOptions = Array.from(e.target.selectedOptions).map(
              (opt) => Number(opt.value)
            )
            setSelectedChecklists(selectedOptions)
          }}
        >
          {unassignedChecklists.length > 0 ? (
            unassignedChecklists.map((checklist) => (
              <option key={checklist.id} value={checklist.id}>
                {checklist.description}
              </option>
            ))
          ) : (
            <option disabled>No available checklist items</option>
          )}
        </select>

        <button
          className="btn btn-primary btn-sm mt-2"
          style={{ backgroundColor: '#0094B6' }}
          onClick={handleAddChecklists}
          disabled={selectedChecklists.length === 0}
        >
          Add Selected Checklists
        </button>
      </div>

      {/* Already Assigned Checklists */}
      <table
        className="table table-striped table-hover btn-sm"
        style={{ width: '80%' }}
      >
        <thead>
          <tr>
            <th>Description</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {projectChecklists.map((c) => (
            <tr key={c.id}>
              <td>{c.description}</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemoveChecklist(c.id)}
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProjectChecklist
