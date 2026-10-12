import React, { useState, useRef, useEffect } from 'react';
import { Cpu, Cloud, ChevronDown, Check, AlertCircle } from 'lucide-react';
import type { ModelInfo } from '../types';

interface ModelSelectorProps {
  models: ModelInfo[];
  selectedProvider: string;
  onSelectProvider: (provider: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  selectedProvider,
  onSelectProvider,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [dropdownOpen]);

  const activeModel = models.find((m) => m.provider === selectedProvider) || models[0];

  const getCleanLabel = (m?: ModelInfo) => {
    if (!m) return selectedProvider;
    if (m.provider === 'ollama') return 'Ollama (qwen2.5:0.5b)';
    if (m.provider === 'anthropic') return 'Claude (3.5 Sonnet)';
    if (m.provider === 'openai') return 'OpenAI (gpt-4o-mini)';
    return m.name;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setDropdownOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
        aria-label="Select AI model provider"
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-gray-50 border border-[#E5E7EB] text-xs font-medium text-[#171923] shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        {activeModel?.is_local ? (
          <span className="flex items-center gap-1.5 text-[#059669] shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeModel.is_available ? 'bg-[#059669] animate-pulse' : 'bg-[#DC2626]'
              }`}
            />
            <Cpu className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-[#4F46E5] shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                activeModel?.is_available ? 'bg-[#059669]' : 'bg-[#D97706]'
              }`}
            />
            <Cloud className="w-3.5 h-3.5" />
          </span>
        )}

        <span className="font-medium truncate max-w-[190px] sm:max-w-[240px]">
          {getCleanLabel(activeModel)}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6B7280] transition-transform duration-150 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdownOpen && (
        <div
          role="listbox"
          aria-label="AI model providers"
          className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white border border-[#E5E7EB] rounded-xl shadow-xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider border-b border-[#E5E7EB]">
            Available Model Providers
          </div>

          {models.map((m) => {
            const isSelected = m.provider === selectedProvider;
            return (
              <button
                key={m.id}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onSelectProvider(m.provider);
                  setDropdownOpen(false);
                }}
                className={`w-full flex items-start justify-between p-2.5 rounded-lg text-left text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-400 ${
                  isSelected
                    ? 'bg-[#EEF2FF] text-[#4F46E5] border border-indigo-200'
                    : 'hover:bg-gray-50 text-[#171923]'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2 font-medium">
                    {m.is_local ? (
                      <Cpu className="w-3.5 h-3.5 text-[#059669] shrink-0" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-[#4F46E5] shrink-0" />
                    )}
                    <span className="text-[#171923] font-semibold">{getCleanLabel(m)}</span>
                  </div>

                  <div className="text-[11px] text-[#6B7280]">
                    {m.status_message || (m.is_local ? 'Local Ollama service' : 'Cloud API endpoint')}
                  </div>

                  <div className="text-[10px] flex items-center gap-1 pt-0.5">
                    {m.is_available ? (
                      <span className="text-[#059669] font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#059669]" />
                        {m.is_local ? 'Active & Ready (Local)' : 'Configured & Ready'}
                      </span>
                    ) : (
                      <span className="text-[#D97706] flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        API Key Required in .env
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[#4F46E5] shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
