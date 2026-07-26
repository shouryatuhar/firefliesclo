import React from 'react';
import MeetingCard from './MeetingCard';
import { MeetingListItem } from '../lib/api';

export default function MeetingList({
  meetings,
  searchQuery = '',
  onEdit,
  onDelete,
}: {
  meetings: MeetingListItem[];
  searchQuery?: string;
  onEdit?: (meeting: MeetingListItem) => void;
  onDelete?: (meeting: MeetingListItem) => void;
}) {
  if (!meetings || meetings.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-[#0c1020] py-20 text-center text-slate-500">
        <h3 className="text-lg font-semibold text-slate-300">No meetings found</h3>
        <p className="mt-2 text-sm text-slate-400">Create a meeting or adjust your search to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {meetings.map((m) => (
        <MeetingCard key={m.id} meeting={m} searchQuery={searchQuery} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
