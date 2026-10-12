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
        /* Empty / Welcome State */
        <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 text-center animate-in fade-in duration-200">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5] mx-auto shadow-xs">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#171923]">
              Your growth strategy, grounded in Lenny's Podcast.
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280] max-w-lg mx-auto leading-relaxed">
              Tactical product and growth advice grounded in 260+ episodes of Lenny's Podcast archive.
              Select a core topic below or synthesize long-form essays and visual components.
            </p>
          </div>

          {/* 4 Core Strategy Prompt Cards */}
          <div className="space-y-2.5 text-left max-w-2xl mx-auto">
            <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-1">
              Core Strategic Frameworks
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FOUR_STRATEGY_CARDS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggested(item.prompt)}
                  className="p-3.5 rounded-xl bg-white hover:bg-indigo-50/40 border border-[#E5E7EB] hover:border-indigo-300 transition-all duration-150 text-left cursor-pointer group space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-[#171923] group-hover:text-[#4F46E5] transition-colors">
                      {item.title}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-[#6B7280] border border-gray-200 shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed line-clamp-2">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* 2 Specialized Actions: Ship 30 Essay & HTML Artifact */}
          <div className="space-y-2.5 text-left max-w-2xl mx-auto pt-2">
            <div className="text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider px-1">
              Specialized Agent Capabilities
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SPECIALIZED_ACTION_CARDS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggested(item.prompt, item.ship30, item.artifact)}
                  className={`p-3.5 rounded-xl bg-white hover:bg-gray-50/80 border transition-all duration-150 text-left cursor-pointer group space-y-1.5 shadow-xs focus-visible:outline-none focus-visible:ring-2 ${
                    item.ship30
                      ? 'border-[#E5E7EB] hover:border-amber-400 focus-visible:ring-amber-400'
                      : 'border-[#E5E7EB] hover:border-emerald-400 focus-visible:ring-emerald-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-[#171923]">
                      {item.ship30 ? (
                        <Feather className="w-3.5 h-3.5 text-amber-600" />
                      ) : (
                        <Layout className="w-3.5 h-3.5 text-emerald-600" />
                      )}
                      <span>{item.title}</span>
                    </div>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0 ${
                        item.ship30
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] leading-relaxed">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Experience */
        <div className="max-w-3xl mx-auto space-y-6 pb-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5] shrink-0 mt-0.5 shadow-xs">
                    <Compass className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`space-y-3 ${
                    isUser
                      ? 'max-w-[85%] bg-[#EEF2FF] text-[#171923] px-4 py-3 rounded-2xl rounded-tr-xs text-sm border border-indigo-100 shadow-xs'
                      : 'w-full text-[#171923] text-sm'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  ) : (
                    <div className="space-y-4 bg-white border border-[#E5E7EB] rounded-2xl p-4 sm:p-5 shadow-xs">
                      {/* Assistant Header & Actions */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#171923] text-xs">
                            The Lenny Growth Assistant
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-gray-100 text-[#6B7280] border border-gray-200">
                            {msg.model_name || msg.provider || activeModel || 'grounded'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          aria-label="Copy response"
                          title="Copy response"
                          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-100 text-[#6B7280] hover:text-[#171923] transition-colors text-xs cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-[#059669]" />
                              <span className="text-[#059669] text-[11px]">Copied</span>
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
                      <div className="prose prose-sm max-w-none text-[#171923] prose-headings:text-[#171923] prose-headings:font-bold prose-h2:text-base prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-1.5 prose-h3:text-sm prose-p:text-[#374151] prose-p:leading-relaxed prose-strong:text-[#171923] prose-ul:text-[#374151] prose-li:my-1 prose-blockquote:border-l-[#4F46E5] prose-blockquote:text-[#4B5563] prose-blockquote:bg-gray-50 prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-800 prose-code:text-[#4F46E5] prose-code:bg-indigo-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Attached Artifact banner */}
                      {msg.artifact && (
                        <div className="p-3 bg-indigo-50/60 border border-indigo-200 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-indigo-100 rounded-lg text-[#4F46E5]">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-[#171923]">
                                {msg.artifact.title}
                              </div>
                              <div className="text-[10px] text-[#6B7280] uppercase font-mono">
                                {msg.artifact.artifact_type} Artifact • Sandboxed
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenArtifact(msg.artifact!)}
                            className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                          >
                            Open Artifact
                          </button>
                        </div>
                      )}

                      {/* Source Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-3 border-t border-[#E5E7EB] space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B7280] uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Quote className="w-3 h-3 text-[#4F46E5]" />
                              <span>Grounded Transcript Sources ({msg.citations.length})</span>
                            </span>
                            <span className="text-[10px] text-gray-500 font-normal lowercase">
                              click to inspect passage & video
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => onInspectCitation(c)}
                                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-white hover:bg-indigo-50/60 border border-[#E5E7EB] hover:border-indigo-300 text-[11px] text-[#374151] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
                              >
                                <span className="font-semibold text-[#4F46E5] group-hover:text-[#4338CA]">
                                  {c.guest}
                                </span>
                                {c.timestamp_str && (
                                  <span className="font-mono text-[10px] px-1 py-0.2 rounded bg-gray-100 text-[#6B7280] border border-gray-200">
                                    {c.timestamp_str}
                                  </span>
                                )}
                                {c.similarity_score !== undefined && (
                                  <span className="text-[10px] text-[#059669] font-mono">
                                    {(c.similarity_score * 100).toFixed(0)}%
                                  </span>
                                )}
                                <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-[#6B7280] shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Interrupted User Turn Recovery Banner */}
          {hasOrphanedUserTurn && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 animate-in fade-in shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Response awaiting completion</span>
                </div>
                <p className="text-xs text-amber-700 leading-relaxed">
                  This question is awaiting a response (for example, if previous provider connection was unconfigured or interrupted).
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSelectSuggested(lastMessage.content)}
                className="px-3 py-1.5 bg-[#4F46E5] hover:bg-[#4338CA] text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-xs"
              >
                Generate Response with {activeProvider || 'Ollama'}
              </button>
            </div>
          )}

          {/* Polished Loading indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-[#4F46E5] shrink-0 mt-0.5 shadow-xs">
                <Compass className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#E5E7EB] text-xs text-[#374151] flex items-center gap-3 shadow-xs">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-bounce [animation-delay:0.4s]" />
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
