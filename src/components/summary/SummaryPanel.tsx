'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Chapter, MeetingSummaries, SummaryTemplateType, Participant, ActionItem } from '@/types';
import { formatSecToTime, getSpeakerColorStyle } from '@/lib/utils';
import {
  Sparkles,
  CheckSquare,
  Square,
  Copy,
  Check,
  Bookmark,
  FileText,
  DollarSign,
  UserCheck,
  Zap,
  ChevronUp,
  ChevronDown,
  Play,
  Mail,
  CheckCircle2,
} from 'lucide-react';

interface SummaryPanelProps {
  summaries: MeetingSummaries;
  chapters: Chapter[];
  participants: Participant[];
  onSeek: (timeSec: number) => void;
  meetingId?: string;
  meetingTitle?: string;
}

const TEMPLATE_TABS: {
  id: SummaryTemplateType;
  label: string;
  icon: React.ElementType;
}[] = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'sales', label: 'Sales', icon: DollarSign },
  { id: 'oneOnOne', label: '1:1 Sync', icon: UserCheck },
  { id: 'standup', label: 'Standup', icon: Zap },
];

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summaries,
  chapters = [],
  participants = [],
  onSeek,
  meetingId,
  meetingTitle = 'Meeting',
}) => {
  const [activeTemplate, setActiveTemplate] = useState<SummaryTemplateType>('general');
  const [isTemplateLoading, setIsTemplateLoading] = useState<boolean>(false);
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const storageKey = meetingId
    ? `fathom_action_items_${meetingId}`
    : 'fathom_action_items_default';
  const [completedActions, setCompletedActions] = useState<Record<number, boolean>>({});
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load saved checkbox states from localStorage per meeting
  useEffect(() => {
    if (typeof window !== 'undefined' && storageKey) {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          setCompletedActions(JSON.parse(saved));
        } else {
          setCompletedActions({});
        }
      } catch (e) {
        console.error('Failed to load action items state:', e);
      }
    }
  }, [storageKey]);

  // Clean up loading timer on unmount
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  const handleTemplateSwitch = (templateId: SummaryTemplateType) => {
    if (templateId === activeTemplate) return;
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    setActiveTemplate(templateId);
    setIsTemplateLoading(true);
    loadingTimerRef.current = setTimeout(() => {
      setIsTemplateLoading(false);
    }, 250);
  };

  // Fallback template text if specific template key is omitted in seed
  const getSummaryTextForTemplate = (template: SummaryTemplateType): string => {
    switch (template) {
      case 'sales':
        return (
          summaries.sales ||
          `Sales Focus: Key commercial outcomes and enterprise roadmap alignment. The team agreed on deliverables with ${
            participants[0]?.name || 'the client'
          } and validated ROI benchmarks.`
        );
      case 'oneOnOne':
        return (
          summaries.oneOnOne ||
          `1:1 Alignment: Performance feedback, project ownership, and team collaboration goals discussed between ${
            participants[0]?.name || 'Manager'
          } and team members.`
        );
      case 'standup':
        return (
          summaries.standup ||
          `Standup Notes: Work completed in prior sprint, active pull requests, and core architectural bottlenecks identified for resolution.`
        );
      case 'general':
      default:
        return summaries.general;
    }
  };

  const currentSummaryText = getSummaryTextForTemplate(activeTemplate);

  // Normalize action item object vs string
  const normalizedActionItems = (summaries.actionItems || []).map((raw, idx) => {
    if (typeof raw === 'object' && raw !== null) {
      return {
        id: raw.id || `ai-${idx}`,
        assignee: raw.assignee || 'Team',
        text: raw.text,
        timestampSec: raw.timestampSec ?? (idx + 1) * 60,
      };
    }

    let assignee = 'Team';
    let text = raw;
    if (raw.includes(':')) {
      const parts = raw.split(':');
      assignee = parts[0].trim();
      text = parts.slice(1).join(':').trim();
    }

    return {
      id: `ai-${idx}`,
      assignee,
      text,
      timestampSec: (idx + 1) * 60,
    };
  });

  const toggleAction = (idx: number) => {
    setCompletedActions((prev) => {
      const nextState = {
        ...prev,
        [idx]: !prev[idx],
      };
      if (typeof window !== 'undefined' && storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(nextState));
        } catch (e) {
          console.error('Failed to save action items state:', e);
        }
      }
      return nextState;
    });
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(currentSummaryText);
    triggerToast('Copied! Summary copied to clipboard.');
  };

  const handleCopyFollowUpEmail = () => {
    const actionListText = normalizedActionItems
      .map((item) => `- [${item.assignee}] ${item.text}`)
      .join('\n');

    const emailDraft = `Subject: Follow-up: ${meetingTitle} - Summary & Action Items

Hi Team,

Thanks for your time during our recent sync. Here is a summary of our discussion and key outcomes:

${currentSummaryText}

Key Action Items:
${actionListText || '- No pending action items.'}

Please reach out if you have any questions or updates.

Best regards,
Fathom Meeting Assistant`;

    navigator.clipboard.writeText(emailDraft);
    triggerToast('Copied! Follow-up email copied to clipboard.');
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5 transition-all relative">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header & Collapse Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            AI Summary & Insights
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCollapsed((prev) => !prev)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            title={isCollapsed ? 'Expand Summary' : 'Collapse Summary'}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Collapsible Content */}
      {!isCollapsed && (
        <div className="space-y-5 animate-fade-in">
          {/* Quick Copy CTAs Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Quick Actions
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors shadow-2xs"
                title="Copy current summary text to clipboard"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Summary</span>
              </button>

              <button
                onClick={handleCopyFollowUpEmail}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-2xs"
                title="Generate and copy formatted follow-up email draft"
              >
                <Mail className="w-3.5 h-3.5 text-indigo-600" />
                <span>Copy Follow-up Email</span>
              </button>
            </div>
          </div>

          {/* Template Switcher Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
            {TEMPLATE_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTemplate === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTemplateSwitch(tab.id)}
                  className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Summary Content Body */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 min-h-[90px] flex items-center">
            {isTemplateLoading ? (
              <div className="w-full space-y-2.5 py-1 animate-pulse">
                <div className="h-3.5 bg-slate-200/80 rounded-md w-full" />
                <div className="h-3.5 bg-slate-200/80 rounded-md w-11/12" />
                <div className="h-3.5 bg-slate-200/80 rounded-md w-4/5" />
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal animate-fade-in">
                {currentSummaryText}
              </p>
            )}
          </div>

          {/* Action Items List Section */}
          {normalizedActionItems.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Action Items ({normalizedActionItems.length})
                  </h4>
                </div>
              </div>

              <div className="space-y-2.5">
                {normalizedActionItems.map((item, idx) => {
                  const isDone = !!completedActions[idx];
                  const speakerStyle = getSpeakerColorStyle(item.assignee);

                  return (
                    <div
                      key={item.id || idx}
                      className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                        isDone
                          ? 'bg-slate-50/60 border-slate-200/60 text-slate-400'
                          : 'bg-white border-slate-200/80 hover:border-indigo-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <label
                          className="mt-0.5 shrink-0 cursor-pointer text-slate-400 hover:text-indigo-600 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleAction(idx);
                          }}
                        >
                          {isDone ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-300" />
                          )}
                        </label>

                        <div className="space-y-1.5 min-w-0 flex-1">
                          {/* Speaker / Assignee Tag + Play Timestamp Button */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${speakerStyle.bg} ${speakerStyle.text} border ${speakerStyle.border}`}
                            >
                              {item.assignee}
                            </span>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSeek(item.timestampSec);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-mono font-bold transition-colors group"
                              title={`Seek to timestamp ${formatSecToTime(item.timestampSec)}`}
                            >
                              <Play className="w-2.5 h-2.5 fill-current text-indigo-600 group-hover:scale-110 transition-transform" />
                              <span>{formatSecToTime(item.timestampSec)}</span>
                            </button>
                          </div>

                          <p
                            className={`text-xs sm:text-sm font-medium leading-relaxed ${
                              isDone ? 'line-through text-slate-400' : 'text-slate-800'
                            }`}
                          >
                            {item.text}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chapters Breakdown Section */}
          {chapters.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-indigo-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Chapter Markers ({chapters.length})
                </h4>
              </div>

              <div className="space-y-1.5">
                {chapters.map((ch) => (
                  <button
                    key={ch.id}
                    onClick={() => onSeek(ch.startSec)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/60 hover:border-indigo-200 text-left transition-colors group"
                  >
                    <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate pr-2">
                      {ch.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-mono font-bold text-slate-600 group-hover:border-indigo-200 group-hover:text-indigo-700 shrink-0">
                      {formatSecToTime(ch.startSec)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
