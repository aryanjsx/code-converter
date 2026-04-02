
import type { Language, ProviderPreset } from './types';

export const PROVIDER_PRESETS: ProviderPreset[] = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1', defaultModel: 'gpt-4o-mini' },
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1', defaultModel: 'deepseek-chat' },
  { id: 'mistral', name: 'Mistral', baseUrl: 'https://api.mistral.ai/v1', defaultModel: 'mistral-large-latest' },
  { id: 'groq', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1', defaultModel: 'llama-3.3-70b-versatile' },
  { id: 'ollama', name: 'Ollama (Local)', baseUrl: 'http://localhost:11434/v1', defaultModel: 'llama3' },
  { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai', defaultModel: 'gemini-2.5-pro' },
  { id: 'openrouter', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1', defaultModel: 'anthropic/claude-sonnet-4' },
  { id: 'together', name: 'Together AI', baseUrl: 'https://api.together.xyz/v1', defaultModel: 'meta-llama/Llama-3-70b-chat-hf' },
  { id: 'custom', name: 'Custom', baseUrl: '', defaultModel: '' },
];

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'python', name: 'Python', extension: '.py' },
  { id: 'javascript', name: 'JavaScript', extension: '.js' },
  { id: 'typescript', name: 'TypeScript', extension: '.ts' },
  { id: 'java', name: 'Java', extension: '.java' },
  { id: 'go', name: 'Go', extension: '.go' },
  { id: 'rust', name: 'Rust', extension: '.rs' },
  { id: 'c', name: 'C', extension: '.c' },
  { id: 'cpp', name: 'C++', extension: '.cpp' },
  { id: 'csharp', name: 'C#', extension: '.cs' },
  { id: 'ruby', name: 'Ruby', extension: '.rb' },
  { id: 'php', name: 'PHP', extension: '.php' },
  { id: 'swift', name: 'Swift', extension: '.swift' },
  { id: 'kotlin', name: 'Kotlin', extension: '.kt' },
  { id: 'scala', name: 'Scala', extension: '.scala' },
  { id: 'dart', name: 'Dart', extension: '.dart' },
  { id: 'r', name: 'R', extension: '.r' },
  { id: 'perl', name: 'Perl', extension: '.pl' },
  { id: 'shell', name: 'Shell Script', extension: '.sh' },
  { id: 'julia', name: 'Julia', extension: '.jl' },
  { id: 'matlab', name: 'MATLAB', extension: '.m' },
  { id: 'fortran', name: 'Fortran', extension: '.f90' },
  { id: 'cobol', name: 'COBOL', extension: '.cbl' },
  { id: 'lisp', name: 'Lisp', extension: '.lisp' },
];
