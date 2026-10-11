import React, { useState } from 'react';
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

  const activeModel = models.find((m) => m.provider === selectedProvider) || models[0];

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-medium text-zinc-200 transition-colors cursor-pointer"
      >
        {activeModel?.is_local ? (
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Cpu className="w-3.5 h-3.5" />
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-indigo-400">
            <Cloud className="w-3.5 h-3.5" />
          </span>
        )}
        <span className="truncate max-w-[150px]">{activeModel?.name || selectedProvider}</span>
        <ChevronDown className="w-3 h-3 text-zinc-400" />
      </button>

      {dropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setDropdownOpen(false)}
          />
          <div className="absolute right-0 mt-1.5 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 p-1.5 space-y-1">
            <div className="px-2.5 py-1 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
              Select Model Provider
            </div>
            {models.map((m) => {
              const isSelected = m.provider === selectedProvider;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    onSelectProvider(m.provider);
                    setDropdownOpen(false);
                  }}
                  className={`w-full flex items-start justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/20'
                      : 'hover:bg-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 font-medium">
                      {m.is_local ? (
                        <Cpu className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : (
                        <Cloud className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      )}
                      <span>{m.name}</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                      {m.is_available ? (
                        <span className="text-emerald-400">Ready</span>
                      ) : (
                        <span className="text-amber-400 flex items-center gap-0.5">
                          <AlertCircle className="w-2.5 h-2.5" />
                          Key missing / Offline
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};
