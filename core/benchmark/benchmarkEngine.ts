import { runSyntaxCheck } from './metrics/syntaxCheck';
import { calculateTokenUsage } from './metrics/tokenUsage';
import { calculateStructuralFidelity } from './metrics/structuralFidelity';
import { computeFinalScore } from './scoring';
import type { BenchmarkResult, MetricResult } from './types';
import type { ModelResult, Language } from '../../types';

function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? '');
    reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsText(file);
  });
}

/**
 * Run the full benchmark suite against all successful model outputs.
 *
 * This is a pure evaluation layer — it never calls the LLM service or
 * mutates conversion results.  Each metric is wrapped in a try/catch so
 * a single failure does not crash the entire benchmark.
 */
export async function runBenchmark(
  modelResults: ModelResult[],
  originalFiles: File[],
  sourceLanguage: Language,
  targetLanguage: Language,
): Promise<BenchmarkResult[]> {
  const successfulResults = modelResults.filter(
    r => r.status === 'success' && r.files && r.files.length > 0,
  );
  if (successfulResults.length === 0) return [];

  // Pre-read original file contents (needed for structural fidelity)
  const originalPaths: string[] = [];
  const originalContents: string[] = [];

  for (const file of originalFiles) {
    originalPaths.push(file.webkitRelativePath || file.name);
    try {
      originalContents.push(await readFileContent(file));
    } catch {
      originalContents.push('');
    }
  }

  // ── First pass: collect raw metrics per model ────────────────────────
  const rawResults = successfulResults.map(result => {
    const files = result.files!;
    const allCode = files.map(f => f.content).join('\n');
    const metrics: MetricResult[] = [];

    // Syntax check
    let syntaxValid = true;
    try {
      syntaxValid = runSyntaxCheck(allCode);
      metrics.push({
        name: 'Syntax Check',
        score: syntaxValid ? 1.0 : 0.0,
        passed: syntaxValid,
        details: syntaxValid ? 'Balanced brackets' : 'Unmatched brackets detected',
      });
    } catch (err) {
      console.error('Benchmark: syntax check failed for', result.model, err instanceof Error ? err.message : '');
      metrics.push({ name: 'Syntax Check', score: 0, passed: false, details: 'Metric error' });
      syntaxValid = false;
    }

    // Token usage
    let tokenUsage = 0;
    try {
      tokenUsage = calculateTokenUsage(allCode);
      metrics.push({
        name: 'Token Usage',
        score: tokenUsage,
        passed: true,
        details: `~${tokenUsage.toLocaleString()} tokens`,
      });
    } catch (err) {
      console.error('Benchmark: token usage failed for', result.model, err instanceof Error ? err.message : '');
      metrics.push({ name: 'Token Usage', score: 0, passed: false, details: 'Metric error' });
    }

    // Structural fidelity
    let structuralScore = 0;
    try {
      structuralScore = calculateStructuralFidelity(
        originalPaths,
        originalContents,
        files,
        sourceLanguage.extension,
        targetLanguage.extension,
      );
      metrics.push({
        name: 'Structural Fidelity',
        score: structuralScore,
        passed: structuralScore >= 0.5,
        details: `${Math.round(structuralScore * 100)}% fidelity`,
      });
    } catch (err) {
      console.error('Benchmark: structural fidelity failed for', result.model, err instanceof Error ? err.message : '');
      metrics.push({ name: 'Structural Fidelity', score: 0, passed: false, details: 'Metric error' });
    }

    return { model: result.model, syntaxValid, tokenUsage, structuralScore, metrics };
  });

  // ── Normalize token scores across models ─────────────────────────────
  const nonZeroTokens = rawResults.map(r => r.tokenUsage).filter(t => t > 0);
  const minTokenUsage = nonZeroTokens.length > 0 ? Math.min(...nonZeroTokens) : 0;

  // ── Second pass: compute final scores ────────────────────────────────
  return rawResults.map(raw => {
    const tokenEfficiency =
      raw.tokenUsage === 0 ? 0 : minTokenUsage > 0 ? minTokenUsage / raw.tokenUsage : 1.0;

    // Update the Token Usage metric with normalized efficiency info
    const tokenMetric = raw.metrics.find(m => m.name === 'Token Usage');
    if (tokenMetric) {
      tokenMetric.score = tokenEfficiency;
      tokenMetric.details = `~${raw.tokenUsage.toLocaleString()} tokens (${Math.round(tokenEfficiency * 100)}% efficiency)`;
    }

    return {
      model: raw.model,
      metrics: raw.metrics,
      syntaxValid: raw.syntaxValid,
      tokenUsage: raw.tokenUsage,
      structuralScore: raw.structuralScore,
      finalScore: computeFinalScore(
        raw.syntaxValid,
        raw.structuralScore,
        raw.tokenUsage,
        minTokenUsage,
      ),
    };
  });
}
