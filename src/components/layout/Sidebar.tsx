'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Video,
  Search,
  Settings,
  X,
  Sparkles,
  Calendar,
  Layers,
  ChevronDown,
  User,
  ShieldCheck,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onSearchClick?: () => void;
  onSettingsClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen = false,
  onClose,
  onSearchClick,
  onSettingsClick,
}) => {
  const pathname = usePathname();
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    if (typeof navigator !== 'undefined') {
      const isMacOs = /(Mac|iPhone|iPod|iPad)/i.test(
        navigator.userAgent || navigator.platform || ''
      );
      setIsMac(isMacOs);
    }
  }, []);

  const searchHint = isMac ? '⌘K to search' : 'Ctrl+K to search';

  const navItems = [
    {
      name: 'Meetings',
      href: '/',
      icon: Video,
      active: pathname === '/' || pathname.startsWith('/meetings'),
      badge: undefined,
    },
    {
      name: 'Search',
      href: '#',
      icon: Search,
      active: false,
      onClick: onSearchClick,
      badge: searchHint,
    },
    {
      name: 'Settings',
      href: '#',
      icon: Settings,
      active: false,
      onClick: onSettingsClick,
      badge: 'Placeholder',
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-slate-200/80 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header / Branding */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 text-lg tracking-tight leading-none group-hover:text-indigo-600 transition-colors">
                Fathom
              </span>
              <span className="text-[10px] font-semibold tracking-wider text-indigo-600 uppercase mt-0.5">
                AI Notetaker
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg lg:hidden hover:bg-slate-100 transition-colors"
            aria-label="Close Sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4 py-6 overflow-y-auto space-y-6">
          {/* Quick Search Bar */}
          <div>
            <button
              onClick={() => {
                onSearchClick?.();
                onClose?.();
              }}
              className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-200/80 rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-all shadow-2xs group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                <span className="truncate">Search meetings...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-2xs shrink-0 ml-1">
                {searchHint}
              </kbd>
            </button>
          </div>

          {/* Main Navigation Group */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Main Menu
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const content = (
                  <div
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      item.active
                        ? 'bg-indigo-50/80 text-indigo-700 font-semibold shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          item.active ? 'text-indigo-600' : 'text-slate-400'
                        }`}
                      />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-mono ${
                          item.badge === 'Placeholder'
                            ? 'bg-slate-100 text-slate-500 font-sans text-[10px]'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );

                if (item.onClick) {
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        item.onClick?.();
                        onClose?.();
                      }}
                      className="w-full text-left"
                    >
                      {content}
                    </button>
                  );
                }

                return (
                  <Link key={item.name} href={item.href} onClick={onClose}>
                    {content}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Filters / Views */}
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Library Views
            </div>
            <div className="space-y-1">
              <Link
                href="/?type=Sales"
                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Sales Calls
                </span>
                <span className="text-[11px] text-slate-400 font-mono">12</span>
              </Link>
              <Link
                href="/?type=1:1"
                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-purple-500" />
                  1:1 Synchronizations
                </span>
                <span className="text-[11px] text-slate-400 font-mono">8</span>
              </Link>
              <Link
                href="/?type=Standup"
                className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              >
                <span className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Engineering Standups
                </span>
                <span className="text-[11px] text-slate-400 font-mono">15</span>
              </Link>
            </div>
          </div>

          {/* Connected Calendar Info Box */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-slate-50 to-indigo-50/40 border border-slate-200/70">
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-semibold text-slate-800">
                Google Calendar
              </span>
              <span className="ml-auto flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-snug">
              Auto-recording enabled for all upcoming Zoom & Meet calls.
            </p>
          </div>
        </div>

        {/* Footer Workspace / User Account */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white font-semibold text-xs shadow-xs">
              AR
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                Alex Rivera
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                alex.rivera@fathom.ai
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </div>
        </div>
      </aside>
    </>
  );
};
