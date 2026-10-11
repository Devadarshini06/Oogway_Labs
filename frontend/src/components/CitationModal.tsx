import React from 'react';
import { X, ExternalLink, Quote, Clock, User } from 'lucide-react';
import type { Citation } from '../types';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  if (!citation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
          <div className="flex items-center gap-2 text-indigo-400">
            <Quote className="w-4 h-4" />
            <span className="font-semibold text-xs tracking-wide uppercase">Source Attribution</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div>
            <h3 className="font-semibold text-base text-zinc-100 leading-snug">
              {citation.episode_title}
            </h3>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1 text-zinc-300">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">{citation.guest}</span>
              </span>
              {citation.timestamp_str && (
                <span className="flex items-center gap-1 text-zinc-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{citation.timestamp_str}</span>
                </span>
              )}
              {citation.similarity_score !== undefined && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
                  Match: {(citation.similarity_score * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>

          {/* Verbatim Quote Excerpt */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
              Transcript Passage
            </span>
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 text-xs text-zinc-300 leading-relaxed italic whitespace-pre-wrap">
              "{citation.quote}"
            </div>
          </div>

          {/* YouTube Action */}
          {citation.youtube_url && (
            <div className="pt-2">
              <a
                href={citation.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 border border-red-500/20 rounded-xl text-xs font-medium transition-colors"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
