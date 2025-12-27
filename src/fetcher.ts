/**
 * Model Fetcher
 *
 * Fetches model data from OpenRouter API with fallback to bundled snapshot.
 */

import type { OpenRouterModel, OpenRouterModelsResponse, ModelRegistry } from './types';
import { transformModels, buildRegistry } from './parser';
import { FALLBACK_MODELS } from './fallback';

// ============================================================================
// Constants
// ============================================================================

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/models';

// ============================================================================
// API Fetching
// ============================================================================

/**
 * Fetch raw models from OpenRouter API
 */
export async function fetchFromOpenRouter(): Promise<OpenRouterModel[]> {
  const response = await fetch(OPENROUTER_API_URL, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
  }

  const data: OpenRouterModelsResponse = await response.json();
  return data.data || [];
}

/**
 * Fetch and build registry from OpenRouter API
 */
export async function fetchRegistry(): Promise<ModelRegistry> {
  const rawModels = await fetchFromOpenRouter();
  const models = transformModels(rawModels);
  return buildRegistry(models, 'api');
}

// ============================================================================
// Snapshot Loading
// ============================================================================

/**
 * Load registry from bundled snapshot
 */
export async function loadFromSnapshot(): Promise<ModelRegistry | null> {
  try {
    // Dynamic import of bundled snapshot
    const snapshot = await import('../snapshots/latest.json');
    const data = snapshot.default || snapshot;

    if (!data?.data || !Array.isArray(data.data)) {
      console.error('[LLMRegistry] Invalid snapshot format');
      return null;
    }

    const rawModels = data.data as OpenRouterModel[];
    const models = transformModels(rawModels);
    return buildRegistry(models, 'snapshot');
  } catch (error) {
    console.error('[LLMRegistry] Failed to load snapshot:', error);
    return null;
  }
}

/**
 * Get fallback registry with hardcoded models
 */
export function getFallbackRegistry(): ModelRegistry {
  return buildRegistry(FALLBACK_MODELS, 'fallback');
}

// ============================================================================
// Smart Fetching with Fallback
// ============================================================================

/**
 * Fetch registry with automatic fallback chain:
 * 1. Try OpenRouter API
 * 2. Fall back to bundled snapshot
 * 3. Fall back to hardcoded models
 */
export async function fetchRegistryWithFallback(): Promise<ModelRegistry> {
  // Try API first
  try {
    return await fetchRegistry();
  } catch (apiError) {
    console.warn('[LLMRegistry] API fetch failed:', apiError);
  }

  // Try snapshot
  try {
    const snapshotRegistry = await loadFromSnapshot();
    if (snapshotRegistry) {
      return snapshotRegistry;
    }
  } catch (snapshotError) {
    console.warn('[LLMRegistry] Snapshot load failed:', snapshotError);
  }

  // Ultimate fallback
  console.log('[LLMRegistry] Using hardcoded fallback');
  return getFallbackRegistry();
}
