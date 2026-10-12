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
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FAF7F2] border border-[#ECE3D8] text-xs font-semibold text-[#1E141B] shadow-xs transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A53860]"
      >
        <span
          className={`w-2 h-2 rounded-full shrink-0 ${
            activeModel?.is_available ? 'bg-emerald-500 ring-2 ring-emerald-500/20' : 'bg-rose-500'
          }`}
        />

        {activeModel?.is_local ? (
          <Cpu className="w-3.5 h-3.5 text-[#670D2F]" />
        ) : (
          <Cloud className="w-3.5 h-3.5 text-[#8C163F]" />
        )}

        <span className="font-semibold truncate max-w-[190px] sm:max-w-[240px]">
          {getCleanLabel(activeModel)}
        </span>

        <ChevronDown
          className={`w-3.5 h-3.5 text-[#6C5B65] transition-transform duration-150 ${
            dropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {dropdownOpen && (
        <div
          role="listbox"
          aria-label="AI model providers"
          className="absolute right-0 mt-1.5 w-72 sm:w-80 bg-white border border-[#ECE3D8] rounded-2xl shadow-xl z-50 p-2 space-y-1 animate-in fade-in zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold text-[#670D2F] uppercase tracking-wider border-b border-[#ECE3D8]">
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
                className={`w-full flex items-start justify-between p-2.5 rounded-xl text-left text-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#A53860] ${
                  isSelected
                    ? 'bg-[#FAF7F2] text-[#670D2F] border border-[#670D2F]/20 font-semibold'
                    : 'hover:bg-[#FAF7F2] text-[#1E141B]'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2 font-medium">
                    {m.is_local ? (
                      <Cpu className="w-3.5 h-3.5 text-[#670D2F] shrink-0" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-[#8C163F] shrink-0" />
                    )}
                    <span className="text-[#1E141B] font-semibold">{getCleanLabel(m)}</span>
                  </div>

                  <div className="text-[11px] text-[#6C5B65]">
                    {m.status_message || (m.is_local ? 'Local Ollama service' : 'Cloud API endpoint')}
                  </div>

                  <div className="text-[10px] flex items-center gap-1 pt-0.5">
                    {m.is_available ? (
                      <span className="text-emerald-600 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {m.is_local ? 'Active & Ready (Local)' : 'Configured & Ready'}
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        API Key Required in .env
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-[#670D2F] shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
