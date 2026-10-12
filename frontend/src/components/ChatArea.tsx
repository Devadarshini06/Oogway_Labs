import React, { useRef, useEffect, useState } from 'react';
import { User, Quote, Layout, Feather, Layers, ExternalLink, Compass, Copy, Check, AlertCircle, Target, TrendingUp, Sparkles, Award, ArrowUpRight } from 'lucide-react';
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
    iconColor: 'bg-[#670D2F]',
    icon: Target,
  },
  {
    title: 'B2B Product-Led Growth Playbook',
    prompt: 'What makes a B2B product-led growth strategy effective?',
    desc: 'Self-serve funnels, viral expansion loops, and activation metrics.',
    badge: 'PLG',
    iconColor: 'bg-[#670D2F]',
    icon: TrendingUp,
  },
  {
    title: 'Product-Market Fit Engine',
    prompt: "How does the Superhuman PMF engine systematically measure and improve fit?",
    desc: 'The 40% disappointment threshold and high-expectation customer segmentation.',
    badge: 'PMF',
    iconColor: 'bg-[#670D2F]',
    icon: Sparkles,
  },
  {
    title: 'Product Strategy & High Agency',
    prompt: 'What frameworks does Shreyas Doshi share for product strategy and high-agency execution?',
    desc: 'Avoiding impact vs. effort traps, strategic planning, and career agency.',
    badge: 'Strategy',
    iconColor: 'bg-[#670D2F]',
    icon: Award,
  },
];

const SPECIALIZED_ACTION_CARDS = [
  {
    title: 'Ship 30 for 30 Long-Form Essay',
    prompt: 'Turn podcast insights on Product-Led Growth and Retention into a Ship 30 for 30 essay.',
    desc: 'Synthesizes an executive ~1,250-word tactical essay with provocative hook, lead-in, thematic pillars, and a Monday morning checklist.',
    badge: 'Long-Form Essay',
    iconColor: 'bg-[#670D2F]',
    ship30: true,
  },
  {
    title: 'Interactive HTML Dashboard',
    prompt: 'Create an HTML dashboard explaining the user retention loop.',
    desc: 'Generates a sandboxed, self-contained visual component with interactive metric trees and growth loop diagrams.',
    badge: 'Visual Component',
    iconColor: 'bg-[#670D2F]',
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
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
      {messages.length === 0 ? (
        /* Empty / Welcome State with expansive width and full title visibility */
        <div className="max-w-4xl mx-auto pt-6 sm:pt-10 pb-32 sm:pb-40 space-y-9 text-center animate-in fade-in duration-200">
          <div className="space-y-4">
            <div className="w-14 h-14 rounded-full bg-white border-2 border-[#670D2F]/20 text-[#670D2F] shadow-sm flex items-center justify-center mx-auto ring-8 ring-[#670D2F]/5">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-2xl sm:text-[32px] font-extrabold tracking-tight text-[#1E141B]">
              Your growth strategy, grounded in Lenny's Podcast.
            </h2>
            <p className="text-xs sm:text-sm text-[#6C5B65] max-w-xl mx-auto leading-relaxed">
              Tactical product and growth advice grounded in 260+ episodes of Lenny's Podcast archive.
              Select a core topic below or synthesize long-form essays and visual components.
            </p>
          </div>

          {/* 4 Core Strategy Prompt Cards */}
          <div className="space-y-3.5 text-left max-w-4xl mx-auto">
            <div className="text-[11px] font-bold text-[#670D2F] uppercase tracking-wider px-1">
              Core Strategic Frameworks
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FOUR_STRATEGY_CARDS.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSuggested(item.prompt)}
                    aria-label={`Explore strategic framework: ${item.title}`}
                    className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#FFFDFB] border border-[#ECE3D8] hover:border-[#A53860]/60 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 text-left cursor-pointer group flex items-start gap-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A53860]"
                  >
                    <div className={`w-11 h-11 rounded-full ${item.iconColor} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-start justify-between gap-2.5">
                        <span className="font-bold text-xs sm:text-[13px] text-[#1E141B] group-hover:text-[#670D2F] transition-colors leading-snug">
                          {item.title}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-[#670D2F] border border-rose-100">
                            {item.badge}
                          </span>
                          <ArrowUpRight className="w-3.5 h-3.5 text-[#670D2F] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <p className="text-[11px] text-[#6C5B65] leading-relaxed line-clamp-2">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2 Specialized Actions: Ship 30 Essay & HTML Artifact */}
          <div className="space-y-3.5 text-left max-w-4xl mx-auto pt-1">
            <div className="text-[11px] font-bold text-[#670D2F] uppercase tracking-wider px-1">
              Specialized Agent Capabilities
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SPECIALIZED_ACTION_CARDS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSelectSuggested(item.prompt, item.ship30, item.artifact)}
                  aria-label={`Execute specialized capability: ${item.title}`}
                  className="p-4 sm:p-4.5 rounded-2xl bg-white hover:bg-[#FFFDFB] border border-[#ECE3D8] hover:border-[#670D2F]/60 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 text-left cursor-pointer group flex items-start gap-4 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#670D2F]"
                >
                  <div className={`w-11 h-11 rounded-full ${item.iconColor} text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}>
                    {item.ship30 ? <Feather className="w-5 h-5" /> : <Layout className="w-5 h-5" />}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-start justify-between gap-2.5">
                      <span className="font-bold text-xs sm:text-[13px] text-[#1E141B] group-hover:text-[#670D2F] transition-colors leading-snug">
                        {item.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-[#670D2F] border border-rose-100">
                          {item.badge}
                        </span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#670D2F] opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <p className="text-[11px] text-[#6C5B65] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Conversation Experience with comfortable bottom clearance */
        <div className="max-w-4xl mx-auto space-y-6 pb-20 sm:pb-24">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#670D2F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Compass className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`space-y-3 ${
                    isUser
                      ? 'max-w-[85%] bg-white text-[#1E141B] px-4 py-3 rounded-2xl rounded-tr-xs text-sm border border-[#ECE3D8] shadow-sm'
                      : 'w-full text-[#1E141B] text-sm'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  ) : (
                    <div className="space-y-4 bg-white border border-[#ECE3D8] rounded-2xl p-4 sm:p-5 shadow-sm">
                      {/* Assistant Header & Actions */}
                      <div className="flex items-center justify-between pb-3 border-b border-[#ECE3D8] text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[#1E141B] text-xs">
                            The Lenny Growth Assistant
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#670D2F] border border-[#ECE3D8]">
                            {msg.model_name || msg.provider || activeModel || 'grounded'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          aria-label="Copy response"
                          title="Copy response"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#FAF7F2] text-[#6C5B65] hover:text-[#1E141B] transition-colors text-xs cursor-pointer"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-600 text-[11px]">Copied</span>
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
                      <div className="prose prose-sm max-w-none text-[#1E141B] prose-headings:text-[#1E141B] prose-headings:font-bold prose-h2:text-base prose-h2:border-b prose-h2:border-[#ECE3D8] prose-h2:pb-1.5 prose-h3:text-sm prose-p:text-[#382B33] prose-p:leading-relaxed prose-strong:text-[#1E141B] prose-ul:text-[#382B33] prose-li:my-1 prose-blockquote:border-l-[#8C163F] prose-blockquote:text-[#670D2F] prose-blockquote:bg-[#FAF7F2] prose-blockquote:py-1 prose-blockquote:px-3 prose-blockquote:rounded-r-lg prose-pre:bg-[#2A0313] prose-pre:text-white prose-pre:border prose-pre:border-[#4A0A24] prose-code:text-[#670D2F] prose-code:bg-[#FAF7F2] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:border prose-code:border-[#ECE3D8] prose-code:before:content-none prose-code:after:content-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Attached Artifact banner */}
                      {msg.artifact && (
                        <div className="p-3 bg-[#FAF7F2] border border-[#A53860]/20 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-rose-100 rounded-lg text-[#8C163F]">
                              <Layers className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-[#1E141B]">
                                {msg.artifact.title}
                              </div>
                              <div className="text-[10px] text-[#6C5B65] uppercase font-mono">
                                {msg.artifact.artifact_type} Artifact • Sandboxed
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenArtifact(msg.artifact!)}
                            className="px-3 py-1.5 bg-[#670D2F] hover:bg-[#4A0A23] text-white rounded-lg text-xs font-medium cursor-pointer transition-colors shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A53860]"
                          >
                            Open Artifact
                          </button>
                        </div>
                      )}

                      {/* Source Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-3 border-t border-[#ECE3D8] space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-[#6C5B65] uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Quote className="w-3 h-3 text-[#A53860]" />
                              <span>Grounded Transcript Sources ({msg.citations.length})</span>
                            </span>
                            <span className="text-[10px] text-[#6C5B65]/70 font-normal lowercase">
                              click to inspect passage & video
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => onInspectCitation(c)}
                                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#ECE3D8] hover:border-[#A53860]/50 text-[11px] text-[#382B33] transition-all cursor-pointer shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A53860]"
                              >
                                <span className="font-semibold text-[#670D2F] group-hover:text-[#8C163F]">
                                  {c.guest}
                                </span>
                                {c.timestamp_str && (
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-[#FAF7F2] text-[#6C5B65] border border-[#ECE3D8]">
                                    {c.timestamp_str}
                                  </span>
                                )}
                                {c.similarity_score !== undefined && (
                                  <span className="text-[10px] text-emerald-600 font-mono">
                                    {(c.similarity_score * 100).toFixed(0)}%
                                  </span>
                                )}
                                <ExternalLink className="w-3 h-3 text-[#6C5B65]/60 group-hover:text-[#1E141B]" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#ECE3D8] flex items-center justify-center text-[#670D2F] shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Interrupted User Turn Recovery Banner */}
          {hasOrphanedUserTurn && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 animate-in fade-in shadow-xs">
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
                className="px-3 py-1.5 bg-[#670D2F] hover:bg-[#4A0A23] text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0 transition-colors shadow-xs"
              >
                Generate Response with {activeProvider || 'Ollama'}
              </button>
            </div>
          )}

          {/* Polished Loading indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start animate-in fade-in duration-150">
              <div className="w-8 h-8 rounded-full bg-[#670D2F] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                <Compass className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-[#ECE3D8] text-xs text-[#382B33] flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#670D2F] animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#670D2F] animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-[#670D2F] animate-bounce [animation-delay:0.4s]" />
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
