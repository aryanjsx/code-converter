export interface MetricResult {
  name: string;
  score: number;
  passed: boolean;
  details?: string;
}

export interface BenchmarkResult {
  model: string;
  metrics: MetricResult[];
  syntaxValid: boolean;
  tokenUsage: number;
  structuralScore: number;
  finalScore: number;
}

export interface BenchmarkRun {
  id: string;
  timestamp: number;
  sourceLanguage: string;
  targetLanguage: string;
  results: BenchmarkResult[];
}

export interface ModelRanking {
  model: string;
  avgScore: number;
  totalRuns: number;
}

export interface LeaderboardEntry {
  rank: number;
  model: string;
  avgScore: number;
  totalRuns: number;
}

export interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}
