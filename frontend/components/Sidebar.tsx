import React from 'react';
import Link from 'next/link';

// Simple sidebar with logo, nav items, and avatar at bottom.
export default function Sidebar() {
  return (
    <div className="h-full flex flex-col px-6 py-8">
      {/* Logo area */}
      <div className="mb-8">
        <Link href="/">
          <a className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-[var(--accent)] flex items-center justify-center text-white font-semibold">FF</div>
            <div>
              <div className="text-sm font-semibold">Fireflies Clone</div>
              <div className="text-xs text-gray-300">Demo</div>
            </div>
          </a>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <Link href="/">
              <a className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-white/5">
                <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent)]" />
                <span>Meetings</span>
              </a>
            </Link>
          </li>

          <li>
            <a className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-300 hover:bg-white/5" href="#">
              <span className="w-2.5 h-2.5 rounded-full bg-gray-600" />
              <span>Settings (coming soon)</span>
            </a>
          </li>
        </ul>
      </nav>

      {/* Avatar at bottom */}
      <div className="mt-auto pt-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">SD</div>
          <div className="text-sm">
            <div className="font-medium">Demo User</div>
            <div className="text-xs text-gray-300">demo@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
