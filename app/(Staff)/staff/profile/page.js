'use client';
import React from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';

export default function ProfilePage() {
  const user = {
    fullName: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1234567890',
    department: 'Engineering',
    role: 'Frontend Developer',
    joined: '2023-06-15',
    salary: '$60,000/year',
    location: 'New York Office',
    empId: 'EMP2025-003',
  };

  return (
    <div className="max-w-3xl mx-auto p-6 animate-fadeIn">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <UserCircleIcon className="h-7 w-7 text-blue-600" />
        Your Profile
      </h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        {Object.entries(user).map(([label, value]) => (
          <div key={label} className="flex justify-between border-b py-2">
            <span className="text-gray-600 capitalize">{label.replace(/([A-Z])/g, ' $1')}</span>
            <span className="font-medium text-gray-900">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
