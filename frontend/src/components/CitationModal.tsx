import React, { useEffect } from 'react';
import { X, ExternalLink, Quote, Clock, User, Video } from 'lucide-react';
import type { Citation } from '../types';

interface CitationModalProps {
  citation: Citation | null;
  onClose: () => void;
}

export const CitationModal: React.FC<CitationModalProps> = ({ citation, onClose }) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (citation) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [citation, onClose]);

  if (!citation) return null;

  // Compute timestamped YouTube link if available
  const getTimestampedUrl = (url?: string, timestampStr?: string): string | undefined => {
    if (!url) return undefined;
    if (url.includes('&t=') || url.includes('?t=')) return url;
    if (!timestampStr) return url;

    const clean = timestampStr.replace(/[\[\]]/g, '').trim();
    const parts = clean.split(':').map((p) => parseInt(p, 10));
    let totalSeconds = 0;
    if (parts.length === 3 && !parts.some(isNaN)) {
      totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2 && !parts.some(isNaN)) {
      totalSeconds = parts[0] * 60 + parts[1];
    }

    if (totalSeconds > 0) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}t=${totalSeconds}s`;
    }
    return url;
  };

  const finalVideoUrl = getTimestampedUrl(citation.youtube_url, citation.timestamp_str);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="citation-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
          <div className="flex items-center gap-2 text-indigo-400">
            <Quote className="w-4 h-4" />
            <span id="citation-title" className="font-semibold text-xs tracking-wide uppercase">
              Podcast Source Attribution
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
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
            <div className="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-200 border border-zinc-700/50">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">{citation.guest}</span>
              </span>
              {citation.timestamp_str && (
                <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 font-mono text-[11px] border border-zinc-700/50">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  <span>{citation.timestamp_str}</span>
                </span>
              )}
              {citation.similarity_score !== undefined && (
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-emerald-950/40 text-emerald-300 border border-emerald-800/40">
                  Match Score: {(citation.similarity_score * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>

          {/* Verbatim Quote Excerpt */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
              Transcript Passage
            </span>
            <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 leading-relaxed italic whitespace-pre-wrap font-sans">
              "{citation.quote}"
            </div>
          </div>

          {/* YouTube Action */}
          {finalVideoUrl && (
            <div className="pt-2">
              <a
                href={finalVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600/15 hover:bg-red-600/25 text-red-400 hover:text-red-300 border border-red-500/30 rounded-xl text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              >
                <Video className="w-4 h-4" />
                <span>
                  Watch on YouTube {citation.timestamp_str ? `at ${citation.timestamp_str}` : ''}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
