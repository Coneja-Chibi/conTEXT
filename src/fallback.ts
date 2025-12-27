/**
 * Fallback Models
 *
 * Hardcoded models as ultimate fallback when API and snapshot both fail.
 */

import type { LLMModel } from './types';
import { KNOWN_PROVIDERS } from './types';

export const FALLBACK_MODELS: LLMModel[] = [
  // Anthropic
  {
    id: 'anthropic/claude-sonnet-4',
    slug: 'claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: { id: 'anthropic', ...KNOWN_PROVIDERS['anthropic']! },
    contextLength: 200_000,
    maxCompletionTokens: 64_000,
    sizeTier: 'large',
    pricing: { promptPerMillion: 3, completionPerMillion: 15, isFree: false },
    capabilities: { supportsImages: true, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'text+image' },
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
    pricing: { promptPerMillion: 3, completionPerMillion: 15, isFree: false },
    capabilities: { supportsImages: true, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'text+image' },
    updatedAt: new Date().toISOString(),
  },
  // OpenAI
  {
    id: 'openai/gpt-4o',
    slug: 'gpt-4o',
    name: 'GPT-4o',
    provider: { id: 'openai', ...KNOWN_PROVIDERS['openai']! },
    contextLength: 128_000,
    maxCompletionTokens: 16_384,
    sizeTier: 'medium',
    pricing: { promptPerMillion: 2.5, completionPerMillion: 10, isFree: false },
    capabilities: { supportsImages: true, supportsTools: true, supportsStreaming: true, isModerated: true, modality: 'text+image' },
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
    pricing: { promptPerMillion: 10, completionPerMillion: 30, isFree: false },
    capabilities: { supportsImages: true, supportsTools: true, supportsStreaming: true, isModerated: true, modality: 'text+image' },
    updatedAt: new Date().toISOString(),
  },
  // Google
  {
    id: 'google/gemini-2.5-pro-preview',
    slug: 'gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro',
    provider: { id: 'google', ...KNOWN_PROVIDERS['google']! },
    contextLength: 1_000_000,
    maxCompletionTokens: 65_536,
    sizeTier: 'massive',
    pricing: { promptPerMillion: 1.25, completionPerMillion: 10, isFree: false },
    capabilities: { supportsImages: true, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'multimodal' },
    updatedAt: new Date().toISOString(),
  },
  // DeepSeek
  {
    id: 'deepseek/deepseek-chat',
    slug: 'deepseek-chat',
    name: 'DeepSeek Chat',
    provider: { id: 'deepseek', ...KNOWN_PROVIDERS['deepseek']! },
    contextLength: 128_000,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: { promptPerMillion: 0.14, completionPerMillion: 0.28, isFree: false },
    capabilities: { supportsImages: false, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'text' },
    updatedAt: new Date().toISOString(),
  },
  // Meta
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    slug: 'llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: { id: 'meta-llama', ...KNOWN_PROVIDERS['meta-llama']! },
    contextLength: 131_072,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: { promptPerMillion: 0.12, completionPerMillion: 0.3, isFree: false },
    capabilities: { supportsImages: false, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'text' },
    updatedAt: new Date().toISOString(),
  },
  // Mistral
  {
    id: 'mistralai/mistral-large-2411',
    slug: 'mistral-large-2411',
    name: 'Mistral Large',
    provider: { id: 'mistralai', ...KNOWN_PROVIDERS['mistralai']! },
    contextLength: 128_000,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: { promptPerMillion: 2, completionPerMillion: 6, isFree: false },
    capabilities: { supportsImages: false, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'text' },
    updatedAt: new Date().toISOString(),
  },
  // Qwen
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    slug: 'qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: { id: 'qwen', ...KNOWN_PROVIDERS['qwen']! },
    contextLength: 131_072,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: { promptPerMillion: 0.35, completionPerMillion: 0.4, isFree: false },
    capabilities: { supportsImages: false, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'text' },
    updatedAt: new Date().toISOString(),
  },
  // xAI
  {
    id: 'x-ai/grok-2',
    slug: 'grok-2',
    name: 'Grok 2',
    provider: { id: 'x-ai', ...KNOWN_PROVIDERS['x-ai']! },
    contextLength: 131_072,
    maxCompletionTokens: 8_192,
    sizeTier: 'medium',
    pricing: { promptPerMillion: 2, completionPerMillion: 10, isFree: false },
    capabilities: { supportsImages: true, supportsTools: true, supportsStreaming: true, isModerated: false, modality: 'text+image' },
    updatedAt: new Date().toISOString(),
  },
];
