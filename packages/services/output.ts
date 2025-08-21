import { and, db, desc, eq, schema } from '@repo/database';
import { type Change, diffLines, diffWords } from 'diff';

import {
  ServiceError,
  badRequest,
  internalError,
  notFound,
} from './lib/errors';

export type ExportFormat = 'markdown' | 'html' | 'pdf' | 'raw';

export class OutputService {
  /**
   * Create a new output
   */
  async createOutput(
    chatId: string,
    messageId: string,
    title: string,
    type: string,
    content: string,
    metadata?: Record<string, any>,
    isPinned = false
  ) {
    try {
      const [output] = await db
        .insert(schema.outputs)
        .values({
          id: crypto.randomUUID(),
          chatId,
          messageId,
          title,
          type: type as any, // Drizzle enum type
          content,
          metadata,
          isPinned,
          updatedAt: new Date(),
        })
        .returning();

      return output;
    } catch (_error) {
      throw internalError('Failed to create output');
    }
  }

  /**
   * Get a specific output by ID
   */
  async getById(outputId: string) {
    try {
      const [output] = await db
        .select()
        .from(schema.outputs)
        .where(eq(schema.outputs.id, outputId))
        .limit(1);

      if (!output) {
        throw notFound('Output not found');
      }

      return output;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to get output');
    }
  }

  /**
   * Get outputs for a chat
   */
  async getChatOutputs(chatId: string) {
    try {
      const outputs = await db
        .select()
        .from(schema.outputs)
        .where(eq(schema.outputs.chatId, chatId))
        .orderBy(desc(schema.outputs.isPinned), desc(schema.outputs.createdAt));

      return outputs;
    } catch (_error) {
      throw internalError('Failed to get outputs');
    }
  }

  /**
   * Update an output with automatic versioning
   */
  async updateOutput(
    outputId: string,
    data: {
      title?: string;
      content?: string;
      metadata?: Record<string, any>;
      isPinned?: boolean;
    }
  ) {
    try {
      // Get current output
      const current = await this.getById(outputId);

      // Create new version if content changed
      if (data.content && current.content !== data.content) {
        // Get the latest version number
        const [lastVersion] = await db
          .select()
          .from(schema.outputVersions)
          .where(eq(schema.outputVersions.outputId, outputId))
          .orderBy(desc(schema.outputVersions.version))
          .limit(1);

        // Save current content as a version
        await db.insert(schema.outputVersions).values({
          id: `ver-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          outputId,
          content: current.content,
          metadata: current.metadata as any,
          version: (lastVersion?.version || 0) + 1,
        });
      }

      // Update the output
      const [output] = await db
        .update(schema.outputs)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(schema.outputs.id, outputId))
        .returning();

      return output;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to update output');
    }
  }

  /**
   * Delete an output and all its versions
   */
  async deleteOutput(outputId: string) {
    try {
      // Delete all versions first
      await db
        .delete(schema.outputVersions)
        .where(eq(schema.outputVersions.outputId, outputId));

      // Then delete the output
      await db.delete(schema.outputs).where(eq(schema.outputs.id, outputId));
    } catch (_error) {
      throw internalError('Failed to delete output');
    }
  }

  /**
   * Get version history for an output
   */
  async getVersionHistory(outputId: string, limit = 50) {
    try {
      const versions = await db
        .select()
        .from(schema.outputVersions)
        .where(eq(schema.outputVersions.outputId, outputId))
        .orderBy(desc(schema.outputVersions.version))
        .limit(limit);

      return versions;
    } catch (_error) {
      throw internalError('Failed to get version history');
    }
  }

  /**
   * Compare two versions of an output
   */
  async compareVersions(outputId: string, version1: number, version2: number) {
    try {
      const [v1, v2] = await Promise.all([
        db
          .select()
          .from(schema.outputVersions)
          .where(
            and(
              eq(schema.outputVersions.outputId, outputId),
              eq(schema.outputVersions.version, version1)
            )
          )
          .limit(1)
          .then((rows) => rows[0]),
        db
          .select()
          .from(schema.outputVersions)
          .where(
            and(
              eq(schema.outputVersions.outputId, outputId),
              eq(schema.outputVersions.version, version2)
            )
          )
          .limit(1)
          .then((rows) => rows[0]),
      ]);

      if (!v1 || !v2) {
        throw notFound('Version not found');
      }

      const output = await this.getById(outputId);
      const isCode = output.type === 'code';

      // Use line diff for code, word diff for text
      const changes = isCode
        ? diffLines(v1.content, v2.content)
        : diffWords(v1.content, v2.content);

      return {
        version1: { number: v1.version, createdAt: v1.createdAt },
        version2: { number: v2.version, createdAt: v2.createdAt },
        changes,
        stats: {
          additions: changes.filter((c: Change) => c.added).length,
          deletions: changes.filter((c: Change) => c.removed).length,
        },
      };
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to compare versions');
    }
  }

  /**
   * Restore a specific version
   */
  async restoreVersion(outputId: string, versionNumber: number) {
    try {
      const [version] = await db
        .select()
        .from(schema.outputVersions)
        .where(
          and(
            eq(schema.outputVersions.outputId, outputId),
            eq(schema.outputVersions.version, versionNumber)
          )
        )
        .limit(1);

      if (!version) {
        throw notFound('Version not found');
      }

      // Update output with version content (this will create a new version)
      return this.updateOutput(outputId, {
        content: version.content,
        metadata: version.metadata as any,
      });
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to restore version');
    }
  }

  /**
   * Fork an output
   */
  async forkOutput(outputId: string, _userId: string) {
    try {
      const original = await this.getById(outputId);

      // Create new output based on original
      const [fork] = await db
        .insert(schema.outputs)
        .values({
          id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          chatId: original.chatId,
          messageId: original.messageId,
          title: `${original.title} (fork)`,
          type: original.type,
          content: original.content,
          metadata: {
            ...(original.metadata
              ? (original.metadata as Record<string, any>)
              : {}),
            forkedFrom: outputId,
            forkedAt: new Date().toISOString(),
          } as any,
          isPinned: false,
          updatedAt: new Date(),
        })
        .returning();

      return fork;
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to fork output');
    }
  }

  /**
   * Export output in various formats
   */
  async exportOutput(outputId: string, format: ExportFormat) {
    try {
      const output = await this.getById(outputId);

      switch (format) {
        case 'markdown':
          return this.exportAsMarkdown(output);
        case 'html':
          return this.exportAsHtml(output);
        case 'pdf':
          // TODO: Implement PDF export with a library like puppeteer
          throw badRequest('PDF export not yet implemented');
        case 'raw':
          return {
            filename: `${this.slugify(output.title)}.${this.getExtension(output.type)}`,
            content: output.content,
            mimeType: this.getMimeType(output.type),
          };
        default:
          throw badRequest('Invalid export format');
      }
    } catch (error) {
      if (error instanceof ServiceError) {
        throw error;
      }
      throw internalError('Failed to export output');
    }
  }

  private exportAsMarkdown(output: any) {
    let markdown = `# ${output.title}\n\n`;
    markdown += `*Generated by arbor on ${new Date(output.createdAt).toLocaleDateString()}*\n\n`;

    if (output.type === 'code') {
      const language = output.metadata?.language || '';
      markdown += `\`\`\`${language}\n`;
      markdown += output.content;
      markdown += '\n```';
    } else if (output.type === 'markdown') {
      markdown += output.content;
    } else {
      // For other types, just add the content
      markdown += output.content;
    }

    return {
      filename: `${this.slugify(output.title)}.md`,
      content: markdown,
      mimeType: 'text/markdown',
    };
  }

  private exportAsHtml(output: any) {
    let html = `<!DOCTYPE html>
<html>
<head>
`;
    html += `<title>${output.title}</title>
`;
    html += `<meta charset="utf-8">
`;
    html += `<style>
`;
    html += `body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; `;
    html += `max-width: 800px; margin: 0 auto; padding: 2rem; }
`;
    html += `pre { background: #f5f5f5; padding: 1rem; overflow-x: auto; }
`;
    html += `code { font-family: 'Iosevka Term', 'SF Mono', Consolas, monospace; }
`;
    html += `</style>
</head>
<body>
`;
    html += `<h1>${output.title}</h1>
`;
    html += `<p><em>Generated by arbor on ${new Date(output.createdAt).toLocaleDateString()}</em></p>
`;

    if (output.type === 'code') {
      html += `<pre><code>${this.escapeHtml(output.content)}</code></pre>
`;
    } else if (output.type === 'html') {
      // For HTML type, include content directly (but should sanitize in production)
      html += output.content;
    } else {
      // For other types, escape and wrap in paragraph
      html += `<div>${this.escapeHtml(output.content).replace(/\n/g, '<br>')}</div>
`;
    }

    html += `</body>
</html>`;

    return {
      filename: `${this.slugify(output.title)}.html`,
      content: html,
      mimeType: 'text/html',
    };
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private getExtension(type: string): string {
    const extensions: Record<string, string> = {
      code: 'txt',
      markdown: 'md',
      html: 'html',
      json: 'json',
      text: 'txt',
      diagram: 'svg',
      table: 'csv',
    };
    return extensions[type] || 'txt';
  }

  private getMimeType(type: string): string {
    const mimeTypes: Record<string, string> = {
      code: 'text/plain',
      markdown: 'text/markdown',
      html: 'text/html',
      json: 'application/json',
      text: 'text/plain',
      diagram: 'image/svg+xml',
      table: 'text/csv',
    };
    return mimeTypes[type] || 'text/plain';
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

export const outputService = new OutputService();
