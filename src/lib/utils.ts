import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Meeting } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(name: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 min';
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins} min`;
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
}

export function formatMeetingDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatTimeOnly(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch {
    return '';
  }
}

export interface GroupedMeetings {
  today: Meeting[];
  yesterday: Meeting[];
  earlier: Meeting[];
}

export function groupMeetingsByDate(meetings: Meeting[]): GroupedMeetings {
  if (!meetings || meetings.length === 0) {
    return { today: [], yesterday: [], earlier: [] };
  }

  // Find reference date (most recent date in dataset or current date)
  // To ensure realistic grouping for seed data, we anchor reference date to the max date in meetings if needed
  const meetingDates = meetings.map((m) => new Date(m.date).getTime());
  const maxTime = Math.max(...meetingDates);
  const maxDate = new Date(maxTime);

  // Normalize dates to midnight for accurate calendar day comparison
  const refDay = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate()).getTime();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const today: Meeting[] = [];
  const yesterday: Meeting[] = [];
  const earlier: Meeting[] = [];

  // Sort meetings descending by date
  const sorted = [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  sorted.forEach((m) => {
    const mDate = new Date(m.date);
    const mDay = new Date(mDate.getFullYear(), mDate.getMonth(), mDate.getDate()).getTime();
    const diffDays = Math.round((refDay - mDay) / ONE_DAY_MS);

    if (diffDays <= 0) {
      today.push(m);
    } else if (diffDays === 1) {
      yesterday.push(m);
    } else {
      earlier.push(m);
    }
  });

  return { today, yesterday, earlier };
}

// Participant Avatar Colors generator based on name hash
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 border-blue-200',
  'bg-purple-100 text-purple-700 border-purple-200',
  'bg-emerald-100 text-emerald-700 border-emerald-200',
  'bg-amber-100 text-amber-700 border-amber-200',
  'bg-indigo-100 text-indigo-700 border-indigo-200',
  'bg-rose-100 text-rose-700 border-rose-200',
  'bg-cyan-100 text-cyan-700 border-cyan-200',
  'bg-violet-100 text-violet-700 border-violet-200',
];

export function getAvatarColorClass(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}
