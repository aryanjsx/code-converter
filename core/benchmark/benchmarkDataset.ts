import type { BenchmarkRun } from './types';

const STORAGE_KEY = 'codexconvert-benchmark-history';
const MAX_RUNS = 200;

interface BenchmarkDataset {
  runs: BenchmarkRun[];
}

function loadDataset(): BenchmarkDataset {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.runs)) {
        return { runs: parsed.runs };
      }
    }
  } catch {
    // Corrupted or unavailable — start fresh
  }
  return { runs: [] };
}

function saveDataset(dataset: BenchmarkDataset): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset));
  } catch {
    console.warn('Failed to persist benchmark history to localStorage.');
  }
}

export function addBenchmarkRun(run: BenchmarkRun): void {
  const dataset = loadDataset();
  dataset.runs.push(run);
  if (dataset.runs.length > MAX_RUNS) {
    dataset.runs = dataset.runs.slice(-MAX_RUNS);
  }
  saveDataset(dataset);
}

export function getBenchmarkRuns(): BenchmarkRun[] {
  return loadDataset().runs;
}
