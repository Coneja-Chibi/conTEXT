/**
 * Model Parser
 *
 * Transforms raw OpenRouter API data into our standardized LLMModel format.
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
} from './types';
import { KNOWN_PROVIDERS, UNKNOWN_PROVIDER } from './types';

// ============================================================================
// Constants
// ============================================================================

const REGISTRY_VERSION = 1;
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

function parsePricing(pricing: OpenRouterModel['pricing']): ModelPricing {
  const promptPerToken = parseFloat(pricing.prompt) || 0;
  const completionPerToken = parseFloat(pricing.completion) || 0;

  return {
    promptPerMillion: promptPerToken * 1_000_000,
    completionPerMillion: completionPerToken * 1_000_000,
    imagePerImage: pricing.image ? parseFloat(pricing.image) : undefined,
    isFree: promptPerToken === 0 && completionPerToken === 0,
  };
}

function getSizeTier(contextLength: number): ModelSizeTier {
  if (contextLength < 8_000) return 'tiny';
  if (contextLength < 32_000) return 'small';
  if (contextLength < 128_000) return 'medium';
  if (contextLength < 500_000) return 'large';
  return 'massive';
}

function parseCapabilities(model: OpenRouterModel): ModelCapabilities {
  const modality = model.architecture?.modality || 'text';

  return {
    supportsImages: modality.includes('image') || modality === 'multimodal',
    supportsTools: true,
    supportsStreaming: true,
    isModerated: model.top_provider?.is_moderated ?? false,
    modality: modality.includes('image')
      ? 'text+image'
      : modality === 'multimodal'
        ? 'multimodal'
        : 'text',
    instructType: model.architecture?.instruct_type ?? undefined,
  };
}

// ============================================================================
// Main Transform Function
// ============================================================================

/**
 * Transform a single OpenRouter model to LLMModel format
 */
export function transformModel(raw: OpenRouterModel): LLMModel {
  const providerId = parseProviderId(raw.id);
  const now = new Date().toISOString();

  return {
    id: raw.id,
    slug: parseModelSlug(raw.id),
    name: raw.name,
    description: raw.description,
    provider: getProviderInfo(providerId),
    contextLength: raw.context_length,
    maxCompletionTokens:
      raw.max_completion_tokens ||
      raw.top_provider?.max_completion_tokens ||
      Math.min(raw.context_length, 4096),
    sizeTier: getSizeTier(raw.context_length),
    pricing: parsePricing(raw.pricing),
    capabilities: parseCapabilities(raw),
    tokenizer: raw.architecture?.tokenizer,
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

  const metadata: RegistryMetadata = {
    version: REGISTRY_VERSION,
    fetchedAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    modelCount: models.length,
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
