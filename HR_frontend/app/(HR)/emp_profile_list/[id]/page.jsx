// app/(HR)/emp_profile_list/[id]/page.jsx
"use client";

import { useEffect, useState, useCallback  } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEmployeeById, updateEmployee } from "../../../../lib/api"; // Adjust path if needed
import toast from "react-hot-toast";
import {
  User, Mail, Phone, Building, Briefcase, Calendar, DollarSign,
  Heart, Shield, FileText, ArrowLeft, LoaderCircle, Edit, Save, X,
  GraduationCap, Banknote, Siren, Info
} from "lucide-react";


// ==============================================================================
// MAIN COMPONENT: EmployeeDetailPage
// ==============================================================================
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [employee, setEmployee] = useState(null); // The original, saved data
  const [editData, setEditData] = useState(null); // The data being edited in the form
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  // In a real app, you would fetch these lists from separate API endpoints
  const [departments, setDepartments] = useState([{id: 1, name: 'Technology'}, {id: 2, name: 'Product'}, {id: 3, name: 'HR'}]);
  const [positions, setPositions] = useState([{id: 1, name: 'Software Engineer'}, {id: 2, name: 'Product Manager'}, {id: 3, name: 'HR Generalist'}]);
  const [maritalStatuses, setMaritalStatuses] = useState([{id: 1, status: 'Single'}, {id: 2, status: 'Married'}]);
  const [employmentTypes, setEmploymentTypes] = useState([{id: 1, type: 'Full-Time'}, {id: 2, type: 'Part-Time'}, {id: 3, type: 'Intern'}]);
  const [jobStatuses, setJobStatuses] = useState([{id: 1, status: 'Active'}, {id: 2, status: 'On Leave'}]);
  const [agreementStatuses, setAgreementStatuses] = useState([{id: 1, status: 'Signed'}, {id: 2, status: 'Pending'}]);
  const fetchAndSetEmployeeData = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getEmployeeById(id);
      // Format dates for input fields
      data.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '';
      data.employmentDate = data.employmentDate ? new Date(data.employmentDate).toISOString().split('T')[0] : '';
      setEmployee(data);
      setEditData(data); // Always sync the edit form with the latest data
    } catch (error) {
      toast.error(error.message);
      setEmployee(null);
    }
  }, [id]);  // This function will only be recreated if the 'id' changes.

  useEffect(() => {
    setIsLoading(true);
    fetchAndSetEmployeeData().finally(() => {
      setIsLoading(false);
    });
  }, [fetchAndSetEmployeeData]); // The effect runs when the component mounts and when fetchAndSetEmployeeData changes.

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  const handleSave = async () => {
    // Reformat IDs to integers and handle empty strings before sending
    const payload = {
      ...editData,
      departmentId: editData.departmentId ? parseInt(editData.departmentId) : null,
      positionId: editData.positionId ? parseInt(editData.positionId) : null,
      maritalStatusId: editData.maritalStatusId ? parseInt(editData.maritalStatusId) : null,
      employmentTypeId: editData.employmentTypeId ? parseInt(editData.employmentTypeId) : null,
      jobStatusId: editData.jobStatusId ? parseInt(editData.jobStatusId) : null,
      agreementStatusId: editData.agreementStatusId ? parseInt(editData.agreementStatusId) : null,
    };

const savePromise = updateEmployee(id, payload);

    toast.promise(
      savePromise,
      {
        loading: 'Saving profile...',
        success: () => {
          // This runs ONLY after the save is successful
          fetchAndSetEmployeeData(); // ✅ Refetch the data from the source of truth
          setIsEditing(false); // Exit edit mode
          return 'Profile updated successfully!'; // Return the success message for the toast
        },
        error: (err) => err.message || 'Failed to update profile.',
      }
    );
  };
  
  const handleCancel = () => {
    setEditData(employee); // Revert any changes back to the original
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoaderCircle className="animate-spin h-12 w-12 text-indigo-500" />
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-red-500">Employee Not Found or Failed to Load</h2>
        <Link href="/emp_profile_list" className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Back to Employee List
        </Link>
      </div>
    );
  }
  
  const fullName = isEditing ? `${editData.firstName} ${editData.lastName}` : `${employee.firstName} ${employee.lastName}`;
  const dataToShow = isEditing ? editData : employee;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/emp_profile_list" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 mb-6">
          <ArrowLeft size={16} />
          Back to Employee List
        </Link>

        {/* PROFILE HEADER */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
          <img
            src={employee.photo || "/images/default-avatar.png"}
            alt={fullName}
            className="w-32 h-32 rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-800 flex-shrink-0"
          />
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{fullName}</h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">{employee.position?.name || "No Position"}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{employee.department?.name || "No Department"}</p>
          </div>
          <div className="flex-shrink-0">
            {isEditing ? (
              <div className="flex gap-2">
                <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700"><Save size={16} className="mr-2"/>Save Changes</Button>
                <Button onClick={handleCancel} className="bg-gray-500 hover:bg-gray-600"><X size={16} className="mr-2"/>Cancel</Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}><Edit size={16} className="mr-2"/>Edit Profile</Button>
            )}
          </div>
        </div>

        {/* INFORMATION GRID */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            <Card title="Personal & Family Information" icon={<User />}>
              <CardGrid>
                {isEditing ? (
                    <>
                        <EditField label="First Name" name="firstName" value={dataToShow.firstName} onChange={handleEditChange} />
                        <EditField label="Last Name" name="lastName" value={dataToShow.lastName} onChange={handleEditChange} />
                        <EditField label="Baptismal Name" name="baptismalName" value={dataToShow.baptismalName} onChange={handleEditChange} />
                        <EditField label="Date of Birth" name="dateOfBirth" value={dataToShow.dateOfBirth} onChange={handleEditChange} type="date"/>
                        <EditSelect label="Sex" name="sex" value={dataToShow.sex} onChange={handleEditChange}>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </EditSelect>
                        <EditField label="Nationality" name="nationality" value={dataToShow.nationality} onChange={handleEditChange} />
                        <EditSelect label="Marital Status" name="maritalStatusId" value={dataToShow.maritalStatusId} onChange={handleEditChange}>
                            <option value="">Select Status</option>
                            {maritalStatuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
                        </EditSelect>
                        <EditField label="Repentance Father Name" name="repentanceFatherName" value={dataToShow.repentanceFatherName} onChange={handleEditChange} />
                        <EditField label="Repentance Father Church" name="repentanceFatherChurch" value={dataToShow.repentanceFatherChurch} onChange={handleEditChange} />
                        <EditField label="Repentance Father Phone" name="repentanceFatherPhone" value={dataToShow.repentanceFatherPhone} onChange={handleEditChange} />
                    </>
                ) : (
                    <>
                        <InfoField icon={<User size={16} />} label="Baptismal Name" value={dataToShow.baptismalName} />
                        <InfoField icon={<Calendar size={16} />} label="Date of Birth" value={new Date(dataToShow.dateOfBirth).toLocaleDateString()} />
                        <InfoField icon={<Heart size={16} />} label="Marital Status" value={dataToShow.maritalStatus?.status} />
                        <InfoField icon={<Info size={16} />} label="Sex" value={dataToShow.sex} />
                        <InfoField icon={<Info size={16} />} label="Nationality" value={dataToShow.nationality} />
                        <InfoField icon={<User size={16} />} label="Repentance Father Name" value={dataToShow.repentanceFatherName} />
                        <InfoField icon={<Building size={16} />} label="Repentance Father Church" value={dataToShow.repentanceFatherChurch} />
                        <InfoField icon={<Phone size={16} />} label="Repentance Father Phone" value={dataToShow.repentanceFatherPhone} />
                    </>
                )}
              </CardGrid>
            </Card>
            <Card title="Employment & Education" icon={<Briefcase />}>
              <CardGrid>
                 {isEditing ? (
                    <>
                        <EditSelect label="Department" name="departmentId" value={dataToShow.departmentId} onChange={handleEditChange}>
                            <option value="">Select Department</option>
                            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </EditSelect>
                        <EditSelect label="Position" name="positionId" value={dataToShow.positionId} onChange={handleEditChange}>
                             <option value="">Select Position</option>
                            {positions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </EditSelect>
                        <EditField label="Employment Date" name="employmentDate" value={dataToShow.employmentDate} onChange={handleEditChange} type="date"/>
                        <EditSelect label="Employment Type" name="employmentTypeId" value={dataToShow.employmentTypeId} onChange={handleEditChange}>
                             <option value="">Select Type</option>
                            {employmentTypes.map(t => <option key={t.id} value={t.id}>{t.type}</option>)}
                        </EditSelect>
                        <EditSelect label="Job Status" name="jobStatusId" value={dataToShow.jobStatusId} onChange={handleEditChange}>
                             <option value="">Select Status</option>
                            {jobStatuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
                        </EditSelect>
                        <EditSelect label="Agreement Status" name="agreementStatusId" value={dataToShow.agreementStatusId} onChange={handleEditChange}>
                             <option value="">Select Status</option>
                            {agreementStatuses.map(s => <option key={s.id} value={s.id}>{s.status}</option>)}
                        </EditSelect>
                        <EditField label="Academic Qualification" name="academicQualification" value={dataToShow.academicQualification} onChange={handleEditChange} />
                        <EditField label="Educational Institution" name="educationalInstitution" value={dataToShow.educationalInstitution} onChange={handleEditChange} />
                    </>
                 ) : (
                    <>
                        <InfoField icon={<Building size={16} />} label="Department" value={dataToShow.department?.name} />
                        <InfoField icon={<Briefcase size={16} />} label="Position" value={dataToShow.position?.name} />
                        <InfoField icon={<Calendar size={16} />} label="Employment Date" value={new Date(dataToShow.employmentDate).toLocaleDateString()} />
                        <InfoField icon={<FileText size={16} />} label="Employment Type" value={dataToShow.employmentType?.type} />
                        <InfoField icon={<Shield size={16} />} label="Job Status" value={dataToShow.jobStatus?.status} />
                        <InfoField icon={<FileText size={16} />} label="Agreement Status" value={dataToShow.agreementStatus?.status} />
                        <InfoField icon={<GraduationCap size={16} />} label="Academic Qualification" value={dataToShow.academicQualification} />
                        <InfoField icon={<Building size={16} />} label="Educational Institution" value={dataToShow.educationalInstitution} />
                    </>
                 )}
              </CardGrid>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="Contact & Financial" icon={<Mail />}>
              <div className="space-y-4">
                {isEditing ? (
                    <>
                        <EditField label="Phone Number" name="phone" value={dataToShow.phone} onChange={handleEditChange} />
                        <EditField label="Address" name="address" value={dataToShow.address} onChange={handleEditChange} />
                        <EditField label="Sub-City" name="subCity" value={dataToShow.subCity} onChange={handleEditChange} />
                        <EditField label="Salary" name="salary" value={dataToShow.salary} onChange={handleEditChange} type="number"/>
                        <EditField label="Bonus Salary" name="bonusSalary" value={dataToShow.bonusSalary} onChange={handleEditChange} type="number"/>
                        <EditField label="Account Number" name="accountNumber" value={dataToShow.accountNumber} onChange={handleEditChange} />
                        <InfoField icon={<Mail size={16} />} label="Email (Cannot Edit)" value={dataToShow.user?.email} />
                    </>
                ) : (
                    <>
                        <InfoField icon={<Phone size={16} />} label="Phone Number" value={dataToShow.phone} />
                        <InfoField icon={<Building size={16} />} label="Address" value={`${dataToShow.address || ''}, ${dataToShow.subCity || ''}`} />
                        <InfoField icon={<Mail size={16} />} label="Email Address" value={dataToShow.user?.email} />
                        <InfoField icon={<User size={16} />} label="System Username" value={dataToShow.user?.username} />
                        <InfoField icon={<DollarSign size={16} />} label="Salary" value={`$${parseFloat(dataToShow.salary).toFixed(2)}`} />
                        <InfoField icon={<DollarSign size={16} />} label="Bonus Salary" value={`$${parseFloat(dataToShow.bonusSalary).toFixed(2)}`} />
                        <InfoField icon={<Banknote size={16} />} label="Account Number" value={dataToShow.accountNumber} />
                    </>
                )}
              </div>
            </Card>
            <Card title="Emergency Contact" icon={<Siren />}>
                <div className="space-y-4">
                    {isEditing ? (
                        <>
                            <EditField label="Contact Name" name="emergencyContactName" value={dataToShow.emergencyContactName} onChange={handleEditChange} />
                            <EditField label="Contact Phone" name="emergencyContactPhone" value={dataToShow.emergencyContactPhone} onChange={handleEditChange} />
                        </>
                    ) : (
                        <>
                            <InfoField icon={<User size={16} />} label="Contact Name" value={dataToShow.emergencyContactName} />
                            <InfoField icon={<Phone size={16} />} label="Contact Phone" value={dataToShow.emergencyContactPhone} />
                        </>
                    )}
                </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==============================================================================
// HELPER COMPONENTS (Full Definitions)
// ==============================================================================

function InfoField({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-100 break-words">{value || "N/A"}</p>
    </div>
  );
}

function EditField({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <input
        type={type}
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}

function EditSelect({ label, name, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
      <select
        id={name}
        name={name}
        value={value || ''}
        onChange={onChange}
        className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 focus:ring-2 focus:ring-indigo-500"
      >
        {children}
      </select>
    </div>
  );
}

function Card({ title, icon, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-3">
        <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400">{icon}</div>
        <h2 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      </header>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}

function CardGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  );
}

function Button({ children, onClick, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-2 rounded-lg bg-indigo-600 text-white font-semibold text-sm
                  hover:bg-indigo-700 transition-colors duration-200
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
                  dark:focus:ring-offset-slate-900 ${className}`}
    >
      {children}
    </button>
  );
}