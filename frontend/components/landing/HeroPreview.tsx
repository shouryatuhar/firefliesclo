'use client';

import React, { useEffect, useState } from 'react';

const previewSlides = [
  {
    title: 'Create Complete Meetings',
    description: 'Paste transcript, participants, and action items into a polished Fireflies-style creation flow.',
    image: '/landing/new-meeting-dark.png',
  },
  {
    title: 'AI Summary + Outline',
    description: 'Review AI notes, action items, topics, tags, and exports in a Fireflies-style notepad.',
    image: '/landing/summary-preview.png',
  },
  {
    title: 'Interactive Transcript',
    description: 'Search, highlight, comment, and create soundbites from timestamped transcript rows.',
    image: '/landing/transcript-dark.png',
  },
  {
    title: 'AskFred',
    description: 'Ask transcript-scoped questions and get timestamped answers from the current meeting.',
    image: '/landing/askfred-dark.png',
  },
];

export default function HeroPreview() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((slide) => (slide + 1) % previewSlides.length);
    }, 4000);

    return () => window.clearInterval(timer);
  }, []);

  const slide = previewSlides[activeSlide];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/40 backdrop-blur">
      <div className="rounded-xl border border-white/10 bg-[#0d1224] p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a89dff]">Live Demo Preview</p>
            <p className="mt-1 text-sm text-slate-300">{slide.title}</p>
          </div>
          <div className="flex gap-1.5">
            {previewSlides.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setActiveSlide(index)}
                aria-label={`Show ${item.title}`}
                className={`h-2 w-6 rounded-full transition-colors ${index === activeSlide ? 'bg-[#7b61ff]' : 'bg-white/20'}`}
              />
            ))}
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-white/10 bg-[#080b16]">
          <div className="flex h-8 w-full items-center gap-1.5 border-b border-white/10 bg-[#0f1424] px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
            <div className="mx-auto flex h-4 w-48 items-center justify-center rounded bg-black/20 text-[10px] text-slate-400">
              fireflies-clone.local/meetings
            </div>
          </div>
          <div className="relative h-[calc(100%-2rem)] w-full">
            {previewSlides.map((item, index) => (
              <img
                key={item.title}
                src={item.image}
                alt={item.title}
                className={`absolute inset-0 h-full w-full object-contain p-2 transition-opacity duration-700 ease-in-out ${index === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              />
            ))}
          </div>
        </div>
        <p className="mt-4 min-h-10 text-sm leading-5 text-slate-400">{slide.description}</p>
      </div>
    </div>
  );
}
