"use client"

import { useState, Fragment } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "/components/ui/card"
import { Pencil, Trash2, Plus, X, Eye, EyeOff } from "lucide-react"

export default function DepartmentHeadPage() {
  const [departmentHeadInfo] = useState({
    name: "John Doe",
    designation: "Senior Department Head",
    department: "Engineering",
  })

  // Sub-departments summary
  const [subDepartments, setSubDepartments] = useState([
    { id: 1, name: "Software Development", staff: 8, interns: 4 },
    { id: 2, name: "Network Engineering", staff: 6, interns: 2 },
    { id: 3, name: "Cybersecurity", staff: 5, interns: 3 },
    { id: 4, name: "Data Science", staff: 7, interns: 5 },
  ])

  // Detailed staff/intern data
  const [staffInternData, setStaffInternData] = useState({
    1: {
      staff: [
        { id: 1, name: "Alice Johnson", role: "Senior Developer" },
        { id: 2, name: "Mark Smith", role: "Frontend Engineer" },
      ],
      interns: [{ id: 3, name: "James Doe", role: "Intern Developer" }],
    },
    2: {
      staff: [{ id: 4, name: "Sarah Brown", role: "Network Engineer" }],
      interns: [{ id: 5, name: "Tom Wilson", role: "Network Intern" }],
    },
    3: { staff: [{ id: 6, name: "Kevin Lee", role: "Security Analyst" }], interns: [] },
    4: {
      staff: [{ id: 7, name: "Rachel Green", role: "Data Scientist" }],
      interns: [{ id: 8, name: "Emily Davis", role: "Data Intern" }],
    },
  })

  // Next person ID
  const [nextPersonId, setNextPersonId] = useState(() => {
    const all = Object.values(staffInternData).flatMap(d => [...d.staff, ...d.interns])
    return all.length ? Math.max(...all.map(p => p.id)) + 1 : 1
  })

  // Currently selected sub-department for expand/collapse
  const [selectedSubDept, setSelectedSubDept] = useState(null)

  // Modals & forms
  const [showAddModal, setShowAddModal] = useState(false)

  const [editSubDept, setEditSubDept] = useState(null)
  const [confirmDeleteSubDeptId, setConfirmDeleteSubDeptId] = useState(null)
  const [editPerson, setEditPerson] = useState(null)
  const [confirmDeletePerson, setConfirmDeletePerson] = useState(null)

  // Toggle row expand/collapse
  const toggleSubDept = (subId) => {
    setSelectedSubDept(selectedSubDept === subId ? null : subId)
  }


  const saveNewSubDept = () => {
    const name = newSubDept.name.trim()
    if (!name) return
    const newId = subDepartments.length ? Math.max(...subDepartments.map(d => d.id)) + 1 : 1

    const placeholderStaff = Array.from({ length: Number(newSubDept.staff) || 0 }, (_, i) => ({
      id: nextPersonId + i,
      name: `Staff #${i + 1}`,
      role: "Staff",
    }))
    const nextIdAfterStaff = nextPersonId + placeholderStaff.length
    const placeholderInterns = Array.from({ length: Number(newSubDept.interns) || 0 }, (_, i) => ({
      id: nextIdAfterStaff + i,
      name: `Intern #${i + 1}`,
      role: "Intern",
    }))
    setNextPersonId(nextIdAfterStaff + placeholderInterns.length)

    setSubDepartments(prev => [
      ...prev,
      { id: newId, name, staff: placeholderStaff.length, interns: placeholderInterns.length },
    ])
    setStaffInternData(prev => ({
      ...prev,
      [newId]: { staff: placeholderStaff, interns: placeholderInterns },
    }))
    setShowAddModal(false)
  }

  // Edit Sub-Department
 


  const openEditPerson = (type, subId, person) => {
    setEditPerson({
      subId,
      type,
      personId: person.id,
      name: person.name,
      role: person.role,
    })
  }
  const saveEditPerson = () => {
    const { subId, type, personId, name, role } = editPerson
    setStaffInternData(prev => {
      const group = type === "Staff" ? "staff" : "interns"
      const updated = { ...prev }
      updated[subId] = {
        ...updated[subId],
        [group]: updated[subId][group].map(p =>
          p.id === personId ? { ...p, name: name.trim(), role: role.trim() } : p
        ),
      }
      return updated
    })
    setEditPerson(null)
  }

  // Delete Person
  const openDeletePerson = (type, subId, person) => {
    setConfirmDeletePerson({ type, subId, personId: person.id, name: person.name })
  }
  const doDeletePerson = () => {
    const { type, subId, personId } = confirmDeletePerson
    const group = type === "Staff" ? "staff" : "interns"
    setStaffInternData(prev => {
      const updated = { ...prev }
      updated[subId] = {
        ...updated[subId],
        [group]: updated[subId][group].filter(p => p.id !== personId),
      }
      return updated
    })
    setSubDepartments(prev =>
      prev.map(sd =>
        sd.id === subId
          ? {
              ...sd,
              staff: group === "staff" ? Math.max(0, sd.staff - 1) : sd.staff,
              interns: group === "interns" ? Math.max(0, sd.interns - 1) : sd.interns,
            }
          : sd
      )
    )
    setConfirmDeletePerson(null)
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-600">
            {departmentHeadInfo.name}
          </h1>
          <p className="text-gray-700 dark:text-gray-300">{departmentHeadInfo.designation} - {departmentHeadInfo.department}</p>
        </div>
   
      </div>

      {/* Sub-Department Table */}
      <Card className="border-green-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-black dark:text-white">
            Sub-Departments & Team
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300 dark:border-gray-700">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="p-3 text-left">Sub-Department</th>
                  <th className="p-3 text-center">Staff</th>
                  <th className="p-3 text-center">Interns</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subDepartments.map(sub => (
                  <Fragment key={sub.id}>
                    <tr className="border-b border-gray-300 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-800 cursor-pointer">
                      <td className="p-3">{sub.name}</td>
                      <td className="p-3 text-center">{sub.staff}</td>
                      <td className="p-3 text-center">{sub.interns}</td>
                      <td className="p-3">
                        <div className="flex justify-center gap-3">
                          {/* Toggle eye */}
                          <button
                            onClick={() => toggleSubDept(sub.id)}
                            className="text-green-600 hover:text-green-800"
                            title={selectedSubDept === sub.id ? "Hide details" : "View details"}
                          >
                            {selectedSubDept === sub.id ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                       
                         
                          
                        </div>
                      </td>
                    </tr>

                    {/* Expanded staff/interns */}
                    {selectedSubDept === sub.id && (
                      <tr>
                        <td colSpan={4} className="p-4 bg-gray-50 dark:bg-gray-900">
                          {/* Staff */}
                          <h3 className="text-lg font-semibold text-green-600 mb-2">Staff</h3>
                          <PersonTable
                            people={staffInternData[sub.id]?.staff}
                            type="Staff"
                            subId={sub.id}
                            onEdit={openEditPerson}
                            onDelete={openDeletePerson}
                          />
                          {/* Interns */}
                          <h3 className="text-lg font-semibold text-green-600 mb-2">Interns</h3>
                          <PersonTable
                            people={staffInternData[sub.id]?.interns}
                            type="Intern"
                            subId={sub.id}
                            onEdit={openEditPerson}
                            onDelete={openDeletePerson}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* --- Modals --- */}
      {showAddModal && (
        <Modal onClose={() => setShowAddModal(false)} title="Add Sub-Department">
          <div className="space-y-4">
            <Field
              label="Name"
              value={newSubDept.name}
              onChange={(v) => setNewSubDept(s => ({ ...s, name: v }))}
              placeholder="e.g., Quality Assurance"
            />
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Initial Staff Count"
                type="number"
                value={newSubDept.staff}
                onChange={(v) => setNewSubDept(s => ({ ...s, staff: Number(v) || 0 }))}
              />
              <Field
                label="Initial Intern Count"
                type="number"
                value={newSubDept.interns}
                onChange={(v) => setNewSubDept(s => ({ ...s, interns: Number(v) || 0 }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveNewSubDept}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

    
  

      {editPerson && (
        <Modal onClose={() => setEditPerson(null)} title={`Edit ${editPerson.type}`}>
          <div className="space-y-4">
            <Field
              label="Name"
              value={editPerson.name}
              onChange={(v) => setEditPerson(s => ({ ...s, name: v }))}
            />
            <Field
              label="Role"
              value={editPerson.role}
              onChange={(v) => setEditPerson(s => ({ ...s, role: v }))}
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditPerson(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={saveEditPerson}
                className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white"
              >
                Save
              </button>
            </div>
          </div>
        </Modal>
      )}

      {confirmDeletePerson && (
        <Modal onClose={() => setConfirmDeletePerson(null)} title={`Delete ${confirmDeletePerson.type}`}>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Are you sure you want to delete <span className="font-semibold">{confirmDeletePerson.name}</span>?
          </p>
          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={() => setConfirmDeletePerson(null)}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={doDeletePerson}
              className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ---------------- Small UI helpers ---------------- */
function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative w-full max-w-lg mx-4 rounded-2xl shadow-xl bg-white dark:bg-gray-900 p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-black dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, type = "text", placeholder = "", min }) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span>
      <input
       
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      className="w-full border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
    />
  </label>
)
}

function PersonTable({ people = [], type, subId, onEdit, onDelete }) {
  return (
    <table className="w-full mb-4 border border-gray-300 dark:border-gray-700">
      <thead className="bg-green-200 dark:bg-gray-800 text-black dark:text-white">
        <tr>
          <th className="p-2 text-left">Name</th>
          <th className="p-2 text-left">Role</th>
          <th className="p-2 text-center">Actions</th>
        </tr>
      </thead>
      <tbody>
        {people.map(person => (
          <tr key={person.id} className="border-b border-gray-300 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-gray-900">
            <td className="p-2">{person.name}</td>
            <td className="p-2">{person.role}</td>
            <td className="p-2 flex justify-center gap-2">
              <button
                className="text-green-600 hover:text-green-800"
                onClick={() => onEdit(type, subId, person)}
                title="Edit"
              >
                <Pencil size={16} />
              </button>
              <button
                className="text-red-600 hover:text-red-800"
                onClick={() => onDelete(type, subId, person)}
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </td>
          </tr>
        ))}
        {people.length === 0 && (
          <tr>
            <td colSpan={3} className="p-2 text-center text-gray-500 dark:text-gray-400">
              No {type.toLowerCase()} available.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  )
}
