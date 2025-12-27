/**
 * LLM Model Registry Types
 *
 * Type definitions for the model registry - capturing ALL data from OpenRouter's API.
 * Context limits, pricing, capabilities, supported parameters, and provider information.
 */
/**
 * Raw model data from OpenRouter's /api/v1/models endpoint
 * This captures EVERYTHING they expose
 */
interface OpenRouterModel {
    id: string;
    canonical_slug?: string;
    name: string;
    description?: string;
    created?: number;
    context_length: number;
    max_completion_tokens?: number;
    hugging_face_id?: string;
    architecture?: {
        modality: string;
        input_modalities?: string[];
        output_modalities?: string[];
        tokenizer: string;
        instruct_type?: string | null;
    };
    pricing: {
        prompt: string;
        completion: string;
        request?: string;
        image?: string;
        web_search?: string;
        internal_reasoning?: string;
        input_cache_read?: string;
        input_cache_write?: string;
    };
    top_provider?: {
        context_length?: number;
        max_completion_tokens?: number;
        is_moderated?: boolean;
    };
    per_request_limits?: {
        prompt_tokens?: number;
        completion_tokens?: number;
    } | null;
    supported_parameters?: string[];
    default_parameters?: {
        temperature?: number | null;
        top_p?: number | null;
        frequency_penalty?: number | null;
        presence_penalty?: number | null;
        top_k?: number | null;
    };
}
interface OpenRouterModelsResponse {
    data: OpenRouterModel[];
}
/**
 * Provider information extracted from model ID
 */
interface ModelProvider {
    id: string;
    name: string;
    color: string;
    icon?: string;
}
/**
 * Parsed pricing - all values converted to per-million tokens for easy math
 */
interface ModelPricing {
    promptPerMillion: number;
    completionPerMillion: number;
    isFree: boolean;
    imagePerImage?: number;
    requestCost?: number;
    webSearchCost?: number;
    reasoningPerMillion?: number;
    cacheReadPerMillion?: number;
    cacheWritePerMillion?: number;
}
/**
 * Input/output modalities supported by the model
 */
type InputModality = 'text' | 'image' | 'audio' | 'video' | 'file';
type OutputModality = 'text' | 'image' | 'audio';
/**
 * Model capabilities and features - comprehensive
 */
interface ModelCapabilities {
    inputModalities: InputModality[];
    outputModalities: OutputModality[];
    modalityString: string;
    supportsTools: boolean;
    supportsReasoning: boolean;
    supportsStructuredOutput: boolean;
    supportsJsonMode: boolean;
    supportsStreaming: boolean;
    supportsTemperature: boolean;
    supportsTopP: boolean;
    supportsTopK: boolean;
    supportsFrequencyPenalty: boolean;
    supportsPresencePenalty: boolean;
    supportsStopSequences: boolean;
    supportsWebSearch: boolean;
    isModerated: boolean;
    supportsImages: boolean;
    modality: 'text' | 'text+image' | 'multimodal';
    instructType?: string;
}
/**
 * Supported API parameters for this model
 */
type SupportedParameter = 'include_reasoning' | 'max_tokens' | 'reasoning' | 'response_format' | 'seed' | 'stop' | 'structured_outputs' | 'temperature' | 'tool_choice' | 'tools' | 'top_k' | 'top_p' | 'frequency_penalty' | 'presence_penalty' | 'verbosity' | string;
/**
 * Default parameter values for this model
 */
interface ModelDefaults {
    temperature?: number | null;
    topP?: number | null;
    topK?: number | null;
    frequencyPenalty?: number | null;
    presencePenalty?: number | null;
}
/**
 * Per-request token limits
 */
interface RequestLimits {
    promptTokens?: number;
    completionTokens?: number;
}
/**
 * Size tier classification for quick filtering
 */
type ModelSizeTier = 'tiny' | 'small' | 'medium' | 'large' | 'massive';
/**
 * The main model type - ALL fields from OpenRouter, parsed and typed
 */
interface LLMModel {
    id: string;
    slug: string;
    canonicalSlug?: string;
    name: string;
    description?: string;
    huggingFaceId?: string;
    provider: ModelProvider;
    contextLength: number;
    maxCompletionTokens: number;
    sizeTier: ModelSizeTier;
    pricing: ModelPricing;
    capabilities: ModelCapabilities;
    supportedParameters: SupportedParameter[];
    defaults: ModelDefaults;
    requestLimits?: RequestLimits;
    tokenizer?: string;
    createdAt?: string;
    updatedAt: string;
}
/**
 * Cache metadata for the model registry
 */
interface RegistryMetadata {
    version: number;
    fetchedAt: string;
    expiresAt: string;
    modelCount: number;
    providerCount: number;
    source: 'api' | 'snapshot' | 'fallback';
}
/**
 * The complete model registry
 */
interface ModelRegistry {
    metadata: RegistryMetadata;
    models: LLMModel[];
    byId: Record<string, LLMModel>;
    byProvider: Record<string, LLMModel[]>;
    byTier: Record<ModelSizeTier, LLMModel[]>;
}
/**
 * Filter options for querying models
 */
interface ModelQueryOptions {
    provider?: string | string[];
    minContext?: number;
    maxContext?: number;
    tier?: ModelSizeTier | ModelSizeTier[];
    isFree?: boolean;
    supportsImages?: boolean;
    supportsTools?: boolean;
    supportsReasoning?: boolean;
    supportsStructuredOutput?: boolean;
    inputModality?: InputModality | InputModality[];
    search?: string;
    sortBy?: 'context' | 'price' | 'name' | 'provider';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
}
/**
 * Provider branding with lobe-icons
 * @see https://lobehub.com/icons for icon gallery
 * Icon format: 'lobe-icons:{name}' or 'lobe-icons:{name}-color'
 */
declare const KNOWN_PROVIDERS: Record<string, Omit<ModelProvider, 'id'>>;
declare const UNKNOWN_PROVIDER: Omit<ModelProvider, 'id'>;
/**
 * Model-specific icons (when model brand differs from provider brand)
 * Key = model slug prefix (matched with startsWith)
 *
 * Example: "claude-3.5-sonnet" starts with "claude" → uses claude-color icon
 */
declare const MODEL_ICONS: Record<string, string>;
/**
 * Model-specific colors (when model color differs from provider)
 * Only needed for models with distinctly different branding
 */
declare const MODEL_COLORS: Record<string, string>;
/**
 * Get icon for a model (checks model overrides first, then provider)
 */
declare function getModelIcon(modelSlug: string, providerId: string): string;
/**
 * Get color for a model (checks model overrides first, then provider)
 */
declare function getModelColor(modelSlug: string, providerId: string): string;

export { type InputModality as I, KNOWN_PROVIDERS as K, type LLMModel as L, type ModelRegistry as M, type OpenRouterModel as O, type RegistryMetadata as R, type SupportedParameter as S, UNKNOWN_PROVIDER as U, type ModelSizeTier as a, type ModelQueryOptions as b, type ModelProvider as c, type OpenRouterModelsResponse as d, type ModelPricing as e, type ModelCapabilities as f, type OutputModality as g, type ModelDefaults as h, type RequestLimits as i, MODEL_ICONS as j, MODEL_COLORS as k, getModelIcon as l, getModelColor as m };
