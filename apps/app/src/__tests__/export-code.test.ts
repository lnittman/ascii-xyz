import { describe, expect, it } from 'vitest';
import './setup';
import {
  generatePythonCode,
  generateTypeScriptCode,
  generateCurlCommand,
  generateCodeExport,
  type CodeExportOptions,
  type SupportedLanguage,
} from '@/lib/export/code';

const sampleArtwork = {
  prompt: 'A dancing robot in the rain',
  metadata: {
    width: 80,
    height: 24,
    fps: 10,
    model: 'claude-3.5-sonnet',
    style: 'minimal',
  },
};

describe('Code Export', () => {
  describe('generatePythonCode', () => {
    it('generates valid Python code with prompt', () => {
      const code = generatePythonCode(sampleArtwork);

      expect(code).toContain('import anthropic');
      expect(code).toContain(sampleArtwork.prompt);
      expect(code).toContain('def generate_ascii');
    });

    it('includes model from metadata', () => {
      const code = generatePythonCode(sampleArtwork);

      expect(code).toContain('claude-3.5-sonnet');
    });

    it('escapes special characters in prompt', () => {
      const artwork = {
        ...sampleArtwork,
        prompt: 'A "robot" with \\backslash',
      };
      const code = generatePythonCode(artwork);

      // Should not break Python string syntax
      expect(code).toContain('\\"robot\\"');
      expect(code).toContain('\\\\backslash');
    });

    it('includes dimensions in prompt context', () => {
      const code = generatePythonCode(sampleArtwork);

      expect(code).toContain('80');
      expect(code).toContain('24');
    });
  });

  describe('generateTypeScriptCode', () => {
    it('generates valid TypeScript code', () => {
      const code = generateTypeScriptCode(sampleArtwork);

      expect(code).toContain('import Anthropic');
      expect(code).toContain(sampleArtwork.prompt);
      expect(code).toContain('async function generateAscii');
    });

    it('uses ES modules import syntax', () => {
      const code = generateTypeScriptCode(sampleArtwork);

      expect(code).toContain('import Anthropic from');
      expect(code).not.toContain('require(');
    });

    it('includes proper TypeScript types', () => {
      const code = generateTypeScriptCode(sampleArtwork);

      expect(code).toContain(': Promise<string>');
    });
  });

  describe('generateCurlCommand', () => {
    it('generates valid curl command', () => {
      const code = generateCurlCommand(sampleArtwork);

      expect(code).toContain('curl');
      expect(code).toContain('https://api.anthropic.com');
      expect(code).toContain('$ANTHROPIC_API_KEY');
    });

    it('includes proper headers', () => {
      const code = generateCurlCommand(sampleArtwork);

      expect(code).toContain('x-api-key');
      expect(code).toContain('anthropic-version');
      expect(code).toContain('content-type');
    });

    it('escapes JSON properly', () => {
      const artwork = {
        ...sampleArtwork,
        prompt: 'Test "quoted" prompt',
      };
      const code = generateCurlCommand(artwork);

      // Should be valid for shell
      expect(code).toContain('\\"quoted\\"');
    });
  });

  describe('generateCodeExport', () => {
    it('generates Python by default', () => {
      const code = generateCodeExport(sampleArtwork);

      expect(code).toContain('import anthropic');
    });

    it('generates TypeScript when specified', () => {
      const code = generateCodeExport(sampleArtwork, { language: 'typescript' });

      expect(code).toContain('import Anthropic');
    });

    it('generates curl when specified', () => {
      const code = generateCodeExport(sampleArtwork, { language: 'curl' });

      expect(code).toContain('curl');
    });

    it('includes comments when requested', () => {
      const code = generateCodeExport(sampleArtwork, {
        language: 'python',
        includeComments: true,
      });

      expect(code).toContain('#');
    });

    it('excludes comments when not requested', () => {
      const code = generateCodeExport(sampleArtwork, {
        language: 'python',
        includeComments: false,
      });

      // Should still have docstrings but fewer inline comments
      expect(code).not.toMatch(/^#(?!!).*$/m); // No comment-only lines
    });
  });
});

describe('Code Export Edge Cases', () => {
  it('handles empty prompt gracefully', () => {
    const artwork = { ...sampleArtwork, prompt: '' };
    const code = generateCodeExport(artwork);

    expect(code).toBeDefined();
    expect(code.length).toBeGreaterThan(0);
  });

  it('handles multiline prompts', () => {
    const artwork = {
      ...sampleArtwork,
      prompt: 'Line 1\nLine 2\nLine 3',
    };
    const code = generateCodeExport(artwork);

    expect(code).toBeDefined();
    // Should escape newlines properly
    expect(code).toContain('Line 1');
  });

  it('handles missing metadata gracefully', () => {
    const artwork = {
      prompt: 'Simple prompt',
      metadata: {},
    };
    const code = generateCodeExport(artwork as any);

    expect(code).toBeDefined();
  });
});
