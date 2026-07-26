'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import api, { ActionItem, MeetingDetail, TranscriptSegment } from '../../../../lib/api';
import { formatClock, formatDateTime, formatDuration, fromDatetimeLocalValue, highlightMatch, initials, toDatetimeLocalValue } from '../../../../lib/utils';
import { useToast } from '../../../../components/Toast';
import { loadMeetingFeatures, makeLocalId, MeetingLocalFeatures, saveMeetingFeatures, TranscriptMarker } from '../../../../lib/localFeatures';

type ItemDraft = {
  description: string;
  assigned_to: string;
};

type MetadataDraft = {
  title: string;
  description: string;
  date_recorded: string;
  participants: string;
};

const speeds = [0.75, 1, 1.25, 1.5, 2];
type DetailTab = 'summary' | 'transcript' | 'soundbites';

export default function MeetingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const meetingId = Number(params.id);
  const { pushToast } = useToast();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const [itemDraft, setItemDraft] = useState<ItemDraft>({ description: '', assigned_to: '' });
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [metadataOpen, setMetadataOpen] = useState(false);
  const [metadataDraft, setMetadataDraft] = useState<MetadataDraft | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<DetailTab>('summary');
  const [features, setFeatures] = useState<MeetingLocalFeatures>({ tags: [], markers: [], soundbites: [] });
  const [tagDraft, setTagDraft] = useState('');
  const [askFredQuestion, setAskFredQuestion] = useState('');
  const [askFredAnswer, setAskFredAnswer] = useState('');
  const segmentRefs = useRef<Record<number, HTMLDivElement | null>>({});

  async function loadMeeting() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMeeting(meetingId);
      data.transcript_segments.sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0));
      data.key_topics.sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0));
      setMeeting(data);
      setCurrentTime(0);
    } catch (e: any) {
      setError(e.message || 'Unable to load this meeting.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (Number.isFinite(meetingId)) {
      loadMeeting();
      setFeatures(loadMeetingFeatures(meetingId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingId]);

  function persistFeatures(next: MeetingLocalFeatures) {
    setFeatures(next);
    saveMeetingFeatures(meetingId, next);
  }

  function comingSoon(feature: string) {
    pushToast('info', `${feature} is intentionally out of scope for this assignment demo.`);
  }

  useEffect(() => {
    if (!playing || !meeting) {
      return;
    }

    const timer = window.setInterval(() => {
      setCurrentTime((time) => {
        const next = time + 0.25 * speed;
        if (next >= (meeting.duration_seconds ?? 0)) {
          setPlaying(false);
          return meeting.duration_seconds ?? time;
        }
        return next;
      });
    }, 250);

    return () => window.clearInterval(timer);
  }, [playing, speed, meeting]);

  const activeSegment = useMemo(() => {
    if (!meeting) {
      return null;
    }

    return meeting.transcript_segments.find((segment) => currentTime >= segment.start_time_seconds && currentTime < segment.end_time_seconds) ?? meeting.transcript_segments[0] ?? null;
  }, [meeting, currentTime]);

  const searchMatches = useMemo(() => {
    if (!meeting || !transcriptSearch.trim()) {
      return [];
    }

    const query = transcriptSearch.trim().toLowerCase();
    return meeting.transcript_segments.filter((segment) => segment.text.toLowerCase().includes(query));
  }, [meeting, transcriptSearch]);

  useEffect(() => {
    if (activeSegment?.id) {
      segmentRefs.current[activeSegment.id]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }, [activeSegment?.id]);

  useEffect(() => {
    if (searchMatches.length === 0) {
      setActiveMatchIndex(0);
      return;
    }

    const clamped = Math.min(activeMatchIndex, searchMatches.length - 1);
    setActiveMatchIndex(clamped);
    segmentRefs.current[searchMatches[clamped].id]?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [searchMatches, activeMatchIndex]);

  function seekTo(seconds: number | null | undefined) {
    setCurrentTime(Math.max(0, seconds ?? 0));
  }

  function openMetadata() {
    if (!meeting) {
      return;
    }

    setMetadataDraft({
      title: meeting.title,
      description: meeting.description ?? '',
      date_recorded: toDatetimeLocalValue(meeting.date_recorded),
      participants: meeting.speakers.map((speaker) => speaker.name).join(', '),
    });
    setMetadataOpen(true);
  }

  async function saveMetadata(e: React.FormEvent) {
    e.preventDefault();
    if (!meeting || !metadataDraft) {
      return;
    }

    try {
      const updated = await api.updateMeeting(meeting.id, {
        title: metadataDraft.title.trim(),
        description: metadataDraft.description.trim() || null,
        date_recorded: fromDatetimeLocalValue(metadataDraft.date_recorded),
      });

      const participantNames = metadataDraft.participants
        .split(',')
        .map((name) => name.trim())
        .filter(Boolean);

      await Promise.all(participantNames.map((name, index) => {
        const existing = meeting.speakers[index];
        if (existing) {
          return api.updateSpeaker(meeting.id, existing.id, { name });
        }
        return api.createSpeaker(meeting.id, { name });
      }));

      setMeeting(updated);
      await loadMeeting();
      setMetadataOpen(false);
      pushToast('success', 'Meeting details updated.');
    } catch (e: any) {
      pushToast('error', e.message || 'Unable to update meeting.');
    }
  }

  async function saveActionItem(e: React.FormEvent) {
    e.preventDefault();
    if (!meeting || !itemDraft.description.trim()) {
      pushToast('error', 'Action item description is required.');
      return;
    }

    try {
      if (editingItemId) {
        await api.updateActionItem(editingItemId, {
          description: itemDraft.description.trim(),
          assigned_to: itemDraft.assigned_to.trim() || null,
        });
        pushToast('success', 'Action item updated.');
      } else {
        await api.createActionItem(meeting.id, {
          description: itemDraft.description.trim(),
          assigned_to: itemDraft.assigned_to.trim() || null,
          completed: false,
        });
        pushToast('success', 'Action item created.');
      }
      setItemDraft({ description: '', assigned_to: '' });
      setEditingItemId(null);
      await loadMeeting();
    } catch (e: any) {
      pushToast('error', e.message || 'Unable to save action item.');
    }
  }

  async function toggleActionItem(item: ActionItem) {
    try {
      await api.updateActionItem(item.id, { completed: !item.completed });
      setMeeting((current) => current ? {
        ...current,
        action_items: current.action_items.map((next) => next.id === item.id ? { ...next, completed: !next.completed } : next),
      } : current);
    } catch (e: any) {
      pushToast('error', e.message || 'Unable to update action item.');
    }
  }

  async function deleteActionItem(item: ActionItem) {
    try {
      await api.deleteActionItem(item.id);
      setMeeting((current) => current ? {
        ...current,
        action_items: current.action_items.filter((next) => next.id !== item.id),
      } : current);
      pushToast('success', 'Action item deleted.');
    } catch (e: any) {
      pushToast('error', e.message || 'Unable to delete action item.');
    }
  }

  async function deleteMeeting() {
    if (!meeting) {
      return;
    }

    try {
      await api.deleteMeeting(meeting.id);
      pushToast('success', 'Meeting deleted.');
      router.push('/meetings');
    } catch (e: any) {
      pushToast('error', e.message || 'Unable to delete meeting.');
    }
  }

  function addTag() {
    const tag = tagDraft.trim().toLowerCase();
    if (!tag) {
      return;
    }

    persistFeatures({ ...features, tags: Array.from(new Set([...features.tags, tag])) });
    setTagDraft('');
  }

  function addMarker(segment: TranscriptSegment, type: TranscriptMarker['type']) {
    const body = window.prompt(type === 'highlight' ? 'Highlight note' : 'Comment');
    if (!body?.trim()) {
      return;
    }

    persistFeatures({
      ...features,
      markers: [
        ...features.markers,
        {
          id: makeLocalId(type),
          segmentId: segment.id,
          body: body.trim(),
          type,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    pushToast('success', type === 'highlight' ? 'Highlight saved.' : 'Comment saved.');
  }

  function addSoundbiteFromSegment(segment: TranscriptSegment) {
    const title = window.prompt('Soundbite title', segment.text.slice(0, 64));
    if (!title?.trim()) {
      return;
    }

    persistFeatures({
      ...features,
      soundbites: [
        ...features.soundbites,
        {
          id: makeLocalId('soundbite'),
          title: title.trim(),
          description: segment.text,
          start: segment.start_time_seconds,
          end: segment.end_time_seconds,
          createdAt: new Date().toISOString(),
        },
      ],
    });
    setActiveTab('soundbites');
    pushToast('success', 'Soundbite created.');
  }

  function answerAskFred(question: string) {
    if (!meeting || !question.trim()) {
      setAskFredAnswer('AskFred needs a question about this meeting.');
      return;
    }

    const terms = question.toLowerCase().split(/\W+/).filter((term) => term.length > 3);
    const ranked = meeting.transcript_segments
      .map((segment) => ({
        segment,
        score: terms.reduce((total, term) => total + (segment.text.toLowerCase().includes(term) ? 1 : 0), 0),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    if (ranked.length === 0) {
      setAskFredAnswer('I could not find support for that in this meeting transcript.');
      return;
    }

    setAskFredAnswer(ranked.map(({ segment }) => `${formatClock(segment.start_time_seconds)} ${segment.speaker?.name ?? 'Speaker'}: ${segment.text}`).join('\n'));
  }

  function exportMeeting(format: 'txt' | 'md' | 'pdf') {
    if (!meeting) {
      return;
    }

    const transcript = meeting.transcript_segments.map((segment) => `[${formatClock(segment.start_time_seconds)}] ${segment.speaker?.name ?? 'Speaker'}: ${segment.text}`).join('\n');
    const markdown = `# ${meeting.title}\n\n${meeting.description ?? ''}\n\n## Summary\n${meeting.summary?.overview ?? 'No summary.'}\n\n## Action Items\n${meeting.action_items.map((item) => `- [${item.completed ? 'x' : ' '}] ${item.description}${item.assigned_to ? ` (${item.assigned_to})` : ''}`).join('\n')}\n\n## Transcript\n${transcript}\n`;
    const text = format === 'txt' ? markdown.replace(/[#*_`>-]/g, '') : markdown;

    if (format === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        pushToast('error', 'Popup blocked. Enable popups to export PDF.');
        return;
      }
      printWindow.document.write(`<html><head><title>${meeting.title}</title><style>body{font-family:Inter,Arial,sans-serif;line-height:1.55;padding:32px;color:#111827}h1{font-size:24px}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><pre>${markdown.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char] ?? char))}</pre></body></html>`);
      printWindow.document.close();
      printWindow.print();
      return;
    }

    const blob = new Blob([text], { type: format === 'md' ? 'text/markdown' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${meeting.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
    pushToast('success', `${format.toUpperCase()} export ready.`);
  }

  if (loading) {
    return <DetailSkeleton />;
  }

  if (error || !meeting) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Link href="/meetings" className="text-sm font-medium text-[#7b61ff]">Back to meetings</Link>
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-900">{error || 'Meeting not found.'}</div>
      </div>
    );
  }

  const duration = meeting.duration_seconds ?? 0;
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  const activeMatch = searchMatches[activeMatchIndex];

  return (
    <div className="min-h-screen bg-[#050712] text-slate-100">
      <header className="sticky top-0 z-30 border-b border-slate-800 bg-[#080b16]/95 px-4 py-4 backdrop-blur sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <Link href="/meetings" className="text-sm font-medium text-[#7b61ff]">Back to meetings</Link>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight">{meeting.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-300">
              <span>{formatDateTime(meeting.date_recorded)}</span>
              <span>{formatDuration(meeting.duration_seconds)}</span>
              <span>{meeting.participants_count} participants</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex -space-x-2">
              {meeting.speakers.slice(0, 5).map((speaker) => (
                <div key={speaker.id} className="avatar-initials h-9 w-9 border-2 border-white text-xs font-semibold" title={speaker.name}>{initials(speaker.name)}</div>
              ))}
            </div>
            <button onClick={openMetadata} className="h-10 rounded-lg border border-slate-700 bg-[#0c1020] px-4 text-sm font-medium text-slate-200 hover:bg-slate-800">Edit</button>
            <button onClick={() => setDeleteOpen(true)} className="h-10 rounded-lg border border-rose-900 bg-[#0c1020] px-4 text-sm font-medium text-rose-400 hover:bg-rose-900/20">Delete</button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-[1500px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px] lg:px-8">
        <section className="min-w-0 space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-[#111322] p-4 text-white shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#a89dff]">Meeting playback</p>
                <p className="mt-1 text-sm text-slate-300">Placeholder media · transcript synchronized</p>
              </div>
              <button onClick={() => comingSoon('Audio upload')} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-medium text-white hover:bg-white/15">Upload audio</button>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <button onClick={() => setPlaying((value) => !value)} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-sm font-semibold text-white shadow-sm hover:bg-[#684cf0]">
                {playing ? 'Pause' : 'Play'}
              </button>
              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-300">
                  <span>{formatClock(currentTime)}</span>
                  <span>{formatClock(duration)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(duration, 1)}
                  step={0.1}
                  value={currentTime}
                  onChange={(e) => seekTo(Number(e.target.value))}
                  className="w-full accent-[#7b61ff]"
                />
                <div className="mt-2 h-1 rounded-full bg-slate-800">
                  <div className="h-1 rounded-full bg-[#7b61ff]" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="h-10 rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white">
                {speeds.map((value) => <option key={value} value={value}>{value}x</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1020] shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-800 p-4">
              <div className="flex flex-wrap gap-2">
                {[
                  ['summary', 'AI Summary'],
                  ['transcript', 'Transcript'],
                  ['soundbites', 'Soundbites'],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => setActiveTab(value as DetailTab)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium ${activeTab === value ? 'bg-[#5d4bd7]/20 text-[#a89dff]' : 'text-slate-300 hover:bg-white/5 hover:text-slate-100'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {activeTab === 'transcript' ? (
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold">Transcript</h2>
                <p className="text-sm text-slate-300">{activeSegment?.speaker?.name ?? 'Ready'} {activeSegment ? `at ${formatClock(activeSegment.start_time_seconds)}` : ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <input value={transcriptSearch} onChange={(e) => setTranscriptSearch(e.target.value)} placeholder="Search transcript" className="h-10 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500 md:w-60" />
                {transcriptSearch ? (
                  <div className="flex items-center gap-1 text-xs text-slate-300">
                    <button onClick={() => setActiveMatchIndex((index) => Math.max(0, index - 1))} className="rounded-md border border-slate-700 px-2 py-1">Prev</button>
                    <span className="w-14 text-center">{searchMatches.length ? `${activeMatchIndex + 1}/${searchMatches.length}` : '0/0'}</span>
                    <button onClick={() => setActiveMatchIndex((index) => Math.min(searchMatches.length - 1, index + 1))} className="rounded-md border border-slate-700 px-2 py-1">Next</button>
                  </div>
                ) : null}
              </div>
                </div>
              ) : null}
            </div>

            <div className="p-3">
              {activeTab === 'summary' ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  <section className="rounded-xl border border-slate-800 p-4">
                    <h2 className="font-semibold text-white">AI Summary</h2>
                    <p className="mt-3 text-sm leading-6 text-slate-300">{meeting.summary?.overview ?? 'No summary has been generated yet.'}</p>
                  </section>
                  <section className="rounded-xl border border-slate-800 p-4">
                    <h2 className="font-semibold text-white">Outline</h2>
                    <div className="mt-3 space-y-2">
                      {meeting.key_topics.length === 0 ? <p className="text-sm text-slate-400">No key topics yet.</p> : meeting.key_topics.map((topic) => (
                        <button key={topic.id} onClick={() => seekTo(topic.timestamp_seconds)} className="w-full rounded-lg bg-[#0c1020] p-3 text-left hover:bg-white/5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-white">{topic.title}</span>
                            <span className="text-xs text-[#7b61ff]">{formatClock(topic.timestamp_seconds)}</span>
                          </div>
                          {topic.description ? <p className="mt-1 text-xs leading-5 text-slate-300">{topic.description}</p> : null}
                        </button>
                      ))}
                    </div>
                  </section>
                </div>
              ) : null}

              {activeTab === 'transcript' ? (
                <div className="thin-scrollbar max-h-[620px] overflow-y-auto">
                  {meeting.transcript_segments.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center text-sm text-slate-400">No transcript segments yet.</div>
                  ) : meeting.transcript_segments.map((segment) => (
                    <TranscriptRow
                      key={segment.id}
                      segment={segment}
                      query={transcriptSearch}
                      active={segment.id === activeSegment?.id}
                      searchActive={segment.id === activeMatch?.id}
                      onSeek={seekTo}
                  setRef={(node) => { segmentRefs.current[segment.id] = node; }}
                  markers={features.markers.filter((marker) => marker.segmentId === segment.id)}
                  onComment={(target) => addMarker(target, 'comment')}
                  onHighlight={(target) => addMarker(target, 'highlight')}
                  onSoundbite={addSoundbiteFromSegment}
                />
                  ))}
                </div>
              ) : null}

              {activeTab === 'soundbites' ? (
                <div className="space-y-3">
                  {features.soundbites.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center">
                      <h2 className="font-semibold text-white">Soundbites</h2>
                      <p className="mt-2 text-sm text-slate-300">Create a soundbite from any transcript row.</p>
                    </div>
                  ) : features.soundbites.map((soundbite) => (
                    <button key={soundbite.id} onClick={() => seekTo(soundbite.start)} className="w-full rounded-xl border border-slate-800 bg-[#0c1020] p-4 text-left hover:bg-white/5">
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-medium text-white">{soundbite.title}</span>
                        <span className="text-xs text-[#7b61ff]">{formatClock(soundbite.start)} - {formatClock(soundbite.end)}</span>
                      </div>
                      <p className="mt-2 text-sm text-slate-300">{soundbite.description}</p>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <h2 className="font-semibold text-white">@AskFred</h2>
            <div className="mt-4 rounded-xl border border-slate-800 bg-[#0c1020] p-3">
              <form onSubmit={(e) => { e.preventDefault(); answerAskFred(askFredQuestion); }}>
                <input value={askFredQuestion} onChange={(e) => setAskFredQuestion(e.target.value)} placeholder="Ask anything about this meeting..." className="h-10 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
              </form>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {['What are the next steps?', 'Summarize decisions', 'Draft follow-up email'].map((prompt) => (
                  <button key={prompt} onClick={() => { setAskFredQuestion(prompt); answerAskFred(prompt); }} className="rounded-full bg-slate-800 px-3 py-1.5 text-slate-300 shadow-sm hover:text-[#6f5cff]">{prompt}</button>
                ))}
              </div>
              {askFredAnswer ? <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-slate-800 p-3 text-xs leading-5 text-slate-300">{askFredAnswer}</pre> : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <h2 className="font-semibold text-white">Tags</h2>
            <div className="mt-3 flex gap-2">
              <input value={tagDraft} onChange={(e) => setTagDraft(e.target.value)} placeholder="Add tag" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
              <button onClick={addTag} className="h-10 rounded-lg bg-[#6f5cff] px-3 text-sm font-medium text-white">Add</button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {features.tags.map((tag) => (
                <button key={tag} onClick={() => persistFeatures({ ...features, tags: features.tags.filter((next) => next !== tag) })} className="rounded-full bg-[#f0ecff] px-3 py-1.5 text-xs font-medium text-[#5d4bd7]">#{tag}</button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-white">Key Topics</h2>
              <span className="text-xs text-slate-300">{meeting.key_topics.length}</span>
            </div>
            <div className="space-y-3">
              {meeting.key_topics.length === 0 ? <p className="text-sm text-slate-400">No key topics yet.</p> : meeting.key_topics.map((topic) => (
                <button key={topic.id} onClick={() => seekTo(topic.timestamp_seconds)} className="w-full rounded-xl border border-slate-800 bg-[#0c1020] p-3 text-left hover:border-[#c8bfff] hover:bg-white/5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium text-white">{topic.title}</div>
                    <div className="text-xs text-[#7b61ff]">{formatClock(topic.timestamp_seconds)}</div>
                  </div>
                  {topic.description ? <p className="mt-1 text-xs leading-5 text-slate-300">{topic.description}</p> : null}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <h2 className="font-semibold text-white">Action Items</h2>
            <form onSubmit={saveActionItem} className="mt-4 space-y-2">
              <input value={itemDraft.description} onChange={(e) => setItemDraft({ ...itemDraft, description: e.target.value })} placeholder="Add an action item" className="h-10 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
              <div className="flex gap-2">
                <input value={itemDraft.assigned_to} onChange={(e) => setItemDraft({ ...itemDraft, assigned_to: e.target.value })} placeholder="Assignee" className="h-10 min-w-0 flex-1 rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200 placeholder:text-slate-500" />
                <button className="h-10 rounded-lg bg-[var(--accent)] px-3 text-sm font-medium text-white hover:bg-[#684cf0]">{editingItemId ? 'Update' : 'Add'}</button>
              </div>
            </form>
            <div className="mt-4 space-y-3">
              {meeting.action_items.length === 0 ? <p className="text-sm text-slate-400">No action items yet.</p> : meeting.action_items.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-800 bg-[#0c1020] p-3">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" checked={item.completed} onChange={() => toggleActionItem(item)} className="mt-1 h-4 w-4 accent-[#7b61ff]" />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-5 ${item.completed ? 'text-slate-400 line-through' : 'text-white'}`}>{item.description}</p>
                      <p className="mt-1 text-xs text-slate-300">{item.assigned_to || 'Unassigned'}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    <button onClick={() => { setEditingItemId(item.id); setItemDraft({ description: item.description, assigned_to: item.assigned_to ?? '' }); }} className="rounded-md px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10">Edit</button>
                    <button onClick={() => deleteActionItem(item)} className="rounded-md px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-900/20">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#0c1020] p-5 shadow-sm">
            <h2 className="font-semibold text-white">Meeting actions</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <button onClick={() => exportMeeting('txt')} className="rounded-lg border border-slate-700 px-3 py-2 text-left text-slate-200 hover:bg-white/5">Export transcript TXT</button>
              <button onClick={() => exportMeeting('md')} className="rounded-lg border border-slate-700 px-3 py-2 text-left text-slate-200 hover:bg-white/5">Export summary Markdown</button>
              <button onClick={() => exportMeeting('pdf')} className="rounded-lg border border-slate-700 px-3 py-2 text-left text-slate-200 hover:bg-white/5">Export PDF</button>
              <button onClick={() => comingSoon('Team sharing')} className="rounded-lg border border-slate-700 px-3 py-2 text-left text-slate-200 hover:bg-white/5">Share with team</button>
              <button onClick={() => comingSoon('CRM sync')} className="rounded-lg border border-slate-700 px-3 py-2 text-left text-slate-200 hover:bg-white/5">Push to CRM</button>
            </div>
          </div>
        </aside>
      </main>

      {metadataOpen && metadataDraft ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <form onSubmit={saveMetadata} className="w-full max-w-lg rounded-2xl bg-[#0c1020] p-5 shadow-2xl border border-slate-800">
            <h2 className="text-lg font-semibold text-white">Edit meeting details</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-slate-300">Title<input value={metadataDraft.title} onChange={(e) => setMetadataDraft({ ...metadataDraft, title: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200" /></label>
              <label className="block text-sm font-medium text-slate-300">Description<textarea value={metadataDraft.description} onChange={(e) => setMetadataDraft({ ...metadataDraft, description: e.target.value })} className="mt-1 min-h-24 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 py-2 text-sm text-slate-200" /></label>
              <label className="block text-sm font-medium text-slate-300">Recorded at<input type="datetime-local" value={metadataDraft.date_recorded} onChange={(e) => setMetadataDraft({ ...metadataDraft, date_recorded: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200" /></label>
              <label className="block text-sm font-medium text-slate-300">Participants<input value={metadataDraft.participants} onChange={(e) => setMetadataDraft({ ...metadataDraft, participants: e.target.value })} className="mt-1 h-11 w-full rounded-lg border border-slate-700 bg-[#0c1020] px-3 text-sm text-slate-200" /></label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setMetadataOpen(false)} className="h-10 rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200 hover:bg-slate-800">Cancel</button>
              <button className="h-10 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[#684cf0]">Save</button>
            </div>
          </form>
        </div>
      ) : null}

      {deleteOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0c1020] p-5 shadow-2xl border border-slate-800">
            <h2 className="text-lg font-semibold text-white">Delete this meeting?</h2>
            <p className="mt-2 text-sm text-slate-300">This permanently deletes the transcript, AI summary, topics, and action items.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeleteOpen(false)} className="h-10 rounded-lg border border-slate-700 px-4 text-sm font-medium text-slate-200 hover:bg-slate-800">Cancel</button>
              <button onClick={deleteMeeting} className="h-10 rounded-lg bg-rose-600 px-4 text-sm font-medium text-white hover:bg-rose-700">Delete</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TranscriptRow({
  segment,
  query,
  active,
  searchActive,
  onSeek,
  setRef,
  markers,
  onComment,
  onHighlight,
  onSoundbite,
}: {
  segment: TranscriptSegment;
  query: string;
  active: boolean;
  searchActive: boolean;
  onSeek: (seconds: number) => void;
  setRef: (node: HTMLDivElement | null) => void;
  markers: TranscriptMarker[];
  onComment: (segment: TranscriptSegment) => void;
  onHighlight: (segment: TranscriptSegment) => void;
  onSoundbite: (segment: TranscriptSegment) => void;
}) {
  const parts = highlightMatch(segment.text, query);

  return (
    <div
      ref={setRef}
      onClick={() => onSeek(segment.start_time_seconds)}
      className={`group grid cursor-pointer grid-cols-[64px_minmax(0,1fr)] gap-3 rounded-xl p-3 text-sm hover:bg-white/5 ${active ? 'bg-[#5d4bd7]/20 ring-1 ring-[#d8d0ff]' : ''} ${searchActive ? 'ring-2 ring-amber-500' : ''} ${markers.some((marker) => marker.type === 'highlight') ? 'border border-amber-700 bg-amber-900/20' : ''}`}
    >
      <div className="pt-1 text-xs font-medium text-[#7b61ff]">{formatClock(segment.start_time_seconds)}</div>
      <div className="min-w-0">
        <div className="mb-1 flex items-center gap-2">
          <span className="avatar-initials h-6 w-6 text-[10px] font-semibold">{initials(segment.speaker?.name ?? 'Speaker')}</span>
          <span className="text-xs font-semibold text-slate-200">{segment.speaker?.name ?? 'Speaker'}</span>
        </div>
        <p className="leading-6 text-slate-300">
          {parts.map((part, index) => part.match ? <mark key={index} className="bg-amber-900/50 text-amber-200">{part.text}</mark> : <span key={index}>{part.text}</span>)}
        </p>
        {markers.length ? (
          <div className="mt-3 space-y-2">
            {markers.map((marker) => (
              <div key={marker.id} className="rounded-lg border border-slate-700 bg-[#0c1020] px-3 py-2 text-xs text-slate-300">
                <span className="mr-2 font-semibold capitalize text-[#6f5cff]">{marker.type}</span>
                {marker.body}
              </div>
            ))}
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100">
          <button onClick={(event) => { event.stopPropagation(); onComment(segment); }} className="rounded-md border border-slate-700 px-2 py-1 text-xs font-medium text-slate-200 hover:bg-white/10">Comment</button>
          <button onClick={(event) => { event.stopPropagation(); onHighlight(segment); }} className="rounded-md border border-amber-700 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-900/20">Highlight</button>
          <button onClick={(event) => { event.stopPropagation(); onSoundbite(segment); }} className="rounded-md border border-[#d8d0ff] px-2 py-1 text-xs font-medium text-[#a89dff] hover:bg-white/5">Soundbite</button>
        </div>
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 h-24 animate-pulse rounded-2xl bg-[#0c1020]" />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
        <div className="space-y-5">
          <div className="h-24 animate-pulse rounded-2xl bg-[#0c1020]" />
          <div className="h-[620px] animate-pulse rounded-2xl bg-[#0c1020]" />
        </div>
        <div className="space-y-5">
          <div className="h-52 animate-pulse rounded-2xl bg-[#0c1020]" />
          <div className="h-60 animate-pulse rounded-2xl bg-[#0c1020]" />
          <div className="h-80 animate-pulse rounded-2xl bg-[#0c1020]" />
        </div>
      </div>
    </div>
  );
}
