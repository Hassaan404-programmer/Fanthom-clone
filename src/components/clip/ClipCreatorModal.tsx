'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { formatSecToTime } from '@/lib/utils';
import {
  Scissors,
  X,
  Copy,
  Check,
  ExternalLink,
  Film,
  Sparkles,
  Play,
} from 'lucide-react';

interface ClipCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  meetingId: string;
  meetingTitle: string;
  durationSec: number;
  currentTime: number;
}

export const ClipCreatorModal: React.FC<ClipCreatorModalProps> = ({
  isOpen,
  onClose,
  meetingId,
  meetingTitle,
  durationSec,
  currentTime,
}) => {
  const router = useRouter();
  const [startSec, setStartSec] = useState<number>(0);
  const [endSec, setEndSec] = useState<number>(120);
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize clip range around currentTime when modal opens
  useEffect(() => {
    if (isOpen) {
      const start = Math.max(0, Math.floor(currentTime) - 15);
      const end = Math.min(durationSec, Math.floor(currentTime) + 45);
      setStartSec(start);
      setEndSec(end > start ? end : Math.min(durationSec, start + 60));
    }
  }, [isOpen, currentTime, durationSec]);

  if (!isOpen) return null;

  const clipRelativeUrl = `/clip/${meetingId}?start=${startSec}&end=${endSec}`;
  const clipFullUrl = typeof window !== 'undefined' ? `${window.location.origin}${clipRelativeUrl}` : clipRelativeUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(clipFullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenClip = () => {
    onClose();
    router.push(clipRelativeUrl);
  };

  const applyPreset = (durationWindow: number) => {
    const start = Math.max(0, Math.floor(currentTime) - 10);
    const end = Math.min(durationSec, start + durationWindow);
    setStartSec(start);
    setEndSec(end);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-10 p-6 space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Create Shareable Clip
              </h3>
              <p className="text-xs text-slate-500">
                Generate a public standalone clip link for this meeting.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset Range Buttons */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Quick Clip Presets
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => applyPreset(30)}
              className="py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-xl transition-colors"
            >
              30 Seconds
            </button>
            <button
              onClick={() => applyPreset(60)}
              className="py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-xl transition-colors"
            >
              1 Minute
            </button>
            <button
              onClick={() => applyPreset(180)}
              className="py-1.5 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200/80 rounded-xl transition-colors"
            >
              3 Minutes
            </button>
          </div>
        </div>

        {/* Range Sliders Controls */}
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-bold text-slate-800">
            <span>Clip Segment</span>
            <span className="font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
              {formatSecToTime(startSec)} → {formatSecToTime(endSec)} ({formatSecToTime(endSec - startSec)})
            </span>
          </div>

          {/* Start Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>Start Time</span>
              <span className="font-mono text-indigo-700">{formatSecToTime(startSec)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.max(0, endSec - 5)}
              value={startSec}
              onChange={(e) => setStartSec(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          {/* End Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-[11px] font-semibold text-slate-600">
              <span>End Time</span>
              <span className="font-mono text-indigo-700">{formatSecToTime(endSec)}</span>
            </div>
            <input
              type="range"
              min={startSec + 5}
              max={durationSec}
              value={endSec}
              onChange={(e) => setEndSec(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>

        {/* Link Output Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Generated Public Clip Link
          </label>
          <div className="flex items-center gap-2 p-2 bg-slate-100 border border-slate-200 rounded-xl">
            <input
              type="text"
              readOnly
              value={clipFullUrl}
              className="flex-1 text-xs font-mono bg-transparent text-slate-800 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shrink-0 flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Action CTAs */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
          >
            Cancel
          </button>
          <button
            onClick={handleOpenClip}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-indigo-600" />
            <span>Open Public Clip Page</span>
          </button>
        </div>
      </div>
    </div>
  );
};
