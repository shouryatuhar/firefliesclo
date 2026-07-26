'use client';

import React from 'react';
import Navbar from '../../../components/Navbar';

export default function PlaylistsPage() {
  return (
    <div className="flex h-screen flex-col">
      <Navbar />
      <div className="flex-1 overflow-auto bg-[#050712] p-6">
        <div className="mx-auto max-w-5xl text-center mt-20">
          <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0f1424] shadow-sm shadow-black/20">
            <span className="text-2xl">🎵</span>
          </div>
          <h2 className="text-2xl font-semibold text-white">Playlists</h2>
          <p className="mt-2 text-slate-400">This feature is coming soon.</p>
        </div>
      </div>
    </div>
  );
}
