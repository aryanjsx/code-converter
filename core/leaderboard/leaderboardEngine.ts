import { getBenchmarkRuns } from '../benchmark/benchmarkDataset';
import { calculateModelRanking } from '../benchmark/rankingEngine';
import type { LeaderboardEntry, LanguagePair } from '../benchmark/types';

function toLeaderboard(rankings: { model: string; avgScore: number; totalRuns: number }[]): LeaderboardEntry[] {
  return rankings.map((r, i) => ({
    rank: i + 1,
    model: r.model,
    avgScore: r.avgScore,
    totalRuns: r.totalRuns,
  }));
}

export function getGlobalLeaderboard(): LeaderboardEntry[] {
  const runs = getBenchmarkRuns();
  return toLeaderboard(calculateModelRanking(runs));
}

export function getLeaderboardByLanguagePair(
  sourceLanguage: string,
  targetLanguage: string,
): LeaderboardEntry[] {
  const runs = getBenchmarkRuns().filter(
    r => r.sourceLanguage === sourceLanguage && r.targetLanguage === targetLanguage,
  );
  return toLeaderboard(calculateModelRanking(runs));
}

export function getAvailableLanguagePairs(): LanguagePair[] {
  const runs = getBenchmarkRuns();
  const seen = new Set<string>();
  const pairs: LanguagePair[] = [];

  for (const run of runs) {
    const key = `${run.sourceLanguage}::${run.targetLanguage}`;
    if (!seen.has(key)) {
      seen.add(key);
      pairs.push({ sourceLanguage: run.sourceLanguage, targetLanguage: run.targetLanguage });
    }
  }

  return pairs;
}

export function getTopModels(limit: number): LeaderboardEntry[] {
  return getGlobalLeaderboard().slice(0, limit);
}
