import React, { useState, useEffect } from 'react';
import { Menu, Layers, AlertCircle } from 'lucide-react';
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
  const [errorBanner, setErrorBanner] = useState<{ message: string; hint?: string } | null>(null);

  // Panels & Modals
  const [activeArtifact, setActiveArtifact] = useState<ArtifactRef | null>(null);
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState<boolean>(false);

  // Load initial sessions & models
  useEffect(() => {
    loadSessions();
    loadModels();
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
      setSelectedProvider(data.active_provider);
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
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setActiveArtifact(null);
      setErrorBanner(null);
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
    setIsLoading(true);

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

      if (err instanceof ApiError && err.detail) {
        const detail = err.detail;
        setErrorBanner({
          message: detail.message || 'Error communicating with model provider.',
          hint: detail.hint,
        });
      } else {
        setErrorBanner({
          message: err.message || 'An unexpected error occurred.',
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
        activeModel={models.find((m) => m.provider === selectedProvider)?.name || selectedProvider}
        isOpen={sidebarOpenMobile}
        onCloseMobile={() => setSidebarOpenMobile(false)}
      />

      {/* Main Chat Center Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-950">
        {/* Top Navbar */}
        <header className="h-14 border-b border-zinc-800/80 px-4 flex items-center justify-between bg-zinc-950/70 backdrop-blur-xs shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpenMobile(true)}
              className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 md:hidden cursor-pointer"
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
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-600/15 border border-indigo-500/20 text-indigo-300 text-xs font-medium cursor-pointer"
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

        {/* Error Banner */}
        {errorBanner && (
          <div className="px-4 py-2.5 bg-red-950/40 border-b border-red-900/50 flex items-start gap-3 text-xs text-red-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-0.5">
              <p className="font-semibold">{errorBanner.message}</p>
              {errorBanner.hint && <p className="text-[11px] text-red-400/90">{errorBanner.hint}</p>}
            </div>
            <button
              onClick={() => setErrorBanner(null)}
              className="text-red-400 hover:text-red-200 text-xs font-medium cursor-pointer"
            >
              Dismiss
            </button>
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
