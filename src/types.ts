/**
 * LLM Model Registry Types
 *
 * Type definitions for the model registry - capturing ALL data from OpenRouter's API.
 * Context limits, pricing, capabilities, supported parameters, and provider information.
 */

// ============================================================================
// OpenRouter API Response Types (Raw)
// ============================================================================

/**
 * Raw model data from OpenRouter's /api/v1/models endpoint
 * This captures EVERYTHING they expose
 */
export interface OpenRouterModel {
  id: string;
  canonical_slug?: string;
  name: string;
  description?: string;
  created?: number;
  context_length: number;
  max_completion_tokens?: number;
  hugging_face_id?: string;

  architecture?: {
    modality: string;
    input_modalities?: string[];
    output_modalities?: string[];
    tokenizer: string;
    instruct_type?: string | null;
  };

  pricing: {
    prompt: string;
    completion: string;
    request?: string;
    image?: string;
    web_search?: string;
    internal_reasoning?: string;
    input_cache_read?: string;
    input_cache_write?: string;
  };

  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };

  per_request_limits?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  } | null;

  supported_parameters?: string[];

  default_parameters?: {
    temperature?: number | null;
    top_p?: number | null;
    frequency_penalty?: number | null;
    presence_penalty?: number | null;
    top_k?: number | null;
  };
}

export interface OpenRouterModelsResponse {
  data: OpenRouterModel[];
}

// ============================================================================
// Parsed & Enhanced Model Types
// ============================================================================

/**
 * Provider information extracted from model ID
 */
export interface ModelProvider {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

/**
 * Parsed pricing - all values converted to per-million tokens for easy math
 */
export interface ModelPricing {
  // Core pricing (per million tokens)
  promptPerMillion: number;
  completionPerMillion: number;
  isFree: boolean;

  // Additional costs
  imagePerImage?: number;
  requestCost?: number;
  webSearchCost?: number;
  reasoningPerMillion?: number;

  // Cache pricing (per million tokens)
  cacheReadPerMillion?: number;
  cacheWritePerMillion?: number;
}

/**
 * Input/output modalities supported by the model
 */
export type InputModality = 'text' | 'image' | 'audio' | 'video' | 'file';
export type OutputModality = 'text' | 'image' | 'audio';

/**
 * Model capabilities and features - comprehensive
 */
export interface ModelCapabilities {
  // Input/output modalities
  inputModalities: InputModality[];
  outputModalities: OutputModality[];
  modalityString: string; // Raw "text+image->text" string

  // Feature support (derived from supported_parameters)
  supportsTools: boolean;
  supportsReasoning: boolean;
  supportsStructuredOutput: boolean;
  supportsJsonMode: boolean;
  supportsStreaming: boolean;
  supportsTemperature: boolean;
  supportsTopP: boolean;
  supportsTopK: boolean;
  supportsFrequencyPenalty: boolean;
  supportsPresencePenalty: boolean;
  supportsStopSequences: boolean;
  supportsWebSearch: boolean;

  // Content moderation
  isModerated: boolean;

  // Legacy compat
  supportsImages: boolean;
  modality: 'text' | 'text+image' | 'multimodal';
  instructType?: string;
}

/**
 * Supported API parameters for this model
 */
export type SupportedParameter =
  | 'include_reasoning'
  | 'max_tokens'
  | 'reasoning'
  | 'response_format'
  | 'seed'
  | 'stop'
  | 'structured_outputs'
  | 'temperature'
  | 'tool_choice'
  | 'tools'
  | 'top_k'
  | 'top_p'
  | 'frequency_penalty'
  | 'presence_penalty'
  | 'verbosity'
  | string; // Allow unknown params

/**
 * Default parameter values for this model
 */
export interface ModelDefaults {
  temperature?: number | null;
  topP?: number | null;
  topK?: number | null;
  frequencyPenalty?: number | null;
  presencePenalty?: number | null;
}

/**
 * Per-request token limits
 */
export interface RequestLimits {
  promptTokens?: number;
  completionTokens?: number;
}

/**
 * Size tier classification for quick filtering
 */
export type ModelSizeTier =
  | 'tiny'      // < 8K context
  | 'small'     // 8K - 32K
  | 'medium'    // 32K - 128K
  | 'large'     // 128K - 500K
  | 'massive';  // 500K+

/**
 * The main model type - ALL fields from OpenRouter, parsed and typed
 */
export interface LLMModel {
  // === Identification ===
  id: string;                          // "anthropic/claude-opus-4.5"
  slug: string;                        // "claude-opus-4.5"
  canonicalSlug?: string;              // "anthropic/claude-4.5-opus-20251124"
  name: string;                        // "Anthropic: Claude Opus 4.5"
  description?: string;
  huggingFaceId?: string;              // Link to HF if open-source

  // === Provider ===
  provider: ModelProvider;

  // === Context & Tokens ===
  contextLength: number;               // Total context window
  maxCompletionTokens: number;         // Max output tokens
  sizeTier: ModelSizeTier;             // Quick categorization

  // === Pricing ===
  pricing: ModelPricing;

  // === Capabilities ===
  capabilities: ModelCapabilities;

  // === Supported Parameters ===
  supportedParameters: SupportedParameter[];
  defaults: ModelDefaults;
  requestLimits?: RequestLimits;

  // === Metadata ===
  tokenizer?: string;
  createdAt?: string;                  // ISO date when model was added
  updatedAt: string;                   // ISO date when we fetched this
}

// ============================================================================
// Registry Types
// ============================================================================

/**
 * Cache metadata for the model registry
 */
export interface RegistryMetadata {
  version: number;
  fetchedAt: string;
  expiresAt: string;
  modelCount: number;
  providerCount: number;
  source: 'api' | 'snapshot' | 'fallback';
}

/**
 * The complete model registry
 */
export interface ModelRegistry {
  metadata: RegistryMetadata;
  models: LLMModel[];
  byId: Record<string, LLMModel>;
  byProvider: Record<string, LLMModel[]>;
  byTier: Record<ModelSizeTier, LLMModel[]>;
}

/**
 * Filter options for querying models
 */
export interface ModelQueryOptions {
  provider?: string | string[];
  minContext?: number;
  maxContext?: number;
  tier?: ModelSizeTier | ModelSizeTier[];
  isFree?: boolean;

  // Capability filters
  supportsImages?: boolean;
  supportsTools?: boolean;
  supportsReasoning?: boolean;
  supportsStructuredOutput?: boolean;
  inputModality?: InputModality | InputModality[];

  search?: string;
  sortBy?: 'context' | 'price' | 'name' | 'provider';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
}

// ============================================================================
// Provider Constants
// ============================================================================

export const KNOWN_PROVIDERS: Record<string, Omit<ModelProvider, 'id'>> = {
  'anthropic': {
    name: 'Anthropic',
    color: '#D4A574',
    icon: '🎭',
  },
  'openai': {
    name: 'OpenAI',
    color: '#10A37F',
    icon: '🤖',
  },
  'google': {
    name: 'Google',
    color: '#4285F4',
    icon: '✨',
  },
  'meta-llama': {
    name: 'Meta',
    color: '#0668E1',
    icon: '🦙',
  },
  'mistralai': {
    name: 'Mistral',
    color: '#FF7000',
    icon: '🌬️',
  },
  'cohere': {
    name: 'Cohere',
    color: '#D18EE2',
    icon: '🔮',
  },
  'deepseek': {
    name: 'DeepSeek',
    color: '#4D6BFE',
    icon: '🔍',
  },
  'x-ai': {
    name: 'xAI',
    color: '#000000',
    icon: '🅧',
  },
  'qwen': {
    name: 'Qwen',
    color: '#615EFF',
    icon: '🌸',
  },
  'microsoft': {
    name: 'Microsoft',
    color: '#00A4EF',
    icon: '🪟',
  },
  'perplexity': {
    name: 'Perplexity',
    color: '#20808D',
    icon: '🔎',
  },
  'nous': {
    name: 'Nous Research',
    color: '#8B5CF6',
    icon: '🧠',
  },
  'nousresearch': {
    name: 'Nous Research',
    color: '#8B5CF6',
    icon: '🧠',
  },
  '01-ai': {
    name: '01.AI',
    color: '#FF6B6B',
    icon: '🎯',
  },
  'thudm': {
    name: 'Zhipu AI',
    color: '#00D4AA',
    icon: '🐲',
  },
  'nvidia': {
    name: 'NVIDIA',
    color: '#76B900',
    icon: '🟢',
  },
  'amazon': {
    name: 'Amazon',
    color: '#FF9900',
    icon: '📦',
  },
  'ai21': {
    name: 'AI21 Labs',
    color: '#6366F1',
    icon: '🔬',
  },
  'databricks': {
    name: 'Databricks',
    color: '#FF3621',
    icon: '🧱',
  },
  'inflection': {
    name: 'Inflection',
    color: '#7C3AED',
    icon: '💜',
  },
};

export const UNKNOWN_PROVIDER: Omit<ModelProvider, 'id'> = {
  name: 'Unknown',
  color: '#6B7280',
  icon: '❓',
};
