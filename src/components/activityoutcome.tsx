import React, { useState, useEffect } from 'react'
import axios from 'axios'

// ========== INTERFACES ==========
interface ActivityOutcomeProps {
  activityId: number
  activityName: string
}

interface IActivityObjective {
  activityObjectiveId: number
  activity_id: number
  objective_id: number
  amount: number | null
  dateStart: string | null
  dateEnd: string | null
  title: string
  measurement: string
}

interface IPredatorRecord {
  id: number
  activity_id: number
  predator_id: number
  sub_type: string
  measurement: number | null
  dateStart: string | null
  dateEnd: string | null
  rats: number
  possums: number
  mustelids: number
  hedgehogs: number
  others: number
  othersDescription?: string
}

interface IPredatorOption {
  id: number
  sub_type: string
}

const minDate = '2024-01-01' // No date before 2024

const ActivityOutcome: React.FC<ActivityOutcomeProps> = ({
  activityId,
  activityName,
}) => {
  // ----- Objectives State -----
  const [objectives, setObjectives] = useState<IActivityObjective[]>([])
  const [editingObjectiveId, setEditingObjectiveId] = useState<number | null>(
    null
  )
  const [editAmount, setEditAmount] = useState<string>('')
  const [editDateStart, setEditDateStart] = useState<string>('')
  const [editDateEnd, setEditDateEnd] = useState<string>('')

  // ----- Predator State -----
  const [showPredatorSection, setShowPredatorSection] = useState<boolean>(false)
  const [predatorRecords, setPredatorRecords] = useState<IPredatorRecord[]>([])
  const [editingPredatorId, setEditingPredatorId] = useState<number | null>(
    null
  )
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
  const [othersDescription, setOthersDescription] = useState<string>('')

  //----------------------------------------------------------------
  // 1) Fetch activity objectives
  //----------------------------------------------------------------
  useEffect(() => {
    if (!activityId) return
    const fetchObjectives = async () => {
      try {
        const res = await axios.get<IActivityObjective[]>(
          `/api/activity_objectives/${activityId}`
        )
        // strip time portion from dateStart/dateEnd if needed
        const transformed = res.data.map((obj) => ({
          ...obj,
          dateStart: obj.dateStart?.slice(0, 10) ?? null,
          dateEnd: obj.dateEnd?.slice(0, 10) ?? null,
        }))

        // Hide "Establishing Predator Control" from top table
        // That means we filter out objective_id === 11 or title includes "predator control"
        const filtered = transformed.filter((o) => {
          const titleLower = o.title?.toLowerCase() || ''
          if (o.objective_id === 11) return false
          if (titleLower.includes('predator control')) return false
          return true
        })

        setObjectives(filtered)

        // Check if we had the predator objective
        const hasPredator = res.data.some(
          (o) =>
            o.objective_id === 11 ||
            o.title.toLowerCase().includes('predator control')
        )
        setShowPredatorSection(hasPredator)
      } catch (err) {
        console.error('Error fetching activity objectives:', err)
      }
    }
    fetchObjectives()
  }, [activityId])

  //----------------------------------------------------------------
  // 2) If “Predator Control” is present => fetch predator sub-types + records
  //----------------------------------------------------------------
  useEffect(() => {
    const fetchPredatorList = async () => {
      try {
        const subtypesRes = await axios.get<IPredatorOption[]>(`/api/predator`)
        setPredatorList(subtypesRes.data)
      } catch (error) {
        console.error('Error fetching predator list:', error)
      }
    }
    fetchPredatorList()

    if (activityId && showPredatorSection) {
      const fetchPredatorRecords = async () => {
        try {
          const res = await axios.get<IPredatorRecord[]>(
            `/api/activity_predator/${activityId}`
          )
          const transformed = res.data.map((p) => ({
            ...p,
            dateStart: p.dateStart?.slice(0, 10) ?? null,
            dateEnd: p.dateEnd?.slice(0, 10) ?? null,
          }))
          setPredatorRecords(transformed)
        } catch (error) {
          console.error('Error fetching activity predator:', error)
        }
      }
      fetchPredatorRecords()
    }
  }, [activityId, showPredatorSection])

  //----------------------------------------------------------------
  // 3) Edit "normal" objectives (except Predator Control)
  //----------------------------------------------------------------
  const startEditObjective = (obj: IActivityObjective) => {
    setEditingObjectiveId(obj.activityObjectiveId)
    setEditAmount(obj.amount != null ? String(obj.amount) : '')
    setEditDateStart(obj.dateStart || '')
    setEditDateEnd(obj.dateEnd || '')
  }

  const cancelEditObjective = () => {
    setEditingObjectiveId(null)
    setEditAmount('')
    setEditDateStart('')
    setEditDateEnd('')
  }

  const saveObjective = async (objId: number) => {
    try {
      // PUT /api/activity_objectives/:id
      await axios.put(`/api/activity_objectives/${objId}`, {
        amount: editAmount ? Number(editAmount) : null,
        dateStart: editDateStart || null,
        dateEnd: editDateEnd || null,
      })
      // Refresh
      const newRes = await axios.get<IActivityObjective[]>(
        `/api/activity_objectives/${activityId}`
      )
      const transformed = newRes.data.map((obj) => ({
        ...obj,
        dateStart: obj.dateStart?.slice(0, 10) ?? null,
        dateEnd: obj.dateEnd?.slice(0, 10) ?? null,
      }))

      // Re-filter out Predator objective from top table
      const filtered = transformed.filter((o) => {
        const t = o.title?.toLowerCase() || ''
        if (o.objective_id === 11) return false
        if (t.includes('predator control')) return false
        return true
      })

      setObjectives(filtered)
      cancelEditObjective()
    } catch (error) {
      console.error('Error updating activity objective:', error)
    }
  }

  //----------------------------------------------------------------
  // 4) Predator Control logic
  //----------------------------------------------------------------
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
    setOthersDescription('')
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
    setOthersDescription(rec.othersDescription ?? '')
  }

  // Save or Update Predator
  const handleSavePredator = async () => {
    if (!selectedPredatorId) {
      alert('Please select a predator sub-type.')
      return
    }
    try {
      if (editingPredatorId) {
        // Update
        await axios.put(`/api/activity_predator/${editingPredatorId}`, {
          activity_id: activityId,
          predator_id: selectedPredatorId,
          measurement: measurement ?? null,
          dateStart: pDateStart || null,
          dateEnd: pDateEnd || null,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
          othersDescription,
        })
        alert('Predator record updated.')
      } else {
        // Create
        await axios.post('/api/activity_predator', {
          activity_id: activityId,
          predator_id: selectedPredatorId,
          measurement: measurement ?? null,
          dateStart: pDateStart || null,
          dateEnd: pDateEnd || null,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
          othersDescription,
        })
        alert('Predator record added.')
      }

      // Refresh
      const res = await axios.get<IPredatorRecord[]>(
        `/api/activity_predator/${activityId}`
      )
      const transformed = res.data.map((p) => ({
        ...p,
        dateStart: p.dateStart?.slice(0, 10) ?? null,
        dateEnd: p.dateEnd?.slice(0, 10) ?? null,
      }))
      setPredatorRecords(transformed)

      resetPredatorForm()
    } catch (err) {
      console.error('Error saving predator record:', err)
      alert('Failed to save predator record.')
    }
  }

  // Delete Predator
  const handleDeletePredator = async (id: number) => {
    if (
      !window.confirm('Are you sure you want to delete this predator record?')
    )
      return
    try {
      await axios.delete(`/api/activity_predator/${id}`)
      setPredatorRecords((prev) => prev.filter((x) => x.id !== id))
    } catch (err) {
      console.error('Error deleting predator record:', err)
      alert('Failed to remove predator record.')
    }
  }

  // If the user picks "Catches" sub_type => show species fields
  const isSelectedCatches = () => {
    if (!selectedPredatorId) return false
    const pred = predatorList.find((p) => p.id === selectedPredatorId)
    return pred?.sub_type.toLowerCase() === 'catches'
  }

  // ---------------------------------------------------------------------------
  // RENDER
  // ---------------------------------------------------------------------------
  return (
    <div>
      <h3 className="fw-bold p-2 fs-4" style={{ color: '#0094B6' }}>
        Activity Outcome
      </h3>

      {/* ========== OBJECTIVES TABLE (minus predator control) ========== */}
      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead>
            <tr>
              <th>Objective Title</th>
              <th>Default Measurement</th>
              <th>Amount / Value</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {objectives.length === 0 && (
              <tr>
                <td colSpan={6}>No objectives found for this activity.</td>
              </tr>
            )}
            {objectives.map((obj) => {
              const isRowEditing =
                editingObjectiveId === obj.activityObjectiveId
              return (
                <tr key={obj.activityObjectiveId}>
                  <td>{obj.title}</td>
                  <td>{obj.measurement}</td>
                  <td>
                    {isRowEditing ? (
                      <input
                        type="number"
                        className="form-control"
                        value={editAmount}
                        min={0}
                        onChange={(e) => setEditAmount(e.target.value)}
                      />
                    ) : (
                      obj.amount ?? ''
                    )}
                  </td>
                  <td>
                    {isRowEditing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editDateStart}
                        onChange={(e) => setEditDateStart(e.target.value)}
                        min={minDate} // disallow dates before 2024-01-01
                      />
                    ) : (
                      obj.dateStart || ''
                    )}
                  </td>
                  <td>
                    {isRowEditing ? (
                      <input
                        type="date"
                        className="form-control"
                        value={editDateEnd}
                        onChange={(e) => setEditDateEnd(e.target.value)}
                        min={minDate}
                      />
                    ) : (
                      obj.dateEnd || ''
                    )}
                  </td>
                  <td>
                    {isRowEditing ? (
                      <>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => saveObjective(obj.activityObjectiveId)}
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

      {/* ========== PREDATOR CONTROL ========== */}
      {showPredatorSection && (
        <>
          <h5 style={{ color: '#0094B6', marginTop: '1.5rem' }}>
            Predator Control Details
          </h5>
          <p>
            Add or track trap checks, established traps, or catches (species).
          </p>

          {/* Predator Add/Edit Form */}
          <div className="card p-3 mb-3" style={{ maxWidth: '100%' }}>
            <h6>
              {editingPredatorId
                ? 'Edit Predator Control Record'
                : 'Add Predator Control Record'}
            </h6>
            <div className="row mb-2">
              <div className="col">
                <label className="form-label">Sub-Objective</label>
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
                <label className="form-label">Measurement</label>
                <input
                  type="number"
                  className="form-control"
                  value={measurement ?? ''}
                  onChange={(e) => {
                    const val = e.target.value
                    setMeasurement(val ? Number(val) : null)
                  }}
                  disabled={isSelectedCatches()}
                  min={0}
                />
              </div>
              <div className="col">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={pDateStart}
                  onChange={(e) => setPDateStart(e.target.value)}
                  min={minDate}
                />
              </div>
              <div className="col">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={pDateEnd}
                  onChange={(e) => setPDateEnd(e.target.value)}
                  min={minDate}
                />
              </div>
            </div>

            {/* If sub_type is "catches", show species fields */}
            {isSelectedCatches() && (
              <div className="row mb-2">
                <div className="col">
                  <label className="form-label">Rats</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={rats}
                    onChange={(e) => setRats(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Possums</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={possums}
                    onChange={(e) => setPossums(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Mustelids</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={mustelids}
                    onChange={(e) => setMustelids(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Hedgehogs</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={hedgehogs}
                    onChange={(e) => setHedgehogs(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Others (#)</label>
                  <input
                    type="number"
                    className="form-control"
                    min={0}
                    value={others}
                    onChange={(e) => setOthers(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Others (Species)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={othersDescription}
                    onChange={(e) => setOthersDescription(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div>
              <button
                className="btn btn-primary me-2"
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

          {/* Predator Table */}
          <div className="table-responsive">
            <table className="table table-bordered table-hover align-middle">
              <thead>
                <tr>
                  <th>Sub-Type</th>
                  <th>Measurement</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Rats</th>
                  <th>Possums</th>
                  <th>Mustelids</th>
                  <th>Hedgehogs</th>
                  <th>Others</th>
                  <th>Others (Species)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {predatorRecords.length === 0 && (
                  <tr>
                    <td colSpan={11}>No predator records yet.</td>
                  </tr>
                )}
                {predatorRecords.map((rec) => (
                  <tr key={rec.id}>
                    <td>{rec.sub_type}</td>
                    <td>
                      {rec.sub_type.toLowerCase() === 'catches'
                        ? '-'
                        : rec.measurement}
                    </td>
                    <td>{rec.dateStart || ''}</td>
                    <td>{rec.dateEnd || ''}</td>
                    <td>{rec.rats}</td>
                    <td>{rec.possums}</td>
                    <td>{rec.mustelids}</td>
                    <td>{rec.hedgehogs}</td>
                    <td>{rec.others}</td>
                    <td>{rec.othersDescription ?? ''}</td>
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
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

export default ActivityOutcome
