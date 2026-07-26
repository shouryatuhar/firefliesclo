'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useToast } from './Toast';

export default function Sidebar() {
  const pathname = usePathname();
  const { pushToast } = useToast();
  const comingSoon = (feature: string) => pushToast('info', `${feature} is coming soon.`);

  return (
    <div className="flex h-full flex-col px-4 py-5">
      <div className="mb-8 px-2">
        <Link href="/meetings" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#7b61ff] text-sm font-bold text-white shadow-sm">F</div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-white">Fireflies</div>
            <div className="text-xs text-slate-200">Workspace</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1">
        <ul className="space-y-1 text-sm">
          <li>
            <Link href="/" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${pathname === '/' ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${pathname === '/' ? 'bg-[#7b61ff]' : 'bg-slate-600'}`} />
              <span>Home</span>
            </Link>
          </li>
          <li>
            <Link href="/meetings" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${pathname.startsWith('/meetings') ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${pathname.startsWith('/meetings') ? 'bg-[#7b61ff]' : 'bg-slate-600'}`} />
              <span>Meetings</span>
            </Link>
          </li>
          <li>
            <Link href="/playlists" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${pathname.startsWith('/playlists') ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${pathname.startsWith('/playlists') ? 'bg-[#7b61ff]' : 'bg-slate-600'}`} />
              <span>Playlists</span>
            </Link>
          </li>
          <li>
            <button onClick={() => comingSoon('Integrations')} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-slate-300 transition hover:bg-white/5 hover:text-white">
              <span className="h-2.5 w-2.5 rounded-full bg-slate-600" />
              <span>Integrations</span>
            </button>
          </li>
          <li>
            <Link href="/settings" className={`flex items-center gap-3 rounded-lg px-3 py-2.5 transition ${pathname.startsWith('/settings') ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'}`}>
              <span className={`h-2.5 w-2.5 rounded-full ${pathname.startsWith('/settings') ? 'bg-[#7b61ff]' : 'bg-slate-600'}`} />
              <span>Settings</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="mt-auto rounded-xl border border-white/10 bg-white/[0.04] p-3">
        <div className="mb-3 rounded-lg bg-[#171a25] p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">AI credits</div>
          <div className="mt-2 h-1.5 rounded-full bg-slate-800">
            <div className="h-1.5 w-2/3 rounded-full bg-[#7b61ff]" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-xs font-semibold">AJ</div>
          <div className="min-w-0 text-sm">
            <div className="truncate font-medium">Alex Johnson</div>
            <div className="truncate text-xs text-slate-300">user@example.com</div>
          </div>
        </div>
      </div>
    </div>
  );
}
