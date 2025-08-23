// components/StatusDropdown.jsx
'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { CheckCircle, Clock, XCircle, ChevronDown } from 'lucide-react';

// --- NEW, IMPROVED HELPER FUNCTION ---
// This version includes dark mode styles and uses lucide-react icons.
const getStatusConfig = (status) => {
  switch (status) {
    case 'Approved':
      return {
        icon: <CheckCircle className="w-5 h-5 mr-2 text-green-500" />,
        badge: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 ring-1 ring-inset ring-green-600/20',
        item: 'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/50',
      };
    case 'Pending':
      return {
        icon: <Clock className="w-5 h-5 mr-2 text-yellow-500" />,
        badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 ring-1 ring-inset ring-yellow-600/20',
        item: 'text-yellow-700 dark:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/50',
      };
    case 'Rejected':
      return {
        icon: <XCircle className="w-5 h-5 mr-2 text-red-500" />,
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 ring-1 ring-inset ring-red-600/10',
        item: 'text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/50',
      };
    default:
      return {
        icon: null,
        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 ring-1 ring-inset ring-gray-500/10',
        item: 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600',
      };
  }
};

const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const statusOptions = ['Approved', 'Pending', 'Rejected'];
  const currentConfig = getStatusConfig(currentStatus);

  return (
    <div className="w-40">
      <Menu as="div" className="relative inline-block text-left w-full">
        <Menu.Button
          className={`group inline-flex w-full justify-between items-center rounded-md px-3 py-1.5 text-sm font-semibold shadow-sm transition-all duration-150 hover:scale-[1.03] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${currentConfig.badge}`}
        >
          <span>{currentStatus}</span>
          <ChevronDown
            className="ml-2 h-4 w-4 text-gray-500 transition-transform duration-200"
            aria-hidden="true"
          />
        </Menu.Button>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95 -translate-y-1"
          enterTo="transform opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none">
            <div className="p-1">
              {statusOptions.map((option) => {
                const config = getStatusConfig(option);
                return (
                  <Menu.Item key={option}>
                    {({ active }) => (
                      <button
                        onClick={() => onStatusChange(option)}
                        className={`
                          group flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold 
                          ${config.item}
                          ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                        `}
                      >
                        {config.icon}
                        <span>{option}</span>
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default StatusDropdown;