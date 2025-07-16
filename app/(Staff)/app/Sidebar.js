'use client';
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div
      className="w-64 h-screen text-white p-6 flex flex-col justify-between"
      style={{ backgroundColor: 'var(--sidebar)' }}
    >
      <div>
        <h2 className="text-2xl font-bold mb-8">Staff Dashboard</h2>
        <ul className="space-y-4 text-lg">
          <li>
            <Link href="/" className="flex items-center gap-2 hover:text-gray-300">
              🏠 Dashboard
            </Link>
          </li>
          <li>
            <Link href="/attendance" className="flex items-center gap-2 hover:text-gray-300">
              📅 Attendance History
            </Link>
          </li>
          <li>
            <Link href="/setting" className="flex items-center gap-2 hover:text-gray-300">
              ⚙️ Settings
            </Link>
          </li>
          <li>
            <Link href="/profile" className="flex items-center gap-2 hover:text-gray-300">
              👤 My Profile
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <button className="flex items-center gap-2 text-red-400 hover:text-red-200">
          <img src="/logout-icon.png" alt="Logout Icon" className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
