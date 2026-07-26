'use client';
import React, { useState } from 'react';

export default function Navbar({
  onSearch,
  onCreate,
}: {
  onSearch?: (q: string) => void;
  onCreate?: () => void;
}) {
  const [q, setQ] = useState('');

  function handleSearch(e?: React.FormEvent) {
    e?.preventDefault();
    onSearch && onSearch(q);
  }

  return (
    <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <form onSubmit={handleSearch} className="flex w-full max-w-2xl items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search meetings, participants, topics..."
          className="h-11 flex-1 rounded-lg border border-slate-700 bg-[#0c1020] px-4 text-sm shadow-sm text-slate-200 placeholder:text-slate-500"
        />
        <button type="submit" className="h-11 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#684cf0]">Search</button>
      </form>

      <div className="flex items-center gap-3 md:ml-6">
        <button
          onClick={onCreate}
          className="h-11 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white shadow-sm hover:bg-[#684cf0]"
        >
          New Meeting
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-700 bg-[#0c1020] text-xs font-semibold text-slate-200">AJ</div>
      </div>
    </div>
  );
}
