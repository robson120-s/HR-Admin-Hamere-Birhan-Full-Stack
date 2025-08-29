"use client";

import { useState, useEffect } from "react";
import { X, User, Briefcase, Info, Phone, Banknote, ChevronsUpDown, Check, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { Combobox } from '@headlessui/react';
import { createEmployee } from "../../../../lib/api";
import { 
    getRoles, getDepartmentsLookup, getPositionsLookup, getMaritalStatuses, 
    getEmploymentTypes, getJobStatuses, getAgreementStatuses 
} from "../../../../lib/api";
import Image from 'next/image';

// --- IMPORT UPLOADTHING'S BUTTON COMPONENT ---
import { UploadButton } from "@uploadthing/react";

// ==============================================================================
// HELPER COMPONENTS (These are correct and unchanged)
// ==============================================================================
const FormInput = ({ label, name, value, onChange, type = "text", required = false, placeholder = '', step }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
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
    <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}{required && <span className="text-red-500">*</span>}</label>
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

function SearchableDropdown({ label, options = [], selected, setSelected, required = false, placeholder = '', disabled = false }) {
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => option.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <Combobox value={selected} onChange={setSelected} nullable disabled={disabled}>
        <div className="relative">
          <Combobox.Label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </Combobox.Label>
          <div className={`relative w-full cursor-default overflow-hidden rounded-md text-left border ${disabled ? 'bg-slate-100 dark:bg-slate-700' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500'}`}>
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-100 bg-transparent focus:ring-0"
              displayValue={(option) => option?.name || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">Nothing found.</div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.id}
                  className={({ active }) => `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'}`}
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>{option.name}</span>
                      {selected ? (<span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-600'}`}><Check className="h-5 w-5" aria-hidden="true" /></span>) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}

const initialUserData = { username: '', email: '', password: '' };
const initialEmployeeData = { firstName: '', lastName: '', baptismalName: '', dateOfBirth: '', sex: 'male', nationality: '', subDepartmentId: '', employmentDate: '', phone: '', address: '', subCity: '', emergencyContactName: '', emergencyContactPhone: '', repentanceFatherName: '', repentanceFatherChurch: '', repentanceFatherPhone: '', academicQualification: '', educationalInstitution: '', salary: '', bonusSalary: '', accountNumber: '', photo: '' };

// ==============================================================================
// MAIN MODAL COMPONENT
// ==============================================================================
export function CreateEmployeeModal({ open, onClose, onCreated }) {
  const [activeTab, setActiveTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [employeeData, setEmployeeData] = useState(initialEmployeeData);
  const [lookupData, setLookupData] = useState({
      roles: [], departments: [], positions: [], maritalStatuses: [],
      employmentTypes: [], jobStatuses: [], agreementStatuses: []
  });
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const [selectedSubDept, setSelectedSubDept] = useState(null);
  const [selectedPos, setSelectedPos] = useState(null);
  const [selectedEmpType, setSelectedEmpType] = useState(null);
  const [selectedJobStatus, setSelectedJobStatus] = useState(null);
  const [selectedAgreement, setSelectedAgreement] = useState(null);
  const [availableSubDepts, setAvailableSubDepts] = useState([]);
  
  // ✅ NEW STATE: This will track the upload progress visually.
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchLookups = async () => {
        try {
          const [roles, departments, positions, maritalStatuses, employmentTypes, jobStatuses, agreementStatuses] = await Promise.all([
            getRoles(), getDepartmentsLookup(), getPositionsLookup(), getMaritalStatuses(), 
            getEmploymentTypes(), getJobStatuses(), getAgreementStatuses()
          ]);
          setLookupData({ roles, departments, positions, maritalStatuses, employmentTypes, jobStatuses, agreementStatuses });
        } catch (error) { toast.error("Failed to load form options."); }
      };
      fetchLookups();
    } else {
        // Reset all state when the modal is closed
        setActiveTab("account");
        setUserData(initialUserData);
        setEmployeeData(initialEmployeeData);
        setSelectedRole(null);
        setSelectedMaritalStatus(null);
        setSelectedDept(null);
        setSelectedPos(null);
        setSelectedEmpType(null);
        setSelectedJobStatus(null);
        setSelectedAgreement(null);
        setSelectedSubDept(null);
        setAvailableSubDepts([]);
    }
  }, [open]);

  useEffect(() => {
    if (selectedDept && lookupData.departments.length > 0) {
      const subs = lookupData.departments.filter(d => d.parentId === selectedDept.id);
      setAvailableSubDepts(subs);
      if (selectedSubDept && selectedSubDept.parentId !== selectedDept.id) {
          setSelectedSubDept(null);
      }
    } else {
      setAvailableSubDepts([]);
      setSelectedSubDept(null);
    }
  }, [selectedDept, lookupData.departments, selectedSubDept]); 

  const handleUserChange = (e) => setUserData({ ...userData, [e.target.name]: e.target.value });
  const handleEmployeeChange = (e) => setEmployeeData({ ...employeeData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isUploading) {
        return toast.error("Please wait for the photo to finish uploading.");
    }
    setIsLoading(true);
    try {
      const payload = {
        userData,
        employeeData: {
          ...employeeData,
          maritalStatusId: selectedMaritalStatus?.id,
          departmentId: selectedDept?.id,
          subDepartmentId: selectedSubDept?.id,
          positionId: selectedPos?.id,
          employmentTypeId: selectedEmpType?.id,
          jobStatusId: selectedJobStatus?.id,
          agreementStatusId: selectedAgreement?.id,
        },
        roleId: selectedRole?.id,
      };
      await createEmployee(payload);
      toast.success("Employee created successfully!");
      onCreated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create employee.");
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
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
        </header>

        <nav className="flex border-b dark:border-slate-700 flex-shrink-0">
          <TabButton icon={<User />} label="Account & Role" isActive={activeTab === 'account'} onClick={() => setActiveTab('account')} />
          <TabButton icon={<Info />} label="Personal" isActive={activeTab === 'personal'} onClick={() => setActiveTab('personal')} />
          <TabButton icon={<Phone />} label="Contact" isActive={activeTab === 'contact'} onClick={() => setActiveTab('contact')} />
          <TabButton icon={<Briefcase />} label="Employment" isActive={activeTab === 'employment'} onClick={() => setActiveTab('employment')} />
          <TabButton icon={<Banknote />} label="Financial" isActive={activeTab === 'financial'} onClick={() => setActiveTab('financial')} />
        </nav>

        <form onSubmit={handleSubmit} className="overflow-y-auto">
          <div className="p-6">
            {activeTab === 'account' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="Username" name="username" value={userData.username} onChange={handleUserChange} required />
                <FormInput label="Email Address" name="email" value={userData.email} onChange={handleUserChange} type="email" required />
                <FormInput label="Password" name="password" value={userData.password} onChange={handleUserChange} type="password" required />
                <SearchableDropdown label="Role" options={lookupData.roles} selected={selectedRole} setSelected={setSelectedRole} required placeholder="Select a role..." />
              </div>
            )}
            {activeTab === 'personal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput label="First Name" name="firstName" value={employeeData.firstName} onChange={handleEmployeeChange} required />
                <FormInput label="Last Name" name="lastName" value={employeeData.lastName} onChange={handleEmployeeChange} required />
                <FormInput label="Baptismal Name" name="baptismalName" value={employeeData.baptismalName} onChange={handleEmployeeChange} />
                <FormInput label="Date of Birth" name="dateOfBirth" value={employeeData.dateOfBirth} onChange={handleEmployeeChange} type="date" />
                <FormSelect label="Sex" name="sex" value={employeeData.sex} onChange={handleEmployeeChange}><option value="male">Male</option><option value="female">Female</option></FormSelect>
                <FormInput label="Nationality" name="nationality" value={employeeData.nationality} onChange={handleEmployeeChange} />
                <SearchableDropdown label="Marital Status" options={lookupData.maritalStatuses} selected={selectedMaritalStatus} setSelected={setSelectedMaritalStatus} placeholder="Select status..." />
                
                <div className="md:col-span-2 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                        {employeeData.photo ? (
                            <Image src={employeeData.photo} alt="Employee Preview" width={96} height={96} className="object-cover w-full h-full"/>
                        ) : (
                            <User size={40} className="text-slate-400"/>
                        )}
                        {/* ✅ VISIBLE LOADING OVERLAY */}
                        {isUploading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <LoaderCircle className="w-8 h-8 text-white animate-spin" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Employee Photo</label>
                        <UploadButton
                            endpoint="employeePhotoUploader"
                            onUploadBegin={() => {
                                setIsUploading(true);
                                toast.loading("Uploading photo...");
                            }}
                            onClientUploadComplete={(res) => {
                                setIsUploading(false);
                                toast.dismiss(); // Dismiss the loading toast
                                if (res && res[0]) {
                                    setEmployeeData(p => ({ ...p, photo: res[0].url }));
                                    toast.success("Upload Completed!");
                                }
                            }}
                            onUploadError={(error) => {
                                setIsUploading(false);
                                toast.dismiss();
                                toast.error(`ERROR! ${error.message}`);
                            }}
                            // --- ✅ ATTRACTIVE STYLING ---
                            appearance={{
                                button: "bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold h-10",
                                container: "w-max",
                                allowedContent: "text-slate-500 text-xs",
                            }}
                        />
                         <p className="text-xs text-slate-500 mt-1">PNG or JPG, up to 2MB.</p>
                    </div>
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
                <SearchableDropdown 
                    label="Department (Main)" 
                    options={lookupData.departments.filter(d => !d.parentId)}
                    selected={selectedDept} 
                    setSelected={setSelectedDept} 
                    placeholder="Select Main department..." 
                />
                <SearchableDropdown 
                    label="Sub-Department (Optional)" 
                    options={availableSubDepts} 
                    selected={selectedSubDept} 
                    setSelected={setSelectedSubDept} 
                    disabled={!selectedDept || availableSubDepts.length === 0}
                    placeholder={!selectedDept ? "Select a department first" : "Select a sub-department..."}
                />
                <SearchableDropdown label="Position" options={lookupData.positions} selected={selectedPos} setSelected={setSelectedPos} placeholder="Select position..." />
                <SearchableDropdown label="Employment Type" options={lookupData.employmentTypes} selected={selectedEmpType} setSelected={setSelectedEmpType} placeholder="Select type..." />
                <FormInput label="Employment Date" name="employmentDate" value={employeeData.employmentDate} onChange={handleEmployeeChange} type="date" />
                <SearchableDropdown label="Job Status" options={lookupData.jobStatuses} selected={selectedJobStatus} setSelected={setSelectedJobStatus} placeholder="Select status..." />
                <FormInput label="Academic Qualification" name="academicQualification" value={employeeData.academicQualification} onChange={handleEmployeeChange} />
                <FormInput label="Educational Institution" name="educationalInstitution" value={employeeData.educationalInstitution} onChange={handleEmployeeChange} />
              </div> 
            )}
            {activeTab === 'financial' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <FormInput label="Salary" name="salary" value={employeeData.salary} onChange={handleEmployeeChange} type="number" step="0.01" />
                 <FormInput label="Bonus Salary" name="bonusSalary" value={employeeData.bonusSalary} onChange={handleEmployeeChange} type="number" step="0.01" />
                 <FormInput label="Account Number" name="accountNumber" value={employeeData.accountNumber} onChange={handleEmployeeChange} />
                 <SearchableDropdown label="Agreement Status" options={lookupData.agreementStatuses} selected={selectedAgreement} setSelected={setSelectedAgreement} placeholder="Select status..." />
              </div>
            )}
          </div>

          <footer className="p-4 border-t dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50 sticky bottom-0">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500">Cancel</button>
            <button type="submit" disabled={isLoading || isUploading} className="px-6 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
              {isLoading ? "Creating..." : isUploading ? "Uploading..." : "Create Employee"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}