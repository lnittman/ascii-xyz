import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

export function loadPrompt(
  relativePath: string,
  defaultValue = '',
  _options?: any
): string {
  try {
    // In production, files are relative to the bundled output
    // In development, they're relative to src/mastra
    const possiblePaths = [
      // Try relative to current working directory + src/mastra
      join(process.cwd(), 'src', 'mastra', relativePath),
      // Try relative to just current working directory (for production)
      join(process.cwd(), relativePath),
      // Try absolute path resolution
      resolve(relativePath),
    ];

    let content: string | null = null;
    let successPath: string | null = null;

    for (const path of possiblePaths) {
      try {
        content = readFileSync(path, 'utf-8');
        successPath = path;
        break;
      } catch (_e) {
        // Continue to next path
      }
    }

    if (!content) {
      throw new Error(
        `Could not find file at any of: ${possiblePaths.join(', ')}`
      );
    }

    // Process XML includes
    const basePath = dirname(successPath!);
    content = processIncludes(content, basePath);

    return content.trim();
  } catch (_error) {
    if (defaultValue) {
      return defaultValue;
    }
    throw new Error(`Failed to load prompt: ${relativePath}`);
  }
}

function processIncludes(content: string, basePath: string): string {
  const includeRegex = /<include\s+path="([^"]+)"\s*\/>/g;

  return content.replace(includeRegex, (_match, path) => {
    try {
      const processedPath = path.replace('~/instructions/', '');
      const includePath = join(basePath, processedPath);
      const includeContent = readFileSync(includePath, 'utf-8');
      return includeContent.trim();
    } catch (_error) {
      return `<!-- Include failed: ${path} -->`;
    }
  });
}
