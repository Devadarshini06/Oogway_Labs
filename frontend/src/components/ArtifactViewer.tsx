import React, { useState } from 'react';
import { X, Code, Eye, Copy, Check, ShieldCheck } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import type { ArtifactRef } from '../types';

interface ArtifactViewerProps {
  artifact: ArtifactRef | null;
  onClose: () => void;
}

export const ArtifactViewer: React.FC<ArtifactViewerProps> = ({ artifact, onClose }) => {
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
  const [copied, setCopied] = useState(false);

  if (!artifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(artifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHtml = artifact.artifact_type.toLowerCase() === 'html';

  return (
    <aside
      aria-label="Artifact inspector"
      className="w-full md:w-[480px] lg:w-[560px] h-full bg-white border-l border-[#ECE3D8] flex flex-col z-20 shrink-0 shadow-lg"
    >
      {/* Header */}
      <div className="p-3.5 border-b border-[#ECE3D8] flex items-center justify-between bg-[#FAF7F2]">
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-full bg-rose-50 text-[#8C163F] border border-rose-100 font-semibold">
            {artifact.artifact_type}
          </span>
          <h2 className="font-bold text-xs text-[#1E141B] truncate" title={artifact.title}>
            {artifact.title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* View mode toggle */}
          <div className="flex items-center bg-black/5 rounded-full p-0.5 border border-[#ECE3D8] text-xs">
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              aria-label="Preview rendered artifact"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C163F] ${
                viewMode === 'preview'
                  ? 'bg-white text-[#670D2F] font-semibold shadow-xs'
                  : 'text-[#6C5B65] hover:text-[#1E141B]'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('source')}
              aria-label="View artifact source code"
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C163F] ${
                viewMode === 'source'
                  ? 'bg-white text-[#670D2F] font-semibold shadow-xs'
                  : 'text-[#6C5B65] hover:text-[#1E141B]'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Source</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy artifact content"
            title="Copy code"
            className="p-1.5 hover:bg-black/5 text-[#6C5B65] hover:text-[#1E141B] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C163F]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close artifact viewer"
            title="Close viewer"
            className="p-1.5 hover:bg-black/5 text-[#6C5B65] hover:text-[#1E141B] rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C163F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Banner for HTML */}
      {isHtml && (
        <div className="px-3.5 py-1.5 bg-emerald-50 border-b border-emerald-200 flex items-center justify-between text-[11px] text-emerald-700">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sandboxed Iframe Execution (Null Origin Isolated)</span>
          </span>
          <span className="text-[10px] text-[#6C5B65] font-mono">sandbox="allow-scripts"</span>
        </div>
      )}

      {/* Content Canvas */}
      <div className="flex-1 overflow-auto bg-[#FAF7F2] p-4">
        {viewMode === 'preview' ? (
          isHtml ? (
            <div className="w-full h-full min-h-[500px] rounded-2xl overflow-hidden border border-[#ECE3D8] bg-white shadow-xs">
              <iframe
                title={artifact.title}
                sandbox="allow-scripts"
                srcDoc={artifact.content}
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-[#1E141B] prose-headings:text-[#1E141B] prose-p:text-[#382B33] prose-strong:text-[#1E141B] prose-ul:text-[#382B33]">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {artifact.content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          <pre className="font-mono text-xs text-white whitespace-pre-wrap break-all p-3.5 bg-[#2A0313] rounded-xl border border-[#4A0A24]">
            <code>{artifact.content}</code>
          </pre>
        )}
      </div>
    </aside>
  );
};
