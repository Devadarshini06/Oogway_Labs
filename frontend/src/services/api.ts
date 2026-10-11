import type { Session, Message, ModelListResponse, ArtifactRef } from '../types';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  detail: any;
  status: number;

  constructor(status: number, detail: any) {
    const msg = typeof detail === 'string' ? detail : (detail?.message || JSON.stringify(detail));
    super(msg);
    this.status = status;
    this.detail = detail;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    let errorData: any;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new ApiError(response.status, errorData.detail || errorData);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; version: string }>('/health'),
  getReady: () => request<{ status: string; database: { connected: boolean }; models: any[] }>('/ready'),

  // Sessions
  getSessions: async (): Promise<Session[]> => {
    const data = await request<{ sessions: Session[]; total: number }>('/sessions');
    return data.sessions;
  },
  createSession: (title?: string): Promise<Session> =>
    request<Session>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ title: title || 'New Conversation' }),
    }),
  getSession: (sessionId: string): Promise<Session> =>
    request<Session>(`/sessions/${sessionId}`),
  getSessionMessages: async (sessionId: string): Promise<Message[]> => {
    const data = await request<{ session_id: string; messages: Message[] }>(`/sessions/${sessionId}/messages`);
    return data.messages;
  },
  deleteSession: (sessionId: string): Promise<void> =>
    request<void>(`/sessions/${sessionId}`, { method: 'DELETE' }),

  // Chat
  sendMessage: (payload: {
    session_id?: string;
    message: string;
    provider?: string;
    model?: string;
    enable_rag?: boolean;
    trigger_ship30?: boolean;
    trigger_artifact?: boolean;
  }): Promise<{
    session_id: string;
    message_id: string;
    content: string;
    provider: string;
    model_name: string;
    citations: any[];
    artifact?: ArtifactRef | null;
    created_at: string;
  }> =>
    request('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Models
  getModels: (): Promise<ModelListResponse> => request<ModelListResponse>('/models'),

  // Artifacts
  getArtifact: (artifactId: string): Promise<ArtifactRef> =>
    request<ArtifactRef>(`/artifacts/${artifactId}`),
  getSessionArtifacts: (sessionId: string): Promise<ArtifactRef[]> =>
    request<ArtifactRef[]>(`/artifacts/session/${sessionId}`),

  // Knowledge
  ingestKnowledge: (maxEpisodes = 15, force = false) =>
    request('/knowledge/ingest', {
      method: 'POST',
      body: JSON.stringify({ max_episodes: maxEpisodes, force_reindex: force }),
    }),
  getKnowledgeStats: () => request<{ indexed_episodes_count: number; indexed_chunks_count: number; sample_guests: string[] }>('/knowledge/stats'),
};
