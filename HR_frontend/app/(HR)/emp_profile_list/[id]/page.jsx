"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import {
  getEmployeeById,
  updateEmployee,
  getEmployeeFormLookups,
} from "../../../../lib/api";
import { UploadButton } from "@uploadthing/react";
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  DollarSign,
  Heart,
  Shield,
  FileText,
  ArrowLeft,
  LoaderCircle,
  Edit,
  Save,
  X,
  GraduationCap,
  Banknote,
  Siren,
  Info,
} from "lucide-react";

// --- IMPORT THE OFFICIAL UI COMPONENTS FROM YOUR LIBRARY ---
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";

// ==============================================================================
// HELPER COMPONENTS (Using your official UI library for consistency)
// ==============================================================================

function InfoField({ icon, label, value }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <p className="font-semibold text-slate-800 dark:text-slate-100 break-words mt-1">
        {value || "N/A"}
      </p>
    </div>
  );
}

function EditField({ label, name, value, onChange, type = "text" }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-slate-600 dark:text-slate-300">
        {label}
      </Label>
      <Input
        type={type}
        id={name}
        name={name}
        value={value || ""}
        onChange={onChange}
      />
    </div>
  );
}

function EditSelect({
  label,
  name,
  value,
  onChange,
  children,
  placeholder,
  disabled = false,
}) {
  return (
    <div className="space-y-1">
      <Label htmlFor={name} className="text-slate-600 dark:text-slate-300">
        {label}
      </Label>
      <Select
        name={name}
        onValueChange={(val) => onChange({ target: { name, value: val } })}
        value={value || ""}
        disabled={disabled}
      >
        <SelectTrigger>
          <SelectValue placeholder={placeholder || `Select ${label}...`} />
        </SelectTrigger>
        <SelectContent>{children}</SelectContent>
      </Select>
    </div>
  );
}

// ==============================================================================
// MAIN COMPONENT: EmployeeDetailPage
// ==============================================================================
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [editData, setEditData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lookupData, setLookupData] = useState({
    departments: [],
    positions: [],
    maritalStatuses: [],
    employmentTypes: [],
    jobStatuses: [],
    agreementStatuses: [],
  });
  const [availableSubDepts, setAvailableSubDepts] = useState([]);

  const fetchPageData = useCallback(async () => {
    if (!id) return;
    try {
      const [data, lookups] = await Promise.all([
        getEmployeeById(id),
        getEmployeeFormLookups(),
      ]);

      data.dateOfBirth = data.dateOfBirth
        ? new Date(data.dateOfBirth).toISOString().split("T")[0]
        : "";
      data.employmentDate = data.employmentDate
        ? new Date(data.employmentDate).toISOString().split("T")[0]
        : "";

      setEmployee(data);
      setEditData(data);
      setLookupData(lookups);
    } catch (error) {
      toast.error(error.message);
      setEmployee(null);
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    fetchPageData().finally(() => setIsLoading(false));
  }, [fetchPageData]);

  useEffect(() => {
    if (
      isEditing &&
      editData?.departmentId &&
      lookupData.departments.length > 0
    ) {
      const subs = lookupData.departments.filter(
        (d) => d.parentId === editData.departmentId
      );
      setAvailableSubDepts(subs);
      if (
        editData.subDepartmentId &&
        !subs.some((s) => s.id === editData.subDepartmentId)
      ) {
        setEditData((prev) => ({ ...prev, subDepartmentId: null }));
      }
    } else {
      setAvailableSubDepts([]);
    }
  }, [
    isEditing,
    editData?.departmentId,
    lookupData.departments,
    editData?.subDepartmentId,
  ]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (name === "departmentId") {
      setEditData({
        ...editData,
        departmentId: parseInt(value),
        subDepartmentId: null,
      });
    } else {
      setEditData({ ...editData, [name]: value });
    }
  };

  const handleSave = async () => {
    if (isUploading)
      return toast.error("Please wait for photo upload to finish.");

    const payload = {
      ...editData,
      departmentId: editData.departmentId
        ? parseInt(editData.departmentId)
        : null,
      subDepartmentId: editData.subDepartmentId
        ? parseInt(editData.subDepartmentId)
        : null,
      positionId: editData.positionId ? parseInt(editData.positionId) : null,
      maritalStatusId: editData.maritalStatusId
        ? parseInt(editData.maritalStatusId)
        : null,
      employmentTypeId: editData.employmentTypeId
        ? parseInt(editData.employmentTypeId)
        : null,
      jobStatusId: editData.jobStatusId ? parseInt(editData.jobStatusId) : null,
      agreementStatusId: editData.agreementStatusId
        ? parseInt(editData.agreementStatusId)
        : null,
    };

    const savePromise = updateEmployee(id, payload);
    toast.promise(savePromise, {
      loading: "Saving profile...",
      success: () => {
        fetchPageData();
        setIsEditing(false);
        return "Profile updated successfully!";
      },
      error: (err) => err.response?.data?.error || "Failed to update profile.",
    });
  };

  const handleCancel = () => {
    setEditData(employee);
    setIsEditing(false);
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoaderCircle className="animate-spin h-12 w-12 text-indigo-500" />
      </div>
    );
  if (!employee)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
        <h2 className="text-2xl font-bold text-red-500">Employee Not Found</h2>
        <Link href="/emp_profile_list" className="mt-4">
          <Button>Back to List</Button>
        </Link>
      </div>
    );

  const fullName = isEditing
    ? `${editData.firstName} ${editData.lastName}`
    : `${employee.firstName} ${employee.lastName}`;
  const dataToShow = isEditing ? editData : employee;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <Link
          href="/emp_profile_list"
          className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Employee List
        </Link>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-32 h-32 rounded-full flex-shrink-0">
            <Image
              src={dataToShow.photo || "/images/default-avatar.png"}
              alt={fullName}
              fill
              sizes="128px"
              className="rounded-full object-cover border-4 border-indigo-200 dark:border-indigo-800"
            />
            {isUploading && (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <LoaderCircle className="w-8 h-8 text-white animate-spin" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {fullName}
            </h1>
            <p className="text-indigo-600 dark:text-indigo-400 font-semibold mt-1">
              {employee.position?.name || "No Position"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {employee.department?.name || "No Department"}
            </p>

            {isEditing && (
              <div className="mt-4">
                <UploadButton
                  endpoint="employeePhotoUploader"
                  onUploadBegin={() => setIsUploading(true)}
                  onClientUploadComplete={(res) => {
                    if (res && res[0]) {
                      setEditData((prev) => ({ ...prev, photo: res[0].url }));
                      toast.success("Photo updated!");
                    }
                    setIsUploading(false);
                  }}
                  onUploadError={(error) => {
                    toast.error(error.message);
                    setIsUploading(false);
                  }}
                  appearance={{
                    button: "text-xs h-8 bg-slate-600 hover:bg-slate-700",
                    container: "w-max",
                  }}
                />
              </div>
            )}
          </div>
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save size={16} className="mr-2" />
                  {isUploading ? "Uploading..." : "Save"}
                </Button>
                <Button onClick={handleCancel} variant="secondary">
                  <X size={16} className="mr-2" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={() => setIsEditing(true)}>
                <Edit size={16} className="mr-2" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <User />
                  Personal & Family
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {isEditing ? (
                  <>
                    <EditField
                      label="First Name"
                      name="firstName"
                      value={dataToShow.firstName}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Last Name"
                      name="lastName"
                      value={dataToShow.lastName}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Baptismal Name"
                      name="baptismalName"
                      value={dataToShow.baptismalName}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Date of Birth"
                      name="dateOfBirth"
                      value={dataToShow.dateOfBirth}
                      onChange={handleEditChange}
                      type="date"
                    />
                    <EditSelect
                      label="Sex"
                      name="sex"
                      value={dataToShow.sex}
                      onChange={handleEditChange}
                    >
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </EditSelect>
                    <EditField
                      label="Nationality"
                      name="nationality"
                      value={dataToShow.nationality}
                      onChange={handleEditChange}
                    />
                    <EditSelect
                      label="Marital Status"
                      name="maritalStatusId"
                      value={String(dataToShow.maritalStatusId || "")}
                      onChange={handleEditChange}
                    >
                      {lookupData.maritalStatuses.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                    <EditField
                      label="Repentance Father Name"
                      name="repentanceFatherName"
                      value={dataToShow.repentanceFatherName}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Repentance Father Church"
                      name="repentanceFatherChurch"
                      value={dataToShow.repentanceFatherChurch}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Repentance Father Phone"
                      name="repentanceFatherPhone"
                      value={dataToShow.repentanceFatherPhone}
                      onChange={handleEditChange}
                    />
                  </>
                ) : (
                  <>
                    <InfoField
                      icon={<User size={16} />}
                      label="Baptismal Name"
                      value={dataToShow.baptismalName}
                    />
                    <InfoField
                      icon={<Calendar size={16} />}
                      label="Date of Birth"
                      value={
                        dataToShow.dateOfBirth
                          ? new Date(
                              dataToShow.dateOfBirth
                            ).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <InfoField
                      icon={<Heart size={16} />}
                      label="Marital Status"
                      value={dataToShow.maritalStatus?.status}
                    />
                    <InfoField
                      icon={<Info size={16} />}
                      label="Sex"
                      value={dataToShow.sex}
                    />
                    <InfoField
                      icon={<Info size={16} />}
                      label="Nationality"
                      value={dataToShow.nationality}
                    />
                    <InfoField
                      icon={<User size={16} />}
                      label="Repentance Father Name"
                      value={dataToShow.repentanceFatherName}
                    />
                    <InfoField
                      icon={<Building size={16} />}
                      label="Repentance Father Church"
                      value={dataToShow.repentanceFatherChurch}
                    />
                    <InfoField
                      icon={<Phone size={16} />}
                      label="Repentance Father Phone"
                      value={dataToShow.repentanceFatherPhone}
                    />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Briefcase />
                  Employment & Education
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                {isEditing ? (
                  <>
                    <EditSelect
                      label="Department (Main)"
                      name="departmentId"
                      value={String(dataToShow.departmentId || "")}
                      onChange={handleEditChange}
                    >
                      {lookupData.departments
                        .filter((d) => !d.parentId)
                        .map((d) => (
                          <SelectItem key={d.id} value={String(d.id)}>
                            {d.name}
                          </SelectItem>
                        ))}
                    </EditSelect>
                    <EditSelect
                      label="Sub-Department"
                      name="subDepartmentId"
                      value={String(dataToShow.subDepartmentId || "")}
                      onChange={handleEditChange}
                      disabled={availableSubDepts.length === 0}
                    >
                      {availableSubDepts.map((d) => (
                        <SelectItem key={d.id} value={String(d.id)}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                    <EditSelect
                      label="Position"
                      name="positionId"
                      value={String(dataToShow.positionId || "")}
                      onChange={handleEditChange}
                    >
                      {lookupData.positions.map((p) => (
                        <SelectItem key={p.id} value={String(p.id)}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                    <EditField
                      label="Employment Date"
                      name="employmentDate"
                      value={dataToShow.employmentDate}
                      onChange={handleEditChange}
                      type="date"
                    />
                    <EditSelect
                      label="Employment Type"
                      name="employmentTypeId"
                      value={String(dataToShow.employmentTypeId || "")}
                      onChange={handleEditChange}
                    >
                      {lookupData.employmentTypes.map((t) => (
                        <SelectItem key={t.id} value={String(t.id)}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                    <EditSelect
                      label="Job Status"
                      name="jobStatusId"
                      value={String(dataToShow.jobStatusId || "")}
                      onChange={handleEditChange}
                    >
                      {lookupData.jobStatuses.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                    <EditSelect
                      label="Agreement Status"
                      name="agreementStatusId"
                      value={String(dataToShow.agreementStatusId || "")}
                      onChange={handleEditChange}
                    >
                      {lookupData.agreementStatuses.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </EditSelect>
                    <EditField
                      label="Academic Qualification"
                      name="academicQualification"
                      value={dataToShow.academicQualification}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Educational Institution"
                      name="educationalInstitution"
                      value={dataToShow.educationalInstitution}
                      onChange={handleEditChange}
                    />
                  </>
                ) : (
                  <>
                    <InfoField
                      icon={<Building size={16} />}
                      label="Department"
                      value={`${dataToShow.department?.name || ""}${
                        dataToShow.subDepartment
                          ? " / " + dataToShow.subDepartment.name
                          : ""
                      }`}
                    />
                    <InfoField
                      icon={<Briefcase size={16} />}
                      label="Position"
                      value={dataToShow.position?.name}
                    />
                    <InfoField
                      icon={<Calendar size={16} />}
                      label="Employment Date"
                      value={
                        dataToShow.employmentDate
                          ? new Date(
                              dataToShow.employmentDate
                            ).toLocaleDateString()
                          : "N/A"
                      }
                    />
                    <InfoField
                      icon={<FileText size={16} />}
                      label="Employment Type"
                      value={dataToShow.employmentType?.type}
                    />
                    <InfoField
                      icon={<Shield size={16} />}
                      label="Job Status"
                      value={dataToShow.jobStatus?.status}
                    />
                    <InfoField
                      icon={<FileText size={16} />}
                      label="Agreement Status"
                      value={dataToShow.agreementStatus?.status}
                    />
                    <InfoField
                      icon={<GraduationCap size={16} />}
                      label="Academic Qualification"
                      value={dataToShow.academicQualification}
                    />
                    <InfoField
                      icon={<Building size={16} />}
                      label="Educational Institution"
                      value={dataToShow.educationalInstitution}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Mail />
                  Contact & Financial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <EditField
                      label="Phone Number"
                      name="phone"
                      value={dataToShow.phone}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Address"
                      name="address"
                      value={dataToShow.address}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Sub-City"
                      name="subCity"
                      value={dataToShow.subCity}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Salary"
                      name="salary"
                      value={dataToShow.salary}
                      onChange={handleEditChange}
                      type="number"
                    />
                    <EditField
                      label="Bonus Salary"
                      name="bonusSalary"
                      value={dataToShow.bonusSalary}
                      onChange={handleEditChange}
                      type="number"
                    />
                    <EditField
                      label="Account Number"
                      name="accountNumber"
                      value={dataToShow.accountNumber}
                      onChange={handleEditChange}
                    />
                    <InfoField
                      icon={<Mail size={16} />}
                      label="Email (Cannot Edit)"
                      value={dataToShow.user?.email}
                    />
                  </>
                ) : (
                  <>
                    <InfoField
                      icon={<Phone size={16} />}
                      label="Phone Number"
                      value={dataToShow.phone}
                    />
                    <InfoField
                      icon={<Building size={16} />}
                      label="Address"
                      value={`${dataToShow.address || ""}, ${
                        dataToShow.subCity || ""
                      }`}
                    />
                    <InfoField
                      icon={<Mail size={16} />}
                      label="Email Address"
                      value={dataToShow.user?.email}
                    />
                    <InfoField
                      icon={<User size={16} />}
                      label="System Username"
                      value={dataToShow.user?.username}
                    />
                    <InfoField
                      icon={<DollarSign size={16} />}
                      label="Salary"
                      value={formatCurrency(dataToShow.salary)}
                    />
                    <InfoField
                      icon={<DollarSign size={16} />}
                      label="Bonus Salary"
                      value={formatCurrency(dataToShow.bonusSalary)}
                    />
                    <InfoField
                      icon={<Banknote size={16} />}
                      label="Account Number"
                      value={dataToShow.accountNumber}
                    />
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Siren />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <EditField
                      label="Contact Name"
                      name="emergencyContactName"
                      value={dataToShow.emergencyContactName}
                      onChange={handleEditChange}
                    />
                    <EditField
                      label="Contact Phone"
                      name="emergencyContactPhone"
                      value={dataToShow.emergencyContactPhone}
                      onChange={handleEditChange}
                    />
                  </>
                ) : (
                  <>
                    <InfoField
                      icon={<User size={16} />}
                      label="Contact Name"
                      value={dataToShow.emergencyContactName}
                    />
                    <InfoField
                      icon={<Phone size={16} />}
                      label="Contact Phone"
                      value={dataToShow.emergencyContactPhone}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// ✅ --- ADDED THE MISSING FUNCTION DEFINITION ---
function formatCurrency(value) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "-";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // You can change this to your local currency
    }).format(amount);
  } catch {
    return amount.toFixed(2);
  }
}
