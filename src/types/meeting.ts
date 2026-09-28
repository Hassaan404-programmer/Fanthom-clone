export interface Participant {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

export interface Chapter {
  id: string;
  title: string;
  startSec: number;
  endSec: number;
}

export type SummaryTemplateType = 'general' | 'sales' | 'oneOnOne' | 'standup';

export interface MeetingSummaries {
  general: string;
  sales?: string;
  oneOnOne?: string;
  standup?: string;
  actionItems: string[];
}

export interface TranscriptLine {
  id: string;
  speaker: string;
  startSec: number;
  endSec: number;
  text: string;
}

export interface Highlight {
  id: string;
  meetingId: string;
  sec: number;
  note: string;
  createdAt?: string;
}

export interface Meeting {
  id: string;
  title: string;
  date: string;
  durationSec: number;
  meetingType: 'General' | 'Sales' | '1:1' | 'Standup' | 'Product' | 'Engineering' | 'Executive';
  videoUrl?: string;
  participants: Participant[];
  chapters: Chapter[];
  summaries: MeetingSummaries;
  transcript: TranscriptLine[];
}
