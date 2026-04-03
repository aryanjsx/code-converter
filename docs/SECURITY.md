# 🔒 Security and Privacy

This document describes how CodexConvert handles user data, API keys, and communication with external services.

---

## 🏗️ Architecture Principle

CodexConvert is a **fully client-side application**. There is no backend server, database, or intermediary proxy. All processing happens in the browser:

```
┌──────────────┐                    ┌──────────────────┐
│  Your Browser │ ══════════════▶  │  AI Provider API  │
│  (CodexConvert)│  direct HTTPS    │  (OpenAI, etc.)  │
└──────────────┘                    └──────────────────┘
```

CodexConvert itself **never receives, stores, or transmits** your code or API keys.

**Why no backend?** A backend server would create a single point where API keys and proprietary code could be intercepted, logged, or stored. By running entirely in the browser, users maintain full control over their data.

---

## 🔐 API Key Handling

| Aspect | Implementation |
|---|---|
| **Storage** | `sessionStorage` — cleared automatically when the browser tab closes |
| **Persistence option** | Users may opt in to "Remember for this session" which keeps the key in `sessionStorage` for the tab lifetime |
| **No permanent storage** | API keys are **never** written to `localStorage`, cookies, or any persistent store |
| **No server transmission** | Keys are sent only to the AI provider URL configured by the user |
| **Clear control** | A "Clear key" button in the provider picker immediately removes the key from session storage and state |
| **No bundle injection** | API keys are not compiled into the JavaScript bundle — Vite config contains no `define` entries for secrets |

---

## 📂 Code Handling

| Aspect | Implementation |
|---|---|
| **Upload** | Files are read into browser memory via the File API. Nothing is written to disk or sent to a server |
| **Transmission** | Code is sent only to the AI provider endpoint the user selects. No intermediary server is involved |
| **Storage** | Uploaded code is held in React state (memory) and discarded when the page is reloaded or files are replaced |
| **Size limits** | Maximum **500 files**, **50 MB** total — enforced before processing |
| **Binary detection** | Binary files (images, archives, executables) are detected by extension and a warning is displayed |

---

## 🛡️ Path Sanitization

**File:** `utils/pathSanitizer.ts`

LLM responses contain file paths that are used in ZIP exports. A malicious or hallucinated path like `../../.bashrc` could cause a **ZIP path traversal** attack.

**Protection:** All LLM-returned paths pass through `sanitizePath()` which:

1. Normalizes backslashes to forward slashes
2. Splits on `/`
3. Removes empty segments, `.`, and `..`
4. Rejoins into a safe relative path

This is applied in **two layers** (defense in depth):

| Layer | File | When |
|---|---|---|
| LLM response parsing | `services/llmService.ts` | Immediately after parsing the JSON response from the AI provider |
| ZIP export | `App.tsx` | Before every `zip.file()` call during download |

---

## 📊 Benchmark Data

| Aspect | Implementation |
|---|---|
| **Storage** | `localStorage` under key `codexconvert-benchmark-history` |
| **Content** | Model names, scores, metric results, source/target language IDs, timestamps |
| **NOT stored** | ⚠️ **No code content is stored** — only numerical scores and metadata |
| **Capacity** | Maximum 200 runs. Oldest entries are trimmed automatically |

---

## 🌐 Network Security

### HTTPS Enforcement

- **Required** for all remote AI provider URLs
- **Exception:** HTTP is permitted only for `localhost` and `127.0.0.1` (for local models like Ollama)
- Remote HTTP URLs are rejected with: `"Remote AI providers must use HTTPS."`

### SSRF Protection

The `validateBaseUrl()` function in `llmService.ts` blocks private network ranges:

| Blocked Range | Description |
|---|---|
| `10.*` | Private class A network |
| `172.16.0.0 – 172.31.255.255` | Private class B network |
| `192.168.*` | Private class C network |
| `169.254.*` | Link-local addresses |
| `127.0.0.1`, `0.0.0.0`, `::1` | Loopback addresses |

**Exception:** Private/local addresses are allowed when the provider is explicitly set to **Ollama**.

> ⚠️ **DNS Rebinding Note:** DNS rebinding attacks (where a hostname resolves to a public IP during validation but to a private IP at fetch time) cannot be fully prevented in a client-side application. Since this app runs entirely in the user's browser, the impact is limited to the user's own local network.

### Custom Provider Warning

When a user selects "Custom" as the provider, the UI displays a warning:

> ⚠️ You are sending your code to a custom AI endpoint. Ensure you trust this provider.

---

## 🧱 Content Security Policy

The application includes a CSP meta tag in `index.html`:

| Directive | Value | Rationale |
|---|---|---|
| `default-src` | `'self'` | Only allow resources from the same origin by default |
| `script-src` | `'self' 'unsafe-inline' https://cdn.tailwindcss.com` | `unsafe-inline` required for Tailwind CDN play mode config block |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | Inline styles used by Tailwind, Google Fonts for typography |
| `font-src` | `https://fonts.gstatic.com` | Google Fonts CDN |
| `connect-src` | `https: http://localhost:11434 http://127.0.0.1:11434` | Must allow any HTTPS origin because users configure arbitrary AI provider URLs |
| `img-src` | `'self' data:` | Application images and data URIs |

> 💡 `connect-src https:` is intentionally broad because CodexConvert must reach whatever AI provider URL the user configures. This is by design.

---

## 📝 Error Handling and Logging

| Practice | Implementation |
|---|---|
| **Error message truncation** | LLM error responses are capped at 200 characters |
| **API key redaction** | Patterns matching API keys are replaced with `[REDACTED]` in error messages |
| **Safe logging** | `console.error` calls use `err.message` only — full error objects, request payloads, and user code are never logged |
| **Conversion debounce** | The convert button is guarded against duplicate clicks during processing |

---

## 🔍 TypeScript Strict Mode

The entire codebase compiles with `"strict": true` in `tsconfig.json`, which enables:

- `strictNullChecks` — prevents accidental null/undefined access
- `noImplicitAny` — requires explicit types, reducing runtime surprises
- `strictFunctionTypes` — enforces correct callback signatures
- `strictBindCallApply` — prevents incorrect `bind`/`call`/`apply` usage

---

## 🔒 Privacy Notice

Before the first conversion in a session, the application displays a privacy notice informing the user:

- Which AI provider and base URL their code will be sent to
- How many models will receive a copy (if multi-model)
- That CodexConvert does not store code or API keys

The user must acknowledge this notice before the conversion proceeds.

---

## 📋 Security Audit History

| Date | Scope | Findings Fixed |
|---|---|---|
| Phase 6 (initial) | Full repository audit | API key storage migrated to sessionStorage, URL validation added, HTTPS enforcement, CSP implemented, error sanitization, file upload limits |
| Phase 6 (hardening) | Post-cleanup re-audit | Path sanitization for ZIP exports, CDN import map removed, TypeScript strict mode, binary file detection, conversion debounce, dev server restricted to localhost |

---

## 📦 Supported Versions

| Version | Supported |
|---|---|
| Latest (`main` branch) | ✅ Yes |
| Older releases | Best effort |

---

## 🚨 Responsible Disclosure

If you discover a security vulnerability in CodexConvert, please report it responsibly:

1. **Do not** open a public GitHub issue for security vulnerabilities
2. Email the maintainer or use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability) feature
3. Include:
   - Clear description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
4. Allow reasonable time for a fix before public disclosure

We aim to acknowledge reports within **48 hours** and provide a fix or mitigation plan within **7 days**.
