"use client";

import { AlertTriangle } from "lucide-react";

// Helper component for each input row to keep the code clean
const RuleInput = ({ label, description, value, onChange, name }) => (
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
    <div>
      <label htmlFor={name} className="font-medium text-gray-800 dark:text-gray-200">
        {label}
      </label>
      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-sm text-gray-500">x</span>
      <input
        id={name}
        name={name}
        type="number"
        step="0.01"
        value={value}
        onChange={onChange}
        className="w-24 p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 text-center"
        placeholder="e.g. 1.5"
      />
    </div>
  </div>
);

export function PayrollPolicyEditor({ policy, onPolicyChange, isDefault }) {
  // Handler to update the parent component's state
  const handleChange = (e) => {
    const { name, value } = e.target;
    onPolicyChange({ ...policy, [name]: parseFloat(value) || 0 });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="flex justify-between items-start">
        <div>
           <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Payroll Calculation Rules</h3>
           <p className="text-sm text-gray-500 dark:text-gray-400">Define overtime multipliers for this department.</p>
        </div>
        {isDefault && (
          <span className="text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-1 rounded-full">
            Default
          </span>
        )}
      </div>

      {/* Alert message for non-default policies */}
      {!isDefault && (
        <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-sm flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>These rules override the company's default payroll policy.</span>
        </div>
      )}
      
      <div className="space-y-4 p-4 border rounded-lg dark:border-gray-700">
        <RuleInput
          label="Weekday Overtime (11am - 4pm)"
          description="Multiplier for approved hours in the early afternoon."
          name="otMultiplierWeekday1"
          value={policy?.otMultiplierWeekday1 || 1.5}
          onChange={handleChange}
        />
        <RuleInput
          label="Weekday Overtime (4pm - 2am)"
          description="Multiplier for approved hours in the evening."
          name="otMultiplierWeekday2"
          value={policy?.otMultiplierWeekday2 || 1.75}
          onChange={handleChange}
        />
        <RuleInput
          label="Sleepover Overtime"
          description="Special multiplier for overnight shifts."
          name="otMultiplierSleepover"
          value={policy?.otMultiplierSleepover || 2.2}
          onChange={handleChange}
        />
        <RuleInput
          label="Sunday Overtime"
          description="Multiplier for approved hours on a Sunday."
          name="otMultiplierSunday"
          value={policy?.otMultiplierSunday || 2.0}
          onChange={handleChange}
        />
        <RuleInput
          label="Holiday Overtime"
          description="Multiplier for approved hours on a public holiday."
          name="otMultiplierHoliday"
          value={policy?.otMultiplierHoliday || 2.5}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}