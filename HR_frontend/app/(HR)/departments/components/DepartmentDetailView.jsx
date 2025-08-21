// app/(HR)/departments/components/DepartmentDetailView.jsx
"use client";

import { Fragment } from "react";
import { ArrowLeft, Plus, Users, Edit, Trash2, Building, Briefcase, UserCircle, ChevronDown } from "lucide-react";
import { Button } from "../../../../components/ui/Button"; // Adjust path
import { Disclosure, Transition } from '@headlessui/react';
import Image from 'next/image';

// --- Reusable Accordion Component for Member Lists ---
const MemberAccordion = ({ title, staff, interns }) => (
    <Disclosure as="div" className="mt-4">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-sm font-medium text-left text-indigo-900 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 focus-visible:ring-opacity-75 dark:bg-indigo-900/50 dark:text-indigo-200 dark:hover:bg-indigo-900">
            <span>{title}</span>
            <div className="flex items-center gap-4">
                <span className="text-xs font-normal">Staff: {staff.length} | Interns: {interns.length}</span>
                <ChevronDown className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-indigo-500`} />
            </div>
          </Disclosure.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Disclosure.Panel as="div" className="px-4 pt-4 pb-2 text-sm text-gray-500 dark:text-gray-400">
                <MemberGrid title="Staff Members" members={staff} />
                <MemberGrid title="Interns" members={interns} />
            </Disclosure.Panel>
          </Transition>
        </>
      )}
    </Disclosure>
);

const MemberGrid = ({ title, members }) => (
    <div className="mb-4">
        <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h4>
        {members.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {members.map(member => (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-md bg-slate-50 dark:bg-slate-700/50">
                        <Image src={member.photo || '/images/default-avatar.png'} alt={member.name} width={24} height={24} className="rounded-full object-cover"/>
                        <span className="text-xs truncate">{member.name}</span>
                    </div>
                ))}
            </div>
        ) : (
            <p className="text-xs italic">No {title.toLowerCase()} in this group.</p>
        )}
    </div>
);


// --- Main Detail View Component ---
export function DepartmentDetailView({ department, onBack, setModalState, onDelete }) {
    const totalStaff = (department.staff?.length || 0) + (department.subDepartments || []).reduce((sum, sub) => sum + sub.staff.length, 0);
    const totalInterns = (department.interns?.length || 0) + (department.subDepartments || []).reduce((sum, sub) => sum + sub.interns.length, 0);

    return (
        <div className="animate-fadeIn space-y-8">
            <button onClick={onBack} className="...">Back</button>

            {/* Department Header Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                 <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="p-4 w-fit rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/70 dark:to-purple-900/70">
                        <Building className="h-10 w-10 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{department.name}</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">{department.description || "No description."}</p>
                            </div>
                            <Button onClick={() => setModalState({ open: true, dept: department, parentId: null, parentName: '' })} className="...">
                                <Edit size={16} className="mr-2"/> Edit
                            </Button>
                        </div>
                        <div className="mt-4 flex gap-6 text-sm">
                             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">{totalStaff}</span> Staff
                            </div>
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">{totalInterns}</span> Interns
                            </div>
                             <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <Briefcase size={16} className="text-slate-400"/>
                                <span className="font-semibold">{department.subDepartments?.length || 0}</span> Sub-departments
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Members assigned directly to the main department */}
            {(department.staff.length > 0 || department.interns.length > 0) && (
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
                     <MemberAccordion title="General Members (Assigned Directly to Department)" staff={department.staff} interns={department.interns} />
                </div>
            )}

            {/* Sub-Departments Management Card */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <header className="p-4 border-b dark:border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">Sub-Departments & Members</h2>
                    <Button onClick={() => setModalState({ open: true, dept: null, parentId: department.id, parentName: department.name })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sub-Department
                    </Button>
                </header>
                <div className="p-4 space-y-4">
                    {department.subDepartments && department.subDepartments.length > 0 ? (
                        department.subDepartments.map(sub => (
                            <div key={sub.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">{sub.name}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={() => setModalState({ open: true, dept: sub, parentId: department.id, parentName: department.name })} className="...">
                                            <Edit size={16}/>
                                        </button>
                                        <button onClick={() => onDelete(sub.id)} className="...">
                                            <Trash2 size={16}/>
                                        </button>
                                    </div>
                                </div>
                                <MemberAccordion title="View Members" staff={sub.staff} interns={sub.interns} />
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            <p>No sub-departments have been added yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}