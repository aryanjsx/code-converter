/**
 * Prevent path traversal attacks from LLM-returned file paths.
 * Strips backslashes, empty segments, `.`, and `..` to ensure
 * paths remain relative and cannot escape the output directory.
 */
export function sanitizePath(filePath: string): string {
  return filePath
    .replace(/\\/g, '/')
    .split('/')
    .filter(segment =>
      segment !== '' &&
      segment !== '.' &&
      segment !== '..',
    )
    .join('/');
}

/**
 * Truncate long paths for display so they don't overflow UI elements.
 */
export function truncatePath(filePath: string, maxLength = 120): string {
  if (filePath.length <= maxLength) return filePath;
  return '...' + filePath.slice(-maxLength);
}
