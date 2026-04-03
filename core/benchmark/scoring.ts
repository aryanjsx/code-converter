/**
 * Weighted scoring formula.
 *
 *   syntax validity  → 40%
 *   structural fidelity → 40%
 *   token efficiency  → 20%
 *
 * Final score is normalized to the 0–10 range.
 */

const WEIGHTS = {
  syntax: 0.4,
  structural: 0.4,
  token: 0.2,
} as const;

/**
 * Compute a final benchmark score for a single model.
 *
 * @param syntaxValid   Whether the code passed the syntax check.
 * @param structuralScore  Structural fidelity score (0–1).
 * @param tokenUsage    Approximate token count for this model's output.
 * @param minTokenUsage The lowest non-zero token count across all models
 *                      (used to normalize token efficiency).
 */
export function computeFinalScore(
  syntaxValid: boolean,
  structuralScore: number,
  tokenUsage: number,
  minTokenUsage: number,
): number {
  const syntaxScore = syntaxValid ? 1.0 : 0.0;

  let tokenScore: number;
  if (tokenUsage === 0) {
    tokenScore = 0;
  } else if (minTokenUsage <= 0) {
    tokenScore = 1.0;
  } else {
    tokenScore = minTokenUsage / tokenUsage;
  }

  const raw =
    syntaxScore * WEIGHTS.syntax +
    structuralScore * WEIGHTS.structural +
    tokenScore * WEIGHTS.token;

  return Math.round(raw * 100) / 10;
}
