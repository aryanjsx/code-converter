/**
 * Detect obvious syntax issues in converted code by checking
 * bracket balance while skipping strings and comments.
 */
export function runSyntaxCheck(code: string): boolean {
  const stack: string[] = [];
  const matching: Record<string, string> = { ')': '(', '}': '{', ']': '[' };

  let i = 0;
  while (i < code.length) {
    const ch = code[i];
    const next = i + 1 < code.length ? code[i + 1] : '';

    // Line comment: // or #
    if ((ch === '/' && next === '/') || ch === '#') {
      while (i < code.length && code[i] !== '\n') i++;
      continue;
    }

    // Block comment: /* ... */
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < code.length - 1 && !(code[i] === '*' && code[i + 1] === '/')) i++;
      i += 2;
      continue;
    }

    // String literals: skip everything until the matching close quote
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      i++;
      while (i < code.length) {
        if (code[i] === '\\') {
          i += 2;
          continue;
        }
        if (code[i] === quote) break;
        i++;
      }
      i++;
      continue;
    }

    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else if (ch === ')' || ch === '}' || ch === ']') {
      if (stack.length === 0 || stack[stack.length - 1] !== matching[ch]) {
        return false;
      }
      stack.pop();
    }

    i++;
  }

  return stack.length === 0;
}
