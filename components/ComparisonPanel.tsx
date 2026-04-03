import React, { useState, useMemo } from 'react';
import { SUPPORTED_LANGUAGES } from '../constants';
import { truncatePath } from '../utils/pathSanitizer';
import type { ModelResult, ConvertedFile, Language } from '../types';
import type { BenchmarkResult } from '../core/benchmark/types';

interface ComparisonPanelProps {
  modelResults: ModelResult[];
  selectedOriginalPath: string | null;
  sourceLangId: string;
  targetLangId: string;
  benchmarkResults?: BenchmarkResult[];
}

function findMatchingFile(
  originalPath: string,
  files: ConvertedFile[],
  sourceLang: Language,
  targetLang: Language,
): ConvertedFile | null {
  let potentialPath = originalPath;
  if (originalPath.endsWith(sourceLang.extension)) {
    potentialPath = originalPath.slice(0, -sourceLang.extension.length) + targetLang.extension;
  }

  let match = files.find(f => f.path === potentialPath);
  if (match) return match;

  match = files.find(f => f.path === originalPath);
  if (match) return match;

  const getBase = (p: string) => {
    const name = p.substring(p.lastIndexOf('/') + 1);
    const dot = name.lastIndexOf('.');
    return dot > -1 ? name.substring(0, dot) : name;
  };
  const originalBase = getBase(originalPath);
  match = files.find(f => getBase(f.path) === originalBase && f.path.endsWith(targetLang.extension));
  return match ?? null;
}

const CopyButton: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="text-xs text-gray-500 hover:text-white transition-colors flex items-center gap-1"
      aria-label="Copy code"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          <span className="text-green-400">Copied</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          <span>Copy</span>
        </>
      )}
    </button>
  );
};

const StatusBadge: React.FC<{ status: ModelResult['status'] }> = ({ status }) => {
  switch (status) {
    case 'processing':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-400">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          Converting
        </span>
      );
    case 'success':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          Done
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-red-400">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-gray-500" />
          Pending
        </span>
      );
  }
};

function scoreColor(score: number): string {
  if (score >= 7) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25';
  if (score >= 4) return 'bg-amber-500/15 text-amber-400 border-amber-500/25';
  return 'bg-red-500/15 text-red-400 border-red-500/25';
}

const ScoreBadge: React.FC<{ benchmark: BenchmarkResult }> = ({ benchmark }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setExpanded(prev => !prev)}
        className={`text-xs font-bold px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${scoreColor(benchmark.finalScore)}`}
        title="Click for metric details"
      >
        {benchmark.finalScore.toFixed(1)}/10
      </button>
      {expanded && (
        <div className="absolute left-0 top-full mt-1.5 w-56 bg-gray-900 border border-white/10 rounded-lg shadow-xl p-3 z-30 text-xs space-y-1.5 animate-fade-in">
          {benchmark.metrics.map(m => (
            <div key={m.name} className="flex items-center justify-between">
              <span className="text-gray-400 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${m.passed ? 'bg-emerald-400' : 'bg-red-400'}`} />
                {m.name}
              </span>
              <span className="text-gray-300 font-mono">{m.details}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ModelColumn: React.FC<{
  result: ModelResult;
  matchedFile: ConvertedFile | null;
  targetLanguage: string;
  benchmark?: BenchmarkResult;
}> = ({ result, matchedFile, targetLanguage, benchmark }) => {
  return (
    <div className="flex flex-col h-full min-w-[300px] flex-1 rounded-xl border border-white/5 overflow-hidden bg-gray-900/40">
      {/* Column header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/5 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-semibold text-gray-200 truncate max-w-[180px]" title={result.model}>
            {truncatePath(result.model)}
          </span>
          <StatusBadge status={result.status} />
          {benchmark && <ScoreBadge benchmark={benchmark} />}
        </div>
        <div className="flex items-center gap-2">
          {matchedFile && (
            <span className="text-xs font-mono bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/20">
              {targetLanguage}
            </span>
          )}
          {matchedFile && <CopyButton code={matchedFile.content} />}
        </div>
      </div>

      {/* Column body */}
      <div className="flex-1 overflow-auto custom-scrollbar bg-gray-950/50">
        {result.status === 'processing' && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-sm">Converting with {result.model}...</p>
          </div>
        )}

        {result.status === 'pending' && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            <p className="text-sm">Waiting...</p>
          </div>
        )}

        {result.status === 'error' && (
          <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
            <div className="p-3 bg-red-500/10 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            </div>
            <p className="text-sm font-medium text-red-300">Conversion Failed</p>
            <p className="text-xs text-red-400/80 max-w-[250px] leading-relaxed">{result.error}</p>
          </div>
        )}

        {result.status === 'success' && matchedFile && (
          <pre className="text-sm font-mono leading-relaxed p-4">
            <code>{matchedFile.content}</code>
          </pre>
        )}

        {result.status === 'success' && !matchedFile && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
            <p className="text-sm">Select a file to view converted code</p>
            <p className="text-xs text-gray-700">
              {result.files?.length ?? 0} file(s) converted
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ComparisonPanel: React.FC<ComparisonPanelProps> = ({
  modelResults,
  selectedOriginalPath,
  sourceLangId,
  targetLangId,
  benchmarkResults,
}) => {
  const sourceLang = SUPPORTED_LANGUAGES.find(l => l.id === sourceLangId)!;
  const targetLang = SUPPORTED_LANGUAGES.find(l => l.id === targetLangId)!;

  const benchmarkMap = useMemo(() => {
    const map = new Map<string, BenchmarkResult>();
    if (benchmarkResults) {
      for (const br of benchmarkResults) {
        map.set(br.model, br);
      }
    }
    return map;
  }, [benchmarkResults]);

  const matchedFiles = useMemo(() => {
    if (!selectedOriginalPath) return new Map<string, ConvertedFile | null>();
    const map = new Map<string, ConvertedFile | null>();
    for (const result of modelResults) {
      if (result.status === 'success' && result.files) {
        map.set(result.model, findMatchingFile(selectedOriginalPath, result.files, sourceLang, targetLang));
      } else {
        map.set(result.model, null);
      }
    }
    return map;
  }, [modelResults, selectedOriginalPath, sourceLang, targetLang]);

  if (modelResults.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-600 gap-3 p-6">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="opacity-50"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
        <p className="text-sm font-medium">No conversion results yet</p>
        <p className="text-xs text-gray-700">Run a conversion to compare models side-by-side</p>
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-x-auto custom-scrollbar gap-3 p-3">
      {modelResults.map((result) => (
        <ModelColumn
          key={result.model}
          result={result}
          matchedFile={matchedFiles.get(result.model) ?? null}
          targetLanguage={targetLang.name}
          benchmark={benchmarkMap.get(result.model)}
        />
      ))}
    </div>
  );
};

export default ComparisonPanel;
