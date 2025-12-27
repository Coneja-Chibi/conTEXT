/**
 * Model Parser
 *
 * Transforms raw OpenRouter API data into our standardized LLMModel format.
 * Extracts ALL available data from the API.
 */

import type {
  OpenRouterModel,
  LLMModel,
  ModelProvider,
  ModelPricing,
  ModelCapabilities,
  ModelSizeTier,
  ModelRegistry,
  RegistryMetadata,
  ModelDefaults,
  RequestLimits,
  InputModality,
  OutputModality,
  SupportedParameter,
} from './types';
import { KNOWN_PROVIDERS, UNKNOWN_PROVIDER } from './types';

// ============================================================================
// Constants
// ============================================================================

const REGISTRY_VERSION = 2; // Bumped for new schema
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// ============================================================================
// Parsing Helpers
// ============================================================================

function parseProviderId(modelId: string): string {
  const parts = modelId.split('/');
  return parts[0] || 'unknown';
}

function parseModelSlug(modelId: string): string {
  const parts = modelId.split('/');
  return parts.slice(1).join('/') || modelId;
}

function getProviderInfo(providerId: string): ModelProvider {
  const known = KNOWN_PROVIDERS[providerId];
  if (known) {
    return { id: providerId, ...known };
  }

  const generatedName = providerId
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    id: providerId,
    ...UNKNOWN_PROVIDER,
    name: generatedName,
  };
}

/**
 * Parse ALL pricing fields
 */
function parsePricing(pricing: OpenRouterModel['pricing']): ModelPricing {
  const promptPerToken = parseFloat(pricing.prompt) || 0;
  const completionPerToken = parseFloat(pricing.completion) || 0;
  const requestCost = pricing.request ? parseFloat(pricing.request) : undefined;
  const imagePerImage = pricing.image ? parseFloat(pricing.image) : undefined;
  const webSearchCost = pricing.web_search ? parseFloat(pricing.web_search) : undefined;
  const reasoningPerToken = pricing.internal_reasoning ? parseFloat(pricing.internal_reasoning) : undefined;
  const cacheReadPerToken = pricing.input_cache_read ? parseFloat(pricing.input_cache_read) : undefined;
  const cacheWritePerToken = pricing.input_cache_write ? parseFloat(pricing.input_cache_write) : undefined;

  return {
    // Core pricing (per million)
    promptPerMillion: promptPerToken * 1_000_000,
    completionPerMillion: completionPerToken * 1_000_000,
    isFree: promptPerToken === 0 && completionPerToken === 0,

    // Additional costs
    imagePerImage,
    requestCost,
    webSearchCost,
    reasoningPerMillion: reasoningPerToken ? reasoningPerToken * 1_000_000 : undefined,

    // Cache pricing (per million)
    cacheReadPerMillion: cacheReadPerToken ? cacheReadPerToken * 1_000_000 : undefined,
    cacheWritePerMillion: cacheWritePerToken ? cacheWritePerToken * 1_000_000 : undefined,
  };
}

function getSizeTier(contextLength: number): ModelSizeTier {
  if (contextLength < 8_000) return 'tiny';
  if (contextLength < 32_000) return 'small';
  if (contextLength < 128_000) return 'medium';
  if (contextLength < 500_000) return 'large';
  return 'massive';
}

/**
 * Parse input modalities from architecture
 */
function parseInputModalities(model: OpenRouterModel): InputModality[] {
  const raw = model.architecture?.input_modalities;
  if (raw && Array.isArray(raw)) {
    return raw.filter((m): m is InputModality =>
      ['text', 'image', 'audio', 'video', 'file'].includes(m)
    );
  }

  // Fallback: parse from modality string
  const modality = model.architecture?.modality || 'text';
  const modalities: InputModality[] = ['text'];
  if (modality.includes('image')) modalities.push('image');
  if (modality.includes('audio')) modalities.push('audio');
  if (modality.includes('video')) modalities.push('video');
  return modalities;
}

/**
 * Parse output modalities from architecture
 */
function parseOutputModalities(model: OpenRouterModel): OutputModality[] {
  const raw = model.architecture?.output_modalities;
  if (raw && Array.isArray(raw)) {
    return raw.filter((m): m is OutputModality =>
      ['text', 'image', 'audio'].includes(m)
    );
  }
  return ['text']; // Default to text output
}

/**
 * Check if a parameter is supported
 */
function hasParam(model: OpenRouterModel, param: string): boolean {
  return model.supported_parameters?.includes(param) ?? false;
}

/**
 * Parse ALL capabilities from architecture and supported_parameters
 */
function parseCapabilities(model: OpenRouterModel): ModelCapabilities {
  const modalityString = model.architecture?.modality || 'text';
  const inputModalities = parseInputModalities(model);
  const outputModalities = parseOutputModalities(model);

  // Derive legacy modality enum
  const hasImageInput = inputModalities.includes('image');
  const hasAudioInput = inputModalities.includes('audio');
  const hasVideoInput = inputModalities.includes('video');
  const isMultimodal = hasAudioInput || hasVideoInput || (hasImageInput && outputModalities.length > 1);

  let legacyModality: 'text' | 'text+image' | 'multimodal' = 'text';
  if (isMultimodal) {
    legacyModality = 'multimodal';
  } else if (hasImageInput) {
    legacyModality = 'text+image';
  }

  return {
    // Full modality arrays
    inputModalities,
    outputModalities,
    modalityString,

    // Feature support (derived from supported_parameters)
    supportsTools: hasParam(model, 'tools') || hasParam(model, 'tool_choice'),
    supportsReasoning: hasParam(model, 'reasoning') || hasParam(model, 'include_reasoning'),
    supportsStructuredOutput: hasParam(model, 'structured_outputs'),
    supportsJsonMode: hasParam(model, 'response_format'),
    supportsStreaming: true, // OpenRouter supports streaming for all
    supportsTemperature: hasParam(model, 'temperature'),
    supportsTopP: hasParam(model, 'top_p'),
    supportsTopK: hasParam(model, 'top_k'),
    supportsFrequencyPenalty: hasParam(model, 'frequency_penalty'),
    supportsPresencePenalty: hasParam(model, 'presence_penalty'),
    supportsStopSequences: hasParam(model, 'stop'),
    supportsWebSearch: model.pricing.web_search ? parseFloat(model.pricing.web_search) > 0 : false,

    // Content moderation
    isModerated: model.top_provider?.is_moderated ?? false,

    // Legacy compat
    supportsImages: hasImageInput,
    modality: legacyModality,
    instructType: model.architecture?.instruct_type ?? undefined,
  };
}

/**
 * Parse default parameters
 */
function parseDefaults(model: OpenRouterModel): ModelDefaults {
  const defaults = model.default_parameters;
  if (!defaults) return {};

  return {
    temperature: defaults.temperature,
    topP: defaults.top_p,
    topK: defaults.top_k,
    frequencyPenalty: defaults.frequency_penalty,
    presencePenalty: defaults.presence_penalty,
  };
}

/**
 * Parse per-request limits
 */
function parseRequestLimits(model: OpenRouterModel): RequestLimits | undefined {
  const limits = model.per_request_limits;
  if (!limits) return undefined;

  return {
    promptTokens: limits.prompt_tokens,
    completionTokens: limits.completion_tokens,
  };
}

// ============================================================================
// Main Transform Function
// ============================================================================

/**
 * Transform a single OpenRouter model to LLMModel format
 * Captures ALL available data
 */
export function transformModel(raw: OpenRouterModel): LLMModel {
  const providerId = parseProviderId(raw.id);
  const now = new Date().toISOString();

  return {
    // === Identification ===
    id: raw.id,
    slug: parseModelSlug(raw.id),
    canonicalSlug: raw.canonical_slug,
    name: raw.name,
    description: raw.description,
    huggingFaceId: raw.hugging_face_id || undefined,

    // === Provider ===
    provider: getProviderInfo(providerId),

    // === Context & Tokens ===
    contextLength: raw.context_length,
    maxCompletionTokens:
      raw.max_completion_tokens ||
      raw.top_provider?.max_completion_tokens ||
      Math.min(raw.context_length, 4096),
    sizeTier: getSizeTier(raw.context_length),

    // === Pricing ===
    pricing: parsePricing(raw.pricing),

    // === Capabilities ===
    capabilities: parseCapabilities(raw),

    // === Supported Parameters ===
    supportedParameters: (raw.supported_parameters || []) as SupportedParameter[],
    defaults: parseDefaults(raw),
    requestLimits: parseRequestLimits(raw),

    // === Metadata ===
    tokenizer: raw.architecture?.tokenizer,
    createdAt: raw.created ? new Date(raw.created * 1000).toISOString() : undefined,
    updatedAt: now,
  };
}

/**
 * Transform an array of OpenRouter models
 */
export function transformModels(rawModels: OpenRouterModel[]): LLMModel[] {
  const models = rawModels.map(transformModel);
  models.sort((a, b) => b.contextLength - a.contextLength);
  return models;
}

/**
 * Build a complete registry from models
 */
export function buildRegistry(
  models: LLMModel[],
  source: 'api' | 'snapshot' | 'fallback' = 'api'
): ModelRegistry {
  const now = new Date();
  const expires = new Date(now.getTime() + CACHE_DURATION_MS);

  // Count unique providers
  const providerSet = new Set(models.map((m) => m.provider.id));

  const metadata: RegistryMetadata = {
    version: REGISTRY_VERSION,
    fetchedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    modelCount: models.length,
    providerCount: providerSet.size,
    source,
  };

  const byId: Record<string, LLMModel> = {};
  const byProvider: Record<string, LLMModel[]> = {};
  const byTier: Record<ModelSizeTier, LLMModel[]> = {
    tiny: [],
    small: [],
    medium: [],
    large: [],
    massive: [],
  };

  for (const model of models) {
    byId[model.id] = model;

    const providerId = model.provider.id;
    if (!byProvider[providerId]) {
      byProvider[providerId] = [];
    }
    byProvider[providerId].push(model);

    byTier[model.sizeTier].push(model);
  }

  return {
    metadata,
    models,
    byId,
    byProvider,
    byTier,
  };
}
