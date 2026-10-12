import React, { useState, useMemo } from 'react';
import { Plus, MessageSquare, Trash2, Database, Sparkles, Compass, Search, X } from 'lucide-react';
import type { Session } from '../types';
import { isSyntheticTestSession } from '../types';

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

  // Deduplicate, filter synthetic test artifacts non-destructively, and group chronologically
  const groupedSessions = useMemo<DateGroup[]>(() => {
    const uniqueMap = new Map<string, Session>();
    for (const s of sessions) {
      if (!uniqueMap.has(s.id)) {
        uniqueMap.set(s.id, s);
      }
    }
    let list = Array.from(uniqueMap.values());

    // Hide synthetic automated test runner sessions non-destructively, preserve all legitimate user sessions
    list = list.filter((s) => !isSyntheticTestSession(s.title));

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((s) => (s.title || '').toLowerCase().includes(q));
    }

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfYesterday = startOfToday - 86400000;
    const startOfPast7Days = startOfToday - 7 * 86400000;

    const groups: { [key: string]: Session[] } = {
      TODAY: [],
      YESTERDAY: [],
      'PREVIOUS 7 DAYS': [],
      OLDER: [],
    };

    for (const session of list) {
      const rawDate = session.updated_at || session.created_at;
      const time = rawDate ? new Date(rawDate).getTime() : 0;

      if (time >= startOfToday) {
        groups.TODAY.push(session);
      } else if (time >= startOfYesterday) {
        groups.YESTERDAY.push(session);
      } else if (time >= startOfPast7Days) {
        groups['PREVIOUS 7 DAYS'].push(session);
      } else {
        groups.OLDER.push(session);
      }
    }

    const deduplicateGroup = (items: Session[]) => {
      const seen = new Set<string>();
      const result: Session[] = [];
      for (const item of items) {
        const titleKey = (item.title || 'Untitled Session').trim().toLowerCase();
        if (item.id === activeSessionId) {
          result.push(item);
          seen.add(titleKey);
        } else if (!seen.has(titleKey)) {
          seen.add(titleKey);
          result.push(item);
        }
      }
      return result;
    };

    return Object.entries(groups)
      .map(([label, items]) => ({ label, items: deduplicateGroup(items) }))
      .filter(({ items }) => items.length > 0);
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
        className={`fixed md:static inset-y-0 left-0 z-40 w-72 bg-[#3A0519] border-r border-[#4A0A24] flex flex-col transition-transform duration-300 ease-in-out text-white ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Sidebar navigation"
      >
        {/* App Branding */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#3A0519]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F3E3D0] text-[#670D2F] flex items-center justify-center shadow-md shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight text-[#FFFFFF]">
                Lenny Growth Assistant
              </h1>
              <p className="text-[11px] text-[#E8C9D5]">Podcast Knowledge Workspace</p>
            </div>
          </div>
        </div>

        {/* New Chat Button & Search */}
        <div className="p-3 pb-2 space-y-2">
          <button
            onClick={onNewChat}
            aria-label="Start new chat"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#7D0E36] to-[#A53860] hover:from-[#6B0C2E] hover:to-[#912A50] text-white rounded-xl font-semibold text-xs shadow-md shadow-[#2A0313]/50 transition-all duration-150 active:scale-[0.99] cursor-pointer border border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A53860]"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Chat</span>
          </button>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-7 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:bg-white/15 focus:border-[#A53860] transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                aria-label="Clear search"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Sessions List */}
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-4">
          {groupedSessions.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[#E8C9D5]/80">
              {searchQuery ? 'No matching conversations.' : 'No previous chats yet. Start a conversation above!'}
            </div>
          ) : (
            groupedSessions.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold text-[#E8C9D5] uppercase tracking-wider">
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
                      className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A53860] ${
                        isActive
                          ? 'bg-gradient-to-r from-[#670D2F] to-[#8C163F] text-white font-medium border border-white/20 shadow-sm'
                          : 'text-[#E8C9D5] hover:bg-white/8 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden mr-2">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-white' : 'text-[#E8C9D5]/70'}`} />
                        <span className="truncate">{s.title || 'Untitled Session'}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(s.id);
                        }}
                        aria-label={`Delete conversation ${s.title || ''}`}
                        title="Delete session"
                        className="opacity-0 group-hover:opacity-100 hover:text-rose-300 text-white/50 p-1 rounded transition-opacity cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
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
        <div className="p-3 border-t border-white/10 bg-black/25 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-[#E8C9D5]">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-[#E8C9D5]" />
              <span>Provider</span>
            </span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10 shadow-xs">
              {activeProvider}: {activeModel}
            </span>
          </div>

          <div className="flex items-center justify-between text-[#E8C9D5] pt-1 border-t border-white/10">
            <span className="flex items-center gap-1.5">
              <Database
                className={`w-3 h-3 ${
                  dbConnected === true
                    ? 'text-emerald-400'
                    : dbConnected === false
                    ? 'text-rose-400'
                    : 'text-white/40'
                }`}
              />
              <span>PostgreSQL</span>
            </span>
            <span
              className={`text-[10px] font-medium flex items-center gap-1.5 ${
                dbConnected === true
                  ? 'text-emerald-400'
                  : dbConnected === false
                  ? 'text-rose-400'
                  : 'text-[#C9A8B6]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  dbConnected === true
                    ? 'bg-emerald-400 animate-pulse'
                    : dbConnected === false
                    ? 'bg-rose-400'
                    : 'bg-white/40'
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
