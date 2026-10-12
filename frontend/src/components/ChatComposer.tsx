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
    <div className="w-full max-w-3xl mx-auto p-4 space-y-2">
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
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-amber-50/60 border border-[#E5E7EB] hover:border-amber-300 text-[#171923] shadow-xs transition-all cursor-pointer text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 disabled:opacity-50"
        >
          <Feather className="w-3 h-3 text-amber-600" />
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
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white hover:bg-emerald-50/60 border border-[#E5E7EB] hover:border-emerald-300 text-[#171923] shadow-xs transition-all cursor-pointer text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 disabled:opacity-50"
        >
          <LayoutDashboard className="w-3 h-3 text-emerald-600" />
          <span>Generate HTML Artifact</span>
        </button>
      </div>

      {/* Input box */}
      <form
        onSubmit={(e) => handleSubmit(e)}
        className="relative bg-white border border-[#E5E7EB] focus-within:border-[#4F46E5] focus-within:ring-2 focus-within:ring-indigo-100 rounded-2xl p-2 shadow-sm transition-all"
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
          className="w-full bg-transparent text-[#171923] placeholder-[#6B7280] text-sm px-2.5 py-1.5 resize-none outline-none focus:ring-0 max-h-40 overflow-y-auto leading-relaxed"
        />

        <div className="flex items-center justify-between pt-1.5 px-2 text-[11px] text-[#6B7280] border-t border-[#E5E7EB]">
          <span className="hidden sm:inline">Press Enter to send, Shift+Enter for new line</span>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            aria-label="Send message"
            className={`flex items-center justify-center p-2 rounded-xl transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              input.trim() && !isLoading
                ? 'bg-[#4F46E5] hover:bg-[#4338CA] text-white shadow-xs'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
};
