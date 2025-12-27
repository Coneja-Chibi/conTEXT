/**
 * Fallback Models
 *
 * Hardcoded models as ultimate fallback when API and snapshot both fail.
 * These use the new comprehensive LLMModel schema with all fields.
 */

import type { LLMModel, ModelCapabilities, ModelPricing, ModelDefaults } from './types';
import { KNOWN_PROVIDERS } from './types';

// Helper to create default capabilities
function createCapabilities(opts: {
  supportsImages?: boolean;
  supportsTools?: boolean;
  supportsReasoning?: boolean;
  isModerated?: boolean;
  modality?: 'text' | 'text+image' | 'multimodal';
}): ModelCapabilities {
  const supportsImages = opts.supportsImages ?? false;
  const modality = opts.modality ?? (supportsImages ? 'text+image' : 'text');

  return {
    inputModalities: supportsImages ? ['text', 'image'] : ['text'],
    outputModalities: ['text'],
    modalityString: supportsImages ? 'text+image->text' : 'text->text',
    supportsTools: opts.supportsTools ?? true,
    supportsReasoning: opts.supportsReasoning ?? false,
    supportsStructuredOutput: true,
    supportsJsonMode: true,
    supportsStreaming: true,
    supportsTemperature: true,
    supportsTopP: true,
    supportsTopK: false,
    supportsFrequencyPenalty: true,
    supportsPresencePenalty: true,
    supportsStopSequences: true,
    supportsWebSearch: false,
    isModerated: opts.isModerated ?? false,
    supportsImages,
    modality,
  };
}

// Helper to create default pricing
function createPricing(promptPerMillion: number, completionPerMillion: number): ModelPricing {
  return {
    promptPerMillion,
    completionPerMillion,
    isFree: promptPerMillion === 0 && completionPerMillion === 0,
  };
}

// Default model defaults
const DEFAULT_DEFAULTS: ModelDefaults = {
  temperature: 1.0,
  topP: 1.0,
};

export const FALLBACK_MODELS: LLMModel[] = [
  // ==================== Anthropic ====================
  {
    id: 'anthropic/claude-sonnet-4',
    slug: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: { id: 'anthropic', ...KNOWN_PROVIDERS['anthropic']! },
    contextLength: 200_000,
    maxCompletionTokens: 64_000,
    sizeTier: 'large',
    pricing: createPricing(3, 15),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools', 'tool_choice'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    slug: 'claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: { id: 'anthropic', ...KNOWN_PROVIDERS['anthropic']! },
    contextLength: 200_000,
    maxCompletionTokens: 8_192,
    sizeTier: 'large',
    pricing: createPricing(3, 15),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools', 'tool_choice'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'anthropic/claude-opus-4',
    slug: 'claude-opus-4',
    name: 'Claude Opus 4',
    provider: { id: 'anthropic', ...KNOWN_PROVIDERS['anthropic']! },
    contextLength: 200_000,
    maxCompletionTokens: 32_000,
    sizeTier: 'large',
    pricing: createPricing(15, 75),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true, supportsReasoning: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools', 'tool_choice', 'reasoning'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },

  // ==================== OpenAI ====================
  {
    id: 'openai/gpt-4o',
    slug: 'gpt-4o',
    name: 'GPT-4o',
    provider: { id: 'openai', ...KNOWN_PROVIDERS['openai']! },
    contextLength: 128_000,
    maxCompletionTokens: 16_384,
    sizeTier: 'medium',
    pricing: createPricing(2.5, 10),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true, isModerated: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools', 'tool_choice', 'response_format'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'openai/gpt-4-turbo',
    slug: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: { id: 'openai', ...KNOWN_PROVIDERS['openai']! },
    contextLength: 128_000,
    maxCompletionTokens: 4_096,
    sizeTier: 'medium',
    pricing: createPricing(10, 30),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true, isModerated: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools', 'tool_choice', 'response_format'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'openai/o1',
    slug: 'o1',
    name: 'o1',
    provider: { id: 'openai', ...KNOWN_PROVIDERS['openai']! },
    contextLength: 200_000,
    maxCompletionTokens: 100_000,
    sizeTier: 'large',
    pricing: createPricing(15, 60),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true, supportsReasoning: true, isModerated: true }),
    supportedParameters: ['max_tokens', 'reasoning'],
    defaults: {},
    updatedAt: new Date().toISOString(),
  },

  // ==================== Google ====================
  {
    id: 'google/gemini-2.5-pro-preview',
    slug: 'gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro',
    provider: { id: 'google', ...KNOWN_PROVIDERS['google']! },
    contextLength: 1_000_000,
    maxCompletionTokens: 65_536,
    sizeTier: 'massive',
    pricing: createPricing(1.25, 10),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true, modality: 'multimodal' }),
    supportedParameters: ['temperature', 'top_p', 'top_k', 'stop', 'max_tokens', 'tools'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'google/gemini-2.0-flash-exp',
    slug: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash',
    provider: { id: 'google', ...KNOWN_PROVIDERS['google']! },
    contextLength: 1_000_000,
    maxCompletionTokens: 8_192,
    sizeTier: 'massive',
    pricing: createPricing(0, 0), // Free experimental
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true, modality: 'multimodal' }),
    supportedParameters: ['temperature', 'top_p', 'top_k', 'stop', 'max_tokens'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },

  // ==================== DeepSeek ====================
  {
    id: 'deepseek/deepseek-chat',
    slug: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: { id: 'deepseek', ...KNOWN_PROVIDERS['deepseek']! },
    contextLength: 128_000,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: createPricing(0.14, 0.28),
    capabilities: createCapabilities({ supportsImages: false, supportsTools: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'deepseek/deepseek-r1',
    slug: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: { id: 'deepseek', ...KNOWN_PROVIDERS['deepseek']! },
    contextLength: 64_000,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: createPricing(0.55, 2.19),
    capabilities: createCapabilities({ supportsImages: false, supportsTools: true, supportsReasoning: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'reasoning'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },

  // ==================== Meta ====================
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    slug: 'llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: { id: 'meta-llama', ...KNOWN_PROVIDERS['meta-llama']! },
    contextLength: 131_072,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: createPricing(0.12, 0.3),
    capabilities: createCapabilities({ supportsImages: false, supportsTools: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },

  // ==================== Mistral ====================
  {
    id: 'mistralai/mistral-large-2411',
    slug: 'mistral-large-2411',
    name: 'Mistral Large',
    provider: { id: 'mistralai', ...KNOWN_PROVIDERS['mistralai']! },
    contextLength: 128_000,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: createPricing(2, 6),
    capabilities: createCapabilities({ supportsImages: false, supportsTools: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },

  // ==================== Qwen ====================
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    slug: 'qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: { id: 'qwen', ...KNOWN_PROVIDERS['qwen']! },
    contextLength: 131_072,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: createPricing(0.35, 0.4),
    capabilities: createCapabilities({ supportsImages: false, supportsTools: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },

  // ==================== xAI ====================
  {
    id: 'x-ai/grok-2',
    slug: 'grok-2',
    name: 'Grok 2',
    provider: { id: 'x-ai', ...KNOWN_PROVIDERS['x-ai']! },
    contextLength: 131_072,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: createPricing(2, 10),
    capabilities: createCapabilities({ supportsImages: true, supportsTools: true }),
    supportedParameters: ['temperature', 'top_p', 'stop', 'max_tokens', 'tools'],
    defaults: DEFAULT_DEFAULTS,
    updatedAt: new Date().toISOString(),
  },
];
