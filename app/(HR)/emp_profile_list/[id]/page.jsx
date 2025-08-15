// app/(HR)/emp_profile_list/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEmployeeById, updateEmployee } from "../../../../lib/api";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, Building, Briefcase, Calendar, DollarSign,
  Heart, Shield, FileText, ArrowLeft, LoaderCircle, Edit, Save, X,
  GraduationCap, Banknote, Siren, Info
} from "lucide-react";

// Helper components (no changes needed)
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

/**
 * A reusable, styled input component for forms.
 * Used in "Edit Mode".
 */
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

/**
 * A styled container card with a header.
 */
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

/**
 * A simple grid component for organizing InfoFields inside a Card.
 */
function CardGrid({ children }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
      {children}
    </div>
  );
}

/**
 * A reusable, styled button component.
 */
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
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  // ... other states and functions (no changes needed)

  useEffect(() => {
    if (!id) return;
    const fetchEmployee = async () => {
      setIsLoading(true);
      try {
        const data = await getEmployeeById(id);
        setEmployee(data);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);
  
  // --- RENDER LOGIC ---
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
  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link href="/emp_profile_list" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 mb-6">
          <ArrowLeft size={16} />
          Back to Employee List
        </Link>

        {/* Profile Header (displays name, position, department) */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
            {/* ... header content ... */}
        </div>

        {/* ✅✅✅ FULL INFORMATION DISPLAY - VERIFY THIS SECTION ✅✅✅ */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            <Card title="Employment Details" icon={<Briefcase />}>
              <CardGrid>
                <InfoField icon={<Building size={16} />} label="Department" value={employee.department?.name} />
                <InfoField icon={<Building size={16} />} label="Sub-Department ID" value={employee.subDepartmentId} />
                <InfoField icon={<Briefcase size={16} />} label="Position" value={employee.position?.name} />
                <InfoField icon={<Calendar size={16} />} label="Employment Date" value={employee.employmentDate ? new Date(employee.employmentDate).toLocaleDateString() : 'N/A'} />
                <InfoField icon={<FileText size={16} />} label="Employment Type" value={employee.employmentType?.type} />
                <InfoField icon={<Shield size={16} />} label="Job Status" value={employee.jobStatus?.status} />
                <InfoField icon={<FileText size={16} />} label="Agreement Status" value={employee.agreementStatus?.status} />
              </CardGrid>
            </Card>

            <Card title="Personal & Family Information" icon={<User />}>
              <CardGrid>
                <InfoField icon={<User size={16} />} label="Baptismal Name" value={employee.baptismalName} />
                <InfoField icon={<Calendar size={16} />} label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : 'N/A'} />
                <InfoField icon={<Heart size={16} />} label="Marital Status" value={employee.maritalStatus?.status} />
                <InfoField icon={<Info size={16} />} label="Sex" value={employee.sex} />
                <InfoField icon={<Info size={16} />} label="Nationality" value={employee.nationality} />
                <InfoField icon={<User size={16} />} label="Repentance Father Name" value={employee.repentanceFatherName} />
                <InfoField icon={<Building size={16} />} label="Repentance Father Church" value={employee.repentanceFatherChurch} />
                <InfoField icon={<Phone size={16} />} label="Repentance Father Phone" value={employee.repentanceFatherPhone} />
              </CardGrid>
            </Card>
            
            <Card title="Education & Financials" icon={<GraduationCap />}>
                <CardGrid>
                    <InfoField icon={<GraduationCap size={16} />} label="Academic Qualification" value={employee.academicQualification} />
                    <InfoField icon={<Building size={16} />} label="Educational Institution" value={employee.educationalInstitution} />
                    <InfoField icon={<DollarSign size={16} />} label="Salary" value={`$${parseFloat(employee.salary).toFixed(2)}`} />
                    <InfoField icon={<DollarSign size={16} />} label="Bonus Salary" value={`$${parseFloat(employee.bonusSalary).toFixed(2)}`} />
                    <InfoField icon={<Banknote size={16} />} label="Account Number" value={employee.accountNumber} />
                </CardGrid>
            </Card>
          </div>

          <div className="space-y-8">
            <Card title="Contact & Account" icon={<Mail />}>
              <div className="space-y-4">
                <InfoField icon={<Phone size={16} />} label="Phone Number" value={employee.phone} />
                <InfoField icon={<Mail size={16} />} label="Email Address" value={employee.user?.email} />
                <InfoField icon={<Building size={16} />} label="Address" value={`${employee.address || ''}, ${employee.subCity || ''}`} />
                <InfoField icon={<User size={16} />} label="System Username" value={employee.user?.username} />
              </div>
            </Card>
            <Card title="Emergency Contact" icon={<Siren />}>
                <div className="space-y-4">
                    <InfoField icon={<User size={16} />} label="Contact Name" value={employee.emergencyContactName} />
                    <InfoField icon={<Phone size={16} />} label="Contact Phone" value={employee.emergencyContactPhone} />
                </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}