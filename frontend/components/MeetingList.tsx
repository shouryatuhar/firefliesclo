import React from 'react';
import MeetingCard from './MeetingCard';
import { MeetingListItem } from '../lib/api';

export default function MeetingList({ meetings, searchQuery = '' }: { meetings: MeetingListItem[]; searchQuery?: string }) {
  if (!meetings || meetings.length === 0) {
    return (
      <div className="py-20 text-center text-gray-500">
        <h3 className="text-lg font-medium">No meetings yet</h3>
        <p className="mt-2">Create a meeting or import a transcript to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {meetings.map((m) => (
        <MeetingCard key={m.id} meeting={m} searchQuery={searchQuery} />
      ))}
    </div>
  );
}
