<div align="center">

  <h1>🧬 Multi‑Language Code Converter</h1>

  <p>
    Convert entire codebases between programming languages using Google's Gemini models.<br />
    Upload a project, pick source and target languages, review side‑by‑side diffs, and download a ready‑to‑run ZIP.
  </p>

  <p>
    <strong>Tech Stack:</strong> React · Vite · TypeScript · @google/genai · JSZip · FileSaver
  </p>

</div>

---

### ✨ Overview

**Multi‑Language Code Converter** is a browser‑based tool that helps you migrate projects between languages using AI.  
It sends your uploaded codebase to Gemini, asks for an idiomatic conversion (preserving structure and behavior), and then lets you:

- **Browse the original and converted projects** via a tree view
- **Compare files side‑by‑side** with syntax‑highlighted code
- **Download the converted project as a ZIP**

The default selection is **Python → Rust**, but many other languages are supported.

---

### 🚀 Features

- **Full‑project conversion**
  - Upload an entire folder or a set of files; the app builds a virtual file tree and sends all context to Gemini.
- **Architecture & naming preserved**
  - Keeps directory structure and file names (only extensions change when appropriate).
- **Side‑by‑side code viewer**
  - Quickly jump between original and converted counterparts with automatic file matching.
- **One‑click ZIP export**
  - Download the converted project as `converted-project.zip`.
- **Modern UI**
  - Glassmorphism‑inspired dark theme with smooth transitions and responsive layout.

---

### 🧠 Supported Languages

The UI currently exposes a rich set of language options (as defined in `constants.ts`), including but not limited to:

- **Python**, **JavaScript**, **TypeScript**, **Java**
- **Go**, **Rust**
- **C**, **C++**, **C#**
- **Ruby**, **PHP**
- **Swift**, **Kotlin**, **Scala**, **Dart**
- **R**, **Perl**, **Shell**, **Julia**, **MATLAB**, **Fortran**, **COBOL**, **Lisp**

Gemini is instructed to:

- Preserve business logic and behavior
- Use idiomatic APIs and best practices for the **target** language
- Keep comments and documentation

---

### 🔧 Prerequisites

- **Node.js** (recommended: ≥ 18)
- A **Google Gemini API key**

You can obtain an API key from the Google AI Studio.

---

### ⚙️ Environment Configuration

The app reads the Gemini key from the **`API_KEY`** environment variable in the frontend build.

In local development, one common setup is:

1. Create an `.env` file in the project root:

   ```bash
   API_KEY=your_gemini_api_key_here
   ```

2. Ensure your dev environment / bundler exposes `API_KEY` to the client (the app accesses it via `process.env.API_KEY`).

> **Note:** Never commit your real API key to version control.

---

### 🏃‍♀️ Run Locally

From the project root:

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure your Gemini API key**

   Make sure `API_KEY` is set and available to the frontend (see the section above).

3. **Start the dev server**

   ```bash
   npm run dev
   ```

4. Open the printed local URL in your browser (typically `http://localhost:5173`).

---

### 🧭 How to Use

1. **Upload your project**
   - Click **“Select Project Folder”** to upload a full codebase, or
   - Click **“Select Files”** to upload a set of individual files.
2. **Choose languages**
   - Pick the **Source Language** that matches your existing code.
   - Pick the **Target Language** you want to convert to.
3. **Convert**
   - Click **“Convert Code”**.
   - You’ll see a loader while Gemini converts your project.
4. **Explore & compare**
   - Browse **Original Project** and **Converted Project** in the side file trees.
   - Click a file in either tree to view side‑by‑side code.
5. **Download**
   - When conversion succeeds, click **“Download ZIP”** to save the converted project.

---

### 🧩 Project Structure (High Level)

- `App.tsx` – Main UI and conversion flow, file trees, side‑by‑side display
- `components/` – Header, language pickers, file tree, code display, toasts, loader, dialogs
- `services/geminiService.ts` – Gemini client integration and conversion prompt orchestration
- `constants.ts` – List of supported languages and metadata
- `types.ts` – Shared TypeScript types (languages, file tree, converted files)

---

### 🔒 Security & Privacy Notes

- Uploaded files are processed in the browser and sent only to the Gemini API endpoint.
- Avoid uploading code that contains **secrets**, **API keys**, or other sensitive credentials.
- Always **review converted output** before using it in production.

---

### 🙌 Contributions & Feedback

If you’d like to extend or customize this app (e.g., add presets, better diffing, or framework‑aware rules), you can:

- Fork the repository
- Open issues or pull requests with improvements

Suggestions and enhancements are very welcome.

---

### 📄 License

This project is provided as‑is; choose and add a license file (e.g., MIT) if you plan to open‑source it publicly.

