export type MarkerType = 'comment' | 'highlight' | 'decision' | 'bookmark';

export interface TranscriptMarker {
  id: string;
  segmentId: number;
  body: string;
  type: MarkerType;
  createdAt: string;
}

export interface LocalSoundbite {
  id: string;
  title: string;
  description: string;
  start: number;
  end: number;
  createdAt: string;
}

export interface MeetingLocalFeatures {
  tags: string[];
  markers: TranscriptMarker[];
  soundbites: LocalSoundbite[];
}

const emptyFeatures: MeetingLocalFeatures = {
  tags: [],
  markers: [],
  soundbites: [],
};

export function loadMeetingFeatures(meetingId: number): MeetingLocalFeatures {
  if (typeof window === 'undefined') {
    return emptyFeatures;
  }

  const raw = window.localStorage.getItem(`meeting-features:${meetingId}`);
  if (!raw) {
    return emptyFeatures;
  }

  try {
    return { ...emptyFeatures, ...JSON.parse(raw) };
  } catch {
    return emptyFeatures;
  }
}

export function saveMeetingFeatures(meetingId: number, features: MeetingLocalFeatures) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(`meeting-features:${meetingId}`, JSON.stringify(features));
}

export function makeLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
