# LLM Model Registry

Comprehensive database of LLM models with context limits, pricing, and capabilities. Auto-updated daily from OpenRouter.

## Features

- 🔄 **Auto-updated daily** from OpenRouter API (350+ models)
- 📦 **Bundled snapshot** for offline/fallback use
- ⚛️ **React hooks** for easy integration
- 🎯 **TypeScript first** with full type definitions
- 🔍 **Smart search** with fuzzy model matching
- 💰 **Pricing info** per million tokens
- 📊 **Context tiers** for quick filtering

## Installation

```bash
npm install @chiev/llm-model-registry
```

## Basic Usage

```typescript
import { fetchRegistry, getContextLimit, formatContextLength } from '@chiev/llm-model-registry';

// Fetch latest models (with automatic fallback to snapshot)
const registry = await fetchRegistry();

// Look up context limit
const limit = getContextLimit('anthropic/claude-3.5-sonnet', registry.models);
console.log(formatContextLength(limit)); // "200K"

// Find a model
const model = findModel('gpt-4o', registry.models);
console.log(model?.contextLength); // 128000
```

## React Hooks

```tsx
import { useModelRegistry, useContextLimit } from '@chiev/llm-model-registry/react';

function ModelSelector() {
  const { models, isLoading, queryModels } = useModelRegistry();

  // Get models with 100K+ context
  const largeModels = queryModels({ minContext: 100000 });

  return (
    <select>
      {largeModels.map(m => (
        <option key={m.id} value={m.id}>
          {m.name} ({formatContextLength(m.contextLength)})
        </option>
      ))}
    </select>
  );
}

function TokenBudget({ modelId, tokens }) {
  const { contextLimit, isLoading } = useContextLimit(modelId);

  if (isLoading) return <div>Loading...</div>;

  const status = getBudgetStatus(tokens, contextLimit);
  return <div style={{ color: status.color }}>{status.message}</div>;
}
```

## API Reference

### Core Functions

| Function | Description |
|----------|-------------|
| `fetchRegistry()` | Fetch models from OpenRouter API |
| `fetchRegistryWithFallback()` | Fetch with snapshot/hardcoded fallback |
| `loadFromSnapshot()` | Load bundled snapshot |
| `getContextLimit(id, models)` | Get context limit for a model |
| `findModel(query, models)` | Find model by ID/name (fuzzy) |
| `queryModels(models, options)` | Filter and sort models |

### Query Options

```typescript
interface ModelQueryOptions {
  provider?: string | string[];    // Filter by provider
  minContext?: number;             // Minimum context length
  maxContext?: number;             // Maximum context length
  tier?: ModelSizeTier | ModelSizeTier[];  // Size tier filter
  isFree?: boolean;                // Free models only
  supportsImages?: boolean;        // Vision-capable only
  search?: string;                 // Text search
  sortBy?: 'context' | 'price' | 'name' | 'provider';
  sortOrder?: 'asc' | 'desc';
  limit?: number;                  // Max results
}
```

### Model Type

```typescript
interface LLMModel {
  id: string;                      // "anthropic/claude-3.5-sonnet"
  slug: string;                    // "claude-3.5-sonnet"
  name: string;                    // "Claude 3.5 Sonnet"
  provider: ModelProvider;         // { id, name, color, icon }
  contextLength: number;           // 200000
  maxCompletionTokens: number;     // 8192
  sizeTier: ModelSizeTier;         // "large"
  pricing: ModelPricing;           // { promptPerMillion, completionPerMillion, isFree }
  capabilities: ModelCapabilities; // { supportsImages, supportsTools, ... }
}
```

### Size Tiers

| Tier | Context Range |
|------|---------------|
| `tiny` | < 8K |
| `small` | 8K - 32K |
| `medium` | 32K - 128K |
| `large` | 128K - 500K |
| `massive` | 500K+ |

## Utility Functions

```typescript
import {
  formatContextLength,  // 128000 → "128K"
  formatPrice,          // 0.003 → "$0.003"
  getTierEmoji,         // "large" → "🦅"
  getBudgetStatus,      // tokens + limit → { status, color, message }
  getStats,             // models → { total, providers, avgContext, ... }
} from '@chiev/llm-model-registry';
```

## How Updates Work

1. **GitHub Actions** runs daily at 6 AM UTC
2. Fetches latest models from OpenRouter `/api/v1/models`
3. Updates `snapshots/latest.json` if changed
4. Auto-bumps version and publishes to npm

The bundled snapshot ensures the package works even if:
- OpenRouter API is down
- API becomes paid
- Network is unavailable

## Data Source

Model data is sourced from [OpenRouter](https://openrouter.ai/docs#models), which aggregates models from:

- OpenAI (GPT-4, GPT-4o, o1, etc.)
- Anthropic (Claude 3.5, Claude 3, etc.)
- Google (Gemini 2.5, Gemini 1.5, etc.)
- Meta (Llama 3.3, Llama 3.1, etc.)
- Mistral, DeepSeek, Qwen, xAI, and 50+ more providers

## License

MIT
