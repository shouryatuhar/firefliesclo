'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import MeetingList from '../components/MeetingList';
import { MeetingListItem } from '../lib/api';
import api from '../lib/api';
import { useToast } from '../components/Toast';

export default function Page() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const { pushToast } = useToast();

  async function load() {
    setLoading(true);
    try {
      const data = await api.getMeetings(search, sortBy);
      setMeetings(data);
    } catch (e: any) {
      pushToast('error', `Failed to load meetings: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortBy]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Meetings</h1>
        <div className="flex items-center gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-3 py-2 border rounded">
            <option value="recent">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </div>
      </div>

      {/* Search & actions area */}
      <Navbar onSearch={(q) => setSearch(q)} />

      {loading ? (
        <div className="py-20 text-center text-gray-500">Loading meetings...</div>
      ) : (
        <MeetingList meetings={meetings} searchQuery={search} />
      )}
    </div>
  );
}
