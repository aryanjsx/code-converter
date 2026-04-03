import type { Language, ConvertedFile, LLMProviderConfig } from '../types';

const formatFileContent = async (files: File[]): Promise<string> => {
  const fileContents = await Promise.all(
    files.map(file =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          const path = file.webkitRelativePath || file.name;
          resolve(`--- START FILE: ${path} ---\n${text}\n--- END FILE: ${path} ---`);
        };
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
      })
    )
  );
  return fileContents.join('\n\n');
};

const SYSTEM_PROMPT =
  'You are an expert polyglot programmer specializing in large-scale codebase migrations. ' +
  'You MUST respond with a single valid JSON object and nothing else.';

const generatePrompt = (
  sourceLanguage: Language,
  targetLanguage: Language,
  formattedFileContent: string,
): string => `Your task is to convert an entire project from ${sourceLanguage.name} to idiomatic ${targetLanguage.name}.

You must adhere to the following principles STRICTLY:
1.  **Full Project Context**: Analyze all provided files together to understand cross-file dependencies, modules, and the overall architecture before converting. Do not convert files in isolation.
2.  **Architecture Preservation**: The output directory structure and file naming conventions must mirror the input, only changing file extensions where appropriate (e.g., .py to .rs). For single file uploads without a directory structure, create a logical structure if necessary.
3.  **Functionality Equivalence**: The business logic and functionality of the original code must be preserved.
4.  **Idiomatic Conversion**: Use standard libraries, conventions, and best practices for ${targetLanguage.name}. For example, if converting from Python, use Rust's Result/Option types for error handling instead of exceptions.
5.  **Naming and Semantics**: Retain all original variable names, function names, class names, and module names unless a direct equivalent is impossible or unidiomatic.
6.  **Comments and Docs**: Preserve all inline comments, docstrings, and other documentation from the original source code in the converted files.

**INPUT PROJECT STRUCTURE AND FILES:**

${formattedFileContent}

**CONVERSION TASK:**
Convert the entire ${sourceLanguage.name} project above into a complete, functional ${targetLanguage.name} project.

**OUTPUT FORMAT:**
You MUST return a single, valid JSON object. Do not include any text or markdown before or after the JSON object. The JSON object must conform to this exact schema:
{
  "files": [
    {
      "path": "string (the new path of the converted file, e.g., 'src/main.rs')",
      "content": "string (the full content of the converted file)"
    }
  ]
}`;

/**
 * Validate the provider base URL to prevent SSRF and enforce HTTPS for remote endpoints.
 */
function validateBaseUrl(baseUrl: string, providerId: string): void {
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new Error('Invalid base URL format.');
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw new Error('Only HTTP and HTTPS protocols are allowed for the base URL.');
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '');
  const isLocalhost = ['localhost', '127.0.0.1', '0.0.0.0', '::1'].includes(hostname);

  const isPrivateNetwork =
    isLocalhost ||
    hostname.startsWith('10.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('169.254.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);

  if (isPrivateNetwork && providerId !== 'ollama') {
    throw new Error(
      'Private/local network URLs are only allowed for the Ollama provider. ' +
      'Select Ollama or use a public HTTPS endpoint.'
    );
  }

  if (!isLocalhost && parsed.protocol === 'http:') {
    throw new Error('Remote AI providers must use HTTPS.');
  }
}

function sanitizeErrorMessage(raw: string): string {
  let msg = raw.slice(0, 200);
  msg = msg.replace(/\b(sk|key|token|bearer|api[_-]?key)[_-]?[a-zA-Z0-9]{20,}\b/gi, '[REDACTED]');
  if (msg.length < raw.length) {
    msg += '...';
  }
  return msg;
}

/**
 * Strip markdown code fences that some models wrap around JSON output.
 */
function extractJSON(text: string): string {
  let trimmed = text.trim();
  if (trimmed.startsWith('```')) {
    const firstNewline = trimmed.indexOf('\n');
    trimmed = trimmed.slice(firstNewline + 1);
    const lastFence = trimmed.lastIndexOf('```');
    if (lastFence !== -1) {
      trimmed = trimmed.slice(0, lastFence);
    }
  }
  return trimmed.trim();
}

/**
 * Convert a codebase from one language to another using any OpenAI-compatible LLM.
 */
export const convertCodebase = async (
  files: File[],
  sourceLanguage: Language,
  targetLanguage: Language,
  provider: LLMProviderConfig,
): Promise<ConvertedFile[]> => {
  if (!provider.apiKey) {
    throw new Error('API key is not configured for the selected LLM provider.');
  }
  if (!provider.baseUrl) {
    throw new Error('Base URL is not configured for the selected LLM provider.');
  }

  validateBaseUrl(provider.baseUrl, provider.id);

  const formattedFileContent = await formatFileContent(files);
  const prompt = generatePrompt(sourceLanguage, targetLanguage, formattedFileContent);

  const url = `${provider.baseUrl.replace(/\/+$/, '')}/chat/completions`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    let errorMessage: string;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody?.error?.message || JSON.stringify(errorBody);
    } catch {
      errorMessage = await response.text();
    }
    throw new Error(`LLM API error (${response.status}): ${sanitizeErrorMessage(errorMessage)}`);
  }

  const data = await response.json();

  if (!data.choices?.[0]?.message?.content) {
    throw new Error('Unexpected response format from LLM API: no content in response.');
  }

  const rawContent: string = data.choices[0].message.content;
  const jsonString = extractJSON(rawContent);

  let result: { files: ConvertedFile[] };
  try {
    result = JSON.parse(jsonString);
  } catch {
    throw new Error('Failed to parse JSON from LLM response. The model may not have returned valid JSON.');
  }

  if (!Array.isArray(result.files)) {
    throw new Error('Invalid response structure: expected { files: [...] }');
  }

  return result.files;
};
