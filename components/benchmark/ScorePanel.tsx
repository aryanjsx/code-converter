import React from 'react';
import type { BenchmarkResult } from '../../core/benchmark/types';

interface ScorePanelProps {
  results: BenchmarkResult[];
}

function scoreColor(score: number): string {
  if (score >= 7) return 'text-emerald-400';
  if (score >= 4) return 'text-amber-400';
  return 'text-red-400';
}

function scoreBg(score: number): string {
  if (score >= 7) return 'bg-emerald-500/10';
  if (score >= 4) return 'bg-amber-500/10';
  return 'bg-red-500/10';
}

function scoreRing(score: number): string {
  if (score >= 7) return 'border-emerald-500/30';
  if (score >= 4) return 'border-amber-500/30';
  return 'border-red-500/30';
}

const MetricRow: React.FC<{ label: string; value: string; passed?: boolean }> = ({ label, value, passed }) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-xs text-gray-400 flex items-center gap-1.5">
      {passed !== undefined && (
        <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
      )}
      {label}
    </span>
    <span className="text-xs font-mono text-gray-300">{value}</span>
  </div>
);

const ModelScoreCard: React.FC<{ result: BenchmarkResult }> = ({ result }) => (
  <div className="border border-white/5 rounded-xl bg-gray-900/40 overflow-hidden">
    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
      <span className="text-sm font-medium text-white truncate" title={result.model}>
        {result.model}
      </span>
      <span className={`text-lg font-bold ${scoreColor(result.finalScore)}`}>
        {result.finalScore.toFixed(1)}
      </span>
    </div>

    <div className="px-4 py-4 flex items-center justify-center">
      <div className={`w-20 h-20 rounded-full border-4 ${scoreRing(result.finalScore)} ${scoreBg(result.finalScore)} flex items-center justify-center`}>
        <div className="text-center">
          <span className={`text-xl font-bold ${scoreColor(result.finalScore)}`}>
            {result.finalScore.toFixed(1)}
          </span>
          <p className="text-[9px] text-gray-500 -mt-0.5">/10</p>
        </div>
      </div>
    </div>

    <div className="px-4 pb-2">
      <MetricRow label="Syntax Check" value={result.syntaxValid ? 'Passed' : 'Failed'} passed={result.syntaxValid} />
      <MetricRow label="Structural Fidelity" value={result.structuralScore.toFixed(2)} passed={result.structuralScore >= 0.5} />
      <MetricRow label="Token Usage" value={result.tokenUsage.toLocaleString()} />
    </div>

    {result.metrics.length > 0 && (
      <div className="px-4 pb-3 pt-2 border-t border-white/5">
        <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2 font-medium">Details</p>
        {result.metrics.map(m => (
          <MetricRow key={m.name} label={m.name} value={m.details ?? m.score.toFixed(2)} passed={m.passed} />
        ))}
      </div>
    )}
  </div>
);

const ScorePanel: React.FC<ScorePanelProps> = ({ results }) => {
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2 opacity-50">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        <p className="text-sm">No benchmark data yet</p>
        <p className="text-xs mt-1 text-gray-600">Run a conversion to see scores</p>
      </div>
    );
  }

  const avgScore = results.reduce((sum, r) => sum + r.finalScore, 0) / results.length;

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Benchmark Scores</h3>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {results.length} model{results.length !== 1 ? 's' : ''} &middot; avg {avgScore.toFixed(1)}/10
        </p>
      </div>
      {results.map(r => (
        <ModelScoreCard key={r.model} result={r} />
      ))}
    </div>
  );
};

export default ScorePanel;
