/**
 * Utility Functions
 *
 * Helpers for formatting, searching, and working with model data.
 */

import type { LLMModel, ModelSizeTier, ModelProvider, ModelQueryOptions } from './types';

// ============================================================================
// Display Formatters
// ============================================================================

/**
 * Format context length for display (e.g., "128K", "1M")
 */
export function formatContextLength(tokens: number): string {
  if (tokens >= 1_000_000) {
    const millions = tokens / 1_000_000;
    return millions === Math.floor(millions) ? `${millions}M` : `${millions.toFixed(1)}M`;
  }
  if (tokens >= 1_000) {
    const thousands = tokens / 1_000;
    return thousands === Math.floor(thousands) ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }
  return tokens.toString();
}

/**
 * Format price per million tokens
 */
export function formatPrice(pricePerMillion: number): string {
  if (pricePerMillion === 0) return 'Free';
  if (pricePerMillion < 0.01) return `$${pricePerMillion.toFixed(4)}`;
  if (pricePerMillion < 1) return `$${pricePerMillion.toFixed(2)}`;
  return `$${pricePerMillion.toFixed(2)}`;
}

/**
 * Format combined pricing for display
 */
export function formatModelPricing(model: LLMModel): string {
  if (model.pricing.isFree) return '✨ Free';
  const input = formatPrice(model.pricing.promptPerMillion);
  const output = formatPrice(model.pricing.completionPerMillion);
  return `${input} / ${output}`;
}

/**
 * Get emoji for size tier
 */
export function getTierEmoji(tier: ModelSizeTier): string {
  switch (tier) {
    case 'tiny': return '🐣';
    case 'small': return '🐥';
    case 'medium': return '🐓';
    case 'large': return '🦅';
    case 'massive': return '🐉';
  }
}

/**
 * Get human-readable tier name
 */
export function getTierLabel(tier: ModelSizeTier): string {
  switch (tier) {
    case 'tiny': return 'Tiny (<8K)';
    case 'small': return 'Small (8K-32K)';
    case 'medium': return 'Medium (32K-128K)';
    case 'large': return 'Large (128K-500K)';
    case 'massive': return 'Massive (500K+)';
  }
}

// ============================================================================
// Model Lookup & Search
// ============================================================================

/**
 * Find model by ID with fuzzy matching
 */
export function findModel(query: string, models: LLMModel[]): LLMModel | undefined {
  const normalized = query.toLowerCase().trim();

  // Exact ID match
  const exactId = models.find((m) => m.id.toLowerCase() === normalized);
  if (exactId) return exactId;

  // Exact slug match
  const exactSlug = models.find((m) => m.slug.toLowerCase() === normalized);
  if (exactSlug) return exactSlug;

  // Partial ID match
  const partialId = models.find((m) => m.id.toLowerCase().endsWith('/' + normalized));
  if (partialId) return partialId;

  // Name contains
  const nameContains = models.find((m) => m.name.toLowerCase().includes(normalized));
  if (nameContains) return nameContains;

  // Fuzzy match
  const fuzzyQuery = normalized.replace(/[-.\s]/g, '');
  return models.find((m) => {
    const fuzzyId = m.id.toLowerCase().replace(/[-.\s]/g, '');
    const fuzzySlug = m.slug.toLowerCase().replace(/[-.\s]/g, '');
    const fuzzyName = m.name.toLowerCase().replace(/[-.\s]/g, '');
    return fuzzyId.includes(fuzzyQuery) || fuzzySlug.includes(fuzzyQuery) || fuzzyName.includes(fuzzyQuery);
  });
}

/**
 * Get context limit for a model ID
 */
export function getContextLimit(modelId: string, models: LLMModel[]): number | undefined {
  const model = findModel(modelId, models);
  return model?.contextLength;
}

/**
 * Query models with filters
 */
export function queryModels(models: LLMModel[], options: ModelQueryOptions): LLMModel[] {
  let results = [...models];

  // Provider filter
  if (options.provider) {
    const providers = Array.isArray(options.provider) ? options.provider : [options.provider];
    results = results.filter((m) =>
      providers.some(
        (p) => m.provider.id.toLowerCase() === p.toLowerCase() || m.provider.name.toLowerCase() === p.toLowerCase()
      )
    );
  }

  // Context range filter
  if (options.minContext !== undefined) {
    results = results.filter((m) => m.contextLength >= options.minContext!);
  }
  if (options.maxContext !== undefined) {
    results = results.filter((m) => m.contextLength <= options.maxContext!);
  }

  // Tier filter
  if (options.tier) {
    const tiers = Array.isArray(options.tier) ? options.tier : [options.tier];
    results = results.filter((m) => tiers.includes(m.sizeTier));
  }

  // Free filter
  if (options.isFree !== undefined) {
    results = results.filter((m) => m.pricing.isFree === options.isFree);
  }

  // Image support filter
  if (options.supportsImages !== undefined) {
    results = results.filter((m) => m.capabilities.supportsImages === options.supportsImages);
  }

  // Search filter
  if (options.search) {
    const search = options.search.toLowerCase();
    results = results.filter(
      (m) =>
        m.id.toLowerCase().includes(search) ||
        m.name.toLowerCase().includes(search) ||
        m.provider.name.toLowerCase().includes(search) ||
        m.description?.toLowerCase().includes(search)
    );
  }

  // Sorting
  if (options.sortBy) {
    const order = options.sortOrder === 'desc' ? -1 : 1;
    results.sort((a, b) => {
      switch (options.sortBy) {
        case 'context': return (a.contextLength - b.contextLength) * order;
        case 'price': return (a.pricing.promptPerMillion - b.pricing.promptPerMillion) * order;
        case 'name': return a.name.localeCompare(b.name) * order;
        case 'provider': return a.provider.name.localeCompare(b.provider.name) * order;
        default: return 0;
      }
    });
  }

  // Limit
  if (options.limit) {
    results = results.slice(0, options.limit);
  }

  return results;
}

/**
 * Get unique providers from models
 */
export function getProviders(models: LLMModel[]): ModelProvider[] {
  const seen = new Set<string>();
  const providers: ModelProvider[] = [];

  for (const model of models) {
    if (!seen.has(model.provider.id)) {
      seen.add(model.provider.id);
      providers.push(model.provider);
    }
  }

  return providers.sort((a, b) => a.name.localeCompare(b.name));
}

// ============================================================================
// Budget Helpers
// ============================================================================

export type BudgetStatus = 'safe' | 'warning' | 'danger' | 'over';

export interface BudgetInfo {
  percentage: number;
  status: BudgetStatus;
  color: string;
  message: string;
}

/**
 * Get budget status with color coding
 */
export function getBudgetStatus(tokens: number, contextLimit: number): BudgetInfo {
  const percentage = Math.min(100, (tokens / contextLimit) * 100);

  if (tokens > contextLimit) {
    return {
      percentage: 100,
      status: 'over',
      color: '#EF4444',
      message: `Over by ${formatContextLength(tokens - contextLimit)}!`,
    };
  }

  if (percentage >= 90) {
    return {
      percentage,
      status: 'danger',
      color: '#F97316',
      message: `${formatContextLength(contextLimit - tokens)} remaining`,
    };
  }

  if (percentage >= 75) {
    return {
      percentage,
      status: 'warning',
      color: '#EAB308',
      message: `${formatContextLength(contextLimit - tokens)} remaining`,
    };
  }

  return {
    percentage,
    status: 'safe',
    color: '#22C55E',
    message: `${formatContextLength(contextLimit - tokens)} available`,
  };
}

/**
 * Check if over budget
 */
export function isOverBudget(tokens: number, model: LLMModel): boolean {
  return tokens > model.contextLength;
}

// ============================================================================
// Stats
// ============================================================================

export interface RegistryStats {
  total: number;
  providers: number;
  avgContext: number;
  maxContext: number;
  minContext: number;
  freeModels: number;
  imageCapable: number;
}

/**
 * Get stats about a model collection
 */
export function getStats(models: LLMModel[]): RegistryStats {
  if (models.length === 0) {
    return { total: 0, providers: 0, avgContext: 0, maxContext: 0, minContext: 0, freeModels: 0, imageCapable: 0 };
  }

  const contexts = models.map((m) => m.contextLength);
  const uniqueProviders = new Set(models.map((m) => m.provider.id));

  return {
    total: models.length,
    providers: uniqueProviders.size,
    avgContext: Math.round(contexts.reduce((a, b) => a + b, 0) / models.length),
    maxContext: Math.max(...contexts),
    minContext: Math.min(...contexts),
    freeModels: models.filter((m) => m.pricing.isFree).length,
    imageCapable: models.filter((m) => m.capabilities.supportsImages).length,
  };
}
