import React from 'react';
import type { LeaderboardEntry } from '../../core/benchmark/types';

interface ModelRankingTableProps {
  entries: LeaderboardEntry[];
}

function scoreColor(score: number): string {
  if (score >= 8) return 'text-emerald-400';
  if (score >= 6) return 'text-yellow-400';
  if (score >= 4) return 'text-orange-400';
  return 'text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 8) return 'bg-emerald-500/10';
  if (score >= 6) return 'bg-yellow-500/10';
  if (score >= 4) return 'bg-orange-500/10';
  return 'bg-red-500/10';
}

const ModelRankingTable: React.FC<ModelRankingTableProps> = ({ entries }) => {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 opacity-50"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
        <p className="text-sm">No benchmark data available yet.</p>
        <p className="text-xs mt-1 text-gray-600">Run conversions to populate the leaderboard.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider">
            <th className="py-3 px-4 text-left w-16">Rank</th>
            <th className="py-3 px-4 text-left">Model</th>
            <th className="py-3 px-4 text-right">Avg Score</th>
            <th className="py-3 px-4 text-right">Runs</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr
              key={entry.model}
              className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
            >
              <td className="py-3 px-4">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                  entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                  entry.rank === 2 ? 'bg-gray-400/20 text-gray-300' :
                  entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                  'bg-gray-800 text-gray-500'
                }`}>
                  {entry.rank}
                </span>
              </td>
              <td className="py-3 px-4 font-medium text-white">{entry.model}</td>
              <td className="py-3 px-4 text-right">
                <span className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold ${scoreColor(entry.avgScore)} ${scoreBg(entry.avgScore)}`}>
                  {entry.avgScore.toFixed(1)}
                </span>
              </td>
              <td className="py-3 px-4 text-right text-gray-400">{entry.totalRuns}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModelRankingTable;
