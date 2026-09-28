import { Meeting, Highlight, GlobalSearchResult } from '@/types';
import seedMeetingsData from '@/data/seed-meetings.json';

// Seed data accessor
export const seedMeetings: Meeting[] = seedMeetingsData as Meeting[];

export function getMeetings(): Meeting[] {
  return seedMeetings;
}

export function getMeetingById(id: string): Meeting | undefined {
  return seedMeetings.find((m) => m.id === id);
}

// Global Search function across all meetings' titles, summaries, and transcripts
export function searchGlobalMeetings(query: string): GlobalSearchResult[] {
  if (!query || query.trim().length < 2) return [];
  const q = query.trim().toLowerCase();
  const results: GlobalSearchResult[] = [];

  for (const meeting of seedMeetings) {
    // 1. Match title
    if (meeting.title.toLowerCase().includes(q)) {
      results.push({
        meetingId: meeting.id,
        meetingTitle: meeting.title,
        meetingDate: meeting.date,
        meetingType: meeting.meetingType,
        matchType: 'title',
        snippet: meeting.title,
        timestampSec: 0,
      });
    }

    // 2. Match summary
    const summaryTexts = [
      meeting.summaries.general,
      meeting.summaries.sales,
      meeting.summaries.oneOnOne,
      meeting.summaries.standup,
      ...(meeting.summaries.actionItems || []),
    ].filter(Boolean) as string[];

    for (const sumText of summaryTexts) {
      if (sumText.toLowerCase().includes(q)) {
        // Extract snippet around match
        const matchIdx = sumText.toLowerCase().indexOf(q);
        const start = Math.max(0, matchIdx - 40);
        const end = Math.min(sumText.length, matchIdx + q.length + 60);
        let snippet = sumText.substring(start, end);
        if (start > 0) snippet = '...' + snippet;
        if (end < sumText.length) snippet = snippet + '...';

        results.push({
          meetingId: meeting.id,
          meetingTitle: meeting.title,
          meetingDate: meeting.date,
          meetingType: meeting.meetingType,
          matchType: 'summary',
          snippet,
          timestampSec: 0,
        });
        break; // Max 1 summary result per meeting
      }
    }

    // 3. Match transcript lines
    if (meeting.transcript && meeting.transcript.length > 0) {
      for (const line of meeting.transcript) {
        if (line.text.toLowerCase().includes(q) || line.speaker.toLowerCase().includes(q)) {
          results.push({
            meetingId: meeting.id,
            meetingTitle: meeting.title,
            meetingDate: meeting.date,
            meetingType: meeting.meetingType,
            matchType: 'transcript',
            snippet: line.text,
            speaker: line.speaker,
            timestampSec: line.startSec,
          });
        }
      }
    }
  }

  // Cap at 25 results
  return results.slice(0, 25);
}

// LocalStorage Helper Keys & Utilities for Client Actions
export const LOCAL_STORAGE_HIGHLIGHTS_KEY = 'fathom_user_highlights';

const INITIAL_SEED_HIGHLIGHTS: Record<string, Omit<Highlight, 'id' | 'createdAt'>[]> = {
  'm-001': [
    {
      meetingId: 'm-001',
      sec: 57,
      speaker: 'Alex Rivera',
      type: 'highlight',
      note: 'Streaming pipeline architecture proposed for cutting latency below 300ms.',
    },
    {
      meetingId: 'm-001',
      sec: 97,
      speaker: 'Elena Rostova',
      type: 'note',
      note: 'UI team requested real-time visual bookmark updates without state flicker.',
    },
  ],
  'm-002': [
    {
      meetingId: 'm-002',
      sec: 45,
      speaker: 'Jessica Vance',
      type: 'highlight',
      note: '450-seat expansion discount approved for annual commitment.',
    },
    {
      meetingId: 'm-002',
      sec: 120,
      speaker: 'Tom Brady',
      type: 'note',
      note: 'Acme security team requires SAML 2.0 Okta integration specs.',
    },
  ],
};

export function getLocalHighlights(meetingId?: string): Highlight[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HIGHLIGHTS_KEY);
    let highlights: Highlight[] = raw ? JSON.parse(raw) : [];

    // Pre-populate seed highlights if localStorage is empty for this meeting
    if (meetingId && !highlights.some((h) => h.meetingId === meetingId)) {
      const seedItems = INITIAL_SEED_HIGHLIGHTS[meetingId];
      if (seedItems) {
        const seeded = seedItems.map((item, idx) => ({
          ...item,
          id: `hl-seed-${meetingId}-${idx}`,
          createdAt: new Date().toISOString(),
        }));
        highlights = [...seeded, ...highlights];
        localStorage.setItem(LOCAL_STORAGE_HIGHLIGHTS_KEY, JSON.stringify(highlights));
      }
    }

    if (meetingId) {
      return highlights.filter((h) => h.meetingId === meetingId);
    }
    return highlights;
  } catch (err) {
    console.error('Failed to load local highlights from localStorage:', err);
    return [];
  }
}

export function saveLocalHighlight(highlight: Omit<Highlight, 'id' | 'createdAt'>): Highlight {
  if (typeof window === 'undefined') {
    throw new Error('localStorage is not available on the server');
  }
  const existing = getLocalHighlights();
  const newHighlight: Highlight = {
    ...highlight,
    type: highlight.type || 'highlight',
    speaker: highlight.speaker || 'Speaker',
    id: `hl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newHighlight, ...existing];
  localStorage.setItem(LOCAL_STORAGE_HIGHLIGHTS_KEY, JSON.stringify(updated));
  return newHighlight;
}

export function deleteLocalHighlight(id: string): void {
  if (typeof window === 'undefined') return;
  const existing = getLocalHighlights();
  const updated = existing.filter((h) => h.id !== id);
  localStorage.setItem(LOCAL_STORAGE_HIGHLIGHTS_KEY, JSON.stringify(updated));
}
