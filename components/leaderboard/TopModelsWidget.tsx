import React from 'react';
import type { LeaderboardEntry } from '../../core/benchmark/types';

interface TopModelsWidgetProps {
  entries: LeaderboardEntry[];
}

const MEDALS = ['🥇', '🥈', '🥉'] as const;

function barWidth(score: number): string {
  return `${Math.max((score / 10) * 100, 8)}%`;
}

function barColor(rank: number): string {
  if (rank === 1) return 'from-yellow-500 to-amber-500';
  if (rank === 2) return 'from-gray-400 to-gray-300';
  if (rank === 3) return 'from-orange-500 to-orange-400';
  return 'from-indigo-500 to-violet-500';
}

const TopModelsWidget: React.FC<TopModelsWidgetProps> = ({ entries }) => {
  const top = entries.slice(0, 3);

  if (top.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No models ranked yet.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {top.map((entry, i) => (
        <div key={entry.model} className="flex items-center gap-3">
          <span className="text-lg w-7 text-center shrink-0" aria-hidden="true">
            {MEDALS[i] ?? `#${entry.rank}`}
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-white truncate">{entry.model}</span>
              <span className="text-xs font-bold text-gray-300 ml-2 shrink-0">{entry.avgScore.toFixed(1)}</span>
            </div>
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${barColor(entry.rank)} transition-all duration-500`}
                style={{ width: barWidth(entry.avgScore) }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">{entry.totalRuns} run{entry.totalRuns !== 1 ? 's' : ''}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopModelsWidget;
