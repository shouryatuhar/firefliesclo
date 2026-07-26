/**
 * Typed REST client for the FastAPI backend.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';

export interface MeetingListItem {
  id: number;
  title: string;
  description: string | null;
  date_recorded: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  participants_count: number;
  created_at: string;
}

export interface Speaker {
  id: number;
  meeting_id: number;
  name: string;
  email: string | null;
  avatar_url: string | null;
}

export interface TranscriptSegment {
  id: number;
  meeting_id: number;
  speaker_id: number;
  speaker?: Speaker | null;
  text: string;
  start_time_seconds: number;
  end_time_seconds: number;
  sequence_order: number | null;
  created_at: string;
}

export interface Summary {
  id: number;
  meeting_id: number;
  overview: string;
  created_at: string;
  updated_at: string;
}

export interface ActionItem {
  id: number;
  meeting_id: number;
  description: string;
  assigned_to: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface KeyTopic {
  id: number;
  meeting_id: number;
  title: string;
  description: string | null;
  timestamp_seconds: number | null;
  sequence_order: number | null;
  created_at: string;
}

export interface MeetingDetail extends MeetingListItem {
  updated_at: string;
  speakers: Speaker[];
  transcript_segments: TranscriptSegment[];
  summary: Summary | null;
  action_items: ActionItem[];
  key_topics: KeyTopic[];
}

export interface MeetingPayload {
  title: string;
  description?: string | null;
  date_recorded: string;
  thumbnail_url?: string | null;
}

export interface MeetingUpdatePayload {
  title?: string;
  description?: string | null;
  date_recorded?: string;
  thumbnail_url?: string | null;
}

export interface ActionItemPayload {
  description: string;
  assigned_to?: string | null;
  completed?: boolean;
}

export interface SpeakerPayload {
  name: string;
  email?: string | null;
  avatar_url?: string | null;
}

export interface MeetingFullPayload extends MeetingPayload {
  speakers: SpeakerPayload[];
  transcript_segments: Array<{
    speaker_name: string;
    text: string;
    start_time_seconds: number;
    end_time_seconds: number;
    sequence_order?: number | null;
  }>;
  summary?: {
    overview: string;
  } | null;
  action_items?: Array<{
    description: string;
    assigned_to?: string | null;
    completed?: boolean;
  }>;
  key_topics?: Array<{
    title: string;
    description?: string | null;
    timestamp_seconds?: number | null;
    sequence_order?: number | null;
  }>;
}

export interface MeetingFilters {
  search?: string;
  participant?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'recent' | 'oldest';
}

export interface GlobalSearchResult {
  meetings: Array<{
    id: number;
    title: string;
    description: string | null;
    date_recorded: string;
    duration_seconds: number | null;
    participants_count: number;
  }>;
  transcript_matches: Array<{
    meeting_id: number;
    meeting_title: string;
    segment_id: number;
    speaker: string;
    text: string;
    start_time_seconds: number;
  }>;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(body || `Request failed (${res.status})`);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

async function getMeetings(filters: MeetingFilters | string = {}, sortByArg: 'recent' | 'oldest' = 'recent'): Promise<MeetingListItem[]> {
  const normalized: MeetingFilters = typeof filters === 'string' ? { search: filters, sortBy: sortByArg } : filters;
  const params = new URLSearchParams();
  if (normalized.search?.trim()) {
    params.set('search', normalized.search.trim());
  }
  if (normalized.participant?.trim()) {
    params.set('participant', normalized.participant.trim());
  }
  if (normalized.dateFrom) {
    params.set('date_from', normalized.dateFrom);
  }
  if (normalized.dateTo) {
    params.set('date_to', normalized.dateTo);
  }
  params.set('sort_by', normalized.sortBy ?? 'recent');

  const query = params.toString();
  return request<MeetingListItem[]>(`/api/meetings${query ? `?${query}` : ''}`);
}

async function getMeeting(id: number): Promise<MeetingDetail> {
  return request<MeetingDetail>(`/api/meetings/${id}`);
}

async function globalSearch(query: string): Promise<GlobalSearchResult> {
  const params = new URLSearchParams({ q: query });
  return request<GlobalSearchResult>(`/api/meetings/global-search?${params.toString()}`);
}

async function createMeeting(payload: MeetingPayload): Promise<MeetingDetail> {
  return request<MeetingDetail>('/api/meetings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function createMeetingFull(payload: MeetingFullPayload): Promise<MeetingDetail> {
  return request<MeetingDetail>('/api/meetings/full', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updateMeeting(id: number, payload: MeetingUpdatePayload): Promise<MeetingDetail> {
  return request<MeetingDetail>(`/api/meetings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

async function deleteMeeting(id: number): Promise<void> {
  return request<void>(`/api/meetings/${id}`, { method: 'DELETE' });
}

async function createActionItem(meetingId: number, payload: ActionItemPayload): Promise<ActionItem> {
  return request<ActionItem>(`/api/meetings/${meetingId}/action-items`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updateActionItem(id: number, payload: Partial<ActionItemPayload>): Promise<ActionItem> {
  return request<ActionItem>(`/api/action-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

async function deleteActionItem(id: number): Promise<void> {
  return request<void>(`/api/action-items/${id}`, { method: 'DELETE' });
}

async function createSpeaker(meetingId: number, payload: SpeakerPayload): Promise<Speaker> {
  return request<Speaker>(`/api/meetings/${meetingId}/speakers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

async function updateSpeaker(meetingId: number, speakerId: number, payload: Partial<SpeakerPayload>): Promise<Speaker> {
  return request<Speaker>(`/api/meetings/${meetingId}/speakers/${speakerId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

async function deleteSpeaker(meetingId: number, speakerId: number): Promise<void> {
  return request<void>(`/api/meetings/${meetingId}/speakers/${speakerId}`, { method: 'DELETE' });
}

const api = {
  getMeetings,
  getMeeting,
  globalSearch,
  createMeeting,
  createMeetingFull,
  updateMeeting,
  deleteMeeting,
  createActionItem,
  updateActionItem,
  deleteActionItem,
  createSpeaker,
  updateSpeaker,
  deleteSpeaker,
};

export default api;
