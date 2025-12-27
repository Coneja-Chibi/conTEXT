/**
 * LLM Model Registry
 *
 * Comprehensive database of LLM models with context limits, pricing,
 * and capabilities. Auto-updated daily from OpenRouter.
 *
 * @example
 * ```typescript
 * import { fetchRegistry, getContextLimit, formatContextLength } from '@chiev/llm-model-registry';
 *
 * // Fetch latest models
 * const registry = await fetchRegistry();
 *
 * // Look up context limit
 * const limit = getContextLimit('anthropic/claude-3.5-sonnet', registry.models);
 * console.log(formatContextLength(limit)); // "200K"
 * ```
 *
 * @packageDocumentation
 */

// Types
export type {
  OpenRouterModel,
  OpenRouterModelsResponse,
  LLMModel,
  ModelProvider,
  ModelPricing,
  ModelCapabilities,
  ModelSizeTier,
  ModelRegistry,
  RegistryMetadata,
  ModelQueryOptions,
  // New comprehensive types
  InputModality,
  OutputModality,
  SupportedParameter,
  ModelDefaults,
  RequestLimits,
} from './types';

export { KNOWN_PROVIDERS, UNKNOWN_PROVIDER } from './types';

// Parser
export { transformModel, transformModels, buildRegistry } from './parser';

// Fetcher
export {
  fetchFromOpenRouter,
  fetchRegistry,
  loadFromSnapshot,
  getFallbackRegistry,
  fetchRegistryWithFallback,
} from './fetcher';

// Fallback
export { FALLBACK_MODELS } from './fallback';

// Utils
export {
  // Formatters
  formatContextLength,
  formatPrice,
  formatModelPricing,
  getTierEmoji,
  getTierLabel,
  // Search
  findModel,
  getContextLimit,
  queryModels,
  getProviders,
  // Budget
  getBudgetStatus,
  isOverBudget,
  // Stats
  getStats,
} from './utils';

export type { BudgetStatus, BudgetInfo, RegistryStats } from './utils';
