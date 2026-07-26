'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import HeroPreview from './HeroPreview';

const githubUrl = 'https://github.com/shouryatuhar/firefliesclo';

const features = [
  ['AI', 'AI Summaries', 'Structured overviews, key decisions, and follow-ups after every meeting.'],
  ['Tx', 'Interactive Transcript', 'Speaker labels, timestamps, search highlights, seeking, and active-row sync.'],
  ['Sp', 'Speaker Recognition', 'Meeting participants are persisted and displayed across cards and detail pages.'],
  ['✓', 'Action Items', 'Create, edit, assign, complete, and delete meeting tasks.'],
  ['⌕', 'Global Search', 'Search across meeting metadata, participants, and transcript content.'],
  ['F', 'AskFred', 'Transcript-grounded meeting chat with timestamped answers.'],
  ['Sb', 'Soundbites', 'Save memorable moments from transcript rows for fast replay.'],
  ['↗', 'Export', 'Download TXT, Markdown, or print-ready PDF summaries and transcripts.'],
];

const technologies = [
  'Next.js',
  'React',
  'TypeScript',
  'Tailwind CSS',
  'FastAPI',
  'SQLAlchemy',
  'SQLite',
  'REST APIs',
];

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="landing-shell min-h-screen overflow-hidden bg-[#080b16] text-white">
      <section className="landing-hero relative">
        <div className="landing-particles" aria-hidden="true">
          {Array.from({ length: 18 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        {/* Sticky Navbar */}
        <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080b16]/80 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#7b61ff] text-sm font-bold text-white shadow-lg shadow-[#7b61ff]/30">F</span>
              <span>
                <span className="block text-sm font-semibold tracking-tight text-white">Fireflies Clone</span>
                <span className="block text-xs text-slate-400">Scaler AI Labs demo</span>
              </span>
            </Link>

            <nav className="hidden items-center gap-3 md:flex">
              <a href={githubUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-white/10 transition">
                GitHub
              </a>
              <Link href="/meetings" className="rounded-lg bg-[#7b61ff] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#7b61ff]/25 hover:bg-[#6a52f2] transition">
                Launch Demo
              </Link>
            </nav>

            <button onClick={() => setMenuOpen((open) => !open)} className="rounded-lg border border-white/15 px-3 py-2 text-sm text-white md:hidden">
              Menu
            </button>
          </div>
        </header>

        {menuOpen ? (
          <div className="relative z-20 mx-5 mt-2 rounded-xl border border-white/10 bg-[#101426] p-3 shadow-2xl md:hidden">
            <a href={githubUrl} target="_blank" rel="noreferrer" className="block rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10">GitHub</a>
            <Link href="/meetings" className="mt-1 block rounded-lg bg-[#7b61ff] px-3 py-2 text-sm font-semibold text-white text-center">Launch Demo</Link>
          </div>
        ) : null}

        <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-8 lg:pb-32 lg:pt-24">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#7b61ff]/30 bg-[#7b61ff]/10 px-3 py-1.5 text-xs font-medium text-[#c9c2ff]">
              AI meeting workspace · Full-stack demo
            </div>
            <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-white sm:text-6xl lg:text-7xl">
              The AI Meeting Assistant For Every Conversation
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              Automatically transcribe, summarize, search, organize, and export meetings with a Fireflies-inspired AI workspace.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/meetings" className="landing-button rounded-lg bg-[#7b61ff] px-6 py-3 text-center text-sm font-semibold text-white shadow-xl shadow-[#7b61ff]/25 hover:bg-[#6a52f2] transition">
                Launch Demo
              </Link>
              <a href={githubUrl} target="_blank" rel="noreferrer" className="rounded-lg border border-white/15 px-6 py-3 text-center text-sm font-semibold text-white hover:bg-white/10 transition">
                View GitHub
              </a>
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      <section className="bg-[#090b16] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9d8fff]">Features</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Everything the demo workspace can do</h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(([icon, title, description]) => (
              <div key={title} className="landing-card rounded-xl border border-white/10 bg-white/[0.04] p-5 shadow-sm hover:-translate-y-1 hover:shadow-md shadow-black/10 hover:bg-white/[0.07] transition">
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-[#7b61ff]/15 text-sm font-bold text-[#c9c2ff]">{icon}</div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#070812] px-5 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#9d8fff]">Technology</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">Built with a production-ready full-stack foundation</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {technologies.map((technology) => (
                <div key={technology} className="rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-center text-sm font-medium text-slate-200 shadow-sm transition">
                  {technology}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#090b16] px-5 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl border border-[#7b61ff]/25 bg-[#7b61ff]/10 p-8 text-center shadow-lg shadow-[#7b61ff]/10 sm:p-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c9c2ff]">Interactive demo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-5xl">Ready to explore the demo?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-300">
            Jump into the Fireflies-style workspace with seeded meetings, transcripts, AI notes, action items, AskFred, search, exports, and dark mode.
          </p>
          <Link href="/meetings" className="mt-8 inline-flex rounded-lg bg-[#7b61ff] px-6 py-3 text-sm font-semibold text-white shadow-xl hover:bg-[#6a52f2] transition">
            Launch Demo
          </Link>
        </div>
      </section>
    </div>
  );
}
