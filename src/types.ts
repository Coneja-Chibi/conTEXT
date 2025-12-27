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
// Provider Branding
// ============================================================================

/**
 * Provider branding with lobe-icons
 * @see https://lobehub.com/icons for icon gallery
 * Icon format: 'lobe-icons:{name}' or 'lobe-icons:{name}-color'
 */
export const KNOWN_PROVIDERS: Record<string, Omit<ModelProvider, 'id'>> = {
  // === Tier 1: Major AI Labs ===
  'anthropic':    { name: 'Anthropic',      color: '#D4A574', icon: 'lobe-icons:anthropic' },
  'openai':       { name: 'OpenAI',         color: '#10A37F', icon: 'lobe-icons:openai' },
  'google':       { name: 'Google',         color: '#4285F4', icon: 'lobe-icons:google-color' },
  'meta-llama':   { name: 'Meta',           color: '#0668E1', icon: 'lobe-icons:meta-color' },
  'mistralai':    { name: 'Mistral',        color: '#FF7000', icon: 'lobe-icons:mistral-color' },
  'x-ai':         { name: 'xAI',            color: '#1DA1F2', icon: 'lobe-icons:xai' },

  // === Tier 2: Major Players ===
  'deepseek':     { name: 'DeepSeek',       color: '#4D6BFE', icon: 'lobe-icons:deepseek-color' },
  'cohere':       { name: 'Cohere',         color: '#D18EE2', icon: 'lobe-icons:cohere-color' },
  'qwen':         { name: 'Qwen',           color: '#615EFF', icon: 'lobe-icons:qwen-color' },
  'alibaba':      { name: 'Alibaba',        color: '#FF6A00', icon: 'lobe-icons:alibaba-color' },
  'microsoft':    { name: 'Microsoft',      color: '#00A4EF', icon: 'lobe-icons:azure-color' },
  'perplexity':   { name: 'Perplexity',     color: '#20808D', icon: 'lobe-icons:perplexity-color' },
  'nvidia':       { name: 'NVIDIA',         color: '#76B900', icon: 'lobe-icons:nvidia-color' },

  // === Research Labs ===
  'nous':         { name: 'Nous Research',  color: '#8B5CF6', icon: 'lobe-icons:nousresearch' },
  'nousresearch': { name: 'Nous Research',  color: '#8B5CF6', icon: 'lobe-icons:nousresearch' },
  'ai21':         { name: 'AI21 Labs',      color: '#6366F1', icon: 'lobe-icons:ai21-brand-color' },
  'thudm':        { name: 'Zhipu AI',       color: '#00D4AA', icon: 'lobe-icons:zhipu-color' },
  '01-ai':        { name: '01.AI',          color: '#FF6B6B', icon: 'lobe-icons:yi-color' },
  'inflection':   { name: 'Inflection',     color: '#7C3AED', icon: 'lobe-icons:inflection' },

  // === Cloud Providers ===
  'amazon':       { name: 'Amazon',         color: '#FF9900', icon: 'lobe-icons:bedrock-color' },
  'databricks':   { name: 'Databricks',     color: '#FF3621', icon: 'lobe-icons:dbrx-color' },
  'together':     { name: 'Together',       color: '#0EA5E9', icon: 'lobe-icons:together-color' },
  'groq':         { name: 'Groq',           color: '#F55036', icon: 'lobe-icons:groq' },
  'fireworks-ai': { name: 'Fireworks',      color: '#FF6B35', icon: 'lobe-icons:fireworks-color' },
  'deepinfra':    { name: 'DeepInfra',      color: '#3B82F6', icon: 'lobe-icons:deepinfra-color' },
  'replicate':    { name: 'Replicate',      color: '#000000', icon: 'lobe-icons:replicate' },
  'anyscale':     { name: 'Anyscale',       color: '#00D4FF', icon: 'lobe-icons:anyscale-color' },
  'cloudflare':   { name: 'Cloudflare',     color: '#F6821F', icon: 'lobe-icons:cloudflare-color' },
  'sambanova':    { name: 'SambaNova',      color: '#FF5722', icon: 'lobe-icons:sambanova-color' },
  'cerebras':     { name: 'Cerebras',       color: '#00D9FF', icon: 'lobe-icons:cerebras-color' },

  // === Chinese AI ===
  'baichuan':     { name: 'Baichuan',       color: '#4F46E5', icon: 'lobe-icons:baichuan-color' },
  'moonshot':     { name: 'Moonshot',       color: '#1E293B', icon: 'lobe-icons:moonshot' },
  'minimax':      { name: 'MiniMax',        color: '#3B82F6', icon: 'lobe-icons:minimax-color' },
  'zhipu':        { name: 'Zhipu AI',       color: '#00D4AA', icon: 'lobe-icons:zhipu-color' },
  'stepfun':      { name: 'StepFun',        color: '#6366F1', icon: 'lobe-icons:stepfun-color' },
  'baidu':        { name: 'Baidu',          color: '#2932E1', icon: 'lobe-icons:baidu-color' },
  'tencent':      { name: 'Tencent',        color: '#00C853', icon: 'lobe-icons:tencent-color' },
  'bytedance':    { name: 'ByteDance',      color: '#3B82F6', icon: 'lobe-icons:bytedance-color' },

  // === Open Source / Community ===
  'huggingface':  { name: 'Hugging Face',   color: '#FFD21E', icon: 'lobe-icons:huggingface-color' },
  'ollama':       { name: 'Ollama',         color: '#000000', icon: 'lobe-icons:ollama' },
  'openrouter':   { name: 'OpenRouter',     color: '#6366F1', icon: 'lobe-icons:openrouter' },
};

export const UNKNOWN_PROVIDER: Omit<ModelProvider, 'id'> = {
  name: 'Unknown',
  color: '#6B7280',
  icon: 'lobe-icons:openrouter',
};

// ============================================================================
// Model Icon Overrides
// ============================================================================

/**
 * Model-specific icons (when model brand differs from provider brand)
 * Key = model slug prefix (matched with startsWith)
 *
 * Example: "claude-3.5-sonnet" starts with "claude" → uses claude-color icon
 */
export const MODEL_ICONS: Record<string, string> = {
  // Anthropic - Claude has its own icon
  'claude':       'lobe-icons:claude-color',

  // Google - Gemini/Gemma have their own icons
  'gemini':       'lobe-icons:gemini-color',
  'gemma':        'lobe-icons:gemma-color',
  'palm':         'lobe-icons:palm-color',

  // xAI - Grok has its own icon
  'grok':         'lobe-icons:grok',

  // OpenAI - DALL-E and Sora have their own icons
  'dall-e':       'lobe-icons:dalle-color',
  'sora':         'lobe-icons:sora-color',

  // Cohere - Command and Aya
  'command':      'lobe-icons:cohere-color',
  'aya':          'lobe-icons:aya-color',

  // Databricks
  'dbrx':         'lobe-icons:dbrx-color',

  // Chinese models with distinct branding
  'yi':           'lobe-icons:yi-color',
  'glm':          'lobe-icons:chatglm-color',
  'chatglm':      'lobe-icons:chatglm-color',
  'ernie':        'lobe-icons:wenxin-color',
  'wenxin':       'lobe-icons:wenxin-color',
  'doubao':       'lobe-icons:doubao-color',
  'hunyuan':      'lobe-icons:hunyuan-color',
  'kimi':         'lobe-icons:kimi-color',
  'spark':        'lobe-icons:spark-color',

  // Image generation models
  'flux':         'lobe-icons:flux',
  'stable-diffusion': 'lobe-icons:stability-color',
  'sd':           'lobe-icons:stability-color',
  'midjourney':   'lobe-icons:midjourney',

  // Community models
  'dolphin':      'lobe-icons:dolphin',
  'solar':        'lobe-icons:upstage-color',
  'phi':          'lobe-icons:azure-color',
};

/**
 * Model-specific colors (when model color differs from provider)
 * Only needed for models with distinctly different branding
 */
export const MODEL_COLORS: Record<string, string> = {
  'claude':       '#D4A574',
  'gemini':       '#4285F4',
  'grok':         '#1DA1F2',
  'yi':           '#FF6B6B',
};

// ============================================================================
// Branding Utility Functions
// ============================================================================

/**
 * Get icon for a model (checks model overrides first, then provider)
 */
export function getModelIcon(modelSlug: string, providerId: string): string {
  // Exact match
  if (MODEL_ICONS[modelSlug]) return MODEL_ICONS[modelSlug];

  // Prefix match (claude-3.5-sonnet → claude)
  const prefix = Object.keys(MODEL_ICONS).find(k => modelSlug.startsWith(k));
  if (prefix) return MODEL_ICONS[prefix];

  // Fall back to provider icon, then unknown provider icon
  return KNOWN_PROVIDERS[providerId]?.icon ?? UNKNOWN_PROVIDER.icon ?? 'lobe-icons:openrouter';
}

/**
 * Get color for a model (checks model overrides first, then provider)
 */
export function getModelColor(modelSlug: string, providerId: string): string {
  // Exact match
  if (MODEL_COLORS[modelSlug]) return MODEL_COLORS[modelSlug];

  // Prefix match
  const prefix = Object.keys(MODEL_COLORS).find(k => modelSlug.startsWith(k));
  if (prefix) return MODEL_COLORS[prefix];

  // Fall back to provider color
  return KNOWN_PROVIDERS[providerId]?.color ?? UNKNOWN_PROVIDER.color;
}
