import React, { useMemo } from 'react';
import { getGlobalLeaderboard, getTopModels } from '../../core/leaderboard/leaderboardEngine';
import type { LeaderboardEntry } from '../../core/benchmark/types';
import ModelRankingTable from './ModelRankingTable';
import TopModelsWidget from './TopModelsWidget';
import LanguagePairLeaderboard from './LanguagePairLeaderboard';

interface LeaderboardViewProps {
  refreshKey: number;
}

const LeaderboardView: React.FC<LeaderboardViewProps> = ({ refreshKey }) => {
  const globalEntries: LeaderboardEntry[] = useMemo(() => {
    void refreshKey;
    return getGlobalLeaderboard();
  }, [refreshKey]);

  const topEntries: LeaderboardEntry[] = useMemo(() => {
    void refreshKey;
    return getTopModels(3);
  }, [refreshKey]);

  const hasData = globalEntries.length > 0;

  return (
    <div className="flex-1 flex flex-col overflow-auto min-h-0 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400"><path d="M8 21h8" /><path d="M12 17v4" /><path d="M7 4h10" /><path d="M9 4v4.5a.5.5 0 0 0 .5.5h5a.5.5 0 0 0 .5-.5V4" /><circle cx="12" cy="13" r="3" /></svg>
            Benchmark Leaderboard
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {hasData
              ? `${globalEntries.length} model${globalEntries.length !== 1 ? 's' : ''} ranked from historical benchmark data`
              : 'No benchmark data available yet. Run conversions to populate the leaderboard.'}
          </p>
        </div>
      </div>

      {/* Section 1: Global Leaderboard + Top Models side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 shrink-0">
        <div className="lg:col-span-2 glass rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Global Model Rankings</h3>
          </div>
          <ModelRankingTable entries={globalEntries} />
        </div>

        <div className="glass rounded-xl overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-white/5">
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Top Models</h3>
          </div>
          <div className="p-5 flex-1">
            <TopModelsWidget entries={topEntries} />
          </div>
        </div>
      </div>

      {/* Section 2: Language Pair Leaderboard */}
      <div className="glass rounded-xl overflow-hidden shrink-0">
        <div className="px-5 py-3 border-b border-white/5">
          <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Best Models by Language Pair</h3>
        </div>
        <LanguagePairLeaderboard refreshKey={refreshKey} />
      </div>
    </div>
  );
};

export default LeaderboardView;
