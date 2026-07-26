'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from './Toast';

// Navbar with search input, New Meeting button, and avatar on the right.
export default function Navbar({ onSearch }: { onSearch?: (q: string) => void }) {
  const [q, setQ] = useState('');
  const router = useRouter();
  const { pushToast } = useToast();

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    onSearch && onSearch(q);
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <form onSubmit={handleSearch} className="flex items-center gap-3 w-full max-w-xl">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search meetings, participants, topics..."
          className="flex-1 px-4 py-2 rounded-md border border-gray-200 shadow-sm"
        />
        <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded-md">Search</button>
      </form>

      <div className="flex items-center gap-4 ml-6">
        <button
          onClick={() => pushToast('info', 'New meeting flow not implemented yet')}
          className="px-4 py-2 bg-[var(--accent)] text-white rounded-md"
        >
          New Meeting
        </button>

        <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">DU</div>
      </div>
    </div>
  );
}
