// app/(HR)/emp_profile_list/components/SearchableDropdown.jsx
"use client";

import { useState } from 'react';
import { Combobox } from '@headlessui/react';
import { ChevronsUpDown, Check } from 'lucide-react';

export function SearchableDropdown({ label, options = [], selected, setSelected, required = false, placeholder = '', disabled = false }) {
    useEffect(() => {
    console.log(`Dropdown "${label}" received ${options.length} options.`);
  }, [label, options]);
  
  const [query, setQuery] = useState('');

  const filteredOptions =
    query === ''
      ? options
      : options.filter((option) => {
          if (!option || typeof option.name !== 'string') {
            return false;
          }
          // Safety Check 2: Convert both to lowercase for a case-insensitive search.
          return option.name.toLowerCase().includes(query.toLowerCase());
        });

  return (
    // ✅ This outer div handles the disabled styling
    <div className={disabled ? 'opacity-50 cursor-not-allowed' : ''}>
      <Combobox value={selected} onChange={setSelected} nullable disabled={disabled}>
        <div className="relative">
          <Combobox.Label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </Combobox.Label>
          <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white dark:bg-slate-800 text-left border border-slate-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-indigo-500">
            <Combobox.Input
              className="w-full border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 dark:text-gray-100 bg-transparent focus:ring-0 disabled:cursor-not-allowed"
              displayValue={(option) => option?.name || ''}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={placeholder}
              // The disabled prop on the Combobox handles the input's disabled state automatically
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronsUpDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
            {filteredOptions.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700 dark:text-gray-300">
                Nothing found.
              </div>
            ) : (
              filteredOptions.map((option) => (
                <Combobox.Option
                  key={option.id}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-10 pr-4 ${
                      active ? 'bg-indigo-600 text-white' : 'text-gray-900 dark:text-gray-100'
                    }`
                  }
                  value={option}
                >
                  {({ selected, active }) => (
                    <>
                      <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                        {option.name}
                      </span>
                      {selected ? (
                        <span className={`absolute inset-y-0 left-0 flex items-center pl-3 ${active ? 'text-white' : 'text-indigo-600'}`}>
                          <Check className="h-5 w-5" aria-hidden="true" />
                        </span>
                      ) : null}
                    </>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </div>
      </Combobox>
    </div>
  );
}