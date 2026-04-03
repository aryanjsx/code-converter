import type { ConvertedFile } from '../../../types';

/**
 * Count structural elements (functions, classes, imports) in code
 * using language-agnostic regex patterns.
 */
function countStructuralElements(code: string): {
  functions: number;
  classes: number;
  imports: number;
} {
  const countAll = (patterns: RegExp[]): number => {
    let total = 0;
    for (const p of patterns) {
      const matches = code.match(p);
      if (matches) total += matches.length;
    }
    return total;
  };

  const functions = countAll([
    /\bfunction\s+\w+/g,
    /\bdef\s+\w+/g,
    /\bfn\s+\w+/g,
    /\bfunc\s+\w+/g,
    /\bfun\s+\w+/g,
  ]);

  const classes = countAll([
    /\bclass\s+\w+/g,
    /\bstruct\s+\w+/g,
    /\binterface\s+\w+/g,
    /\benum\s+\w+/g,
    /\btrait\s+\w+/g,
  ]);

  const imports = countAll([
    /\bimport\s+/g,
    /\brequire\s*\(/g,
    /\buse\s+\w/g,
    /\b#include\s+/g,
  ]);

  return { functions, classes, imports };
}

function safeRatio(a: number, b: number): number {
  if (a === 0 && b === 0) return 1;
  if (a === 0 || b === 0) return 0;
  return Math.min(a, b) / Math.max(a, b);
}

/**
 * Measure how well the converted output preserves the original project
 * structure — file count, path mapping, and code element counts.
 *
 * Returns a score between 0 and 1.
 */
export function calculateStructuralFidelity(
  originalPaths: string[],
  originalContents: string[],
  convertedFiles: ConvertedFile[],
  sourceExtension: string,
  targetExtension: string,
): number {
  if (originalPaths.length === 0 || convertedFiles.length === 0) return 0;

  // 1. File count preservation (30%)
  const fileCountScore = safeRatio(originalPaths.length, convertedFiles.length);

  // 2. Path structure match (40%)
  let pathMatches = 0;
  for (const origPath of originalPaths) {
    const expectedPath = origPath.endsWith(sourceExtension)
      ? origPath.slice(0, -sourceExtension.length) + targetExtension
      : origPath;

    if (convertedFiles.some(f => f.path === expectedPath || f.path === origPath)) {
      pathMatches++;
    }
  }
  const pathScore = pathMatches / originalPaths.length;

  // 3. Structural element preservation (30%)
  const origCode = originalContents.join('\n');
  const convCode = convertedFiles.map(f => f.content).join('\n');

  const origElements = countStructuralElements(origCode);
  const convElements = countStructuralElements(convCode);

  const funcScore = safeRatio(origElements.functions, convElements.functions);
  const classScore = safeRatio(origElements.classes, convElements.classes);
  const elementScore = (funcScore + classScore) / 2;

  return fileCountScore * 0.3 + pathScore * 0.4 + elementScore * 0.3;
}
