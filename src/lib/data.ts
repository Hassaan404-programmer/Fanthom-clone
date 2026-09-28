import { Meeting, Highlight } from '@/types';
import seedMeetingsData from '@/data/seed-meetings.json';

// Seed data accessor
export const seedMeetings: Meeting[] = seedMeetingsData as Meeting[];

export function getMeetings(): Meeting[] {
  return seedMeetings;
}

export function getMeetingById(id: string): Meeting | undefined {
  return seedMeetings.find((m) => m.id === id);
}

// LocalStorage Helper Keys & Utilities for Client Actions
export const LOCAL_STORAGE_HIGHLIGHTS_KEY = 'fathom_user_highlights';

export function getLocalHighlights(meetingId?: string): Highlight[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HIGHLIGHTS_KEY);
    if (!raw) return [];
    const highlights: Highlight[] = JSON.parse(raw);
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
