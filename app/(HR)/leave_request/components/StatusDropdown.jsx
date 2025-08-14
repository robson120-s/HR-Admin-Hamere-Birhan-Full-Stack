// components/StatusDropdown.jsx

'use client';

import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';

// --- ATTRACTIVE THING #1: ICONS ---
// We'll create small, reusable icon components directly in this file.
const CheckCircleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.415L11 9.586V6z" clipRule="evenodd" />
  </svg>
);

const XCircleIcon = () => (
  <svg className="w-5 h-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

// Helper function to get Tailwind CSS classes and icons for each status
const getStatusConfig = (status) => {
  switch (status) {
    case 'Approved':
      return {
        styles: 'bg-green-50 text-green-700 hover:bg-green-100',
        icon: <CheckCircleIcon />,
        badge: 'bg-green-100 text-green-800 border-green-200',
      };
    case 'Pending':
      return {
        styles: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
        icon: <ClockIcon />,
        badge: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      };
    case 'Rejected':
      return {
        styles: 'bg-red-50 text-red-700 hover:bg-red-100',
        icon: <XCircleIcon />,
        badge: 'bg-red-100 text-red-800 border-red-200',
      };
    default:
      return {
        styles: 'bg-gray-50 text-gray-700 hover:bg-gray-100',
        icon: null,
        badge: 'bg-gray-100 text-gray-700 border-gray-200',
      };
  }
};

const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const statusOptions = ['Approved', 'Pending', 'Rejected'];
  const currentBadgeStyles = getStatusConfig(currentStatus).badge;

  return (
    <div className="w-36">
      <Menu as="div" className="relative inline-block text-left w-full">
        <Menu.Button
          className={`group inline-flex w-full justify-between items-center rounded-lg px-4 py-2 text-sm font-semibold shadow-sm border transition-all duration-150 hover:scale-105 hover:shadow-md ${currentBadgeStyles}`}
        >
          <span>{currentStatus}</span>
          <svg
            className="ml-2 h-5 w-5 text-gray-500 transition-transform duration-200 group-hover:text-gray-800"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Menu.Button>

        {/* --- ATTRACTIVE THING #2: SMOOTHER ANIMATION --- */}
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95 -translate-y-2"
          enterTo="transform opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          {/* --- VERTICAL FIX & ATTRACTIVE THING #3: BETTER STYLING --- */}
          <Menu.Items className="absolute left-0 z-10 mt-2 w-full origin-top-left rounded-md bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="p-1">
              {statusOptions.map((option) => {
                const config = getStatusConfig(option);
                return (
                  <Menu.Item as="div" key={option}>
                    <button
                      onClick={() => onStatusChange(option)}
                      className={`
                        group flex w-full items-center rounded-md px-3 py-2 text-sm font-semibold border border-transparent 
                        ${config.styles}
                        data-[active]:ring-2 data-[active]:ring-blue-500
                      `}
                    >
                      {config.icon}
                      <span>{option}</span>
                    </button>
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