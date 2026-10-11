export interface Citation {
  episode_slug: string;
  episode_title: string;
  guest: string;
  youtube_url?: string;
  timestamp_str?: string;
  quote: string;
  similarity_score?: number;
}

export interface ArtifactRef {
  id: string;
  title: string;
  artifact_type: 'html' | 'markdown' | string;
  content: string;
}

export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  provider?: string;
  model_name?: string;
  citations: Citation[];
  artifact?: ArtifactRef | null;
  created_at: string;
}

export interface Session {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: 'ollama' | 'anthropic' | 'openai';
  is_local: boolean;
  is_available: boolean;
  status_message?: string;
}

export interface ModelListResponse {
  active_provider: string;
  active_model: string;
  models: ModelInfo[];
}
