'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Meeting, Participant } from '@/types';
import {
  formatDuration,
  formatMeetingDate,
  getInitials,
  getAvatarColorClass,
} from '@/lib/utils';
import { Clock, ChevronRight, Video, FileText, Users } from 'lucide-react';

interface MeetingCardProps {
  meeting: Meeting;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  // Extract clean one-line summary
  const getOneLineSummary = (m: Meeting): string => {
    if (m.summaries?.general) {
      const firstSentence = m.summaries.general.split('. ')[0];
      return firstSentence.endsWith('.') ? firstSentence : `${firstSentence}.`;
    }
    if (m.chapters && m.chapters.length > 0) {
      return m.chapters[0].title;
    }
    return 'Summary available for review.';
  };

  const summaryText = getOneLineSummary(meeting);
  const formattedDate = formatMeetingDate(meeting.date);
  const formattedDuration = formatDuration(meeting.durationSec);

  // Meeting type badges mapping
  const getTypeBadgeStyle = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'sales':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case '1:1':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'standup':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'product':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'engineering':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'executive':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const displayedParticipants = meeting.participants.slice(0, 4);
  const extraCount = meeting.participants.length - 4;

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="group block p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-2.5">
        {/* Left side: Badge + Title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getTypeBadgeStyle(
                meeting.meetingType
              )}`}
            >
              {meeting.meetingType || 'General'}
            </span>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs text-slate-500 font-mono">
              {formattedDuration}
            </span>
          </div>

          <h3 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {meeting.title}
          </h3>
        </div>

        {/* Right side arrow */}
        <div className="hidden sm:flex items-center text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all">
          <ChevronRight className="w-5 h-5" />
        </div>
      </div>

      {/* Summary line */}
      <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed mb-4">
        {summaryText}
      </p>

      {/* Card Footer: Participant Avatars Stack */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        <div className="flex items-center gap-2">
          {/* Avatar stack */}
          <div className="flex items-center -space-x-2 overflow-hidden">
            {displayedParticipants.map((p) => (
              <AvatarWithInitialsFallback key={p.id} participant={p} />
            ))}

            {extraCount > 0 && (
              <div
                className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600 shadow-2xs"
                title={`${extraCount} more participants`}
              >
                +{extraCount}
              </div>
            )}
          </div>

          <span className="text-xs text-slate-500 font-medium ml-1">
            {meeting.participants.length}{' '}
            {meeting.participants.length === 1 ? 'attendee' : 'attendees'}
          </span>
        </div>

        <div className="text-xs font-semibold text-indigo-600 flex items-center gap-1 group-hover:underline">
          <span>View Notes</span>
          <ChevronRight className="w-3.5 h-3.5 sm:hidden" />
        </div>
      </div>
    </Link>
  );
};

// Avatar with Initials Fallback Component
const AvatarWithInitialsFallback: React.FC<{ participant: Participant }> = ({
  participant,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(participant.name);
  const avatarColorClass = getAvatarColorClass(participant.name);

  return (
    <div
      className="relative group/avatar"
      title={`${participant.name} (${participant.role || participant.email})`}
    >
      {participant.avatar && !imageError ? (
        <img
          src={participant.avatar}
          alt={participant.name}
          onError={() => setImageError(true)}
          className="w-7 h-7 rounded-full object-cover border-2 border-white shadow-2xs"
        />
      ) : (
        <div
          className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-2xs ${avatarColorClass}`}
        >
          {initials}
        </div>
      )}
    </div>
  );
};
