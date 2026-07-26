import React from 'react';
import Link from 'next/link';
import { MeetingListItem } from '../lib/api';
import { formatDate, formatDuration, highlightMatch } from '../lib/utils';

// Single meeting card component. Clean, rounded, with hover state.
export default function MeetingCard({ meeting, searchQuery = '' }: { meeting: MeetingListItem; searchQuery?: string }) {
  const date = formatDate(meeting.date_recorded);
  const duration = formatDuration(meeting.duration_seconds);

  // Render title with highlighted search matches
  const titleParts = highlightMatch(meeting.title, searchQuery);

  return (
    <Link href={`/meetings/${meeting.id}`}>
      <a className="block p-4 bg-white rounded-lg shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200">
        <div className="flex items-start gap-4">
          <div className="w-20 h-12 bg-gray-100 rounded-md flex items-center justify-center text-sm text-gray-600">Thumbnail</div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-semibold">
                {titleParts.map((p, i) => p.match ? <mark key={i} className="bg-yellow-100">{p.text}</mark> : <span key={i}>{p.text}</span>)}
              </h3>
              <div className="text-xs text-gray-500">{duration}</div>
            </div>

            <div className="text-xs text-gray-500 mt-1">{date} • {meeting.participants_count} participants</div>

            <div className="mt-3 flex items-center gap-2">
              {/* Simple participant avatar placeholders */}
              {Array.from({ length: Math.min(4, meeting.participants_count) }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded-full bg-gray-200 text-xs flex items-center justify-center avatar-initials">P{i + 1}</div>
              ))}

              {meeting.participants_count > 4 && (
                <div className="text-xs text-gray-400">+{meeting.participants_count - 4}</div>
              )}
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
}
