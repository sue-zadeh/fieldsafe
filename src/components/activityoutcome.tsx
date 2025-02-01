import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface ActivityOutcomeProps {
  activityId: number
  activityName: string
  projectName: string
}

// ProjectObjective row from backend
interface IProjectObjective {
  projectObjectiveId: number
  objective_id: number
  title: string
  measurement: string
  amount: number | null
}

interface IPredatorOption {
  id: number
  sub_type: string
}

interface IPredatorRecord {
  id: number
  activity_id: number
  predator_id: number
  sub_type: string
  measurement: number | null
  rats: number
  possums: number
  mustelids: number
  hedgehogs: number
  others: number
  others_description?: string
}

const ActivityOutcome: React.FC<ActivityOutcomeProps> = ({ activityId }) => {
  // ============ Objectives State ============
  const [objectives, setObjectives] = useState<IProjectObjective[]>([])
  const [editingObjId, setEditingObjId] = useState<number | null>(null)
  const [editAmount, setEditAmount] = useState('')

  // ============ Predator State ============
  const [predatorList, setPredatorList] = useState<IPredatorOption[]>([])
  const [predatorRecords, setPredatorRecords] = useState<IPredatorRecord[]>([])
  const [editingPredId, setEditingPredId] = useState<number | null>(null)

  const [selectedPredatorId, setSelectedPredatorId] = useState<number | null>(
    null
  )
  const [pMeasurement, setPMeasurement] = useState<number | null>(null)
  const [rats, setRats] = useState(0)
  const [possums, setPossums] = useState(0)
  const [mustelids, setMustelids] = useState(0)
  const [hedgehogs, setHedgehogs] = useState(0)
  const [others, setOthers] = useState(0)
  const [othersDescription, setOthersDescription] = useState('')
  // If you want to match exactly the title "Establishing Predator Control":
  const hasPredatorControl = objectives.some(
    (obj) => obj.title === 'Predator Control'
  )

  // ============ Load Project Objectives for the activity ============

  useEffect(() => {
    if (!activityId) return
    axios
      .get(`/api/activity_outcome/${activityId}`)
      .then((res) => {
        // res.data = { projectId, objectives: [ ... ] }
        setObjectives(res.data.objectives || [])
      })
      .catch((err) => {
        console.error('Error loading project objectives:', err)
      })
  }, [activityId])

  // ============ Load Predator List & Predator Records ============
  useEffect(() => {
    // fetch the predator list (just 3 or so sub_types)
    axios
      .get<IPredatorOption[]>('/api/predator')
      .then((res) => setPredatorList(res.data))
      .catch((err) => console.error('Error fetching predator list:', err))

    // fetch activity's existing predator records
    if (activityId) {
      axios
        .get<IPredatorRecord[]>(`/api/activity_predator/${activityId}`)
        .then((res) => {
          setPredatorRecords(res.data)
        })
        .catch((err) => console.error('Error fetching predator records:', err))
    }
  }, [activityId])

  // ============ Objective Edit Handlers ============
  const handleEditObjective = (obj: IProjectObjective) => {
    setEditingObjId(obj.projectObjectiveId)
    setEditAmount(obj.amount !== null ? String(obj.amount) : '')
  }

  const handleSaveObjective = async (objId: number) => {
    try {
      await axios.put(`/api/project_objectives/${objId}`, {
        amount: editAmount ? Number(editAmount) : null,
      })
      // reload the full list
      const resp = await axios.get(`/api/activity_outcome/${activityId}`)
      setObjectives(resp.data.objectives || [])
    } catch (err) {
      console.error('Error saving objective:', err)
    }
    setEditingObjId(null)
    setEditAmount('')
  }

  const handleCancelObjective = () => {
    setEditingObjId(null)
    setEditAmount('')
  }

  // ============ Predator Add/Edit ============
  const resetPredatorForm = () => {
    setEditingPredId(null)
    setSelectedPredatorId(null)
    setPMeasurement(null)
    setRats(0)
    setPossums(0)
    setMustelids(0)
    setHedgehogs(0)
    setOthers(0)
    setOthersDescription('')
  }

  const handleSavePredator = async () => {
    if (!selectedPredatorId) {
      alert('Please select a Predator sub_type.')
      return
    }
    try {
      if (!editingPredId) {
        // POST
        await axios.post('/api/activity_predator', {
          activity_id: activityId,
          predator_id: selectedPredatorId,
          measurement: pMeasurement,
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
      setPredatorRecords(resp.data)
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
    setRats(rec.rats)
    setPossums(rec.possums)
    setMustelids(rec.mustelids)
    setHedgehogs(rec.hedgehogs)
    setOthers(rec.others)
    setOthersDescription(rec.others_description || '')
  }

  const handleDeletePredator = async (id: number) => {
    if (!window.confirm('Delete this predator record?')) return
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
      {/* <h3 className="mb-3" style={{ fontWeight: 'bold', color: '#0094B6' }}>
        Activity: {activityName} — Project: {projectName}
      </h3> */}

      <h4>Activity Outcome</h4>
      <div
        className="flex justify-content-center table-responsive shadow rounded mb-4"
        style={{ width: '75%' }}
      >
        <table className="table table-striped table-bordered table-hover rounded btn-sm">
          <thead>
            <tr>
              <th>Objective Title</th>
              <th className="text-center">Default Measurement</th>
              <th className="text-center">Amount/Value</th>
              <th
                className="text-center"
                style={{ width: '25%', textAlign: 'center' }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {objectives.map((obj) => {
              const isEditing = editingObjId === obj.projectObjectiveId
              return (
                <tr key={obj.projectObjectiveId}>
                  <td className="p-2">{obj.title}</td>
                  <td className="text-center">{obj.measurement}</td>
                  <td className="text-center">
                    {isEditing ? (
                      <input
                        style={{ textAlign: 'center' }}
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
                      <>
                        <button
                          className="btn btn-success btn-sm w-50"
                          onClick={() =>
                            handleSaveObjective(obj.projectObjectiveId)
                          }
                        >
                          Save
                        </button>
                        <button
                          className="btn btn-secondary btn-sm ms-1 w-50"
                          onClick={handleCancelObjective}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm text-light w-50"
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
                <td colSpan={4} className="text-center">
                  No objectives found for this project.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* {hasPredatorControl && ( */}
      <div>
        {/* Predator controls form / tables go here */}

        <h4 className=" mt-4" style={{ color: '#0094B6' }}>
          Predator Control Details
        </h4>
        <h6 className="">
          Add or track trap checks, established traps, or catches.
        </h6>

        {/* ADD/EDIT Predator Form */}
        <div className="card p-3 mb-3 shadow rounded">
          <h5 className="text-center">
            {editingPredId ? 'Edit' : 'Add'} Predator Control Record
          </h5>
          <div className="row justify-content-center mb-2">
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
            <div className="col-6 col-md-3">
              <label className="form-label">Measurement (#)</label>
              <input
                type="number"
                className="form-control"
                value={pMeasurement ?? ''}
                min={0}
                onChange={(e) =>
                  setPMeasurement(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              />
            </div>
          </div>

          {/* Show species input if sub_type === 'Catches' */}
          {(() => {
            const predObj = predatorList.find(
              (p) => p.id === selectedPredatorId
            )
            if (predObj && predObj.sub_type.toLowerCase() === 'catches') {
              return (
                <div className="row mb-2">
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
                  <div className="col">
                    <label className="form-label">Others (Species)</label>
                    <input
                      style={{ textAlign: 'center' }}
                      type="text"
                      className=" text-center form-control"
                      value={othersDescription}
                      onChange={(e) => setOthersDescription(e.target.value)}
                    />
                  </div>
                </div>
              )
            }
            return null
          })()}

          <div className=" text-center mt-2 ">
            <button
              className="btn me-2 text-light w-25"
              style={{ backgroundColor: '#0094B6' }}
              onClick={handleSavePredator}
            >
              {editingPredId ? 'Update' : 'Add'}
            </button>
            {editingPredId && (
              <button
                className="btn btn-secondary w-25"
                onClick={resetPredatorForm}
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Display each sub-type in separate table */}
        <h5 className="text-center">Traps Established</h5>
        <div className="flex justify-content-center table-responsive shadow rounded mb-4">
          <table className="table table-striped table-hover btn-sm w-50">
            <thead>
              <tr>
                <th className="text-center">Measurement (#)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trapsEstablishedRecords.map((r) => (
                <tr key={r.id}>
                  <td className="text-center">{r.measurement ?? ''}</td>
                  <td>
                    <button
                      className="btn btn-sm text-light w-25"
                      style={{ backgroundColor: '#0094B6' }}
                      onClick={() => handleEditPredator(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm ms-2 w-25 text-light"
                      style={{ backgroundColor: '#D37B40' }}
                      onClick={() => handleDeletePredator(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {trapsEstablishedRecords.length === 0 && (
                <tr>
                  <td colSpan={2}>No records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h5 className="text-center">Traps Checked</h5>
        <div className="table-responsive shadow rounded mb-4">
          <table className="table table-striped table-hover btn-sm w-50">
            <thead>
              <tr>
                <th className="text-center">Measurement (#)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {trapsCheckedRecords.map((r) => (
                <tr key={r.id}>
                  <td className="text-center">{r.measurement ?? ''}</td>
                  <td>
                    <button
                      className="btn btn-sm text-light w-25"
                      style={{ backgroundColor: '#0094B6' }}
                      onClick={() => handleEditPredator(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm ms-2 w-25 text-light"
                      style={{ backgroundColor: '#D37B40' }}
                      onClick={() => handleDeletePredator(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {trapsCheckedRecords.length === 0 && (
                <tr>
                  <td colSpan={2}>No records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <h5>Catches</h5>
        <div className="table-responsive shadow rounded mb-4">
          <table className="table table-striped table-bordered table-hover btn-sm">
            <thead>
              <tr>
                <th className="text-center">Rats</th>
                <th className="text-center">Possums</th>
                <th className="text-center">Mustelids</th>
                <th className="text-center">Hedgehogs</th>
                <th className="text-center">Others (#)</th>
                <th className="text-center">Others (Species)</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {catchesRecords.map((r) => (
                <tr key={r.id}>
                  <td className="text-center">{r.rats}</td>
                  <td className="text-center">{r.possums}</td>
                  <td className="text-center">{r.mustelids}</td>
                  <td className="text-center">{r.hedgehogs}</td>
                  <td className="text-center">{r.others}</td>
                  <td className="text-center">{r.others_description || ''}</td>
                  <td
                    className="text-center"
                    style={{ textAlign: 'center', width: '25%' }}
                  >
                    <button
                      className="btn btn-sm text-light text-center w-25"
                      style={{ backgroundColor: '#0094B6' }}
                      onClick={() => handleEditPredator(r)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm ms-2 w-25 text-light text-center"
                      style={{ backgroundColor: '#D37B40' }}
                      onClick={() => handleDeletePredator(r.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {catchesRecords.length === 0 && (
                <tr>
                  <td colSpan={7}>No records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* )} */}
    </div>
  )
}

export default ActivityOutcome
