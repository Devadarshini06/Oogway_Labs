import React, { useRef, useEffect, useState } from 'react';
import { User, Quote, Layout, Feather, Layers, ExternalLink, Compass, Copy, Check, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { Message, Citation, ArtifactRef } from '../types';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSelectSuggested: (prompt: string, ship30?: boolean, artifact?: boolean) => void;
  onInspectCitation: (citation: Citation) => void;
  onOpenArtifact: (artifact: ArtifactRef) => void;
  activeProvider?: string;
  activeModel?: string;
}

const FOUR_STRATEGY_CARDS = [
  {
    title: 'Retention Strategy & Churn Loops',
    prompt: 'What is the best retention strategy according to Elena Verna and Casey Winters?',
    desc: 'Tactical loops, retention prioritization over acquisition, and churn reduction.',
    badge: 'Retention',
  },
  {
    title: 'B2B Product-Led Growth Playbook',
    prompt: 'What makes a B2B product-led growth strategy effective?',
    desc: 'Self-serve funnels, viral expansion loops, and activation metrics.',
    badge: 'PLG',
  },
  {
    title: 'Product-Market Fit Engine',
    prompt: "How does the Superhuman PMF engine systematically measure and improve fit?",
    desc: 'The 40% disappointment threshold and high-expectation customer segmentation.',
    badge: 'PMF',
  },
  {
    title: 'Product Strategy & High Agency',
    prompt: 'What frameworks does Shreyas Doshi share for product strategy and high-agency execution?',
    desc: 'Avoiding impact vs. effort traps, strategic planning, and career agency.',
    badge: 'Strategy',
  },
];

const SPECIALIZED_ACTION_CARDS = [
  {
    title: 'Ship 30 for 30 Long-Form Essay',
    prompt: 'Turn podcast insights on Product-Led Growth and Retention into a Ship 30 for 30 essay.',
    desc: 'Synthesizes an executive ~1,250-word tactical essay with provocative hook, lead-in, thematic pillars, and a Monday morning checklist.',
    badge: 'Long-Form Essay',
    ship30: true,
  },
  {
    title: 'Interactive HTML Dashboard',
    prompt: 'Create an HTML dashboard explaining the user retention loop.',
    desc: 'Generates a sandboxed, self-contained visual component with interactive metric trees and growth loop diagrams.',
    badge: 'Visual Component',
    artifact: true,
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSelectSuggested,
  onInspectCitation,
  onOpenArtifact,
  activeProvider,
  activeModel,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-scroll on new message or loading state
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, isLoading]);

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const lastMessage = messages[messages.length - 1];
  const hasOrphanedUserTurn = lastMessage && lastMessage.role === 'user' && !isLoading;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.length === 0 ? (
        /* Empty / Welcome State (Phase 3) */
        <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 text-center animate-in fade-in duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-100">
              Your growth strategy, grounded in Lenny's Podcast.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Tactical product and growth advice grounded in 260+ episodes of Lenny's Podcast archive.
              Select a core topic below or synthesize long-form essays and visual components.
            </p>
          </div>

          {/* 4 Core Strategy Prompt Cards */}
          <div className="space-y-2.5 text-left max-w-2xl mx-auto">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
              Core Strategic Frameworks
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOUR_STRATEGY_CARDS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggested(item.prompt)}
                  className="p-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/40 transition-all duration-150 text-left cursor-pointer group space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-zinc-200 group-hover:text-indigo-300 transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40 shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2 Specialized Actions: Ship 30 Essay & HTML Artifact */}
          <div className="space-y-2.5 text-left max-w-2xl mx-auto pt-2">
            <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider px-1">
              Specialized Agent Capabilities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPECIALIZED_ACTION_CARDS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggested(item.prompt, item.ship30, item.artifact)}
                  className={`p-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border transition-all duration-150 text-left cursor-pointer group space-y-1.5 focus-visible:outline-none focus-visible:ring-2 ${
                    item.ship30
                      ? 'border-amber-500/20 hover:border-amber-500/50 focus-visible:ring-amber-400'
                      : 'border-emerald-500/20 hover:border-emerald-500/50 focus-visible:ring-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-zinc-200 group-hover:text-white transition-colors">
                      {item.ship30 ? (
                        <Feather className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Layout className="w-3.5 h-3.5 text-emerald-400" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        item.ship30
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Experience (Phase 2) */
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`space-y-3 ${
                    isUser
                      ? 'max-w-[85%] bg-zinc-850 text-zinc-100 px-4 py-3 rounded-2xl rounded-tr-xs text-sm border border-zinc-700/60 shadow-xs'
                      : 'w-full text-zinc-200 text-sm'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  ) : (
                    <div className="space-y-4 bg-zinc-900/60 border border-zinc-800/80 rounded-2xl p-4 sm:p-5 shadow-xs">
                      {/* Assistant Header & Actions */}
                      <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-100 text-xs">
                            The Lenny Growth Assistant
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                            {msg.model_name || msg.provider || activeModel || 'grounded'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          aria-label="Copy response"
                          title="Copy response"
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors text-xs cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 text-[11px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Markdown Body */}
                      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-headings:font-bold prose-h2:text-base prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-1.5 prose-h3:text-sm prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-zinc-100 prose-ul:text-zinc-300 prose-li:my-1 prose-blockquote:border-l-indigo-500 prose-blockquote:text-zinc-300 prose-pre:bg-zinc-950 prose-pre:border prose-pre:border-zinc-800">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Attached Artifact banner */}
                      {msg.artifact && (
                        <div className="p-3 bg-zinc-950/80 border border-indigo-500/30 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-600/20 rounded-lg text-indigo-400">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-zinc-100">
                                {msg.artifact.title}
                              </div>
                              <div className="text-[10px] text-zinc-400 uppercase font-mono">
                                {msg.artifact.artifact_type} Artifact • Sandboxed
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenArtifact(msg.artifact!)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            Open Artifact
                          </button>
                        </div>
                      )}

                      {/* Source Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-3 border-t border-zinc-800/80 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Quote className="w-3 h-3 text-indigo-400" />
                              <span>Grounded Transcript Sources ({msg.citations.length})</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 font-normal lowercase">
                              click to inspect passage & video
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => onInspectCitation(c)}
                                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-950 hover:bg-zinc-800/80 border border-zinc-800 hover:border-indigo-500/40 text-[11px] text-zinc-300 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                              >
                                <span className="font-semibold text-indigo-300 group-hover:text-indigo-200">
                                  {c.guest}
                                </span>
                                {c.timestamp_str && (
                                  <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40">
                                    {c.timestamp_str}
                                  </span>
                                )}
                                {c.similarity_score !== undefined && (
                                  <span className="text-[10px] text-emerald-400/80 font-mono">
                                    {(c.similarity_score * 100).toFixed(0)}%
                                  </span>
                                )}
                                <ExternalLink className="w-3 h-3 text-zinc-500 group-hover:text-zinc-300" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Interrupted User Turn Recovery Banner (Phase 1 Fix) */}
          {hasOrphanedUserTurn && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-indigo-500/30 flex items-start justify-between gap-3 animate-in fade-in">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Response awaiting completion</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  This question is awaiting a response (for example, if previous provider connection was unconfigured or interrupted).
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectSuggested(lastMessage.content)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-sm"
              >
                Generate Response with {activeProvider || 'Ollama'}
              </button>
            </div>
          )}

          {/* Polished Loading indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Compass className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Retrieving podcast transcripts & synthesizing grounded response...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};
