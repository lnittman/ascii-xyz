/**
 * Code export utilities - generate code snippets to reproduce ASCII art
 */

export type SupportedLanguage = 'python' | 'typescript' | 'curl';

export interface CodeExportOptions {
  language?: SupportedLanguage;
  includeComments?: boolean;
}

interface ArtworkLike {
  prompt: string;
  metadata: {
    width?: number;
    height?: number;
    fps?: number;
    model?: string;
    style?: string;
  };
}

/**
 * Escape string for Python string literal
 */
function escapePython(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n');
}

/**
 * Escape string for JSON
 */
function escapeJson(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t');
}

/**
 * Generate Python code using Anthropic SDK
 */
export function generatePythonCode(
  artwork: ArtworkLike,
  includeComments = true
): string {
  const { prompt, metadata } = artwork;
  const width = metadata.width || 80;
  const height = metadata.height || 24;
  const model = metadata.model || 'claude-sonnet-4-20250514';
  const style = metadata.style || 'default';
  const escapedPrompt = escapePython(prompt);

  const comments = includeComments
    ? `# ASCII Art Generator
# Recreate: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"
# Dimensions: ${width}x${height}
# Model: ${model}

`
    : '';

  return `${comments}import anthropic

def generate_ascii(prompt: str, width: int = ${width}, height: int = ${height}) -> str:
    """Generate ASCII art from a prompt using Claude."""
    client = anthropic.Anthropic()

    system_prompt = f"""You are an ASCII art generator. Create ASCII art that:
- Fits within {width} characters wide and {height} lines tall
- Uses standard ASCII characters
- Is visually striking and detailed
- Matches the style: ${style}"""

    message = client.messages.create(
        model="${model}",
        max_tokens=4096,
        system=system_prompt,
        messages=[
            {
                "role": "user",
                "content": f"Create ASCII art of: {prompt}"
            }
        ]
    )

    return message.content[0].text


if __name__ == "__main__":
    prompt = "${escapedPrompt}"
    result = generate_ascii(prompt)
    print(result)
`;
}

/**
 * Generate TypeScript code using Anthropic SDK
 */
export function generateTypeScriptCode(
  artwork: ArtworkLike,
  includeComments = true
): string {
  const { prompt, metadata } = artwork;
  const width = metadata.width || 80;
  const height = metadata.height || 24;
  const model = metadata.model || 'claude-sonnet-4-20250514';
  const style = metadata.style || 'default';
  const escapedPrompt = escapeJson(prompt);

  const comments = includeComments
    ? `// ASCII Art Generator
// Recreate: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"
// Dimensions: ${width}x${height}
// Model: ${model}

`
    : '';

  return `${comments}import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

async function generateAscii(
  prompt: string,
  width: number = ${width},
  height: number = ${height}
): Promise<string> {
  const systemPrompt = \`You are an ASCII art generator. Create ASCII art that:
- Fits within \${width} characters wide and \${height} lines tall
- Uses standard ASCII characters
- Is visually striking and detailed
- Matches the style: ${style}\`;

  const message = await client.messages.create({
    model: "${model}",
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: \`Create ASCII art of: \${prompt}\`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type === "text") {
    return content.text;
  }
  throw new Error("Unexpected response type");
}

// Generate ASCII art
const prompt = "${escapedPrompt}";
generateAscii(prompt).then(console.log);
`;
}

/**
 * Generate curl command for API call
 */
export function generateCurlCommand(
  artwork: ArtworkLike,
  includeComments = true
): string {
  const { prompt, metadata } = artwork;
  const width = metadata.width || 80;
  const height = metadata.height || 24;
  const model = metadata.model || 'claude-sonnet-4-20250514';
  const style = metadata.style || 'default';
  const escapedPrompt = escapeJson(prompt);

  const systemPrompt = `You are an ASCII art generator. Create ASCII art that: - Fits within ${width} characters wide and ${height} lines tall - Uses standard ASCII characters - Is visually striking and detailed - Matches the style: ${style}`;

  const comments = includeComments
    ? `# ASCII Art Generator
# Recreate: "${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}"
# Dimensions: ${width}x${height}
# Model: ${model}

`
    : '';

  return `${comments}curl https://api.anthropic.com/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{
  "model": "${model}",
  "max_tokens": 4096,
  "system": "${escapeJson(systemPrompt)}",
  "messages": [
    {
      "role": "user",
      "content": "Create ASCII art of: ${escapedPrompt}"
    }
  ]
}'`;
}

/**
 * Generate code export in specified language
 */
export function generateCodeExport(
  artwork: ArtworkLike,
  options: CodeExportOptions = {}
): string {
  const { language = 'python', includeComments = true } = options;

  switch (language) {
    case 'python':
      return generatePythonCode(artwork, includeComments);
    case 'typescript':
      return generateTypeScriptCode(artwork, includeComments);
    case 'curl':
      return generateCurlCommand(artwork, includeComments);
    default:
      return generatePythonCode(artwork, includeComments);
  }
}
