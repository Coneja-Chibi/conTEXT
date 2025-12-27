/**
 * LLM Model Registry Types
 *
 * Type definitions for the model registry - context limits, pricing,
 * capabilities, and provider information.
 */

// ============================================================================
// OpenRouter API Response Types
// ============================================================================

/**
 * Raw model data from OpenRouter's /api/v1/models endpoint
 */
export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  context_length: number;
  max_completion_tokens?: number;
  pricing: {
    prompt: string;
    completion: string;
    image?: string;
    request?: string;
  };
  top_provider?: {
    context_length?: number;
    max_completion_tokens?: number;
    is_moderated?: boolean;
  };
  architecture?: {
    modality: string;
    tokenizer: string;
    instruct_type?: string | null;
  };
  per_request_limits?: {
    prompt_tokens?: number;
    completion_tokens?: number;
  } | null;
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
 * Parsed pricing in more usable format
 */
export interface ModelPricing {
  promptPerMillion: number;
  completionPerMillion: number;
  imagePerImage?: number;
  isFree: boolean;
}

/**
 * Model capabilities and features
 */
export interface ModelCapabilities {
  supportsImages: boolean;
  supportsTools: boolean;
  supportsStreaming: boolean;
  isModerated: boolean;
  modality: 'text' | 'text+image' | 'multimodal';
  instructType?: string;
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
 * The main model type used throughout the library
 */
export interface LLMModel {
  id: string;
  slug: string;
  name: string;
  description?: string;
  provider: ModelProvider;
  contextLength: number;
  maxCompletionTokens: number;
  sizeTier: ModelSizeTier;
  pricing: ModelPricing;
  capabilities: ModelCapabilities;
  tokenizer?: string;
  updatedAt: string;
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
  supportsImages?: boolean;
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
};

export const UNKNOWN_PROVIDER: Omit<ModelProvider, 'id'> = {
  name: 'Unknown',
  color: '#6B7280',
  icon: '❓',
};
