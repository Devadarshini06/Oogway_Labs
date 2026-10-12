import React, { useState, useRef, useEffect } from 'react';
import { Send, Feather, LayoutDashboard } from 'lucide-react';

interface ChatComposerProps {
  onSendMessage: (message: string, triggerShip30?: boolean, triggerArtifact?: boolean) => void;
  isLoading: boolean;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({ onSendMessage, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e?: React.FormEvent, ship30 = false, artifact = false) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    onSendMessage(input.trim(), ship30, artifact);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-5 space-y-2.5">
      {/* Quick Skill Action Buttons */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            const prompt = input.trim() || 'Turn podcast insights on Product-Led Growth into a Ship 30 for 30 essay.';
            onSendMessage(prompt, true, false);
            setInput('');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#ECE3D8] hover:border-[#670D2F]/50 text-[#1E141B] shadow-xs transition-all cursor-pointer text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#670D2F] disabled:opacity-50"
        >
          <Feather className="w-3.5 h-3.5 text-[#670D2F]" />
          <span>Generate Ship 30 Essay</span>
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={() => {
            const prompt = input.trim() || 'Create an HTML dashboard explaining the user retention loop.';
            onSendMessage(prompt, false, true);
            setInput('');
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#ECE3D8] hover:border-[#670D2F]/50 text-[#1E141B] shadow-xs transition-all cursor-pointer text-[11px] font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#670D2F] disabled:opacity-50"
        >
          <LayoutDashboard className="w-3.5 h-3.5 text-[#670D2F]" />
          <span>Generate HTML Artifact</span>
        </button>
      </div>

      {/* Floating Curved Input Card */}
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="relative bg-white border border-[#ECE3D8] focus-within:border-[#8C163F] focus-within:ring-2 focus-within:ring-[#8C163F]/15 rounded-2xl p-3 shadow-md shadow-[#2A0313]/4 transition-all"
      >
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          rows={1}
          aria-label="Type your product or growth question"
          placeholder="Ask a growth or product question from Lenny's Podcast..."
          className="w-full bg-transparent text-[#1E141B] placeholder-[#8A7B84] text-sm px-2 py-1 resize-none outline-none focus:ring-0 max-h-40 overflow-y-auto leading-relaxed"
        />

        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-[#8A7B84]">
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C163F] ${
              input.trim() && !isLoading
                ? 'bg-[#670D2F] hover:bg-[#4A0A23] text-white shadow-md active:scale-95'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
