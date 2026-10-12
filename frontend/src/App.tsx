import React, { useState, useEffect } from 'react';
import { Menu, Layers, AlertCircle, RefreshCw } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { ModelSelector } from './components/ModelSelector';
import { ChatArea } from './components/ChatArea';
import { ChatComposer } from './components/ChatComposer';
import { ArtifactViewer } from './components/ArtifactViewer';
import { CitationModal } from './components/CitationModal';
import { api, ApiError } from './services/api';
import type { Session, Message, ModelInfo, Citation, ArtifactRef } from './types';

export const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('ollama');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [errorBanner, setErrorBanner] = useState<{ message: string; hint?: string } | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<{
    prompt: string;
    ship30?: boolean;
    artifact?: boolean;
  } | null>(null);

  // Panels & Modals
  const [activeArtifact, setActiveArtifact] = useState<ArtifactRef | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);

  // Load initial sessions, models, and real database status
  useEffect(() => {
    loadSessions();
    loadModels();
    checkReadiness();
  }, []);

  // When active session changes, load messages
  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    } else {
      setMessages([]);
      setActiveArtifact(null);
    }
  }, [activeSessionId]);

  const checkReadiness = async () => {
    try {
      const ready = await api.getReady();
      setDbConnected(ready.database?.connected ?? true);
    } catch {
      setDbConnected(false);
    }
  };

  const loadSessions = async () => {
    try {
      const data = await api.getSessions();
      setSessions(data);
      if (data.length > 0 && !activeSessionId) {
        setActiveSessionId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load sessions:', e);
    }
  };

  const loadModels = async () => {
    try {
      const data = await api.getModels();
      setModels(data.models);
      if (data.active_provider) {
        setSelectedProvider(data.active_provider);
      }
    } catch (e) {
      console.error('Failed to load models:', e);
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      const msgs = await api.getSessionMessages(sessionId);
      setMessages(msgs);

      // Check if any message in session has an artifact to display
      for (const m of msgs.slice().reverse()) {
        if (m.artifact) {
          setActiveArtifact(m.artifact);
          break;
        }
      }
    } catch (e) {
      console.error(`Failed to load messages for ${sessionId}:`, e);
    }
  };

  const handleNewChat = async () => {
    try {
      const newSession = await api.createSession();
      setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setActiveArtifact(null);
      setErrorBanner(null);
      setLastFailedPrompt(null);
      setSidebarOpenMobile(false);
    } catch (e) {
      console.error('Failed to create new session:', e);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await api.deleteSession(sessionId);
      const remaining = sessions.filter((s) => s.id !== sessionId);
      setSessions(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (e) {
      console.error('Failed to delete session:', e);
    }
  };

  const handleSendMessage = async (
    prompt: string,
    triggerShip30 = false,
    triggerArtifact = false
  ) => {
    setErrorBanner(null);
    setLastFailedPrompt(null);
    setIsLoading(true);

    const activeModel = models.find((m) => m.provider === selectedProvider);

    // Optimistic user message
    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      session_id: activeSessionId || '',
      role: 'user',
      content: prompt,
      citations: [],
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await api.sendMessage({
        session_id: activeSessionId || undefined,
        message: prompt,
        provider: selectedProvider,
        model: activeModel?.id,
        trigger_ship30: triggerShip30,
        trigger_artifact: triggerArtifact,
      });

      // If a new session was created on backend, register it in state
      if (!activeSessionId || activeSessionId !== res.session_id) {
        setActiveSessionId(res.session_id);
        loadSessions();
      }

      // Assistant message
      const assistantMsg: Message = {
        id: res.message_id,
        session_id: res.session_id,
        role: 'assistant',
        content: res.content,
        provider: res.provider,
        model_name: res.model_name,
        citations: res.citations,
        artifact: res.artifact,
        created_at: res.created_at,
      };

      setMessages((prev) => {
        const withoutTemp = prev.filter((m) => !m.id.startsWith('temp-'));
        return [...withoutTemp, tempUserMsg, assistantMsg];
      });

      // If an artifact was produced, automatically open it
      if (res.artifact) {
        setActiveArtifact(res.artifact);
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      // Remove optimistic message if error
      setMessages((prev) => prev.filter((m) => !m.id.startsWith('temp-')));
      setLastFailedPrompt({ prompt, ship30: triggerShip30, artifact: triggerArtifact });

      if (err instanceof ApiError && err.detail) {
        const detail = err.detail;
        setErrorBanner({
          message: detail.message || 'Error communicating with model provider.',
          hint: detail.hint,
        });
      } else {
        setErrorBanner({
          message: err.message || 'An unexpected error occurred while processing your request.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans">
      {/* Left Sidebar */}
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(id) => {
          setActiveSessionId(id);
          setSidebarOpenMobile(false);
        }}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        activeProvider={selectedProvider}
        activeModel={
          selectedProvider === 'ollama'
            ? 'qwen2.5:0.5b'
            : selectedProvider === 'anthropic'
            ? 'claude-3-5-sonnet'
            : 'gpt-4o-mini'
        }
        isOpen={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
        dbConnected={dbConnected}
      />

      {/* Main Chat Center Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        {/* Top Navbar */}
        <header className="h-14 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-zinc-950/70 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpenMobile(true)}
              aria-label="Open sidebar menu"
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 md:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-xs font-semibold text-zinc-300 truncate max-w-[200px] sm:max-w-xs">
              {sessions.find((s) => s.id === activeSessionId)?.title || 'New Conversation'}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Artifact Viewer Toggle */}
            {activeArtifact && (
              <button
                onClick={() => setActiveArtifact(null)}
                aria-label="Close artifact viewer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/30 text-indigo-300 text-xs font-medium cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Close Artifact</span>
              </button>
            )}

            {/* Model Provider Selector */}
            <ModelSelector
              models={models}
              selectedProvider={selectedProvider}
              onSelectProvider={setSelectedProvider}
            />
          </div>
        </header>

        {/* Error Banner with Retry */}
        {errorBanner && (
          <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/50 flex items-start gap-3 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold">{errorBanner.message}</p>
              {errorBanner.hint && <p className="text-[11px] text-red-400/90">{errorBanner.hint}</p>}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {lastFailedPrompt && (
                <button
                  type="button"
                  onClick={() => {
                    const p = lastFailedPrompt;
                    setLastFailedPrompt(null);
                    setErrorBanner(null);
                    handleSendMessage(p.prompt, p.ship30, p.artifact);
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-red-900/60 hover:bg-red-800/80 text-red-200 text-xs font-medium transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setErrorBanner(null);
                  setLastFailedPrompt(null);
                }}
                className="text-red-400 hover:text-red-200 text-xs font-medium cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Message Feed Canvas */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          onSelectSuggested={(prompt, ship30, artifact) =>
            handleSendMessage(prompt, ship30, artifact)
          }
          onInspectCitation={setSelectedCitation}
          onOpenArtifact={setActiveArtifact}
          activeProvider={selectedProvider}
          activeModel={models.find((m) => m.provider === selectedProvider)?.name}
        />

        {/* Composer */}
        <footer className="border-t border-zinc-800/80 bg-zinc-950/80 shrink-0">
          <ChatComposer onSendMessage={handleSendMessage} isLoading={isLoading} />
        </footer>
      </main>

      {/* Right Beside-Chat Artifact Viewer */}
      {activeArtifact && (
        <ArtifactViewer
          artifact={activeArtifact}
          onClose={() => setActiveArtifact(null)}
        />
      )}

      {/* Source Citation Modal */}
      <CitationModal
        citation={selectedCitation}
        onClose={() => setSelectedCitation(null)}
      />
    </div>
  );
};

export default App;
