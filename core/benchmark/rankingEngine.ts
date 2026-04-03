import type { BenchmarkRun, ModelRanking } from './types';

/**
 * Aggregate benchmark runs and produce a ranked list of models
 * sorted by average final score (descending).
 */
export function calculateModelRanking(runs: BenchmarkRun[]): ModelRanking[] {
  const aggregates = new Map<string, { totalScore: number; count: number }>();

  for (const run of runs) {
    for (const result of run.results) {
      const entry = aggregates.get(result.model);
      if (entry) {
        entry.totalScore += result.finalScore;
        entry.count += 1;
      } else {
        aggregates.set(result.model, { totalScore: result.finalScore, count: 1 });
      }
    }
  }

  const rankings: ModelRanking[] = [];
  for (const [model, { totalScore, count }] of aggregates) {
    rankings.push({
      model,
      avgScore: Math.round((totalScore / count) * 10) / 10,
      totalRuns: count,
    });
  }

  rankings.sort((a, b) => b.avgScore - a.avgScore || b.totalRuns - a.totalRuns);
  return rankings;
}
