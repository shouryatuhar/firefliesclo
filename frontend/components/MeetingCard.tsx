import React from 'react';
import Link from 'next/link';
import { MeetingListItem } from '@/lib/api';
import { formatDate, formatDuration, highlightMatch } from '@/lib/utils';
export default function MeetingCard({
  meeting,
  searchQuery = '',
  onEdit,
  onDelete,
}: {
  meeting: MeetingListItem;
  searchQuery?: string;
  onEdit?: (meeting: MeetingListItem) => void;
  onDelete?: (meeting: MeetingListItem) => void;
}) {
  const date = formatDate(meeting.date_recorded);
  const duration = formatDuration(meeting.duration_seconds);
  const titleParts = highlightMatch(meeting.title, searchQuery);

  return (
    <div className="group rounded-xl border border-slate-800 bg-[#0c1020] p-4 shadow-sm hover:-translate-y-0.5 hover:border-slate-700 hover:shadow-md">
      <Link href={`/meetings/${meeting.id}`} className="block">
        <div className="mb-4 flex items-start gap-4">
          <div className="flex aspect-video w-24 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#2a1f4a] to-[#1a2f3a] text-xs font-medium text-[#a89dff]">
            Audio
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <h3 className="line-clamp-2 text-sm font-semibold leading-5 text-white">
                {titleParts.map((p, i) => p.match ? <mark key={i} className="bg-yellow-900/50 text-yellow-200">{p.text}</mark> : <span key={i}>{p.text}</span>)}
              </h3>
              <div className="shrink-0 rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">{duration}</div>
            </div>

            <div className="mt-1 text-xs text-slate-300">{date} · {meeting.participants_count} participants</div>
            <p className="mt-3 line-clamp-2 min-h-10 text-sm leading-5 text-slate-400">{meeting.description || 'No description yet.'}</p>
          </div>
        </div>
      </Link>

      <div className="flex items-center justify-between border-t border-slate-800 pt-3">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(4, meeting.participants_count) }).map((_, i) => (
            <div key={i} className="avatar-initials h-8 w-8 border-2 border-[#0c1020] text-[11px] font-semibold">P{i + 1}</div>
          ))}

          {meeting.participants_count > 4 && (
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#0c1020] bg-slate-800 text-[11px] text-slate-300">+{meeting.participants_count - 4}</div>
          )}
        </div>
        <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <button onClick={() => onEdit?.(meeting)} className="rounded-md px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10">Edit</button>
          <button onClick={() => onDelete?.(meeting)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-900/20">Delete</button>
        </div>
      </div>
    </div>
  );
}
