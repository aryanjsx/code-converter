import React, { useState, useMemo } from 'react';
import { SUPPORTED_LANGUAGES } from '../../constants';
import {
  getAvailableLanguagePairs,
  getLeaderboardByLanguagePair,
} from '../../core/leaderboard/leaderboardEngine';
import type { LanguagePair, LeaderboardEntry } from '../../core/benchmark/types';
import ModelRankingTable from './ModelRankingTable';

interface LanguagePairLeaderboardProps {
  refreshKey: number;
}

function langName(id: string): string {
  return SUPPORTED_LANGUAGES.find(l => l.id === id)?.name ?? id;
}

function pairLabel(pair: LanguagePair): string {
  return `${langName(pair.sourceLanguage)} → ${langName(pair.targetLanguage)}`;
}

const LanguagePairLeaderboard: React.FC<LanguagePairLeaderboardProps> = ({ refreshKey }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  const pairs: LanguagePair[] = useMemo(() => {
    void refreshKey;
    return getAvailableLanguagePairs();
  }, [refreshKey]);

  const entries: LeaderboardEntry[] = useMemo(() => {
    const pair = pairs[selectedIdx];
    if (!pair) return [];
    return getLeaderboardByLanguagePair(pair.sourceLanguage, pair.targetLanguage);
  }, [pairs, selectedIdx]);

  if (pairs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50"><path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" /></svg>
        <p className="text-sm">No language pair data yet.</p>
        <p className="text-xs mt-1 text-gray-600">Run conversions across different language pairs.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between gap-4 flex-wrap">
        <label htmlFor="pair-select" className="text-xs text-gray-400 font-medium uppercase tracking-wider whitespace-nowrap">
          Select Conversion Pair
        </label>
        <select
          id="pair-select"
          value={selectedIdx}
          onChange={e => setSelectedIdx(Number(e.target.value))}
          className="bg-gray-800/80 border border-gray-700/50 text-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-w-[200px]"
        >
          {pairs.map((pair, i) => (
            <option key={`${pair.sourceLanguage}-${pair.targetLanguage}`} value={i}>
              {pairLabel(pair)}
            </option>
          ))}
        </select>
      </div>
      <ModelRankingTable entries={entries} />
    </div>
  );
};

export default LanguagePairLeaderboard;
