import React from 'react';
import { Bot, User, Quote, Layout, Feather, Layers, ExternalLink, Compass } from 'lucide-react';
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
}

const SUGGESTIONS = [
  {
    title: 'B2B Product-Led Growth & Retention',
    prompt: 'What does Elena Verna recommend about B2B product-led growth and retention?',
    desc: 'Tactical loops, retention prioritization, and self-serve funnels',
    badge: 'Growth Loop',
  },
  {
    title: 'Funnels vs. Compounding Loops',
    prompt: 'How does Casey Winters distinguish between linear funnels and compounding growth loops?',
    desc: 'Designing sustainable acquisition and re-engagement engines',
    badge: 'Strategy',
  },
  {
    title: 'Product-Market Fit Engine',
    prompt: "How does Rahul Vohra's engine measure and systematically optimize Product-Market Fit?",
    desc: 'The 40% threshold and high-expectation customer focus',
    badge: 'PMF',
  },
  {
    title: 'Product Strategy & Agency',
    prompt: 'What frameworks does Shreyas Doshi share for product strategy and high-agency execution?',
    desc: 'Navigating impact vs. effort traps and strategic roadmaps',
    badge: 'Leadership',
  },
  {
    title: 'Ship 30 for 30 Long-Form Essay',
    prompt: 'Turn podcast insights on Product-Led Growth and Retention into a Ship 30 for 30 essay.',
    desc: 'Structured ~1,250 words with hook, lead-in, framework pillars, and checklist',
    ship30: true,
    badge: 'Ship 30',
  },
  {
    title: 'Interactive HTML Dashboard',
    prompt: 'Create an HTML dashboard explaining the user retention loop.',
    desc: 'Self-contained visual metric tree and framework dashboard',
    artifact: true,
    badge: 'Artifact',
  },
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  isLoading,
  onSelectSuggested,
  onInspectCitation,
  onOpenArtifact,
}) => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
      {messages.length === 0 ? (
        /* Empty / Welcome State */
        <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-8 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-inner">
              <Compass className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
              The Lenny Growth Assistant
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Grounded product and growth partner trained on transcripts of Lenny's Podcast.
              Ask tactical questions, synthesize Ship 30 for 30 essays, or generate sandboxed visual dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-2xl mx-auto">
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectSuggested(item.prompt, item.ship30, item.artifact)}
                className="p-3.5 rounded-xl bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-indigo-500/40 transition-all duration-150 text-left cursor-pointer group space-y-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-xs text-zinc-200 group-hover:text-indigo-300 transition-colors">
                    {item.title}
                  </span>
                  {item.ship30 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <Feather className="w-3 h-3" />
                      Essay
                    </span>
                  ) : item.artifact ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                      <Layout className="w-3 h-3" />
                      HTML
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/40 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                  {item.desc}
                </p>
              </button>
            ))}
          </div>
        </div>
      ) : (
        /* Message Stream */
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`space-y-3 max-w-[88%] ${
                    isUser
                      ? 'bg-zinc-800 text-zinc-100 px-4 py-2.5 rounded-2xl rounded-tr-xs text-sm border border-zinc-700/50'
                      : 'text-zinc-200 text-sm w-full'
                  }`}
                >
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  ) : (
                    <div className="space-y-4">
                      {/* Markdown rendered assistant answer */}
                      <div className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-p:leading-relaxed prose-strong:text-zinc-100 prose-ul:text-zinc-300 prose-li:my-1">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeSanitize]}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Attached Artifact banner */}
                      {msg.artifact && (
                        <div className="p-3 bg-zinc-900 border border-indigo-500/30 rounded-xl flex items-center justify-between">
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
                        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <Quote className="w-3 h-3 text-indigo-400" />
                              <span>Grounded Transcript Sources ({msg.citations.length})</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 font-normal lowercase">
                              click source to inspect
                            </span>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            {msg.citations.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                type="button"
                                onClick={() => onInspectCitation(c)}
                                className="group flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-indigo-500/40 text-[11px] text-zinc-300 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3.5 items-start">
              <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-300 flex items-center gap-3 shadow-sm">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Retrieving podcast transcripts & synthesizing grounded response...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
