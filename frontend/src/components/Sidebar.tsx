import React, { useState, useMemo } from 'react';
import { Plus, MessageSquare, Trash2, Database, Sparkles, Compass, Search, X } from 'lucide-react';
import type { Session } from '../types';

interface SidebarProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  activeProvider: string;
  activeModel: string;
  isOpen: boolean;
  onCloseMobile: () => void;
  dbConnected?: boolean | null;
}

interface DateGroup {
  label: string;
  items: Session[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  activeProvider,
  activeModel,
  isOpen,
  onCloseMobile,
  dbConnected,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Non-destructive presentation filter to hide synthetic test runner sessions in demo view
  const isTestSession = (title?: string) => {
    if (!title) return false;
    const lower = title.toLowerCase();
    return (
      lower.includes('pre-submission validation') ||
      lower.includes('journey test session') ||
      lower.includes('test message') ||
      lower.includes('session b') ||
      lower.includes('test 1')
    );
  };

  // Deduplicate, filter test artifacts, and group sessions chronologically by date
  const groupedSessions = useMemo<DateGroup[]>(() => {
    // 1. Deduplicate by ID
    const uniqueMap = new Map<string, Session>();
    for (const s of sessions) {
      if (!uniqueMap.has(s.id)) {
        uniqueMap.set(s.id, s);
      }
    }
    let list = Array.from(uniqueMap.values());

    // 2. Filter test artifacts non-destructively (unless currently active)
    list = list.filter((s) => s.id === activeSessionId || !isTestSession(s.title));

    // 3. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => (s.title || '').toLowerCase().includes(q));
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfPast7Days = startOfToday - 7 * 86400000;

    const groups: { [key: string]: Session[] } = {
      Today: [],
      Yesterday: [],
      'Previous 7 Days': [],
      Older: [],
    };

    for (const session of list) {
      const rawDate = session.updated_at || session.created_at;
      const time = rawDate ? new Date(rawDate).getTime() : 0;

      if (time >= startOfToday) {
        groups.Today.push(session);
      } else if (time >= startOfYesterday) {
        groups.Yesterday.push(session);
      } else if (time >= startOfPast7Days) {
        groups['Previous 7 Days'].push(session);
      } else {
        groups.Older.push(session);
      }
    }

    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([label, items]) => ({ label, items }));
  }, [sessions, activeSessionId, searchQuery]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-zinc-900/95 border-r border-zinc-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* App Branding */}
        <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-zinc-100">
                Lenny Assistant
              </h1>
              <p className="text-[11px] text-zinc-400">Podcast Knowledge Workspace</p>
            </div>
          </div>
        </div>

        {/* New Chat Button */}
        <div className="p-3 pb-2 space-y-2">
          <button
            onClick={onNewChat}
            aria-label="Start new chat"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium text-xs shadow-sm transition-all duration-150 active:scale-[0.99] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          >
            <Plus className="w-4 h-4" />
            <span>New Chat</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-zinc-850 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-200 p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {groupedSessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-zinc-400">
              {searchQuery ? 'No matching conversations.' : 'No previous chats yet. Start a conversation above!'}
            </div>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-2 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  {group.label}
                </div>
                {group.items.map((s) => {
                  const isActive = s.id === activeSessionId;
                  return (
                    <div
                      key={s.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectSession(s.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onSelectSession(s.id);
                        }
                      }}
                      className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                        isActive
                          ? 'bg-zinc-800 text-zinc-100 font-medium'
                          : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                      }`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden mr-2">
                        <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-70" />
                        <span className="truncate">{s.title || 'Untitled Session'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(s.id);
                        }}
                        aria-label={`Delete conversation ${s.title || ''}`}
                        title="Delete session"
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-1 rounded transition-opacity cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-red-400"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* System & Model Status Bar */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/60 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              <span>Provider</span>
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">
              {activeProvider}: {activeModel}
            </span>
          </div>

          <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-800/50">
            <span className="flex items-center gap-1.5">
              <Database
                className={`w-3 h-3 ${
                  dbConnected === true
                    ? 'text-emerald-400'
                    : dbConnected === false
                    ? 'text-red-400'
                    : 'text-zinc-500'
                }`}
              />
              <span>PostgreSQL</span>
            </span>
            <span
              className={`text-[10px] font-medium flex items-center gap-1 ${
                dbConnected === true
                  ? 'text-emerald-400'
                  : dbConnected === false
                  ? 'text-red-400'
                  : 'text-zinc-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dbConnected === true
                    ? 'bg-emerald-400'
                    : dbConnected === false
                    ? 'bg-red-400'
                    : 'bg-zinc-500'
                }`}
              />
              {dbConnected === true
                ? 'Connected'
                : dbConnected === false
                ? 'Offline'
                : 'Checking...'}
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};
