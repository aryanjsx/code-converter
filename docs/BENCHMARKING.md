# 📊 Benchmarking Methodology

This document explains how CodexConvert evaluates and scores AI model outputs.

---

## 🔍 Overview

After each conversion, the benchmark engine automatically evaluates every successful model output using **three independent metrics**. The results are combined into a single score per model and persisted for leaderboard aggregation.

```
Model Output ──▶ Syntax Check ──▶ Structural Fidelity ──▶ Token Usage
                       │                   │                    │
                       ▼                   ▼                    ▼
                   0 or 1.0           0.0 – 1.0            0.0 – 1.0
                       │                   │                    │
                       └───────────────────┼────────────────────┘
                                           ▼
                                    Weighted Score
                                      (0 – 10)
```

---

## 📏 Metrics

### 1. ✅ Syntax Validity

**File:** `core/benchmark/metrics/syntaxCheck.ts`

Checks whether the converted code has balanced brackets and delimiters.

**How it works:**

1. Parses the code character by character
2. Skips string literals (`'...'`, `"..."`), line comments (`//`, `#`), and block comments (`/* */`)
3. Tracks opening and closing brackets: `()`, `{}`, `[]`
4. Returns `true` if all brackets are balanced at the end

**Scoring:**

| Result | Score |
|---|---|
| All brackets balanced | **1.0** |
| Unmatched brackets found | **0.0** |

**Why this metric?** Correct syntax is a prerequisite for any usable output. If the AI produces unbalanced brackets, the code is almost certainly broken and not worth running.

**Limitations:** This is a structural bracket check, not a full parser. It does not validate language-specific syntax rules or detect semantic errors.

---

### 2. 🏗️ Structural Fidelity

**File:** `core/benchmark/metrics/structuralFidelity.ts`

Measures how well the converted output preserves the original project structure.

**Three sub-metrics:**

| Sub-metric | Weight | Description |
|---|---|---|
| File count ratio | 33% | `min(converted, original) / max(converted, original)` |
| Path mapping | 33% | Fraction of original files that have a corresponding converted file (by base name) |
| Structural elements | 34% | Comparison of function/class/import counts |

**Structural element detection** uses language-agnostic regex patterns:

| Element | Keywords matched |
|---|---|
| Functions | `function`, `def`, `fn`, `func`, `fun`, `sub` |
| Classes / Structs | `class`, `struct`, `interface`, `enum` |
| Imports | `import`, `require`, `use`, `using`, `include` |

Each element type is compared as `min(original, converted) / max(original, converted)`, and the three ratios are averaged.

**Final structural score:** Weighted average of the three sub-metrics → **0.0 to 1.0**.

**Why this metric?** Code conversion should preserve the project's architecture. If a model merges 10 files into 1, or drops all class definitions, the output is less useful even if the logic is correct.

---

### 3. ⚡ Token Efficiency

**File:** `core/benchmark/metrics/tokenUsage.ts`

Estimates output length as a proxy for token efficiency.

**Formula:**

```
estimatedTokens = code.length / 4
```

This uses the widely-accepted heuristic that one token ≈ four characters of code.

**Normalization:** Token counts are compared across all successful models in the same run:

```
tokenScore = minTokenUsage / modelTokenUsage
```

| Scenario | Score |
|---|---|
| Model with the shortest output | **1.0** |
| Model with 2× the shortest output | **0.5** |
| Model with 0 output | **0.0** |

**Why this metric?** Excessively verbose output wastes tokens (and money) without adding value. Conciseness is a desirable quality, though it's weighted lower than correctness.

---

## 🧮 Scoring Formula

**File:** `core/benchmark/scoring.ts`

The three metric scores are combined using a weighted sum:

```
finalScore = syntaxScore × 0.4 + structuralScore × 0.4 + tokenScore × 0.2
```

| Metric | Weight | Rationale |
|---|---|---|
| ✅ Syntax validity | **40%** | Correct syntax is a prerequisite for usable output |
| 🏗️ Structural fidelity | **40%** | Preserving project structure is critical for real-world usage |
| ⚡ Token efficiency | **20%** | Concise output is preferred but less important than correctness |

The weighted sum (0.0–1.0) is normalized to a **0–10 scale** for display.

**Example:**

| Model | Syntax | Structure | Tokens | Final Score |
|---|---|---|---|---|
| gpt-4o | 1.0 | 0.92 | 0.85 | **(1.0×0.4 + 0.92×0.4 + 0.85×0.2) × 10 = 9.4** |
| deepseek-chat | 1.0 | 0.80 | 1.0 | **(1.0×0.4 + 0.80×0.4 + 1.0×0.2) × 10 = 9.2** |
| mistral-large | 0.0 | 0.75 | 0.90 | **(0.0×0.4 + 0.75×0.4 + 0.90×0.2) × 10 = 4.8** |

---

## 💾 Benchmark Run Storage

**File:** `core/benchmark/benchmarkDataset.ts`

Each benchmark run is stored as a `BenchmarkRun` object:

```typescript
{
  id: string;             // crypto.randomUUID()
  timestamp: number;      // Date.now()
  sourceLanguage: string; // e.g. "python"
  targetLanguage: string; // e.g. "rust"
  results: BenchmarkResult[];
}
```

| Property | Value |
|---|---|
| **Location** | Browser `localStorage` |
| **Key** | `codexconvert-benchmark-history` |
| **Capacity** | Maximum 200 runs (oldest trimmed on overflow) |
| **Content** | Scores, metric results, model names, language IDs, timestamps |
| **NOT stored** | User code, API keys, raw LLM responses |
| **Error handling** | Storage failures are logged and silently ignored |

---

## 🏅 Ranking Aggregation

**File:** `core/benchmark/rankingEngine.ts`

Rankings are computed by aggregating all stored benchmark runs:

1. Iterate through every `BenchmarkResult` in every stored run
2. Group by model name
3. Calculate: `avgScore = totalScore / count` (rounded to one decimal)
4. Sort by average score (descending), with run count as tiebreaker

Rankings can be filtered by language pair via the leaderboard engine.

---

## 🔧 Extending the Benchmark

To add a new metric:

1. Create a new file in `core/benchmark/metrics/`
2. Export a function that accepts converted code (and optionally original code) and returns a numeric score between 0.0 and 1.0
3. Integrate the metric call in `benchmarkEngine.ts`
4. Add its weight in `scoring.ts` — adjust existing weights so all weights sum to **1.0**
5. Update the `MetricResult` type in `core/benchmark/types.ts` if needed

See [🤝 Contributing](../CONTRIBUTING.md) for the full contributor workflow.
