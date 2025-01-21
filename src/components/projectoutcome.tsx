import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface IProjectObjective {
  projectObjectiveId: number
  project_id: number
  objective_id: number
  amount: number | null
  dateStart: string | null
  dateEnd: string | null
  title: string
  measurement: string
}

interface IPredatorRecord {
  id: number
  project_id: number
  predator_id: number
  sub_type: string // from JOIN with predator table
  measurement: number | null
  dateStart: string | null
  dateEnd: string | null
  rats: number
  possums: number
  mustelids: number
  hedgehogs: number
  others: number
}

interface IPredatorOption {
  id: number
  sub_type: string
}

interface OutcomeTabProps {
  projectId: number
  isSidebarOpen: boolean
}

const OutcomeTab: React.FC<OutcomeTabProps> = ({
  projectId,
  isSidebarOpen,
}) => {
  // ----- Project Objectives Data -----
  const [objectives, setObjectives] = useState<IProjectObjective[]>([])
  const [editingObjectiveId, setEditingObjectiveId] = useState<number | null>(
    null
  )
  const [editAmount, setEditAmount] = useState<string>('')
  const [editDateStart, setEditDateStart] = useState<string>('')
  const [editDateEnd, setEditDateEnd] = useState<string>('')

  // ----- Predator Control Data -----
  const [showPredatorSection, setShowPredatorSection] = useState<boolean>(false)
  const [predatorRecords, setPredatorRecords] = useState<IPredatorRecord[]>([])
  const [editingPredatorId, setEditingPredatorId] = useState<number | null>(
    null
  )

  // The user picks from the predator table:
  const [predatorList, setPredatorList] = useState<IPredatorOption[]>([])
  const [selectedPredatorId, setSelectedPredatorId] = useState<number | null>(
    null
  )
  const [measurement, setMeasurement] = useState<number | null>(null)
  const [pDateStart, setPDateStart] = useState<string>('')
  const [pDateEnd, setPDateEnd] = useState<string>('')
  const [rats, setRats] = useState<number>(0)
  const [possums, setPossums] = useState<number>(0)
  const [mustelids, setMustelids] = useState<number>(0)
  const [hedgehogs, setHedgehogs] = useState<number>(0)
  const [others, setOthers] = useState<number>(0)

  // ---------------- Fetch Project Objectives ----------------
  useEffect(() => {
    const fetchObjectives = async () => {
      try {
        const res = await axios.get<IProjectObjective[]>(
          `/api/objectives/project_objectives/${projectId}`
        )
        setObjectives(res.data)

        // Check if "Establishing Predator Control" (objective_id=11) is present
        const hasPredatorControl = res.data.some(
          (obj) => obj.objective_id === 11
        )
        setShowPredatorSection(hasPredatorControl)
      } catch (err) {
        console.error('Error fetching project objectives:', err)
      }
    }
    if (projectId) {
      fetchObjectives()
    }
  }, [projectId])

  // ---------------- Fetch Predator List + Project Predator Data ----------------
  useEffect(() => {
    const fetchPredatorList = async () => {
      try {
        // fetch sub_types from /api/predator
        const subtypesRes = await axios.get<IPredatorOption[]>(`/api/predator`)
        setPredatorList(subtypesRes.data)
      } catch (error) {
        console.error('Error fetching predator list:', error)
      }
    }
    fetchPredatorList()

    if (projectId && showPredatorSection) {
      const fetchPredatorRecords = async () => {
        try {
          const res = await axios.get<IPredatorRecord[]>(
            `/api/project_predator/${projectId}`
          )
          setPredatorRecords(res.data)
        } catch (error) {
          console.error('Error fetching project predator records:', error)
        }
      }
      fetchPredatorRecords()
    }
  }, [projectId, showPredatorSection])

  // ============== OBJECTIVES EDITING HANDLERS =================
  const startEditObjective = (obj: IProjectObjective) => {
    setEditingObjectiveId(obj.projectObjectiveId)
    setEditAmount(obj.amount !== null ? String(obj.amount) : '')
    setEditDateStart(obj.dateStart || '')
    setEditDateEnd(obj.dateEnd || '')
  }

  const cancelEditObjective = () => {
    setEditingObjectiveId(null)
    setEditAmount('')
    setEditDateStart('')
    setEditDateEnd('')
  }

  const saveObjective = async (id: number) => {
    try {
      await axios.put(`/api/objectives/project_objectives/${id}`, {
        amount: editAmount ? Number(editAmount) : null, // store null if blank
        dateStart: editDateStart || null,
        dateEnd: editDateEnd || null,
      })
      // Refresh the list
      const res = await axios.get<IProjectObjective[]>(
        `/api/objectives/project_objectives/${projectId}`
      )
      setObjectives(res.data)
      cancelEditObjective()
    } catch (error) {
      console.error('Error updating project objective:', error)
    }
  }

  // ============== PREDATOR CONTROL HANDLERS ====================
  const resetPredatorForm = () => {
    setEditingPredatorId(null)
    setSelectedPredatorId(null)
    setMeasurement(null)
    setPDateStart('')
    setPDateEnd('')
    setRats(0)
    setPossums(0)
    setMustelids(0)
    setHedgehogs(0)
    setOthers(0)
  }

  const startEditPredator = (rec: IPredatorRecord) => {
    setEditingPredatorId(rec.id)
    setSelectedPredatorId(rec.predator_id)
    setMeasurement(rec.measurement)
    setPDateStart(rec.dateStart || '')
    setPDateEnd(rec.dateEnd || '')
    setRats(rec.rats)
    setPossums(rec.possums)
    setMustelids(rec.mustelids)
    setHedgehogs(rec.hedgehogs)
    setOthers(rec.others)
  }

  const handleSavePredator = async () => {
    try {
      if (!selectedPredatorId) {
        alert('Please select a predator sub‐type.')
        return
      }

      if (editingPredatorId) {
        // Update existing
        await axios.put(`/api/project_predator/${editingPredatorId}`, {
          predator_id: selectedPredatorId,
          measurement: measurement === null ? null : measurement,
          dateStart: pDateStart || null,
          dateEnd: pDateEnd || null,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
        })
      } else {
        // Create new
        await axios.post(`/api/project_predator`, {
          project_id: projectId,
          predator_id: selectedPredatorId,
          measurement: measurement === null ? null : measurement,
          dateStart: pDateStart || null,
          dateEnd: pDateEnd || null,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
        })
      }

      // Refresh predator data
      const res = await axios.get<IPredatorRecord[]>(
        `/api/project_predator/${projectId}`
      )
      setPredatorRecords(res.data)

      resetPredatorForm()
    } catch (err) {
      console.error('Error saving predator record:', err)
    }
  }

  const handleDeletePredator = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    try {
      await axios.delete(`/api/project_predator/${id}`)
      setPredatorRecords((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error('Error deleting predator record:', err)
    }
  }

  // Helper to see if the currently selected sub‐type is “Catches”
  const isSelectedCatches = () => {
    if (!selectedPredatorId) return false
    const pred = predatorList.find((p) => p.id === selectedPredatorId)
    return pred?.sub_type === 'Catches'
  }

  // ----- RENDER -----
  return (
    <div
      className={`${
        isSidebarOpen ? 'content-expanded' : 'content-collapsed'
      } d-flex flex-column`}
    >
      <h3 className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        Outcome (Project Objectives)
      </h3>

      {/* ------------------------------------------
          1) TABLE OF PROJECT OBJECTIVES
      -------------------------------------------- */}
      <h5 className="ms-3 mt-3" style={{ color: '#0094B6' }}>
        Objectives for this Project
      </h5>
      <div className="table-responsive px-3">
        <table className="table table-striped table-hover">
          <thead>
            <tr>
              <th>Title</th>
              <th>Default Measurement</th>
              <th>Amount / Value</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {objectives.map((obj) => {
              const isEditing = editingObjectiveId === obj.projectObjectiveId
              return (
                <tr key={obj.projectObjectiveId}>
                  <td>{obj.title}</td>
                  <td>{obj.measurement}</td>
                  {/* Amount */}
                  <td>
                    {
                      isEditing ? (
                        <input
                          type="number"
                          className="form-control"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                        />
                      ) : obj.amount !== null ? (
                        obj.amount
                      ) : (
                        ''
                      ) // show blank if null
                    }
                  </td>
                  {/* Date Start */}
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editDateStart}
                        onChange={(e) => setEditDateStart(e.target.value)}
                      />
                    ) : (
                      obj.dateStart || ''
                    )}
                  </td>
                  {/* Date End */}
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editDateEnd}
                        onChange={(e) => setEditDateEnd(e.target.value)}
                      />
                    ) : (
                      obj.dateEnd || ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => saveObjective(obj.projectObjectiveId)}
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={cancelEditObjective}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => startEditObjective(obj)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ------------------------------------------
          2) PREDATOR CONTROL SECTION (if applicable)
      -------------------------------------------- */}
      {showPredatorSection && (
        <>
          <h5 className="ms-3 mt-4" style={{ color: '#0094B6' }}>
            Predator Control Details
          </h5>
          <p className="ms-3">
            Track traps established, traps checked, and any catches (species).
          </p>

          {/* Add / Edit Form */}
          <div className="card mx-3 mb-3" style={{ padding: '1rem' }}>
            <h6>
              {editingPredatorId
                ? 'Edit Predator Record'
                : 'Add Predator Record'}
            </h6>
            <div className="row mb-2">
              {/* Sub-Objective from the predator table */}
              <div className="col">
                <label>Sub-Objective</label>
                <select
                  className="form-select"
                  value={selectedPredatorId ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setSelectedPredatorId(val ? Number(val) : null)
                  }}
                >
                  <option value="">-- select one --</option>
                  {predatorList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sub_type}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col">
                <label>Measurement (if not "Catches")</label>
                <input
                  type="number"
                  className="form-control"
                  value={measurement ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setMeasurement(val ? Number(val) : null)
                  }}
                  disabled={isSelectedCatches()}
                />
              </div>
              <div className="col">
                <label>Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={pDateStart}
                  onChange={(e) => setPDateStart(e.target.value)}
                />
              </div>
              <div className="col">
                <label>End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={pDateEnd}
                  onChange={(e) => setPDateEnd(e.target.value)}
                />
              </div>
            </div>

            {/* If user selected "Catches" */}
            {isSelectedCatches() && (
              <div className="row mb-2">
                <div className="col">
                  <label>Rats</label>
                  <input
                    type="number"
                    className="form-control"
                    value={rats}
                    onChange={(e) => setRats(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label>Possums</label>
                  <input
                    type="number"
                    className="form-control"
                    value={possums}
                    onChange={(e) => setPossums(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label>Mustelids</label>
                  <input
                    type="number"
                    className="form-control"
                    value={mustelids}
                    onChange={(e) => setMustelids(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label>Hedgehogs</label>
                  <input
                    type="number"
                    className="form-control"
                    value={hedgehogs}
                    onChange={(e) => setHedgehogs(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label>Others</label>
                  <input
                    type="number"
                    className="form-control"
                    value={others}
                    onChange={(e) => setOthers(Number(e.target.value))}
                  />
                </div>
              </div>
            )}

            <div className="mt-2">
              <button
                className="btn btn-success me-2"
                onClick={handleSavePredator}
              >
                {editingPredatorId ? 'Update' : 'Add'}
              </button>
              {editingPredatorId && (
                <button
                  className="btn btn-secondary"
                  onClick={resetPredatorForm}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Predator Data Table */}
          <div className="table-responsive px-3">
            <table className="table table-bordered table-hover">
              <thead>
                <tr>
                  <th>Sub-Type</th>
                  <th>Measurement</th>
                  <th>Date Start</th>
                  <th>Date End</th>
                  <th>Rats</th>
                  <th>Possums</th>
                  <th>Mustelids</th>
                  <th>Hedgehogs</th>
                  <th>Others</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {predatorRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.sub_type}</td>
                    <td>
                      {rec.sub_type === 'Catches' ? '-' : rec.measurement ?? ''}
                    </td>
                    <td>{rec.dateStart || ''}</td>
                    <td>{rec.dateEnd || ''}</td>
                    <td>{rec.rats}</td>
                    <td>{rec.possums}</td>
                    <td>{rec.mustelids}</td>
                    <td>{rec.hedgehogs}</td>
                    <td>{rec.others}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => startEditPredator(rec)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDeletePredator(rec.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {predatorRecords.length === 0 && (
                  <tr>
                    <td colSpan={10}>No predator records added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default OutcomeTab
