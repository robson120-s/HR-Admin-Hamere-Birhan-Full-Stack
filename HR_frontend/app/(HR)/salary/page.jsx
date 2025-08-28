"use client";

import { useEffect, useMemo, useState, useCallback, Fragment } from "react";
import { toast } from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "../../../components/ui/table";
import { Users, CheckCircle2, XCircle, CalendarX2, DollarSign, RefreshCw, Pencil, X, Eye, ChevronsUpDown, ThumbsUp, ThumbsDown } from "lucide-react";
import { Menu, Transition } from '@headlessui/react';
import { 
    getSalaryDashboard, 
    getSalaryTable, 
    generateSalaries, 
    updateSalary,
    getPayrollPolicies,
    createPayrollPolicy,
    updatePayrollPolicy,
    assignPolicyToDepartment 
} from "../../../lib/api";
import { PayrollRulesCard } from "./components/PayrollRulesCard";

// ==============================================================================
// SUB-COMPONENTS
// ==============================================================================
const SalaryDetailModal = ({ salary, onClose }) => {
    if (!salary) return null;
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold">Salary Breakdown for {salary.employeeName}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </header>
                <div className="p-6 text-sm">
                    <div className="space-y-2">
                        <div className="flex justify-between"><span className="text-gray-500">Base Salary:</span><span className="font-medium">{formatCurrency(salary.details.baseSalary)}</span></div>
                        <div className="flex justify-between"><span className="text-green-500">Overtime Pay:</span><span className="font-medium text-green-500">+ {formatCurrency(salary.details.overtimePay)}</span></div>
                        <div className="flex justify-between border-b pb-2"><span className="text-red-500">Deductions (Absence):</span><span className="font-medium text-red-500">- {formatCurrency(salary.details.deductions)}</span></div>
                        <div className="flex justify-between text-base font-bold pt-2"><span >Final Gross Salary:</span><span>{formatCurrency(salary.totalSalary)}</span></div>
                    </div>
                </div>
                <footer className="p-4 flex justify-end bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                    <Button onClick={onClose}>Close</Button>
                </footer>
            </div>
        </div>
    );
};

const EditSalaryModal = ({ salary, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        absentDays: salary.absentDays || 0,
        overtimeHours: salary.overtime || 0,
    });
    const [isSaving, setIsSaving] = useState(false);
    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(salary.id, {
                absentDays: parseFloat(formData.absentDays),
                overtimeHours: parseFloat(formData.overtimeHours),
            });
            onClose();
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-lg">
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center"><h2 className="text-lg font-bold">Edit & Recalculate for {salary.employeeName}</h2><button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button></header>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div><label htmlFor="absentDays" className="block text-sm font-medium">Absent Days</label><input id="absentDays" name="absentDays" type="number" step="1" value={formData.absentDays} onChange={handleChange} className="w-full p-2 mt-1 border rounded-md" required /></div>
                        <div><label htmlFor="overtimeHours" className="block text-sm font-medium">Overtime Hours</label><input id="overtimeHours" name="overtimeHours" type="number" step="0.1" value={formData.overtimeHours} onChange={handleChange} className="w-full p-2 mt-1 border rounded-md" required /></div>
                    </div>
                    <footer className="p-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : "Save & Recalculate"}</Button></footer>
                </form>
            </div>
        </div>
    );
};

const PolicyAssignDropdown = ({ departmentId, currentPolicyId, policies, onAssign }) => {
    const currentPolicy = policies.find(p => p.id === currentPolicyId);
    const defaultPolicy = policies.find(p => p.isDefault);
    const effectivePolicyName = currentPolicy?.name || `${defaultPolicy?.name} (Default)`;
    
    return (
        <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 flex items-center gap-1">
                <span>Policy: {effectivePolicyName}</span>
                <ChevronsUpDown size={14} />
            </Menu.Button>
            <Transition as={Fragment} enter="transition ease-out duration-100" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white dark:bg-gray-900 rounded-md shadow-lg z-20 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="p-1">
                        {policies.map(policy => (
                            <Menu.Item key={policy.id}>
                                {({ active }) => (
                                <button onClick={() => onAssign(departmentId, policy.id)} className={`${active ? 'bg-gray-100 dark:bg-gray-700' : ''} group flex rounded-md items-center w-full px-2 py-2 text-sm text-left`}>
                                    {policy.name} {policy.isDefault && <span className="ml-auto text-xs text-blue-500">Default</span>}
                                </button>
                                )}
                            </Menu.Item>
                        ))}
                        {currentPolicyId && (
                            <>
                                <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                                <Menu.Item>
                                    <button onClick={() => onAssign(departmentId, null)} className="group flex rounded-md items-center w-full px-2 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50">
                                        Reset to Default
                                    </button>
                                </Menu.Item>
                            </>
                        )}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

// ==============================================================================
// MAIN SALARY PAGE COMPONENT
// ==============================================================================
export default function SalaryPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [summary, setSummary] = useState({ totalEmployee: 0, totalPaid: 0, totalUnpaid: 0, totalLeave: 0 });
  const [groupedRows, setGroupedRows] = useState([]);
  const [policies, setPolicies] = useState([]);
  const [editingSalary, setEditingSalary] = useState(null);
  const [viewingSalary, setViewingSalary] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const [refreshKey, setRefreshKey] = useState(0);
  const triggerRefresh = () => setRefreshKey(prevKey => prevKey + 1);

  useEffect(() => {
    const fetchAll = async () => {
      setIsRefreshing(true);
      try {
        const [dashData, tableData, policyData] = await Promise.all([ 
            getSalaryDashboard(), 
            getSalaryTable(),
            getPayrollPolicies()
        ]);
        setSummary({
          totalEmployee: dashData?.totalEmployee ?? 0,
          totalPaid: dashData?.totalPaid ?? 0,
          totalUnpaid: dashData?.totalUnpaid ?? 0,
          totalLeave: dashData?.totalLeave ?? 0,
        });
        setGroupedRows(Array.isArray(tableData) ? tableData : []);
        setPolicies(policyData);
      } catch (error) {
        toast.error(error.message || "Something went wrong");
        setGroupedRows([]);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    };
    if (isLoading) fetchAll();
  }, [isLoading]);

  useEffect(() => {
      if (!isRefreshing) return;
      const fetchAll = async () => {
        try {
            const [dashData, tableData, policyData] = await Promise.all([ 
                getSalaryDashboard(), 
                getSalaryTable(),
                getPayrollPolicies()
            ]);
            setSummary({ /* ... */ });
            setGroupedRows(Array.isArray(tableData) ? tableData : []);
            setPolicies(policyData);
        } catch (error) { toast.error(error.message); }
        finally { setIsRefreshing(false); }
      };
      fetchAll();
  }, [isRefreshing]);



  const handleGenerate = async () => {
    if (!window.confirm("This will calculate salaries for the current month. Existing data will be updated. Continue?")) {
      return;
    }

    // Use toast.promise to automatically handle loading, success, and error states
    const generatePromise = generateSalaries();

    await toast.promise(
      generatePromise,
      {
        loading: 'Generating salaries...',
        success: (result) => result.message || 'Salaries generated successfully!',
        error: (err) => err.message || 'Failed to generate salaries.',
      }
    );

    // ✅ THE FIX: After the toast has resolved (either success or error),
    // trigger a refresh to fetch the new data.
    triggerRefresh();
  };
  
  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
        await updateSalary(id, { status });
        toast.success(`Salary marked as ${status}.`);
        triggerRefresh();
    } catch (error) {
        toast.error(error.message || 'Update failed.');
    } finally {
        setUpdatingId(null);
    }
  };

  const handleSaveEdit = async (id, data) => {
    await toast.promise(updateSalary(id, data), {
        loading: 'Recalculating...',
        success: 'Salary updated successfully!',
        error: (err) => err.message || 'Update failed.',
    });
    triggerRefresh();
  };
  
  const handleCreatePolicy = async (policyData) => {
    await createPayrollPolicy(policyData);
    triggerRefresh();
  };
  const handleUpdatePolicy = async (policyId, policyData) => {
    await updatePayrollPolicy(policyId, policyData);
    triggerRefresh();
  };
  const handleAssignPolicy = async (departmentId, policyId) => {
    await toast.promise(assignPolicyToDepartment(departmentId, policyId), {
        loading: 'Assigning policy...',
        success: 'Policy assigned!',
        error: 'Failed to assign policy.',
    });
    triggerRefresh();
  };

  const summaryCards = useMemo(() => [
      { key: "totalEmployee", title: "Total Employees (non-intern)", value: summary.totalEmployee, icon: Users, color: "bg-white dark:bg-gray-800" },
      { key: "totalPaid", title: "Total Paid (This Month)", value: summary.totalPaid, icon: CheckCircle2, color: "bg-emerald-50 dark:bg-emerald-900/30" },
      { key: "totalUnpaid", title: "Total Unpaid (This Month)", value: summary.totalUnpaid, icon: XCircle, color: "bg-rose-50 dark:bg-rose-900/30" },
      { key: "totalLeave", title: "On Leave Today", value: summary.totalLeave, icon: CalendarX2, color: "bg-amber-50 dark:bg-amber-900/30" },
  ], [summary]);

  if (isLoading) return <div className="flex items-center justify-center h-screen"><RefreshCw className="animate-spin h-8 w-8 text-gray-500" /></div>;

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold"><DollarSign className="inline w-6 h-6 mr-2 text-green-600" /> Salary Management</h1>
        <div className="flex gap-2">
            <Button onClick={handleGenerate} disabled={isGenerating || isRefreshing} className="bg-blue-600 hover:bg-blue-700">{isGenerating ? "Generating..." : "Generate Salaries"}</Button>
            <Button onClick={triggerRefresh} disabled={isRefreshing || isGenerating} variant="outline"><RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />Refresh</Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
            <PayrollRulesCard 
                policies={policies}
                onCreate={handleCreatePolicy}
                onUpdate={handleUpdatePolicy}
            />
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 h-fit">
            {summaryCards.map(({ key, title, value, icon: Icon, color }) => (
                <Card key={key} className={`${color} rounded-xl shadow`}><CardHeader className="flex flex-row items-center justify-between p-4"><CardTitle className="text-sm font-medium">{title}</CardTitle><Icon className="w-5 h-5 text-gray-400" /></CardHeader><CardContent className="p-4 pt-0"><div className="text-2xl font-bold">{value}</div></CardContent></Card>
            ))}
        </div>
      </div>

      <div className="space-y-6">
        {!isLoading && groupedRows.length === 0 && (
            <Card className="text-center py-16 text-gray-500">No salary data found. Click "Generate Salaries" to begin.</Card>
        )}
        
        {groupedRows.map(group => (
            <Card key={group.id} className="rounded-2xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between p-4">
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <PolicyAssignDropdown 
                        departmentId={group.id}
                        currentPolicyId={group.payrollPolicyId}
                        policies={policies}
                        onAssign={handleAssignPolicy}
                    />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Employee</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Base Salary</TableHead>
                                <TableHead className="text-center">Absents</TableHead>
                                <TableHead className="text-center">Overtime (Hrs)</TableHead>
                                <TableHead className="text-right font-bold">Total Salary</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Action</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {group.salaries.map(row => {
                                    const isLoadingAction = updatingId === row.id;
                                    return (
                                    <TableRow key={row.id}>
                                        <TableCell>{row.employeeName}</TableCell>
                                        <TableCell className="text-sm text-gray-500">{row.role}</TableCell>
                                        <TableCell className="text-right text-sm text-gray-500">{formatCurrency(row.baseSalary)}</TableCell>
                                        <TableCell className="text-center">{row.absentDays ?? 0}</TableCell>
                                        <TableCell className="text-center">{row.overtime ?? 0}</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(row.totalSalary)}</TableCell>
                                        <TableCell className="text-center">
                                            {row.status === 'paid' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Paid</span>}
                                            {row.status === 'unpaid' && <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Unpaid</span>}
                                            {row.status === 'pending' && (
                                                <div className="flex justify-center gap-2">
                                                    <Button size="xs" onClick={() => handleStatusChange(row.id, 'paid')} disabled={isLoadingAction} className="bg-green-500 hover:bg-green-600"><ThumbsUp size={14}/></Button>
                                                    <Button size="xs" variant="destructive" onClick={() => handleStatusChange(row.id, 'unpaid')} disabled={isLoadingAction}><ThumbsDown size={14}/></Button>
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center space-x-2">
                                            <Button size="icon" variant="ghost" onClick={() => setViewingSalary(row)}><Eye size={16} /></Button>
                                            <Button size="icon" variant="ghost" onClick={() => setEditingSalary(row)}><Pencil size={16} /></Button>
                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      {viewingSalary && <SalaryDetailModal salary={viewingSalary} onClose={() => setViewingSalary(null)} />}
      {editingSalary && <EditSalaryModal salary={editingSalary} onClose={() => setEditingSalary(null)} onSave={handleSaveEdit} />}
    </div>
  );
}

function formatCurrency(value) {
  const amount = Number(value ?? 0);
  if (Number.isNaN(amount)) return "-";
  try { return new Intl.NumberFormat('en-US', { style: "currency", currency: "USD" }).format(amount); }
  catch { return amount.toFixed(2); }
}
// User
// okay so now in the edit part we are going to add  a part to edit part for the whole department that adds or correct the calculation of the overtime for this times (11-4, 4-2,sleepover(11-4 + 4 - 2), sunday, Holiday) for this ot time the numbers to be multiplied for the default(1.5, 1.75, 2.2, 2 , 2.5) and for the Absent calcualtion (absent number times daily sal) when this things edited in the department section the employee under that department and if there is special cause lets add this calculation edit in the persons to edit the single persons claculations and the overtime and absent edit so for the edit page lets do it using component