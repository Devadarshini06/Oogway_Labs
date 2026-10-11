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
    <aside className="w-full md:w-[480px] lg:w-[560px] h-full bg-zinc-900 border-l border-zinc-800 flex flex-col z-20 shrink-0">
      {/* Header */}
      <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/60">
        <div className="flex items-center gap-2 overflow-hidden mr-2">
          <span className="text-xs font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
            {artifact.artifact_type}
          </span>
          <h2 className="font-semibold text-xs text-zinc-100 truncate" title={artifact.title}>
            {artifact.title}
          </h2>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* View mode toggle */}
          <div className="flex items-center bg-zinc-800 rounded-lg p-0.5 border border-zinc-700/60 text-xs">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'preview'
                  ? 'bg-zinc-700 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              onClick={() => setViewMode('source')}
              className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors cursor-pointer ${
                viewMode === 'source'
                  ? 'bg-zinc-700 text-white font-medium'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Code className="w-3 h-3" />
              <span>Source</span>
            </button>
          </div>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            title="Copy code"
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            title="Close viewer"
            className="p-1.5 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Security Banner for HTML */}
      {isHtml && (
        <div className="px-3.5 py-1.5 bg-emerald-950/30 border-b border-emerald-900/30 flex items-center justify-between text-[11px] text-emerald-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sandboxed Iframe Execution (Null Origin Isolated)</span>
          </span>
          <span className="text-[10px] text-zinc-400 font-mono">sandbox="allow-scripts"</span>
        </div>
      )}

      {/* Content Canvas */}
      <div className="flex-1 overflow-auto bg-zinc-950 p-4">
        {viewMode === 'preview' ? (
          isHtml ? (
            <div className="w-full h-full min-h-[500px] rounded-lg overflow-hidden border border-zinc-800 bg-white">
              <iframe
                title={artifact.title}
                sandbox="allow-scripts"
                srcDoc={artifact.content}
                className="w-full h-full border-none"
              />
            </div>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-strong:text-zinc-100 prose-ul:text-zinc-300">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>
                {artifact.content}
              </ReactMarkdown>
            </div>
          )
        ) : (
          <pre className="font-mono text-xs text-zinc-300 whitespace-pre-wrap break-all p-3 bg-zinc-900 rounded-lg border border-zinc-800">
            <code>{artifact.content}</code>
          </pre>
        )}
      </div>
    </aside>
  );
};
