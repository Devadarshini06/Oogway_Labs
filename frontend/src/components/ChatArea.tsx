import React from 'react';
import { Sparkles, Bot, User, Quote, Layout, Feather, Layers } from 'lucide-react';
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
    title: 'User Retention',
    prompt: 'How can a startup improve user retention?',
    desc: 'Tactics from Elena Verna & Casey Winters',
  },
  {
    title: 'Product-Led Growth',
    prompt: 'What makes a product-led growth strategy effective?',
    desc: 'Self-serve funnels & activation loops',
  },
  {
    title: 'Product-Market Fit',
    prompt: 'What can founders learn about product-market fit from top operators?',
    desc: 'Rahul Vohra engine & retention metrics',
  },
  {
    title: 'Ship 30 for 30 Essay',
    prompt: 'Turn relevant podcast insights into a long-form essay.',
    desc: '~1,250 words structured with hook & frameworks',
    ship30: true,
  },
  {
    title: 'Interactive Dashboard',
    prompt: 'Create an HTML dashboard explaining a growth framework.',
    desc: 'Rendered visual metric & loop component',
    artifact: true,
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
        <div className="max-w-2xl mx-auto py-10 space-y-8 text-center">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100 sm:text-2xl">
              The Lenny Growth Assistant
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto leading-relaxed">
              Grounded advice from 260+ episodes of Lenny's Podcast. Ask tactical growth questions,
              generate Ship 30 for 30 essays, or render interactive HTML dashboards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left max-w-xl mx-auto">
            {SUGGESTIONS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => onSelectSuggested(item.prompt, item.ship30, item.artifact)}
                className="p-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700/80 transition-all text-left cursor-pointer group space-y-1"
              >
                <div className="font-semibold text-xs text-zinc-200 group-hover:text-indigo-400 transition-colors flex items-center justify-between">
                  <span>{item.title}</span>
                  {item.ship30 && <Feather className="w-3.5 h-3.5 text-amber-400" />}
                  {item.artifact && <Layout className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <div className="text-[11px] text-zinc-400">{item.desc}</div>
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
                                {msg.artifact.artifact_type} Artifact
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => onOpenArtifact(msg.artifact!)}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium cursor-pointer transition-colors"
                          >
                            Open Artifact
                          </button>
                        </div>
                      )}

                      {/* Source Citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                            <Quote className="w-3 h-3 text-indigo-400" />
                            <span>Grounded Transcript Sources ({msg.citations.length})</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((c, cIdx) => (
                              <button
                                key={cIdx}
                                onClick={() => onInspectCitation(c)}
                                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-[11px] text-zinc-300 transition-colors cursor-pointer"
                              >
                                <span className="font-semibold text-indigo-400">{c.guest}</span>
                                {c.timestamp_str && (
                                  <span className="text-zinc-500">{c.timestamp_str}</span>
                                )}
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
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800/80 text-xs text-zinc-400 flex items-center gap-3">
                <div className="flex gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0.4s]" />
                </div>
                <span>Retrieving transcripts and generating grounded answer...</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
