// app/(HR)/terminations/page.jsx
'use client';

import { useState, useEffect, useCallback, memo, Fragment } from 'react';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Settings, ChevronUp, ChevronsUpDown, Pencil, Trash2, Plus, Briefcase, UserCheck, UserMinus, Hourglass, Loader, CheckCircle } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';
import { getTerminations, updateTermination, deleteTermination } from '../../../lib/api'; 
import { AddTerminationModal } from './components/AddTerminationModal'; 

// ==============================================================================
// Component 1: Theme Switcher Icon
// ==============================================================================
const ThemeSwitcher = () => {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  useEffect(() => { setMounted(true) }, []);
  
  if (!mounted) { 
    // Render a placeholder to prevent layout shift on initial load
    return <div className="w-10 h-10" />; 
  }
  
  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');
  
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 transition-colors" aria-label="Toggle theme">
      {theme === 'light' ? 
        (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-gray-800"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>) : 
        (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-yellow-400"><circle cx="12" cy="12" r="5"></circle><path d="M12 1v2"></path><path d="M12 21v2"></path><path d="M4.22 4.22l1.42 1.42"></path><path d="M18.36 18.36l1.42 1.42"></path><path d="M1 12h2"></path><path d="M21 12h2"></path><path d="M4.22 19.78l1.42-1.42"></path><path d="M18.36 5.64l1.42-1.42"></path></svg>)
      }
    </button>
  );
};

// ==============================================================================
// Component 2: Dropdown for TERMINATION TYPE
// ==============================================================================
const TerminationTypeDropdown = ({ currentType, onTypeChange }) => {
  const typeOptions = ['Voluntary', 'Involuntary', 'Retirement'];
  
  const getConfig = (type) => {
    switch (type) {
      case 'Voluntary': return { icon: <UserCheck size={16} className="mr-2 text-blue-500" />, button: 'bg-blue-100/60 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300', item: 'hover:bg-blue-50 dark:hover:bg-blue-900' };
      case 'Involuntary': return { icon: <UserMinus size={16} className="mr-2 text-red-500" />, button: 'bg-red-100/60 text-red-700 dark:bg-red-900/50 dark:text-red-300', item: 'hover:bg-red-50 dark:hover:bg-red-900' };
      case 'Retirement': return { icon: <Briefcase size={16} className="mr-2 text-gray-500" />, button: 'bg-gray-100 text-gray-700 dark:bg-gray-600 dark:text-gray-200', item: 'hover:bg-gray-100 dark:hover:bg-gray-600' };
      default: return { icon: null, button: 'bg-gray-100 text-gray-700', item: 'hover:bg-gray-50' };
    }
  };

  return (
    <Menu as="div" className="relative inline-block text-left w-36">
      <Menu.Button className={`inline-flex w-full justify-center items-center rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 transition-colors ${getConfig(currentType).button}`}>
        {currentType} <ChevronsUpDown size={14} className="ml-auto text-gray-400" />
      </Menu.Button>
      <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
        <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-1">
                {typeOptions.map(option => (
                    <Menu.Item key={option}>
                        {({ active }) => (
                            <button onClick={() => onTypeChange(option)} className={`group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${getConfig(option).item}`}>
                                {getConfig(option).icon}{option}
                            </button>
                        )}
                    </Menu.Item>
                ))}
            </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

// ==============================================================================
// Component 3: Dropdown for WORKFLOW STATUS (UI Only for now)
// ==============================================================================
const WorkflowStatusDropdown = ({ currentStatus, onStatusChange }) => {
    const statusOptions = ['Pending Approval', 'Processing', 'Finalized'];
    const getConfig = (status) => {
        switch (status) {
            case 'Pending Approval': return { icon: <Hourglass size={16} className="mr-2 text-yellow-500" />, button: 'bg-yellow-100/60 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300', item: 'hover:bg-yellow-50 dark:hover:bg-yellow-900' };
            case 'Processing': return { icon: <Loader size={16} className="mr-2 text-cyan-500 animate-spin" />, button: 'bg-cyan-100/60 text-cyan-700 dark:bg-cyan-900/50 dark:text-cyan-300', item: 'hover:bg-cyan-50 dark:hover:bg-cyan-900' };
            case 'Finalized': return { icon: <CheckCircle size={16} className="mr-2 text-green-500" />, button: 'bg-green-100/60 text-green-700 dark:bg-green-900/50 dark:text-green-300', item: 'hover:bg-green-50 dark:hover:bg-green-900' };
            default: return { icon: null, button: 'bg-gray-100 text-gray-700', item: 'hover:bg-gray-50' };
        }
    };
    return (
        <Menu as="div" className="relative inline-block text-left w-44">
            <Menu.Button className={`inline-flex w-full justify-center items-center rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-600 transition-colors ${getConfig(currentStatus).button}`}>
                {currentStatus} <ChevronsUpDown size={14} className="ml-auto text-gray-400" />
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95">
                <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-1">
                        {statusOptions.map(option => (
                            <Menu.Item key={option}>
                                {({ active }) => (
                                    <button onClick={() => onStatusChange(option)} className={`group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium ${active ? 'bg-gray-100 dark:bg-gray-700' : ''} ${getConfig(option).item}`}>
                                        {getConfig(option).icon}{option}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

// ==============================================================================
// Component 4: Memoized Table Row
// ==============================================================================
const TerminationRow = memo(function TerminationRow({ termination, onTypeChange, onStatusChange, onDelete }) {
  
  // Helper to map backend status (e.g., 'voluntary') to frontend display (e.g., 'Voluntary')
  const mapStatusToType = (status) => {
      switch(status) {
          case 'voluntary': return 'Voluntary';
          case 'involuntary': return 'Involuntary';
          case 'retired': return 'Retirement';
          default: return 'Voluntary'; // Sensible fallback
      }
  };

  // ✅ FIX #1: Combine firstName and lastName into a single fullName variable
  const fullName = `${termination.employee.firstName} ${termination.employee.lastName}`;

  return (
    <tr className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-slate-50 dark:hover:bg-gray-700/50">
      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        <div className="flex items-center gap-3">
          {/* ✅ FIX #2: Use `termination.employee.photo` which matches the backend API response */}
          <Image 
            src={termination.employee.photo || '/images/default-avatar.png'} // Use a fallback image
            alt={fullName} 
            width={32} 
            height={32} 
            className="rounded-full object-cover" 
          />
          <span>{fullName}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <TerminationTypeDropdown 
          currentType={mapStatusToType(termination.status)} 
          onTypeChange={(newType) => onTypeChange(termination.id, newType)}
        />
      </td>
      <td className="px-6 py-4">
        {/* This is still a UI-only field for now */}
        <WorkflowStatusDropdown 
          currentStatus={termination.workflowStatus || 'Finalized'} 
          onStatusChange={(newStatus) => onStatusChange(termination.id, newStatus)}
        />
      </td>
      {/* Dates from the database are often full ISO strings, so we format them */}
      <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{new Date(termination.terminationDate).toLocaleDateString()}</td>
      <td className="px-6 py-4 max-w-[200px] truncate text-gray-600 dark:text-gray-300" title={termination.reason}>{termination.reason || 'N/A'}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <button className="p-2 bg-emerald-100/60 text-emerald-600 rounded-md hover:bg-emerald-100 dark:bg-emerald-900/50 dark:text-emerald-300 dark:hover:bg-emerald-900"><Pencil size={16} /></button>
          <button onClick={() => onDelete(termination.id)} className="p-2 bg-rose-100/60 text-rose-600 rounded-md hover:bg-rose-100 dark:bg-rose-900/50 dark:text-rose-300 dark:hover:bg-rose-900"><Trash2 size={16} /></button>
        </div>
      </td>
    </tr>
  );
});

// ==============================================================================
// Main Page Component
// ==============================================================================
const TerminationsPage = () => {
  const [terminations, setTerminations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // --- Fetch data from API on page load ---
  const fetchTerminations = async () => {
      setIsLoading(true);
      try {
          const data = await getTerminations();
          setTerminations(data);
      } catch (error) {
          toast.error(error.message);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    fetchTerminations();
  }, []);

  // --- API Handlers ---
  const handleTypeChange = useCallback(async (terminationId, newType) => {
    const originalTerminations = [...terminations];
    const newStatus = newType.toLowerCase(); // 'Voluntary' -> 'voluntary'

    // Optimistic UI update
    setTerminations(current => current.map(t => t.id === terminationId ? { ...t, status: newStatus } : t));

    try {
        await updateTermination(terminationId, { status: newStatus });
        toast.success("Termination type updated.");
    } catch (error) {
        toast.error(error.message);
        setTerminations(originalTerminations); // Revert UI on failure
    }
  }, [terminations]);

  const handleStatusChange = useCallback((terminationId, newStatus) => {
    // This is a placeholder as 'workflowStatus' is not in the backend schema.
    toast.info("Workflow status updates are not yet saved to the database.");
  }, []);

  const handleDelete = async (terminationId) => {
      if (window.confirm("Are you sure you want to delete this termination record?")) {
          const originalTerminations = [...terminations];
          // Optimistic UI update
          setTerminations(current => current.filter(t => t.id !== terminationId));
          try {
              await deleteTermination(terminationId);
              toast.success("Termination record deleted.");
          } catch (error) {
              toast.error(error.message);
              setTerminations(originalTerminations); // Revert UI on failure
          }
      }
  };

    const handleCreateSuccess = (newTermination) => {
    // Add the new record to the top of the list for immediate feedback
    setTerminations(prev => [newTermination, ...prev]);
  };
  const filteredData = terminations.filter(item => 
    `${item.employee.firstName} ${item.employee.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-100 dark:bg-gray-900 min-h-screen font-sans">
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Termination Management</h1>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <ThemeSwitcher />
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg shadow-sm hover:bg-indigo-700">
                <Plus size={18} />
                Add Termination
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-5 gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Show</span>
                <select className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                    <option>10</option><option>25</option><option>50</option>
                </select>
                <span>entries</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Search:</span>
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 w-48 focus:outline-none focus:ring-1 focus:ring-indigo-500"/>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-slate-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-4">Employee</th>
                  <th scope="col" className="px-6 py-4">Termination Type</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Termination Date</th>
                  <th scope="col" className="px-6 py-4">Reason</th>
                  <th scope="col" className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-gray-300">
                {isLoading ? (
                    <tr><td colSpan="7" className="text-center py-16 text-gray-500">
                        <Loader size={24} className="mx-auto animate-spin" />
                        <p className="mt-2">Loading terminations...</p>
                    </td></tr>
                ) : (
                    filteredData.map((item) => (
                      <TerminationRow 
                        key={item.id} 
                        termination={item} 
                        onTypeChange={handleTypeChange}
                        onStatusChange={handleStatusChange}
                        onDelete={handleDelete}
                      />
                    ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">Showing 1 to {filteredData.length} of {terminations.length} entries</p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" disabled>Previous</button>
              <button className="px-3 py-1.5 text-sm text-white bg-indigo-600 border border-indigo-600 rounded-md">1</button>
              <button className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">Next</button>
            </div>
          </div>
        </div>
      </main>
      <AddTerminationModal 
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default TerminationsPage;