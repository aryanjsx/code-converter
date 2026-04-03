# 🤝 Contributing to CodexConvert

Thank you for your interest in contributing! This guide covers development setup, code structure, and the process for submitting changes.

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm

### Development setup

```bash
git clone https://github.com/aryanjsx/code-converter.git
cd code-converter
npm install
npm run dev
```

The dev server starts at `http://localhost:3000`. Changes to source files trigger hot module reloading.

### Build and type check

```bash
npm run build          # Production build
npx tsc --noEmit       # TypeScript strict mode type check
```

> ⚠️ The project enforces `"strict": true` in `tsconfig.json`. All contributions must pass strict type checking.

---

## 📁 Project Structure

```
core/                        # Business logic (no React dependencies)
  modelExecutionManager.ts   # Parallel model dispatch with concurrency control
  benchmark/                 # Benchmark engine, metrics, scoring, dataset, ranking
  leaderboard/               # Leaderboard query functions

services/                    # External communication
  llmService.ts              # OpenAI-compatible API client

utils/                       # Shared utilities
  pathSanitizer.ts           # Path traversal prevention, display truncation

context/                     # React context providers
  ProviderContext.tsx         # LLM provider configuration (sessionStorage)
  ToastContext.tsx            # Toast notification system

components/                  # React UI components
  layout/                    # App shell (Sidebar, TopBar, AppLayout)
  converter/                 # Conversion workspace layout
  benchmark/                 # Score panel and metric visualization
  leaderboard/               # Leaderboard views, tables, widgets
```

### 🔑 Key conventions

- **`core/` modules are pure TypeScript** — no React imports, no DOM access. They can be tested independently.
- **Components** receive data via props or React context. No component directly accesses `localStorage` or makes API calls.
- **`App.tsx`** orchestrates the conversion flow and is the single source of truth for application state.
- **All file paths from LLM responses** must pass through `sanitizePath()` from `utils/pathSanitizer.ts`.

---

## 🧪 Common Contribution Tasks

### 📊 Adding a Benchmark Metric

1. **Create the metric function** in `core/benchmark/metrics/`:

```typescript
// core/benchmark/metrics/myMetric.ts
import type { ConvertedFile } from '../../../types';

export function calculateMyMetric(
  convertedFiles: ConvertedFile[],
  originalCode: string,
): number {
  // Return a score between 0.0 and 1.0
}
```

2. **Integrate into the benchmark engine** in `core/benchmark/benchmarkEngine.ts`:
   - Import your metric function
   - Call it within the per-model evaluation loop
   - Add the result to the `MetricResult` array

3. **Update the scoring weights** in `core/benchmark/scoring.ts`:
   - Add a weight for the new metric
   - Ensure all weights still sum to **1.0**

4. **Update types** if needed in `core/benchmark/types.ts`

5. **Verify everything compiles:**

```bash
npx tsc --noEmit && npm run build
```

---

### 🔌 Adding a Model Provider

1. **Add the provider preset** in `constants.ts`:

```typescript
// In PROVIDER_PRESETS array:
{
  id: 'myprovider',
  name: 'My Provider',
  baseUrl: 'https://api.myprovider.com/v1',
  defaultModel: 'my-model',
}
```

2. **Add suggested models** in `constants.ts`:

```typescript
// In PROVIDER_MODELS record:
myprovider: ['my-model', 'my-model-large'],
```

The provider **must** expose an OpenAI-compatible chat completions endpoint (`POST /chat/completions`). No changes to `llmService.ts` are required.

---

### 🏆 Adding a Leaderboard Feature

The leaderboard components in `components/leaderboard/` read from the leaderboard engine in `core/leaderboard/leaderboardEngine.ts`.

1. Add a query function in `leaderboardEngine.ts` (reads from `benchmarkDataset`)
2. Create a component in `components/leaderboard/`
3. Integrate into `LeaderboardView.tsx`

---

### 🔒 Security Considerations

When contributing code, keep these rules in mind:

| Rule | Why |
|---|---|
| Never log API keys, request payloads, or user code | Prevents sensitive data exposure in devtools |
| Always sanitize LLM-returned file paths with `sanitizePath()` | Prevents ZIP path traversal attacks |
| Use `sessionStorage` (not `localStorage`) for API keys | Keys are cleared when the tab closes |
| Validate URLs before `fetch()` calls | Prevents SSRF-like behavior |
| Use `err.message` in error logs, never full error objects | Avoids leaking request details |

---

## 📬 Submitting a Pull Request

### Branch workflow

1. Fork the repository
2. Create a feature branch from `main`:

```bash
git checkout -b feature/my-feature
```

3. Make your changes
4. Run type check and build:

```bash
npx tsc --noEmit && npm run build
```

5. Commit with a clear message describing what changed and why
6. Push and open a pull request against `main`

### ✅ PR checklist

- [ ] TypeScript and Vite build pass
- [ ] No hardcoded secrets or API keys
- [ ] Existing conversion, benchmark, and leaderboard flows still work
- [ ] Error handling includes try/catch around storage and network operations
- [ ] UI changes maintain the dark theme and responsive layout
- [ ] Documentation updated if the change affects architecture, metrics, or security

### 🔍 What we look for

- Clean, readable TypeScript with strict mode compliance
- Consistency with existing code patterns
- Proper error handling and graceful degradation
- Security-conscious code (see table above)

---

## ❓ Questions?

Open a GitHub issue for feature discussions, bug reports, or questions about the codebase.
