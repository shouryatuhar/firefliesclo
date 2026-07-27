'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import MeetingList from '../../../components/MeetingList';
import { GlobalSearchResult, MeetingFullPayload, MeetingListItem } from '../../../lib/api';
import api from '@/lib/api';
import { useToast } from '../../../components/Toast';
import { fromDatetimeLocalValue, splitLines, toDatetimeLocalValue } from '../../../lib/utils';
import { loadMeetingFeatures } from '../../../lib/localFeatures';

type MeetingFormState = {
  title: string;
  description: string;
  date_recorded: string;
  participants: string;
  transcript: string;
  action_items: string;
};

const emptyForm = (): MeetingFormState => ({
  title: '',
  description: '',
  date_recorded: toDatetimeLocalValue(new Date().toISOString()),
  participants: '',
  transcript: '',
  action_items: '',
});

export default function Page() {
  const [meetings, setMeetings] = useState<MeetingListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [participantFilter, setParticipantFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [globalQuery, setGlobalQuery] = useState('');
  const [globalResults, setGlobalResults] = useState<GlobalSearchResult | null>(null);
  const [autoJoinEnabled, setAutoJoinEnabled] = useState(true);
  const [recapAudience, setRecapAudience] = useState<'me' | 'participants'>('me');
  const [meetingLanguage, setMeetingLanguage] = useState('English (Global)');
  const [upcomingEnabled, setUpcomingEnabled] = useState<Record<string, boolean>>({
    'Marketing Daily Huddle': true,
    'Weekly Call: Fireflies.ai x V360': true,
  });
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<MeetingListItem | null>(null);
  const [form, setForm] = useState<MeetingFormState>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<MeetingListItem | null>(null);
  const { pushToast } = useToast();

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMeetings({
        search,
        participant: participantFilter,
        dateFrom,
        dateTo,
        sortBy,
      });
      setMeetings(data);
    } catch (e: any) {
      const message = `Failed to load meetings: ${e.message}`;
      setError(message);
      pushToast('error', message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, participantFilter, dateFrom, dateTo, sortBy]);

  async function runGlobalSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!globalQuery.trim()) {
      setGlobalResults(null);
      return;
    }

    try {
      setGlobalResults(await api.globalSearch(globalQuery.trim()));
    } catch (e: any) {
      pushToast('error', e.message || 'Global search failed.');
    }
  }

  function comingSoon(feature: string) {
    pushToast('info', `${feature} is intentionally out of scope for this assignment demo.`);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  }

  function openEdit(meeting: MeetingListItem) {
    setEditing(meeting);
    setForm({
      title: meeting.title,
      description: meeting.description ?? '',
      date_recorded: toDatetimeLocalValue(meeting.date_recorded),
      participants: '',
      transcript: '',
      action_items: '',
    });
    setFormOpen(true);
  }

  function buildFullMeetingPayload(): MeetingFullPayload {
    const participantNames = splitLines(form.participants)
      .flatMap((line) => line.split(','))
      .map((name) => name.trim())
      .filter(Boolean);

    const transcriptLines = splitLines(form.transcript);
    const parsedSegments = transcriptLines.map((line, index) => {
      const match = line.match(/^(?:(\d{1,2}):(\d{2})\s+)?([^:]+):\s*(.+)$/);
      const speakerName = match?.[3]?.trim() || participantNames[0] || 'Speaker';
      const text = match?.[4]?.trim() || line;
      const explicitTime = match?.[1] && match?.[2] ? Number(match[1]) * 60 + Number(match[2]) : index * 12;
      return {
        speaker_name: speakerName,
        text,
        start_time_seconds: explicitTime,
        end_time_seconds: explicitTime + Math.max(8, Math.min(24, Math.ceil(text.length / 8))),
        sequence_order: index + 1,
      };
    });

    const speakerNames = Array.from(new Set([
      ...participantNames,
      ...parsedSegments.map((segment) => segment.speaker_name),
    ])).filter(Boolean);

    const transcriptText = parsedSegments.map((segment) => segment.text).join(' ');
    const overview = transcriptText
      ? `This meeting covered ${transcriptText.slice(0, 220)}${transcriptText.length > 220 ? '...' : ''}`
      : form.description || 'Meeting created from the Fireflies-style uploader. Add transcript content later.';

    return {
      title: form.title.trim(),
      description: form.description.trim() || null,
      date_recorded: fromDatetimeLocalValue(form.date_recorded),
      thumbnail_url: null,
      speakers: (speakerNames.length ? speakerNames : ['Speaker']).map((name) => ({ name })),
      transcript_segments: parsedSegments,
      summary: { overview },
      action_items: splitLines(form.action_items).map((description) => ({
        description,
        assigned_to: null,
        completed: false,
      })),
      key_topics: parsedSegments.slice(0, 4).map((segment, index) => ({
        title: segment.text.split(/[.!?]/)[0].slice(0, 60) || `Topic ${index + 1}`,
        description: segment.text,
        timestamp_seconds: segment.start_time_seconds,
        sequence_order: index + 1,
      })),
    };
  }

  async function saveMeeting(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) {
      pushToast('error', 'Meeting title is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        date_recorded: fromDatetimeLocalValue(form.date_recorded),
      };

      if (editing) {
        await api.updateMeeting(editing.id, payload);
        pushToast('success', 'Meeting updated.');
      } else {
        if (form.transcript.trim() || form.participants.trim() || form.action_items.trim()) {
          await api.createMeetingFull(buildFullMeetingPayload());
        } else {
          await api.createMeeting(payload);
        }
        pushToast('success', 'Meeting created.');
      }

      setFormOpen(false);
      await load();
    } catch (e: any) {
      pushToast('error', e.message || 'Unable to save meeting.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleting) {
      return;
    }

    try {
      await api.deleteMeeting(deleting.id);
      pushToast('success', 'Meeting deleted.');
      setDeleting(null);
      await load();
    } catch (e: any) {
      pushToast('error', e.message || 'Unable to delete meeting.');
    }
  }

  const visibleMeetings = tagFilter.trim()
    ? meetings.filter((meeting) => loadMeetingFeatures(meeting.id).tags.some((tag) => tag.toLowerCase().includes(tagFilter.trim().toLowerCase())))
    : meetings;

  return (
    <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8 bg-[#050712] text-slate-100">
      <div className="mb-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7b61ff]">@AskFred beta</p>
              <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">Meetings</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300">Search, filter, and revisit every conversation in your notebook.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm text-slate-300" htmlFor="sortBy">Sort</label>
              <select id="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="h-10 rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm shadow-sm text-slate-200">
                <option value="recent">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </div>

          <Navbar onSearch={(q) => setSearch(q)} onCreate={openCreate} />

          <form onSubmit={runGlobalSearch} className="mb-5 rounded-xl border border-[#3b326f] bg-[#17132a] p-3">
            <div className="flex gap-2">
              <input value={globalQuery} onChange={(e) => setGlobalQuery(e.target.value)} placeholder="Global search meetings and transcripts..." className="h-11 min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
              <button className="h-11 rounded-lg bg-[#6f5cff] px-4 text-sm font-semibold text-white">Search</button>
            </div>
            {globalResults ? (
              <div className="mt-3 grid gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-100">Meetings</p>
                  {globalResults.meetings.length === 0 ? <p className="text-slate-500">No meeting matches.</p> : globalResults.meetings.slice(0, 4).map((result) => (
                    <Link key={result.id} href={`/meetings/${result.id}`} className="block rounded-lg bg-[#0c1020] p-3 hover:bg-[#11182d] text-slate-200">{result.title}</Link>
                  ))}
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-100">Transcript matches</p>
                  {globalResults.transcript_matches.length === 0 ? <p className="text-slate-500">No transcript matches.</p> : globalResults.transcript_matches.slice(0, 4).map((result) => (
                    <Link key={`${result.meeting_id}-${result.segment_id}`} href={`/meetings/${result.meeting_id}`} className="block rounded-lg bg-[#0c1020] p-3 hover:bg-[#11182d]">
                      <span className="font-medium text-slate-200">{result.meeting_title}</span>
                      <span className="mt-1 block line-clamp-2 text-xs text-slate-300">{result.speaker}: {result.text}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </form>

          <div className="mb-5 grid gap-3 rounded-xl border border-slate-800 bg-[#0c1020] p-3 md:grid-cols-3">
            <label className="text-xs font-medium text-slate-300">
              Participant
              <input value={participantFilter} onChange={(e) => setParticipantFilter(e.target.value)} placeholder="Sarah, Mike..." className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
            </label>
            <label className="text-xs font-medium text-slate-300">
              From
              <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200" />
            </label>
            <label className="text-xs font-medium text-slate-300">
              To
              <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200" />
            </label>
            <label className="text-xs font-medium text-slate-300 md:col-span-3">
              Tags
              <input value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} placeholder="customer, product, sprint..." className="mt-1 h-10 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
            </label>
          </div>

          {error ? (
            <div className="mb-4 rounded-xl border border-rose-900 bg-rose-900/20 px-4 py-3 text-sm text-rose-300">{error}</div>
          ) : null}

          {loading ? (
            <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-xl border border-slate-800 bg-[#0c1020] p-4">
                  <div className="mb-5 flex gap-4">
                    <div className="h-14 w-24 rounded-lg bg-slate-800" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 w-3/4 rounded bg-slate-800" />
                      <div className="h-3 w-1/2 rounded bg-slate-800" />
                      <div className="h-3 w-full rounded bg-slate-800" />
                    </div>
                  </div>
                  <div className="h-3 w-2/3 rounded bg-slate-800" />
                </div>
              ))}
            </div>
          ) : (
            <MeetingList meetings={visibleMeetings} searchQuery={search} onEdit={openEdit} onDelete={setDeleting} />
          )}
        </div>

        <aside className="space-y-5">
          <section className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <button onClick={() => comingSoon('Live bot joiner')} className="mb-5 h-12 w-full rounded-lg bg-[#6f5cff] text-sm font-semibold text-white shadow-sm hover:bg-[#5f4bed]">Add to live meeting</button>
            <div className="rounded-xl border border-slate-800 p-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Fireflies Notetaker</h2>
                <span className={`rounded-full px-2 py-1 text-xs font-medium ${autoJoinEnabled ? 'bg-emerald-900/30 text-emerald-300' : 'bg-slate-800 text-slate-300'}`}>{autoJoinEnabled ? 'On' : 'Off'}</span>
              </div>
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-300">Auto join calendar meetings</span>
                  <button
                    aria-pressed={autoJoinEnabled}
                    onClick={() => setAutoJoinEnabled((value) => !value)}
                    className={`h-6 w-11 rounded-full p-1 ${autoJoinEnabled ? 'bg-[#6f5cff]' : 'bg-slate-700'}`}
                  >
                    <span className={`block h-4 w-4 rounded-full bg-white ${autoJoinEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
                <div>
                  <p className="text-slate-300">Send email recap to</p>
                  <select value={recapAudience} onChange={(e) => setRecapAudience(e.target.value as 'me' | 'participants')} className="mt-1 h-9 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-2 text-sm font-medium text-slate-200">
                    <option value="me">Only me</option>
                    <option value="participants">All participants</option>
                  </select>
                </div>
                <div>
                  <p className="text-slate-300">Meeting language</p>
                  <select value={meetingLanguage} onChange={(e) => setMeetingLanguage(e.target.value)} className="mt-1 h-9 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-2 text-sm font-medium text-[#6f5cff]">
                    <option>English (Global)</option>
                    <option>English (US)</option>
                    <option>Hindi</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Upcoming Meetings · 2</h2>
              <button onClick={() => comingSoon('Calendar scheduling')} className="rounded-md px-2 text-lg text-slate-300 hover:bg-white/10">+</button>
            </div>
            <div className="space-y-3">
              {['Marketing Daily Huddle', 'Weekly Call: Fireflies.ai x V360'].map((title, index) => (
                <div key={title} className="rounded-xl bg-[#0c1020] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-slate-300">{index === 0 ? '09:30 AM' : '12:00 PM'}</p>
                      <p className="mt-1 text-sm font-medium text-white">{title}</p>
                      <p className="mt-2 text-xs text-slate-300">EN-US</p>
                    </div>
                    <button
                      aria-pressed={upcomingEnabled[title]}
                      onClick={() => setUpcomingEnabled((current) => ({ ...current, [title]: !current[title] }))}
                      className={`mt-1 h-5 w-9 rounded-full p-0.5 ${upcomingEnabled[title] ? 'bg-emerald-500' : 'bg-slate-700'}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white ${upcomingEnabled[title] ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-white">Placeholders</h2>
            <div className="mt-3 grid gap-2 text-sm text-slate-300">
              <span>Live bot joiner: Coming Soon</span>
              <span>Zoom / Meet / Calendar integrations: Coming Soon</span>
              <span>Team sharing and CRM sync: Coming Soon</span>
            </div>
          </section>
        </aside>
      </div>

      {formOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <form onSubmit={saveMeeting} className="thin-scrollbar max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#0c1020] p-5 shadow-2xl border border-slate-800">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-white">{editing ? 'Edit meeting' : 'New meeting'}</h2>
              <p className="mt-1 text-sm text-slate-300">Paste a transcript to create a complete Fireflies-style meeting with speakers, summary, topics, and tasks.</p>
            </div>
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-300">
                Title
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200" />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Description
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 py-2 text-sm text-slate-200" />
              </label>
              <label className="block text-sm font-medium text-slate-300">
                Recorded at
                <input type="datetime-local" value={form.date_recorded} onChange={(e) => setForm({ ...form, date_recorded: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200" />
              </label>
              {!editing ? (
                <>
                  <label className="block text-sm font-medium text-slate-300">
                    Participants
                    <input value={form.participants} onChange={(e) => setForm({ ...form, participants: e.target.value })} placeholder="Sarah Chen, Mike Rodriguez" className="mt-1 h-11 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
                  </label>
                  <label className="block text-sm font-medium text-slate-300">
                    Transcript
                    <textarea value={form.transcript} onChange={(e) => setForm({ ...form, transcript: e.target.value })} placeholder={'00:00 Sarah Chen: Welcome everyone...\n00:12 Mike Rodriguez: I have an update...'} className="mt-1 min-h-40 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" />
                  </label>
                  <label className="block text-sm font-medium text-slate-300">
                    Action items
                    <textarea value={form.action_items} onChange={(e) => setForm({ ...form, action_items: e.target.value })} placeholder={'Send recap to team\nPrepare launch checklist'} className="mt-1 min-h-24 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 py-2 text-sm text-slate-200 placeholder:text-slate-500" />
                  </label>
                </>
              ) : null}
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setFormOpen(false)} className="h-10 rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200 hover:bg-slate-800">Cancel</button>
              <button disabled={saving} className="h-10 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[#684cf0] disabled:opacity-60">{saving ? 'Saving...' : 'Save'}</button>
            </div>
          </form>
        </div>
      ) : null}

      {deleting ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1020] p-5 shadow-2xl border border-slate-800">
            <h2 className="text-lg font-semibold text-white">Delete meeting?</h2>
            <p className="mt-2 text-sm text-slate-300">This removes "{deleting.title}" and all related transcript, summary, and action item data.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleting(null)} className="h-10 rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200 hover:bg-slate-800">Cancel</button>
              <button onClick={confirmDelete} className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
