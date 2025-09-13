'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCircle, Briefcase, Building2, CalendarDays, Phone, Mail, Home,
  Cake, Heart, Flag, Book, GraduationCap, DollarSign, Banknote, ShieldEllipsis, Clock3, AtSign
} from 'lucide-react';
 // Using lucide-react for icons


 // =========================================================================
// !!! CORRECTED PATHS FOR UI COMPONENTS !!!
// =========================================================================
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card'; // <--- Check this path carefully
import { fetchEmployeeProfile } from '../../../../lib/api';
import Sidebar from '../Sidebar'; // <--- Check this path carefully


// Helper to display a detail row
const DetailRow = ({ icon, label, value }) => {
  if (value === null || value === undefined || value === '') return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</p>
        <p className="text-base font-semibold text-gray-800 dark:text-gray-100 break-words">{String(value)}</p>
      </div>
    </div>
  );
};

export default function EmployeeProfilePage() {
  // TODO: IMPORTANT: Replace this with the actual logged-in employee ID from your authentication context.
  const employeeId = 1; // Placeholder employee ID for demonstration

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getEmployeeProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!employeeId) {
          throw new Error('Employee ID not available. Cannot fetch profile.');
        }
        const data = await fetchEmployeeProfile(employeeId);
        setEmployee(data);
      } catch (err) {
        console.error("Error fetching employee profile:", err);
        setError(err.message || "Failed to load employee profile.");
      } finally {
        setLoading(false);
      }
    };

    if (employeeId) {
      getEmployeeProfile();
    }
  }, [employeeId]);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <p className="text-gray-600 dark:text-gray-300">Loading profile data...</p>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative dark:bg-red-900/30 dark:text-red-300" role="alert">
            <strong className="font-bold">Error! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </main>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <p className="text-gray-600 dark:text-gray-300">No employee profile found.</p>
        </main>
      </div>
    );
  }

  const defaultPhoto = "https://via.placeholder.com/150/4F46E5/FFFFFF?text=Staff"; // Default image if no photo
  const photoUrl = employee.photo || defaultPhoto;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
            <div className="flex-shrink-0">
              <img
                src={photoUrl}
                alt={`${employee.firstName} ${employee.lastName}'s profile`}
                className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500 shadow-md"
                onError={(e) => { e.target.onerror = null; e.target.src = defaultPhoto; }} // Fallback on error
              />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                {employee.firstName} {employee.lastName}
              </h1>
              {employee.baptismalName && (
                <p className="text-lg text-gray-600 dark:text-gray-300 mt-1 italic">
                  ({employee.baptismalName})
                </p>
              )}
              <p className="text-md text-indigo-600 dark:text-indigo-400 mt-2 flex items-center justify-center sm:justify-start gap-2">
                <Briefcase size={18} />
                {employee.position?.name || 'N/A'} at {employee.department_employee_departmentIdTodepartment?.name || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Details Card */}
            <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-0 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <UserCircle size={24} className="text-orange-500" /> Personal Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow icon={<Cake size={18} />} label="Date of Birth" value={employee.dateOfBirth ? new Date(employee.dateOfBirth).toLocaleDateString() : null} />
                <DetailRow icon={<Heart size={18} />} label="Marital Status" value={employee.maritalstatus?.status} />
                <DetailRow icon={<Flag size={18} />} label="Nationality" value={employee.nationality} />
                <DetailRow icon={<Book size={18} />} label="Sex" value={employee.sex} />
                <DetailRow icon={<GraduationCap size={18} />} label="Academic Qualification" value={employee.academicQualification} />
                <DetailRow icon={<Building2 size={18} />} label="Educational Institution" value={employee.educationalInstitution} />
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-0 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Phone size={24} className="text-teal-500" /> Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow icon={<Phone size={18} />} label="Phone" value={employee.phone} />
                {employee.user?.email && (
                     <DetailRow icon={<AtSign size={18} />} label="Email" value={employee.user.email} />
                )}
                <DetailRow icon={<Home size={18} />} label="Address" value={employee.address} />
                <DetailRow icon={<Building2 size={18} />} label="Sub City" value={employee.subCity} />
                <DetailRow icon={<Phone size={18} />} label="Emergency Contact Name" value={employee.emergencyContactName} />
                <DetailRow icon={<Phone size={18} />} label="Emergency Contact Phone" value={employee.emergencyContactPhone} />
              </CardContent>
            </Card>

            {/* Employment Details Card */}
            <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-0 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <Briefcase size={24} className="text-purple-500" /> Employment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow icon={<Building2 size={18} />} label="Department" value={employee.department_employee_departmentIdTodepartment?.name} />
                <DetailRow icon={<Building2 size={18} />} label="Sub-Department" value={employee.department_employee_subDepartmentIdTodepartment?.name} />
                <DetailRow icon={<Briefcase size={18} />} label="Position" value={employee.position?.name} />
                <DetailRow icon={<CalendarDays size={18} />} label="Employment Date" value={employee.employmentDate ? new Date(employee.employmentDate).toLocaleDateString() : null} />
                <DetailRow icon={<Clock3 size={18} />} label="Employment Type" value={employee.employmenttype?.type} />
                <DetailRow icon={<ShieldEllipsis size={18} />} label="Job Status" value={employee.jobstatus?.status} />
                <DetailRow icon={<ShieldEllipsis size={18} />} label="Agreement Status" value={employee.agreementstatus?.status} />
                <DetailRow icon={<Banknote size={18} />} label="Account Number" value={employee.accountNumber} />
                <DetailRow icon={<DollarSign size={18} />} label="Base Salary" value={employee.salary !== null ? `$${parseFloat(employee.salary).toFixed(2)}` : null} />
                <DetailRow icon={<DollarSign size={18} />} label="Bonus Salary" value={employee.bonusSalary !== null ? `$${parseFloat(employee.bonusSalary).toFixed(2)}` : null} />
              </CardContent>
            </Card>

            {/* Repentance Father Details Card */}
            <Card className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-0 overflow-hidden">
              <CardHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <CardTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                  <UserCircle size={24} className="text-green-500" /> Repentance Father Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow icon={<UserCircle size={18} />} label="Name" value={employee.repentanceFatherName} />
                <DetailRow icon={<Building2 size={18} />} label="Church" value={employee.repentanceFatherChurch} />
                <DetailRow icon={<Phone size={18} />} label="Phone" value={employee.repentanceFatherPhone} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}