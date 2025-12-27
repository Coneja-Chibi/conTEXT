import { L as LLMModel, M as ModelRegistry, b as ModelQueryOptions, c as ModelProvider } from './types-CdsAPTG3.mjs';

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

interface UseModelRegistryResult {
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
declare function useModelRegistry(): UseModelRegistryResult;
/**
 * Get a single model by ID
 */
declare function useModel(id: string | null | undefined): {
    model: LLMModel | undefined;
    isLoading: boolean;
    error: Error | null;
};
/**
 * Get context limit for a model
 */
declare function useContextLimit(modelId: string | null | undefined): {
    contextLimit: number | undefined;
    isLoading: boolean;
};
/**
 * Get models filtered by provider
 */
declare function useProviderModels(providerId: string | null | undefined): {
    models: LLMModel[];
    isLoading: boolean;
};

export { LLMModel, ModelProvider, ModelQueryOptions, ModelRegistry, type UseModelRegistryResult, useContextLimit, useModel, useModelRegistry, useProviderModels };
