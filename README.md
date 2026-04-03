<div align="center">

# 🚀 CodexConvert

### AI Code Conversion Benchmark Platform

Convert entire codebases across languages using multiple AI models and benchmark their performance.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vite.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8_Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Security](https://img.shields.io/badge/Security-Audited-34D058?logo=shield&logoColor=white)](#-security--privacy)

<img src="assets/banner.png" alt="CodexConvert Banner" width="100%" />

</div>

---

## ✨ Features

| | Feature | Description |
|---|---|---|
| 🔁 | **Multi-Model Conversion** | Run the same conversion task across multiple AI models simultaneously |
| 📊 | **Automatic Benchmark Scoring** | Evaluate outputs using syntax validation, structural fidelity, and token efficiency |
| 🏆 | **Leaderboard Rankings** | See which AI models perform best across historical conversions |
| 🧠 | **Language-Pair Benchmarking** | Discover the best model for specific migrations like Python → Rust |
| 🧩 | **Workspace Dashboard** | Modern developer interface with model comparison and benchmark insights |
| 🔒 | **Privacy-First Architecture** | All conversions run directly from your browser to the AI provider — no backend |

---

## 🌐 Supported Languages

<div align="center">

| | | | | |
|---|---|---|---|---|
| Python | JavaScript | TypeScript | Java | Go |
| Rust | C | C++ | C# | Ruby |
| PHP | Swift | Kotlin | Scala | Dart |
| R | Perl | Shell Script | Julia | MATLAB |
| Fortran | COBOL | Lisp | | |

</div>

---

## 🔌 Supported AI Providers

CodexConvert works with **any OpenAI-compatible API**:

| Provider | Default Base URL |
|---|---|
| OpenAI | `https://api.openai.com/v1` |
| DeepSeek | `https://api.deepseek.com/v1` |
| Mistral | `https://api.mistral.ai/v1` |
| Groq | `https://api.groq.com/openai/v1` |
| Ollama (local) | `http://localhost:11434/v1` |
| OpenRouter | `https://openrouter.ai/api/v1` |
| Together AI | `https://api.together.xyz/v1` |
| Custom | Any endpoint you trust |

---

## ⚙️ How It Works

```
                    ┌──────────────────────┐
                    │    📂 Upload Files    │
                    │   (browser memory)    │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  🔁 Model Execution  │  Parallel dispatch
                    │     Manager          │  (max 3 concurrent)
                    └──────────┬───────────┘
                               │
                   ┌───────────┼───────────┐
                   ▼           ▼           ▼
              ┌─────────┐ ┌─────────┐ ┌─────────┐
              │ Model A │ │ Model B │ │ Model C │
              │ (fetch) │ │ (fetch) │ │ (fetch) │
              └────┬────┘ └────┬────┘ └────┬────┘
                   │           │           │
                   └───────────┼───────────┘
                               ▼
                    ┌──────────────────────┐
                    │  📊 Benchmark Engine │  Syntax, structure,
                    │     + Scoring        │  token efficiency
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  💾 Benchmark Dataset│  localStorage
                    │     (max 200 runs)   │  persistence
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  🏆 Leaderboard      │  Rankings, filtering,
                    │     System           │  top models
                    └──────────────────────┘
```

| Layer | Responsibility |
|---|---|
| **Model Execution Manager** | Dispatches conversions in parallel with concurrency control and failure isolation |
| **Benchmark Engine** | Runs syntax check, structural fidelity, and token efficiency metrics on each output |
| **Scoring** | Combines metrics into a weighted 0–10 score per model |
| **Benchmark Dataset** | Persists runs to `localStorage` for historical analysis |
| **Leaderboard System** | Aggregates scores into global and language-pair rankings |

For the full architecture breakdown, see [📐 Architecture](docs/ARCHITECTURE.md).

---

## 📊 Benchmark Metrics

Every conversion is automatically evaluated using three metrics:

| Metric | Weight | What It Measures |
|---|---|---|
| ✅ **Syntax Validity** | 40% | Balanced brackets and delimiters |
| 🏗️ **Structural Fidelity** | 40% | Preservation of file count, paths, functions, classes, and imports |
| ⚡ **Token Efficiency** | 20% | Output conciseness relative to other models |

**Scoring formula:**

```
finalScore = syntaxScore × 0.4 + structuralScore × 0.4 + tokenScore × 0.2
```

Scores are normalized to a **0–10 scale**. Full methodology: [📊 Benchmarking](docs/BENCHMARKING.md).

---

## 🔒 Security & Privacy

CodexConvert was built with a **privacy-first architecture** and has undergone a comprehensive security audit:

| | Protection |
|---|---|
| 🔐 | API keys stored in `sessionStorage` only — cleared when the tab closes |
| 🚫 | No backend server — zero server-side data collection |
| 📡 | Direct browser → AI provider communication |
| 🛡️ | Path sanitization prevents ZIP traversal attacks from LLM responses |
| 📦 | No user code stored in benchmark dataset — only scores and metadata |
| 🔍 | TypeScript strict mode enabled across the entire codebase |
| 🧱 | Content Security Policy restricts script sources and connections |
| 🔗 | HTTPS enforced for all remote provider URLs |

Full details: [🔒 Security](docs/SECURITY.md).

---

## 📁 Project Structure

```
.
├── App.tsx                           # Main app — state, conversion orchestration
├── index.tsx                         # React entry point
├── constants.ts                      # Languages, provider presets, model lists
├── types.ts                          # Shared TypeScript interfaces
│
├── core/
│   ├── modelExecutionManager.ts      # Parallel model execution (max 3)
│   ├── benchmark/
│   │   ├── benchmarkEngine.ts        # Runs metrics, produces results
│   │   ├── scoring.ts                # Weighted scoring formula
│   │   ├── benchmarkDataset.ts       # localStorage persistence (max 200 runs)
│   │   ├── rankingEngine.ts          # Historical aggregation → rankings
│   │   ├── types.ts                  # Benchmark & leaderboard types
│   │   └── metrics/
│   │       ├── syntaxCheck.ts        # Balanced bracket validation
│   │       ├── structuralFidelity.ts # File/path/element comparison
│   │       └── tokenUsage.ts         # Token count estimation
│   └── leaderboard/
│       └── leaderboardEngine.ts      # Global + language-pair queries
│
├── services/
│   └── llmService.ts                 # OpenAI-compatible API client + path sanitization
│
├── utils/
│   └── pathSanitizer.ts              # ZIP path traversal prevention + display truncation
│
├── context/
│   ├── ProviderContext.tsx            # LLM provider config (sessionStorage)
│   └── ToastContext.tsx               # Notification system
│
├── components/
│   ├── layout/                       # AppLayout, Sidebar, TopBar
│   ├── converter/                    # ConversionWorkspace (3-panel)
│   ├── benchmark/                    # ScorePanel (metrics breakdown)
│   ├── leaderboard/                  # LeaderboardView, tables, widgets
│   ├── ProviderPicker.tsx            # Provider/model configuration UI
│   ├── ModelSelector.tsx             # Multi-model checkbox selector
│   ├── ComparisonPanel.tsx           # Side-by-side model output cards
│   ├── CodeDisplay.tsx               # Original ↔ converted viewer
│   ├── FileTree.tsx                  # Collapsible file tree
│   ├── PrivacyBadge.tsx              # 🔒 Privacy mode indicator
│   └── Loader.tsx                    # Loading overlay
│
└── docs/
    ├── ARCHITECTURE.md               # System architecture
    ├── BENCHMARKING.md               # Evaluation methodology
    └── SECURITY.md                   # Security model & privacy
```

---

## 🛣️ Roadmap

| Phase | Feature | Status |
|---|---|---|
| Phase 1 | LLM Abstraction Layer | ✅ Complete |
| Phase 2 | Multi-Model Conversion | ✅ Complete |
| Phase 3 | Benchmark & Scoring Engine | ✅ Complete |
| Phase 4 | Open Benchmark Leaderboard | ✅ Complete |
| Phase 5 | Workspace UI Redesign | ✅ Complete |
| Phase 6 | Security Hardening & Documentation | ✅ Complete |
| Phase 7 | Community benchmark submissions & public leaderboard | 🔜 Planned |
| Phase 8 | Advanced metrics (AST comparison, runtime validation) | 🔜 Planned |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- An API key from any supported LLM provider

### Install and run

```bash
git clone https://github.com/aryanjsx/code-converter.git
cd code-converter
npm install
npm run dev
```

Open the printed local URL (typically `http://localhost:3000`) in your browser.

### Configure your provider

1. Select a provider from the dropdown (OpenAI, DeepSeek, Groq, etc.)
2. Enter your API key
3. Choose one or more models
4. Upload a project folder or files
5. Click **Convert** (or **Compare N Models** for multi-model)

No `.env` file is needed. All configuration happens in the browser at runtime.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Bundler | Vite 6 |
| Language | TypeScript 5.8 (strict mode) |
| AI Integration | Any OpenAI-compatible API |
| ZIP Export | JSZip + FileSaver |
| Styling | Tailwind CSS |

---

## 📚 Documentation

| Document | Description |
|---|---|
| [📐 Architecture](docs/ARCHITECTURE.md) | System design and subsystem breakdown |
| [📊 Benchmarking](docs/BENCHMARKING.md) | Evaluation metrics and scoring methodology |
| [🔒 Security](docs/SECURITY.md) | Privacy model, audit results, and security practices |
| [🤝 Contributing](CONTRIBUTING.md) | Development setup and contribution guide |

---

## 🤝 Contributing

Contributions are welcome! Whether it's a new benchmark metric, a provider preset, a UI improvement, or a bug fix — check out our [Contributing Guide](CONTRIBUTING.md) for development setup, code structure, and pull request guidelines.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
