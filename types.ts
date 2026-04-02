
export interface Language {
  id: string;
  name: string;
  extension: string;
}

export interface FileNode {
  name: string;
  path: string;
  content?: string;
  children: FileNode[];
  isFolder: boolean;
}

export interface ConvertedFile {
  path: string;
  content: string;
}

export interface ProviderPreset {
  id: string;
  name: string;
  baseUrl: string;
  defaultModel: string;
}

export interface LLMProviderConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  model: string;
}
