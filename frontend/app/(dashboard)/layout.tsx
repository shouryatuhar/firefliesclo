import React from 'react';
import Sidebar from '../../components/Sidebar';

export default function MeetingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050712] text-slate-100 lg:flex">
      <aside className="hidden w-64 shrink-0 bg-[var(--sidebar-bg)] text-white lg:flex lg:flex-col">
        <Sidebar />
      </aside>
      <main className="min-w-0 flex-1 bg-[#050712]">
        <div className="border-b border-slate-800 bg-[var(--sidebar-bg)] px-4 py-3 text-white lg:hidden">
          <Sidebar />
        </div>
        {children}
      </main>
    </div>
  );
}
