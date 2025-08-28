"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Plus, Pencil, Save, X, AlertTriangle } from "lucide-react";
import { PayrollPolicyEditor } from "../../departments/components/PayrollPolicyEditor"; // We will reuse the editor
import toast from 'react-hot-toast';

const PolicyModal = ({ policy, onClose, onSave }) => {
    const [policyData, setPolicyData] = useState(
        policy || {
            name: "",
            otMultiplierWeekday1: 1.5,
            otMultiplierWeekday2: 1.75,
            otMultiplierSleepover: 2.2,
            otMultiplierSunday: 2.0,
            otMultiplierHoliday: 2.5,
        }
    );
    const [isSaving, setIsSaving] = useState(false);
    const isEditing = !!policy;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave(policyData);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl">
                <header className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-lg font-bold">{isEditing ? "Edit Payroll Policy" : "Create New Payroll Policy"}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={20} /></button>
                </header>
                <div className="p-6">
                    <div className="mb-4">
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Policy Name</label>
                        <input
                            id="name"
                            value={policyData.name}
                            onChange={(e) => setPolicyData({ ...policyData, name: e.target.value })}
                            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                            placeholder="e.g., Engineering Department Policy"
                            disabled={policy?.isDefault}
                        />
                         {policy?.isDefault && <p className="text-xs text-gray-500 mt-1">The name of the default policy cannot be changed.</p>}
                    </div>
                    <PayrollPolicyEditor
                        policy={policyData}
                        onPolicyChange={setPolicyData}
                        isDefault={policy?.isDefault || false}
                    />
                </div>
                <footer className="p-4 flex justify-end gap-3 bg-gray-50 dark:bg-gray-800/50 rounded-b-lg">
                    <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving || policy?.isDefault}>
                        {policy?.isDefault ? "Cannot Edit Default" : isSaving ? "Saving..." : "Save Policy"}
                    </Button>
                </footer>
            </div>
        </div>
    );
};

export function PayrollRulesCard({ policies, onCreate, onUpdate }) {
    const [modalState, setModalState] = useState({ open: false, policy: null });

    const handleSave = async (policyData) => {
        const actionPromise = policyData.id
            ? onUpdate(policyData.id, policyData)
            : onCreate(policyData);

        await toast.promise(actionPromise, {
            loading: 'Saving policy...',
            success: 'Policy saved successfully!',
            error: (err) => err.message || 'Failed to save policy.',
        });
    };

    return (
        <>
            <Card className="rounded-2xl shadow-md">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">Payroll Rules & Policies</CardTitle>
                    <Button size="sm" onClick={() => setModalState({ open: true, policy: null })}>
                        <Plus size={16} className="mr-2"/> Create Policy
                    </Button>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 mb-4">
                        Manage calculation policies. Assign a policy to a department in the table below. Departments without a custom policy will use the "Default" one.
                    </p>
                    <div className="space-y-2">
                        {(policies || []).map(p => (
                            <div key={p.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <div>
                                    <span className="font-medium">{p.name}</span>
                                    {p.isDefault && <span className="ml-2 text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Default</span>}
                                </div>
                                <Button size="sm" variant="outline" onClick={() => setModalState({ open: true, policy: p })}>
                                    <Pencil size={14} className="mr-2"/> View & Edit
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
            {modalState.open && <PolicyModal policy={modalState.policy} onClose={() => setModalState({ open: false, policy: null })} onSave={handleSave} />}
        </>
    );
}