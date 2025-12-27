/**
 * React Hooks for LLM Model Registry
 *
 * React-specific hooks for consuming the model registry.
 * Import from '@chiev/llm-model-registry/react'
 *
 * @example
 * ```tsx
 * import { useModelRegistry, useContextLimit } from '@chiev/llm-model-registry/react';
 *
 * function MyComponent() {
 *   const { models, getModel, isLoading } = useModelRegistry();
 *   const { contextLimit } = useContextLimit('anthropic/claude-3.5-sonnet');
 * }
 * ```
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ModelRegistry, LLMModel, ModelProvider, ModelQueryOptions } from './types';
import { fetchRegistryWithFallback, getFallbackRegistry } from './fetcher';
import { findModel, getContextLimit as getContextLimitUtil, queryModels, getProviders } from './utils';

// ============================================================================
// Cache
// ============================================================================

const CACHE_KEY = 'llm-model-registry';

function loadFromCache(): ModelRegistry | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const registry: ModelRegistry = JSON.parse(raw);
    const expiresAt = new Date(registry.metadata.expiresAt);
    if (new Date() >= expiresAt) return null;
    return registry;
  } catch {
    return null;
  }
}

function saveToCache(registry: ModelRegistry): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(registry));
  } catch {
    // Ignore cache errors
  }
}

function isCacheFresh(registry: ModelRegistry): boolean {
  const expiresAt = new Date(registry.metadata.expiresAt);
  return new Date() < expiresAt;
}

// ============================================================================
// Main Hook
// ============================================================================

export interface UseModelRegistryResult {
  models: LLMModel[];
  registry: ModelRegistry | null;
  getModel: (id: string) => LLMModel | undefined;
  getContextLimit: (id: string) => number | undefined;
  queryModels: (options: ModelQueryOptions) => LLMModel[];
  getProviders: () => ModelProvider[];
  isLoading: boolean;
  isStale: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

export function useModelRegistry(): UseModelRegistryResult {
  const [registry, setRegistry] = useState<ModelRegistry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const fetchingRef = useRef(false);

  const loadRegistry = useCallback(async (forceRefresh = false) => {
    if (fetchingRef.current) return;

    // Check cache first
    if (!forceRefresh) {
      const cached = loadFromCache();
      if (cached && isCacheFresh(cached)) {
        setRegistry(cached);
        setIsLoading(false);
        return;
      }
    }

    fetchingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const fresh = await fetchRegistryWithFallback();
      setRegistry(fresh);
      saveToCache(fresh);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      const stale = loadFromCache();
      if (stale) {
        setRegistry(stale);
      } else {
        setRegistry(getFallbackRegistry());
      }
    } finally {
      fetchingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRegistry();
  }, [loadRegistry]);

  const getModel = useCallback(
    (id: string): LLMModel | undefined => {
      if (!registry) return undefined;
      return findModel(id, registry.models);
    },
    [registry]
  );

  const getContextLimitFn = useCallback(
    (id: string): number | undefined => {
      if (!registry) return undefined;
      return getContextLimitUtil(id, registry.models);
    },
    [registry]
  );

  const queryModelsFn = useCallback(
    (options: ModelQueryOptions): LLMModel[] => {
      if (!registry) return [];
      return queryModels(registry.models, options);
    },
    [registry]
  );

  const getProvidersFn = useCallback((): ModelProvider[] => {
    if (!registry) return [];
    return getProviders(registry.models);
  }, [registry]);

  const isStale = useMemo(() => {
    if (!registry) return false;
    return !isCacheFresh(registry);
  }, [registry]);

  const lastUpdated = useMemo(() => {
    if (!registry) return null;
    return new Date(registry.metadata.fetchedAt);
  }, [registry]);

  return {
    models: registry?.models ?? [],
    registry,
    getModel,
    getContextLimit: getContextLimitFn,
    queryModels: queryModelsFn,
    getProviders: getProvidersFn,
    isLoading,
    isStale,
    error,
    lastUpdated,
    refresh: () => loadRegistry(true),
  };
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Get a single model by ID
 */
export function useModel(id: string | null | undefined): {
  model: LLMModel | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const { getModel, isLoading, error } = useModelRegistry();

  const model = useMemo(() => {
    if (!id) return undefined;
    return getModel(id);
  }, [id, getModel]);

  return { model, isLoading, error };
}

/**
 * Get context limit for a model
 */
export function useContextLimit(modelId: string | null | undefined): {
  contextLimit: number | undefined;
  isLoading: boolean;
} {
  const { getContextLimit, isLoading } = useModelRegistry();

  const contextLimit = useMemo(() => {
    if (!modelId) return undefined;
    return getContextLimit(modelId);
  }, [modelId, getContextLimit]);

  return { contextLimit, isLoading };
}

/**
 * Get models filtered by provider
 */
export function useProviderModels(providerId: string | null | undefined): {
  models: LLMModel[];
  isLoading: boolean;
} {
  const { queryModels, isLoading } = useModelRegistry();

  const models = useMemo(() => {
    if (!providerId) return [];
    return queryModels({ provider: providerId, sortBy: 'context', sortOrder: 'desc' });
  }, [providerId, queryModels]);

  return { models, isLoading };
}

// Re-export types for convenience
export type { LLMModel, ModelProvider, ModelQueryOptions, ModelRegistry } from './types';
