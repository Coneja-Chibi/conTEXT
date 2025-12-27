import { O as OpenRouterModel, L as LLMModel, M as ModelRegistry, a as ModelSizeTier, b as ModelQueryOptions, c as ModelProvider } from './types-ym87cI4N.mjs';
export { I as InputModality, K as KNOWN_PROVIDERS, k as MODEL_COLORS, j as MODEL_ICONS, f as ModelCapabilities, h as ModelDefaults, e as ModelPricing, d as OpenRouterModelsResponse, g as OutputModality, R as RegistryMetadata, i as RequestLimits, S as SupportedParameter, U as UNKNOWN_PROVIDER, m as getModelColor, l as getModelIcon } from './types-ym87cI4N.mjs';

/**
 * Model Parser
 *
 * Transforms raw OpenRouter API data into our standardized LLMModel format.
 * Extracts ALL available data from the API.
 */

/**
 * Transform a single OpenRouter model to LLMModel format
 * Captures ALL available data
 */
declare function transformModel(raw: OpenRouterModel): LLMModel;
/**
 * Transform an array of OpenRouter models
 */
declare function transformModels(rawModels: OpenRouterModel[]): LLMModel[];
/**
 * Build a complete registry from models
 */
declare function buildRegistry(models: LLMModel[], source?: 'api' | 'snapshot' | 'fallback'): ModelRegistry;

/**
 * Model Fetcher
 *
 * Fetches model data from OpenRouter API with fallback to bundled snapshot.
 */

/**
 * Fetch raw models from OpenRouter API
 */
declare function fetchFromOpenRouter(): Promise<OpenRouterModel[]>;
/**
 * Fetch and build registry from OpenRouter API
 */
declare function fetchRegistry(): Promise<ModelRegistry>;
/**
 * Load registry from bundled snapshot
 */
declare function loadFromSnapshot(): Promise<ModelRegistry | null>;
/**
 * Get fallback registry with hardcoded models
 */
declare function getFallbackRegistry(): ModelRegistry;
/**
 * Fetch registry with automatic fallback chain:
 * 1. Try OpenRouter API
 * 2. Fall back to bundled snapshot
 * 3. Fall back to hardcoded models
 */
declare function fetchRegistryWithFallback(): Promise<ModelRegistry>;

/**
 * Fallback Models
 *
 * Hardcoded models as ultimate fallback when API and snapshot both fail.
 * These use the new comprehensive LLMModel schema with all fields.
 */

declare const FALLBACK_MODELS: LLMModel[];

/**
 * Utility Functions
 *
 * Helpers for formatting, searching, and working with model data.
 */

/**
 * Format context length for display (e.g., "128K", "1M")
 */
declare function formatContextLength(tokens: number): string;
/**
 * Format price per million tokens
 */
declare function formatPrice(pricePerMillion: number): string;
/**
 * Format combined pricing for display
 */
declare function formatModelPricing(model: LLMModel): string;
/**
 * Get emoji for size tier
 */
declare function getTierEmoji(tier: ModelSizeTier): string;
/**
 * Get human-readable tier name
 */
declare function getTierLabel(tier: ModelSizeTier): string;
/**
 * Find model by ID with fuzzy matching
 */
declare function findModel(query: string, models: LLMModel[]): LLMModel | undefined;
/**
 * Get context limit for a model ID
 */
declare function getContextLimit(modelId: string, models: LLMModel[]): number | undefined;
/**
 * Query models with filters
 */
declare function queryModels(models: LLMModel[], options: ModelQueryOptions): LLMModel[];
/**
 * Get unique providers from models
 */
declare function getProviders(models: LLMModel[]): ModelProvider[];
type BudgetStatus = 'safe' | 'warning' | 'danger' | 'over';
interface BudgetInfo {
    percentage: number;
    status: BudgetStatus;
    color: string;
    message: string;
}
/**
 * Get budget status with color coding
 */
declare function getBudgetStatus(tokens: number, contextLimit: number): BudgetInfo;
/**
 * Check if over budget
 */
declare function isOverBudget(tokens: number, model: LLMModel): boolean;
interface RegistryStats {
    total: number;
    providers: number;
    avgContext: number;
    maxContext: number;
    minContext: number;
    freeModels: number;
    imageCapable: number;
    toolCapable: number;
    reasoningCapable: number;
}
/**
 * Get stats about a model collection
 */
declare function getStats(models: LLMModel[]): RegistryStats;

export { type BudgetInfo, type BudgetStatus, FALLBACK_MODELS, LLMModel, ModelProvider, ModelQueryOptions, ModelRegistry, ModelSizeTier, OpenRouterModel, type RegistryStats, buildRegistry, fetchFromOpenRouter, fetchRegistry, fetchRegistryWithFallback, findModel, formatContextLength, formatModelPricing, formatPrice, getBudgetStatus, getContextLimit, getFallbackRegistry, getProviders, getStats, getTierEmoji, getTierLabel, isOverBudget, loadFromSnapshot, queryModels, transformModel, transformModels };
