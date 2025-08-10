"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

/**
 * Employee List page that includes:
 *  - existing cards/grid
 *  - button "Create New Employee" -> opens modal form
 *  - modal posts to /api/employees (server route)
 *
 * This form contains the main fields from your Prisma Employee model:
 * firstName, lastName, baptismalName, dateOfBirth, sex, nationality,
 * maritalStatusId, departmentId, positionId, employmentTypeId,
 * employmentDate, jobStatusId, phone, address, subCity,
 * emergencyContactName, emergencyContactPhone,
 * repentanceFatherName, repentanceFatherChurch, repentanceFatherPhone,
 * academicQualification, educationalInstitution,
 * salary, bonusSalary, accountNumber, agreementStatusId, photo (base64).
 *
 * Adjust fields as needed if you want more/less.
 */

/* ---------- small icons ---------- */
function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="5" stroke="orange" strokeWidth="2" />
      <path stroke="orange" strokeWidth="2" strokeLinecap="round" d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="purple" strokeWidth="2" />
    </svg>
  );
}

/* ---------- helper: convert file to base64 ---------- */
async function fileToBase64(file) {
  return await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = (e) => rej(e);
    reader.readAsDataURL(file);
  });
}

/* ---------- CreateEmployeeModal component ---------- */
function CreateEmployeeModal({ open, onClose, onCreated }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    baptismalName: "",
    dateOfBirth: "",
    sex: "male", // prisma enum: male | female | other
    nationality: "",
    maritalStatusId: "",
    departmentId: "",
    positionId: "",
    employmentTypeId: "",
    employmentDate: "",
    jobStatusId: "",
    phone: "",
    address: "",
    subCity: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    repentanceFatherName: "",
    repentanceFatherChurch: "",
    repentanceFatherPhone: "",
    academicQualification: "",
    educationalInstitution: "",
    salary: "0.00",
    bonusSalary: "0.00",
    accountNumber: "",
    agreementStatusId: "",
    photoBase64: "", // will hold base64 string
  });

  useEffect(() => {
    if (!open) {
      // reset when closed
      setForm((f) => ({
        ...f,
        firstName: "",
        lastName: "",
        baptismalName: "",
        dateOfBirth: "",
        sex: "male",
        nationality: "",
        maritalStatusId: "",
        departmentId: "",
        positionId: "",
        employmentTypeId: "",
        employmentDate: "",
        jobStatusId: "",
        phone: "",
        address: "",
        subCity: "",
        emergencyContactName: "",
        emergencyContactPhone: "",
        repentanceFatherName: "",
        repentanceFatherChurch: "",
        repentanceFatherPhone: "",
        academicQualification: "",
        educationalInstitution: "",
        salary: "0.00",
        bonusSalary: "0.00",
        accountNumber: "",
        agreementStatusId: "",
        photoBase64: "",
      }));
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setForm((p) => ({ ...p, photoBase64: base64 }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // minimal client validation
    if (!form.firstName || !form.lastName) {
      alert("First name and last name are required.");
      setLoading(false);
      return;
    }

    const payload = {
      ...form,
      // convert numeric ID fields to numbers if provided
      maritalStatusId: form.maritalStatusId ? Number(form.maritalStatusId) : null,
      departmentId: form.departmentId ? Number(form.departmentId) : null,
      positionId: form.positionId ? Number(form.positionId) : null,
      employmentTypeId: form.employmentTypeId ? Number(form.employmentTypeId) : null,
      jobStatusId: form.jobStatusId ? Number(form.jobStatusId) : null,
      agreementStatusId: form.agreementStatusId ? Number(form.agreementStatusId) : null,
      salary: form.salary ? String(form.salary) : "0.00",
      bonusSalary: form.bonusSalary ? String(form.bonusSalary) : "0.00",
    };

    // try {
    //   const res = await fetch("/api/employees", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify(payload),
    //   });

    //   if (!res.ok) {
    //     const text = await res.text();
    //     throw new Error(text || "Failed to create employee");
    //   }

    //   const created = await res.json();
    //   onCreated?.(created);
    //   onClose();
    //   alert("Employee created successfully.");
    // } catch (err) {
    //   console.error(err);
    //   alert("Error creating employee: " + (err.message || err));
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <>
      {/* overlay */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <form onSubmit={onSubmit} className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-auto max-h-[90vh]">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Create New Employee</h3>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onClose} className="text-sm px-3 py-1 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
                Close
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">First name</label>
              <input value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2" required />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Last name</label>
              <input value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-2" required />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Baptismal name</label>
              <input value={form.baptismalName} onChange={(e) => setForm({...form, baptismalName: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Date of birth</label>
              <input type="date" value={form.dateOfBirth} onChange={(e) => setForm({...form, dateOfBirth: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Sex</label>
              <select value={form.sex} onChange={(e) => setForm({...form, sex: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2 text-gray-900 dark:text-gray-100">
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Job & Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Nationality</label>
              <input value={form.nationality} onChange={(e) => setForm({...form, nationality: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Address</label>
              <input value={form.address} onChange={(e) => setForm({...form, address: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Sub-city</label>
              <input value={form.subCity} onChange={(e) => setForm({...form, subCity: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 p-2" />
            </div>

            {/* IDs & job dates (single column) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Marital status ID</label>
              <input value={form.maritalStatusId} onChange={(e) => setForm({...form, maritalStatusId: e.target.value})}
                placeholder="enter the ID (system)" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Department ID</label>
              <input value={form.departmentId} onChange={(e) => setForm({...form, departmentId: e.target.value})}
                placeholder="enter the ID" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Position ID</label>
              <input value={form.positionId} onChange={(e) => setForm({...form, positionId: e.target.value})}
                placeholder="enter the ID" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Employment date</label>
              <input type="date" value={form.employmentDate} onChange={(e) => setForm({...form, employmentDate: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />
            </div>

            {/* Emergency & family */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Emergency contact name</label>
              <input value={form.emergencyContactName} onChange={(e) => setForm({...form, emergencyContactName: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Emergency contact phone</label>
              <input value={form.emergencyContactPhone} onChange={(e) => setForm({...form, emergencyContactPhone: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Repentance father's name</label>
              <input value={form.repentanceFatherName} onChange={(e) => setForm({...form, repentanceFatherName: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />
            </div>

            {/* Education & salary */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Academic qualification</label>
              <input value={form.academicQualification} onChange={(e) => setForm({...form, academicQualification: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Educational institution</label>
              <input value={form.educationalInstitution} onChange={(e) => setForm({...form, educationalInstitution: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Salary</label>
              <input type="number" step="0.01" value={form.salary} onChange={(e) => setForm({...form, salary: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Bonus</label>
              <input type="number" step="0.01" value={form.bonusSalary} onChange={(e) => setForm({...form, bonusSalary: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />
            </div>

            {/* Bank & agreement & photo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">Account number</label>
              <input value={form.accountNumber} onChange={(e) => setForm({...form, accountNumber: e.target.value})}
                className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Agreement status ID</label>
              <input value={form.agreementStatusId} onChange={(e) => setForm({...form, agreementStatusId: e.target.value})}
                placeholder="enter ID or leave blank" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-700 p-2 bg-white dark:bg-gray-900" />

              <label className="block mt-4 text-sm font-medium text-gray-700 dark:text-gray-200">Photo (jpg/png)</label>
              <input type="file" accept="image/*" onChange={onFileChange} className="mt-1 block w-full text-sm text-gray-600 dark:text-gray-300" />
              {form.photoBase64 && (
                <div className="mt-3 flex items-center gap-3">
                  <img src={form.photoBase64} alt="preview" className="w-16 h-16 rounded-full object-cover border" />
                  <div className="text-sm text-gray-600 dark:text-gray-300">Photo selected</div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-4 border-t dark:border-gray-700">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">Cancel</button>
            <button type="submit" disabled={loading} className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition">
              {loading ? "Creating..." : "Create Employee"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

/* ---------- Main page component ---------- */
export default function EmployeeListPage({ initialEmployees = [] }) {
  const [openCreate, setOpenCreate] = useState(false);
  const [employees, setEmployees] = useState(initialEmployees);
  const router = useRouter();

  // theme
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Called when create modal reports a created employee
  const handleCreated = (employee) => {
    // add to UI (optimistic)
    setEmployees((prev) => [employee, ...prev]);
    // navigate to detail page optionally:
    // router.push(`/emp_profile_list/${employee.id}`);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* top bar */}
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 dark:text-gray-100">Employee Profiles</h1>

        <div className="flex items-center gap-3">
          {mounted && (
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
              <span className="text-sm text-gray-800 dark:text-gray-100">{theme === "dark" ? "Light" : "Dark"}</span>
            </button>
          )}

          <button onClick={() => setOpenCreate(true)}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow hover:scale-[1.02] transform transition">
            + Create New
          </button>
        </div>
      </div>

      {/* grid */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {employees.length === 0 && (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-12">No employees found yet — create one!</div>
        )}
        {employees.map((emp) => (
          <div key={emp.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-md hover:shadow-xl transform hover:-translate-y-1 transition">
            <div className="flex flex-col items-center">
              <img src={emp.photo || emp.image || "/images/default-avatar.png"} alt={emp.firstName || emp.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-100 dark:border-gray-700 shadow-sm" />
              <div className="text-center mt-3">
                <div className="font-semibold text-gray-800 dark:text-gray-100">{emp.firstName} {emp.lastName}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{emp.designation || emp.position || "—"}</div>
                <div className="mt-3 flex gap-2 justify-center">
                  <button onClick={() => router.push(`/emp_profile_list/${emp.id}`)} className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700">View</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* create modal */}
      <CreateEmployeeModal open={openCreate} onClose={() => setOpenCreate(false)} onCreated={handleCreated} />
    </div>
  );
}
