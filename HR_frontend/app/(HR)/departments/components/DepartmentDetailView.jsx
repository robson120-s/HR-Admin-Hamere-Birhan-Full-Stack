"use client";

import { Fragment } from "react";
import { ArrowLeft, Plus, Users, Edit, Trash2, Building, Briefcase, ChevronDown, Star } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Disclosure, Transition } from '@headlessui/react';
import Image from 'next/image';

// --- Reusable Accordion Component for displaying member lists ---
// ✅ FIX: Now accepts a `heads` prop.
const MemberAccordion = ({ title, heads, staff, interns }) => {
    const headsCount = heads?.length || 0;
    const staffCount = staff?.length || 0;
    const internsCount = interns?.length || 0;

    if (headsCount === 0 && staffCount === 0 && internsCount === 0) {
        return <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-4">No members assigned to this group.</p>;
    }

    return (
        <Disclosure as="div" className="mt-4">
          {({ open }) => (
            <>
              <Disclosure.Button className="flex justify-between w-full px-4 py-3 text-sm font-medium text-left text-indigo-900 bg-indigo-100 rounded-lg hover:bg-indigo-200 focus:outline-none focus-visible:ring focus-visible:ring-indigo-500 dark:bg-indigo-900/50 dark:text-indigo-200 dark:hover:bg-indigo-900">
                <span>{title}</span>
                <div className="flex items-center gap-4">
                    {/* ✅ FIX: Display count of heads */}
                    <span className="text-xs font-normal">
                        Heads: {headsCount} | Staff: {staffCount} | Interns: {internsCount}
                    </span>
                    <ChevronDown className={`${open ? 'transform rotate-180' : ''} w-5 h-5 text-indigo-500 transition-transform`} />
                </div>
              </Disclosure.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"
              >
                <Disclosure.Panel as="div" className="px-4 pt-4 pb-2 text-sm text-gray-500 dark:text-gray-400">
                    {/* ✅ FIX: Display the grid for heads */}
                    <MemberGrid title="Department Heads" members={heads || []} isHead={true} />
                    <MemberGrid title="Staff Members" members={staff || []} />
                    <MemberGrid title="Interns" members={interns || []} />
                </Disclosure.Panel>
              </Transition>
            </>
          )}
        </Disclosure>
    );
};

// --- Reusable Grid for displaying individual members ---
// ✅ FIX: Now accepts an `isHead` prop to render the star icon.
const MemberGrid = ({ title, members, isHead = false }) => {
    if (!members || members.length === 0) return null;

    return (
        <div className="mb-4">
            <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {members.map(member => (
                    <div key={member.id} className="flex items-center gap-2 p-2 rounded-md bg-slate-100 dark:bg-slate-700/50" title={member.name}>
                        <Image src={member.photo || '/images/default-avatar.png'} alt={member.name} width={24} height={24} className="rounded-full object-cover flex-shrink-0"/>
                        <span className="text-xs text-slate-800 dark:text-slate-200 truncate flex-1">{member.name}</span>
                        {/* ✅ FIX: Conditionally render the star icon for heads */}
                        {isHead && <Star className="text-yellow-500 flex-shrink-0" size={14} />}
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- Main Department Detail View Component ---
export function DepartmentDetailView({ department, onBack, setModalState, onDelete }) {
    if (!department) {
        return null;
    }
    
    // ✅ FIX: Calculate total members by summing heads, staff, and interns.
    const totalHeads = (department.heads?.length || 0) + (department.subDepartments || []).reduce((sum, sub) => sum + (sub.heads?.length || 0), 0);
    const totalStaff = (department.staff?.length || 0) + (department.subDepartments || []).reduce((sum, sub) => sum + (sub.staff?.length || 0), 0);
    const totalInterns = (department.interns?.length || 0) + (department.subDepartments || []).reduce((sum, sub) => sum + (sub.interns?.length || 0), 0);
    
    return (
        <div className="animate-fadeIn space-y-8">
            <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 font-semibold">
                <ArrowLeft size={16} />
                Back to All Departments
            </button>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                 <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="p-4 w-fit rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/70 dark:to-purple-900/70">
                        <Building className="h-10 w-10 text-indigo-600 dark:text-indigo-300" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{department.name}</h1>
                                <p className="text-slate-500 dark:text-slate-400 mt-1">{department.description || "No description provided."}</p>
                            </div>
                            <Button onClick={() => setModalState({ open: true, dept: department, parentId: null, parentName: '' })} className="bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600">
                                <Edit size={16} className="mr-2"/> Edit Dept
                            </Button>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                             {/* ✅ FIX: Display the count of heads */}
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                <span className="font-semibold">{totalHeads}</span> Heads
                            </div>
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
                {/* ✅ FIX: Pass the 'heads' data to the accordion */}
                <MemberAccordion title="View General Members" heads={department.heads} staff={department.staff} interns={department.interns} />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                <header className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800 dark:text-slate-100">Sub-Departments & Members</h2>
                    <Button onClick={() => setModalState({ open: true, dept: null, parentId: department.id, parentName: department.name })}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Sub-Department
                    </Button>
                </header>
                <div className="p-4 space-y-2">
                    {(department.subDepartments || []).length > 0 ? (
                        department.subDepartments.map(sub => (
                            sub && (
                                <div key={sub.id} className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
                                    <div className="flex justify-between items-center">
                                        <h3 className="font-semibold text-slate-800 dark:text-slate-100">{sub.name}</h3>
                                        <div className="flex gap-2">
                                            <button onClick={() => setModalState({ open: true, dept: sub, parentId: department.id, parentName: department.name })} className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-md"><Edit size={16}/></button>
                                            <button onClick={() => onDelete(sub.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-md"><Trash2 size={16}/></button>
                                        </div>
                                    </div>
                                    {/* ✅ FIX: Pass the 'heads' data for sub-departments too */}
                                    <MemberAccordion title="View Members" heads={sub.heads} staff={sub.staff} interns={sub.interns} />
                                </div>
                            )
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