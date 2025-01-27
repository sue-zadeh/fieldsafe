// src/components/ActivityOutcome.tsx
import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface ActivityOutcomeProps {
  activityId: number
  activityName: string
  projectName: string
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

const ActivityOutcome: React.FC<ActivityOutcomeProps> = ({
  activityId,
  activityName,
  projectName,
}) => {
  // ============ Objectives State ============
  const [objectives, setObjectives] = useState<IActivityObjective[]>([])
  const [editingObjId, setEditingObjId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [editDateStart, setEditDateStart] = useState('')
  const [editDateEnd, setEditDateEnd] = useState('')

  // ============ Predator State ============
  const [predatorList, setPredatorList] = useState<IPredatorOption[]>([])
  const [predatorRecords, setPredatorRecords] = useState<IPredatorRecord[]>([])
  const [editingPredId, setEditingPredId] = useState<number | null>(null)

  const [selectedPredatorId, setSelectedPredatorId] = useState<number | null>(
    null
  )
  const [pMeasurement, setPMeasurement] = useState<number | null>(null)
  const [pDateStart, setPDateStart] = useState('')
  const [pDateEnd, setPDateEnd] = useState('')
  const [rats, setRats] = useState(0)
  const [possums, setPossums] = useState(0)
  const [mustelids, setMustelids] = useState(0)
  const [hedgehogs, setHedgehogs] = useState(0)
  const [others, setOthers] = useState(0)
  const [othersDescription, setOthersDescription] = useState('')

  // ============ Load Objectives (sync) ============
  useEffect(() => {
    if (!activityId) return
    axios
      .get<IActivityObjective[]>(`/api/activity_objectives/${activityId}`)
      .then((res) => {
        // strip time from date
        const transformed = res.data.map((obj) => ({
          ...obj,
          dateStart: obj.dateStart ? obj.dateStart.slice(0, 10) : null,
          dateEnd: obj.dateEnd ? obj.dateEnd.slice(0, 10) : null,
        }))
        setObjectives(transformed)
      })
      .catch((err) => {
        console.error('Error loading activity objectives:', err)
      })
  }, [activityId])

  // ============ Load Predator List & Predator Records ============
  useEffect(() => {
    // fetch the predator list
    axios
      .get<IPredatorOption[]>('/api/predator')
      .then((res) => setPredatorList(res.data))
      .catch((err) => console.error('Error fetching predator list:', err))

    // fetch activity's existing predator records
    if (activityId) {
      axios
        .get<IPredatorRecord[]>(`/api/activity_predator/${activityId}`)
        .then((res) => {
          const transformed = res.data.map((p) => ({
            ...p,
            dateStart: p.dateStart ? p.dateStart.slice(0, 10) : null,
            dateEnd: p.dateEnd ? p.dateEnd.slice(0, 10) : null,
          }))
          setPredatorRecords(transformed)
        })
        .catch((err) => console.error('Error fetching predator records:', err))
    }
  }, [activityId])

  // ============ Objective Edit Handlers ============
  const handleEditObjective = (obj: IActivityObjective) => {
    setEditingObjId(obj.activityObjectiveId)
    setEditAmount(obj.amount !== null ? String(obj.amount) : '')
    setEditDateStart(obj.dateStart || '')
    setEditDateEnd(obj.dateEnd || '')
  }

  const handleSaveObjective = async (objId: number) => {
    try {
      await axios.put(`/api/activity_objectives/${objId}`, {
        amount: editAmount ? Number(editAmount) : null,
        dateStart: editDateStart || null,
        dateEnd: editDateEnd || null,
      })
      // reload
      const resp = await axios.get<IActivityObjective[]>(
        `/api/activity_objectives/${activityId}`
      )
      const trans = resp.data.map((o) => ({
        ...o,
        dateStart: o.dateStart ? o.dateStart.slice(0, 10) : null,
        dateEnd: o.dateEnd ? o.dateEnd.slice(0, 10) : null,
      }))
      setObjectives(trans)
    } catch (err) {
      console.error('Error saving objective:', err)
    }
    setEditingObjId(null)
  }

  const handleCancelObjective = () => {
    setEditingObjId(null)
    setEditAmount('')
    setEditDateStart('')
    setEditDateEnd('')
  }

  // ============ Predator Add/Edit ============
  const resetPredatorForm = () => {
    setEditingPredId(null)
    setSelectedPredatorId(null)
    setPMeasurement(null)
    setPDateStart('')
    setPDateEnd('')
    setRats(0)
    setPossums(0)
    setMustelids(0)
    setHedgehogs(0)
    setOthers(0)
    setOthersDescription('')
  }

  const handleSavePredator = async () => {
    if (!selectedPredatorId) {
      alert('Please select a Sub-Objective (predator sub_type).')
      return
    }
    try {
      if (!editingPredId) {
        // POST
        await axios.post('/api/activity_predator', {
          activity_id: activityId,
          predator_id: selectedPredatorId,
          measurement: pMeasurement,
          dateStart: pDateStart || null,
          dateEnd: pDateEnd || null,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
          othersDescription,
        })
      } else {
        // PUT
        await axios.put(`/api/activity_predator/${editingPredId}`, {
          activity_id: activityId,
          predator_id: selectedPredatorId,
          measurement: pMeasurement,
          dateStart: pDateStart || null,
          dateEnd: pDateEnd || null,
          rats,
          possums,
          mustelids,
          hedgehogs,
          others,
          othersDescription,
        })
      }
      // reload
      const resp = await axios.get<IPredatorRecord[]>(
        `/api/activity_predator/${activityId}`
      )
      const transformed = resp.data.map((p) => ({
        ...p,
        dateStart: p.dateStart ? p.dateStart.slice(0, 10) : null,
        dateEnd: p.dateEnd ? p.dateEnd.slice(0, 10) : null,
      }))
      setPredatorRecords(transformed)
      resetPredatorForm()
    } catch (err) {
      console.error('Error saving predator record:', err)
      alert('Failed to save predator record.')
    }
  }

  const handleEditPredator = (rec: IPredatorRecord) => {
    setEditingPredId(rec.id)
    setSelectedPredatorId(rec.predator_id)
    setPMeasurement(rec.measurement)
    setPDateStart(rec.dateStart || '')
    setPDateEnd(rec.dateEnd || '')
    setRats(rec.rats)
    setPossums(rec.possums)
    setMustelids(rec.mustelids)
    setHedgehogs(rec.hedgehogs)
    setOthers(rec.others)
    setOthersDescription(rec.othersDescription || '')
  }

  const handleDeletePredator = async (id: number) => {
    if (!window.confirm('Are you sure to delete this predator record?')) return
    try {
      await axios.delete(`/api/activity_predator/${id}`)
      setPredatorRecords((prev) => prev.filter((p) => p.id !== id))
    } catch (err) {
      console.error('Error deleting predator record:', err)
      alert('Failed to delete predator record.')
    }
  }

  // ============ Predator Grouping by sub_type ============
  const trapsEstablishedRecords = predatorRecords.filter(
    (r) => r.sub_type.toLowerCase() === 'traps established'
  )
  const trapsCheckedRecords = predatorRecords.filter(
    (r) => r.sub_type.toLowerCase() === 'traps checked'
  )
  const catchesRecords = predatorRecords.filter(
    (r) => r.sub_type.toLowerCase() === 'catches'
  )

  return (
    <div>
      <h3 style={{ fontWeight: 'bold', color: '#0094B6' }} className="mb-3">
        Activity: {activityName} — Project: {projectName}
      </h3>

      <h4>Activity Outcome</h4>
      <div className="table-responsive hover stripped shadow rounded">
        <table className="table table-striped table-hover btn-sm">
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
            {objectives.map((obj) => {
              const isEditing = editingObjId === obj.activityObjectiveId
              return (
                <tr key={obj.activityObjectiveId}>
                  <td>{obj.title}</td>
                  <td>{obj.measurement}</td>
                  <td>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="form-control"
                        min={0}
                      />
                    ) : (
                      obj.amount ?? ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editDateStart}
                        onChange={(e) => setEditDateStart(e.target.value)}
                        className="form-control"
                        min="2024-01-01"
                      />
                    ) : obj.dateStart ? (
                      obj.dateStart
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editDateEnd}
                        onChange={(e) => setEditDateEnd(e.target.value)}
                        className="form-control"
                        min="2024-01-01"
                      />
                    ) : obj.dateEnd ? (
                      obj.dateEnd
                    ) : (
                      ''
                    )}
                  </td>
                  <td>
                    {isEditing ? (
                      <>
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() =>
                            handleSaveObjective(obj.activityObjectiveId)
                          }
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm ms-2"
                          onClick={handleCancelObjective}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn  btn-sm text-light "
                      style={{ backgroundColor: '#0094B6' }}
                        onClick={() => handleEditObjective(obj)}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {objectives.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center">
                  No objectives found for this activity.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h4 style={{ marginTop: '2rem', color: '#0094B6' }}>
        Predator Control Details
      </h4>
      <p>Add or track trap checks, established traps, or catches (species).</p>

      {/* ============ ADD/EDIT Predator Form ============ */}
      <div className="card p-3 mb-3 shadow rounded" style={{ maxWidth: '100%' }}>
        <h5>
          {editingPredId
            ? 'Edit Predator Control Record'
            : 'Add Predator Control Record'}
        </h5>
        <div className="row mb-2">
          <div className="col-6 col-md-3">
            <label className="form-label">Sub-Objective</label>
            <select
              className="form-select"
              value={selectedPredatorId ?? ''}
              onChange={(e) =>
                setSelectedPredatorId(
                  e.target.value ? Number(e.target.value) : null
                )
              }
            >
              <option value="">-- select one --</option>
              {predatorList.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.sub_type}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-2">
            <label className="form-label">Measurement</label>
            <input
              type="number"
              className="form-control"
              value={pMeasurement ?? ''}
              min={0}
              onChange={(e) => {
                const val = e.target.value
                setPMeasurement(val ? Number(val) : null)
              }}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">Start Date</label>
            <input
              type="date"
              className="form-control"
              min="2024-01-01"
              value={pDateStart}
              onChange={(e) => setPDateStart(e.target.value)}
            />
          </div>
          <div className="col-6 col-md-3">
            <label className="form-label">End Date</label>
            <input
              type="date"
              className="form-control"
              min="2024-01-01"
              value={pDateEnd}
              onChange={(e) => setPDateEnd(e.target.value)}
            />
          </div>
        </div>

        {/* If sub_type is "Catches", show species fields */}
        {/* But you want to show them for all? We'll show them only for "Catches" for example */}
        {(() => {
          const predObj = predatorList.find((p) => p.id === selectedPredatorId)
          if (predObj?.sub_type.toLowerCase() === 'catches') {
            return (
              <div className="row mb-2 shadow rounded">
                <div className="col">
                  <label className="form-label">Rats</label>
                  <input
                    type="number"
                    className="form-control"
                    value={rats}
                    min={0}
                    onChange={(e) => setRats(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Possums</label>
                  <input
                    type="number"
                    className="form-control"
                    value={possums}
                    min={0}
                    onChange={(e) => setPossums(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Mustelids</label>
                  <input
                    type="number"
                    className="form-control"
                    value={mustelids}
                    min={0}
                    onChange={(e) => setMustelids(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Hedgehogs</label>
                  <input
                    type="number"
                    className="form-control"
                    value={hedgehogs}
                    min={0}
                    onChange={(e) => setHedgehogs(Number(e.target.value))}
                  />
                </div>
                <div className="col">
                  <label className="form-label">Others (#)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={others}
                    min={0}
                    onChange={(e) => setOthers(Number(e.target.value))}
                  />
                </div>
                <div className="col ">
                  <label className="form-label">Others (Species)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={othersDescription}
                    onChange={(e) => setOthersDescription(e.target.value)}
                  />
                </div>
              </div>
            )
          } else {
            // If sub_type is "Traps established" or "Traps checked", maybe no species fields
            return null
          }
        })()}

        <div className="mt-2 ">
          <button
            className="btn  me-2 w-25 text-light fs-6"
            style={{ backgroundColor: '#0094B6' }}
            onClick={handleSavePredator}
          >
            {editingPredId ? 'Update' : 'Add'}
          </button>
          {editingPredId && (
            <button className="btn btn-secondary" onClick={resetPredatorForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* =========== Display in 3 separate sub‐tables =========== */}
      <h5>Traps Established</h5>
      <div className="table-responsive mb-4 shadow rounded">
        <table className="table table-striped table-hover btn-sm">
          <thead>
            <tr>
              <th>Measurement</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {trapsEstablishedRecords.map((r) => (
              <tr key={r.id}>
                <td>{r.measurement ?? ''}</td>
                <td>{r.dateStart || ''}</td>
                <td>{r.dateEnd || ''}</td>
                <td>
                  <button
                    className="btn  btn-sm w-25 text-light"
                    style={{ backgroundColor: '#0094B6' }}
                    onClick={() => handleEditPredator(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2 w-25"
                    onClick={() => handleDeletePredator(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {trapsEstablishedRecords.length === 0 && (
              <tr>
                <td colSpan={4}>No records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h5>Traps Checked</h5>
      <div className="table-responsive mb-4 shadow rounded">
        <table className="table table-striped table-hover btn-sm">
          <thead>
            <tr>
              <th>Measurement</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {trapsCheckedRecords.map((r) => (
              <tr key={r.id}>
                <td>{r.measurement ?? ''}</td>
                <td>{r.dateStart || ''}</td>
                <td>{r.dateEnd || ''}</td>
                <td>
                  <button
                    className="btn btn-sm w-25"
                    style={{ backgroundColor: '#0094B6' }}
                    onClick={() => handleEditPredator(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2 w-25"
                    onClick={() => handleDeletePredator(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {trapsCheckedRecords.length === 0 && (
              <tr>
                <td colSpan={4}>No records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h5>Catches</h5>
      <div className="table-responsive mb-4 shadow rounded">
        <table className="table table-striped table-hover btn-sm">
          <thead>
            <tr>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Rats</th>
              <th>Possums</th>
              <th>Mustelids</th>
              <th>Hedgehogs</th>
              <th>Others (#)</th>
              <th>Others (Species)</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {catchesRecords.map((r) => (
              <tr key={r.id}>
                <td>{r.dateStart || ''}</td>
                <td>{r.dateEnd || ''}</td>
                <td>{r.rats}</td>
                <td>{r.possums}</td>
                <td>{r.mustelids}</td>
                <td>{r.hedgehogs}</td>
                <td>{r.others}</td>
                <td>{r.othersDescription || ''}</td>
                <td>
                  <button
                    className="btn btn-sm w-50 text-light"
                    style={{ backgroundColor: '#0094B6' }}
                    onClick={() => handleEditPredator(r)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm ms-2 text-light"
                    onClick={() => handleDeletePredator(r.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {catchesRecords.length === 0 && (
              <tr>
                <td colSpan={9}>No records yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ActivityOutcome
