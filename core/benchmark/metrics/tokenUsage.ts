/**
 * Approximate token count using the ~4 characters per token heuristic
 * common to GPT-family tokenizers.
 */
export function calculateTokenUsage(code: string): number {
  if (!code) return 0;
  return Math.ceil(code.length / 4);
}
