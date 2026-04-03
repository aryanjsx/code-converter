# 📐 Architecture

This document describes the major subsystems of CodexConvert and how they interact.

---

## 🌐 System Overview

CodexConvert is a **fully client-side application**. There is no backend server. The browser communicates directly with AI provider APIs using user-supplied credentials.

```
┌──────────────────────────────────────────────────────────────┐
│                         🖥️ Browser                            │
│                                                              │
│  ┌─────────────┐    ┌────────────────────────────────────┐   │
│  │   🧩 UI     │───▶│  📦 Provider Context               │   │
│  │   (React)   │    │  (apiKey, models[], baseURL)       │   │
│  └──────┬──────┘    └─────────────────┬──────────────────┘   │
│         │                             │                      │
│         ▼                             ▼                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          🔁 Model Execution Manager                    │  │
│  │     (parallel dispatch, concurrency=3, isolation)      │  │
│  └─────────────────────┬──────────────────────────────────┘  │
│                        │                                     │
│            ┌───────────┼───────────┐                         │
│            ▼           ▼           ▼                         │
│       ┌─────────┐ ┌─────────┐ ┌─────────┐                   │
│       │ Model A │ │ Model B │ │ Model C │  (fetch → HTTPS)  │
│       └────┬────┘ └────┬────┘ └────┬────┘                   │
│            │           │           │                         │
│            └───────────┼───────────┘                         │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          📊 Benchmark Engine                           │  │
│  │  syntaxCheck → structuralFidelity → tokenUsage         │  │
│  │  ────────────────────────────────────────────           │  │
│  │  🧮 Scoring: syntax×0.4 + structure×0.4 + token×0.2   │  │
│  └─────────────────────┬──────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │          💾 Benchmark Dataset                          │  │
│  │          (localStorage, max 200 runs)                  │  │
│  └─────────────────────┬──────────────────────────────────┘  │
│                        │                                     │
│                        ▼                                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │     🏆 Ranking Engine + Leaderboard Engine             │  │
│  │     (avg scores, rankings, language-pair filtering)    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## 1. 🔌 LLM Service

**File:** `services/llmService.ts`

The LLM service provides a provider-agnostic interface to any OpenAI-compatible chat completions API.

**Responsibilities:**

| Responsibility | Implementation |
|---|---|
| Request construction | OpenAI-format payload with system + user messages |
| URL validation | Blocks private networks (unless Ollama), requires HTTPS for remote hosts |
| Path sanitization | All LLM-returned file paths pass through `sanitizePath()` before being returned |
| Error sanitization | Truncates error messages to 200 chars, redacts API key patterns |
| Response parsing | Strips markdown fences, parses JSON, validates `{ files: [...] }` structure |

**Data flow:**

```
Provider Config ──▶ validateBaseUrl() ──▶ fetch(POST /chat/completions)
                                              │
                                              ▼
                                    Parse JSON response
                                              │
                                              ▼
                                    sanitizePath() on each file
                                              │
                                              ▼
                                    Return ConvertedFile[]
```

---

## 2. 🔁 Model Execution Manager

**File:** `core/modelExecutionManager.ts`

When multiple models are selected, the execution manager orchestrates parallel conversion:

- **Concurrency control:** Worker queue with `MAX_PARALLEL_MODELS = 3`
- **Failure isolation:** If one model errors, others continue unaffected
- **Status reporting:** Per-model callbacks for real-time UI updates (`pending` → `processing` → `success`/`error`)
- **Output:** Array of `ModelResult` objects (success with `ConvertedFile[]`, or error with message)

```
Selected Models: [gpt-4o, deepseek-chat, mistral-large]
                          │
                 ┌────────┼────────┐
                 ▼        ▼        ▼
              Worker 1  Worker 2  Worker 3   (max 3 concurrent)
                 │        │        │
                 ▼        ▼        ▼
            ✅ Success  ✅ Success  ❌ Error
                 │        │        │
                 └────────┼────────┘
                          ▼
                   ModelResult[]
```

---

## 3. 📊 Benchmark Engine

**File:** `core/benchmark/benchmarkEngine.ts`

After conversions complete, the benchmark engine evaluates each successful model output:

| Metric | File | What It Checks |
|---|---|---|
| Syntax Validity | `metrics/syntaxCheck.ts` | Balanced brackets `()`, `{}`, `[]` with string/comment awareness |
| Structural Fidelity | `metrics/structuralFidelity.ts` | File count, path mapping, function/class/import preservation |
| Token Usage | `metrics/tokenUsage.ts` | Output length via `code.length / 4` heuristic |

Each metric runs independently with error isolation — if one metric fails, it logs a warning and the others still execute.

---

## 4. 🧮 Scoring

**File:** `core/benchmark/scoring.ts`

Combines metric results into a final score per model:

```
finalScore = syntaxScore × 0.4 + structuralScore × 0.4 + tokenScore × 0.2
```

| Input | Range | Derivation |
|---|---|---|
| Syntax score | 0 or 1 | 1.0 if brackets balanced, 0.0 otherwise |
| Structural score | 0.0–1.0 | Weighted average of file count, path mapping, and element comparison |
| Token score | 0.0–1.0 | `minTokenUsage / modelTokenUsage` across all successful models |

The raw weighted sum (0.0–1.0) is scaled to a **0–10 display range**.

---

## 5. 💾 Benchmark Dataset

**File:** `core/benchmark/benchmarkDataset.ts`

Persists benchmark runs to browser `localStorage`:

| Property | Value |
|---|---|
| Storage key | `codexconvert-benchmark-history` |
| Max runs | 200 (oldest trimmed on overflow) |
| Run contents | ID, timestamp, source/target language, per-model scores and metrics |
| What is NOT stored | User code, API keys, raw LLM responses |
| Error handling | All operations wrapped in try/catch — failures are logged and silently ignored |

---

## 6. 🏅 Ranking Engine

**File:** `core/benchmark/rankingEngine.ts`

Aggregates historical benchmark data into model rankings:

1. Iterates through all stored runs
2. Groups results by model name
3. Computes average score and total run count per model
4. Sorts by average score (descending), with run count as tiebreaker

---

## 7. 🏆 Leaderboard Engine

**File:** `core/leaderboard/leaderboardEngine.ts`

Provides read-only query functions over the benchmark dataset:

| Function | Returns |
|---|---|
| `getGlobalLeaderboard()` | All models ranked by average score |
| `getLeaderboardByLanguagePair(source, target)` | Rankings filtered to a specific conversion pair |
| `getAvailableLanguagePairs()` | Unique source/target pairs in the dataset |
| `getTopModels(limit)` | Top N models by average score |

The leaderboard engine never writes data — it only reads from `benchmarkDataset.ts` and delegates ranking to `rankingEngine.ts`.

---

## 8. 🧩 UI Layer

The UI is built with **React 19** and **Tailwind CSS**, organized into a workspace layout:

| Component Group | Purpose |
|---|---|
| `layout/` | App shell — `Sidebar` navigation, `TopBar`, `AppLayout` |
| `converter/` | 3-panel workspace — left (config + files), center (code), right (scores) |
| `benchmark/` | `ScorePanel` — per-model metric visualization |
| `leaderboard/` | `LeaderboardView`, ranking tables, top models widget, language-pair filtering |
| `context/` | `ProviderContext` (LLM config), `ToastContext` (notifications) |
| `utils/` | `pathSanitizer` (security utilities shared across components) |

**Key principle:** The UI only reads from the benchmark and leaderboard engines. It never writes to them directly — only the conversion flow in `App.tsx` triggers benchmark storage.

---

## 🔒 Security Layer

Security is enforced across multiple layers:

| Layer | Protection |
|---|---|
| `llmService.ts` | URL validation, HTTPS enforcement, path sanitization, error redaction |
| `utils/pathSanitizer.ts` | Strips `..`, `.`, empty segments from LLM-returned paths |
| `App.tsx` | File upload limits (500 files / 50MB), binary file detection, conversion debounce |
| `ProviderContext.tsx` | API keys in `sessionStorage` only, clear key functionality |
| `index.html` | Content Security Policy restricting script/connect sources |
| `tsconfig.json` | TypeScript strict mode enabled |

See [🔒 Security](SECURITY.md) for the full security model.
