"use client";

import { useState, useEffect } from "react";
import { X, User, Briefcase, Info, Phone, Banknote } from "lucide-react";
import toast from "react-hot-toast";
import { createEmployee } from "../../../../lib/api"; // Adjust path if needed

// --- Helper Components for the Form ---
const FormInput = ({ label, name, value, onChange, type = "text", required = false, placeholder = '', step }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      placeholder={placeholder}
      step={step}
      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
    />
  </div>
);

const FormSelect = ({ label, name, value, onChange, required = false, children }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
    >
      {children}
    </select>
  </div>
);

const TabButton = ({ icon, label, isActive, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 p-3 text-sm font-semibold
                border-b-2 transition-colors
                ${isActive ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);

// --- Initial State for the Form ---
const initialUserData = { username: '', email: '', password: '' };
const initialEmployeeData = {
  firstName: '',
  lastName: '',
  baptismalName: '',
  dateOfBirth: '',
  sex: 'male',
  nationality: '',
  maritalStatusId: '',
  departmentId: '',
  subDepartmentId: '',
  positionId: '',
  employmentTypeId: '',
  employmentDate: '',
  jobStatusId: '',
  phone: '',
  address: '',
  subCity: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  repentanceFatherName: '',
  repentanceFatherChurch: '',
  repentanceFatherPhone: '',
  academicQualification: '',
  educationalInstitution: '',
  salary: '',
  bonusSalary: '',
  accountNumber: '',
  agreementStatusId: '',
  photoBase64: '',
};

// --- Main Modal Component ---
export function CreateEmployeeModal({ open, onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [roleId, setRoleId] = useState('');
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);

  useEffect(() => {
    if (!open) {
      setActiveTab("account");
      setUserData(initialUserData);
      setRoleId('');
      setEmployeeData(initialEmployeeData);
    }
  }, [open]);

  const handleUserChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });
  const handleEmployeeChange = (e) => setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });
  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setEmployeeData(p => ({ ...p, photoBase64: reader.result }));
    reader.readAsDataURL(file);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = {
        userData,
        employeeData: {
            ...employeeData,
            photo: employeeData.photoBase64 // The backend expects 'photo'
        },
        roleId,
      }
      const newEmployee = await createEmployee(payload);
      onCreated(newEmployee);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <header className="p-4 border-b dark:border-slate-700 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Create New Employee</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
            <X size={20} />
          </button>
        </header>

        {/* Tab Navigation */}
        <nav className="flex border-b dark:border-slate-700 flex-shrink-0">
          <TabButton icon={<User />} label="Account" isActive={activeTab === 'account'} onClick={() => setActiveTab('account')} />
          <TabButton icon={<Info />} label="Personal" isActive={activeTab === 'personal'} onClick={() => setActiveTab('personal')} />
          <TabButton icon={<Phone />} label="Contact" isActive={activeTab === 'contact'} onClick={() => setActiveTab('contact')} />
          <TabButton icon={<Briefcase />} label="Employment" isActive={activeTab === 'employment'} onClick={() => setActiveTab('employment')} />
          <TabButton icon={<Banknote />} label="Financial" isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
        </nav>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6">
            {/* --- TAB CONTENT --- */}
            {activeTab === 'account' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Username" name="username" value={userData.username} onChange={handleUserChange} required />
                <FormInput label="Email Address" name="email" value={userData.email} onChange={handleUserChange} type="email" required />
                <FormInput label="Password" name="password" value={userData.password} onChange={handleUserChange} type="password" required />
                <FormInput label="Role ID" name="roleId" value={roleId} onChange={(e) => setRoleId(e.target.value)} required placeholder="e.g., 2 for Staff" />
              </div>
            )}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="First Name" name="firstName" value={employeeData.firstName} onChange={handleEmployeeChange} required />
                <FormInput label="Last Name" name="lastName" value={employeeData.lastName} onChange={handleEmployeeChange} required />
                <FormInput label="Baptismal Name" name="baptismalName" value={employeeData.baptismalName} onChange={handleEmployeeChange} />
                <FormInput label="Date of Birth" name="dateOfBirth" value={employeeData.dateOfBirth} onChange={handleEmployeeChange} type="date" />
                <FormSelect label="Sex" name="sex" value={employeeData.sex} onChange={handleEmployeeChange}>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </FormSelect>
                <FormInput label="Nationality" name="nationality" value={employeeData.nationality} onChange={handleEmployeeChange} />
                <FormInput label="Marital Status ID" name="maritalStatusId" value={employeeData.maritalStatusId} onChange={handleEmployeeChange} placeholder="e.g., 1 for Single" />
                <div className="md:col-span-2">
                    <label htmlFor="photo" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Employee Photo</label>
                    <input type="file" id="photo" name="photo" accept="image/*" onChange={onFileChange} className="w-full text-sm"/>
                </div>
              </div>
            )}
            {activeTab === 'contact' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Phone Number" name="phone" value={employeeData.phone} onChange={handleEmployeeChange} />
                <FormInput label="Address" name="address" value={employeeData.address} onChange={handleEmployeeChange} />
                <FormInput label="Sub-City" name="subCity" value={employeeData.subCity} onChange={handleEmployeeChange} />
                <FormInput label="Emergency Contact Name" name="emergencyContactName" value={employeeData.emergencyContactName} onChange={handleEmployeeChange} />
                <FormInput label="Emergency Contact Phone" name="emergencyContactPhone" value={employeeData.emergencyContactPhone} onChange={handleEmployeeChange} />
                <FormInput label="Repentance Father Name" name="repentanceFatherName" value={employeeData.repentanceFatherName} onChange={handleEmployeeChange} />
                <FormInput label="Repentance Father Church" name="repentanceFatherChurch" value={employeeData.repentanceFatherChurch} onChange={handleEmployeeChange} />
                <FormInput label="Repentance Father Phone" name="repentanceFatherPhone" value={employeeData.repentanceFatherPhone} onChange={handleEmployeeChange} />
              </div>
            )}
            {activeTab === 'employment' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Department ID" name="departmentId" value={employeeData.departmentId} onChange={handleEmployeeChange} placeholder="e.g., 2" />
                <FormInput label="Sub-Department ID" name="subDepartmentId" value={employeeData.subDepartmentId} onChange={handleEmployeeChange} placeholder="Optional" />
                <FormInput label="Position ID" name="positionId" value={employeeData.positionId} onChange={handleEmployeeChange} placeholder="e.g., 5" />
                <FormInput label="Employment Type ID" name="employmentTypeId" value={employeeData.employmentTypeId} onChange={handleEmployeeChange} placeholder="e.g., 1 for Full-Time" />
                <FormInput label="Employment Date" name="employmentDate" value={employeeData.employmentDate} onChange={handleEmployeeChange} type="date" />
                <FormInput label="Job Status ID" name="jobStatusId" value={employeeData.jobStatusId} onChange={handleEmployeeChange} placeholder="e.g., 1 for Active" />
                <FormInput label="Academic Qualification" name="academicQualification" value={employeeData.academicQualification} onChange={handleEmployeeChange} />
                <FormInput label="Educational Institution" name="educationalInstitution" value={employeeData.educationalInstitution} onChange={handleEmployeeChange} />
              </div>
            )}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormInput label="Salary" name="salary" value={employeeData.salary} onChange={handleEmployeeChange} type="number" step="0.01" />
                 <FormInput label="Bonus Salary" name="bonusSalary" value={employeeData.bonusSalary} onChange={handleEmployeeChange} type="number" step="0.01" />
                 <FormInput label="Account Number" name="accountNumber" value={employeeData.accountNumber} onChange={handleEmployeeChange} />
                 <FormInput label="Agreement Status ID" name="agreementStatusId" value={employeeData.agreementStatusId} onChange={handleEmployeeChange} placeholder="e.g., 1 for Signed" />
              </div>
            )}
          </div>

          <footer className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400">
              {isLoading ? "Creating..." : "Create Employee"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}