/**
 * ASCII Art Helper Functions
 * Utility functions for ASCII art operations
 */

import type { Doc } from "../_generated/dataModel";

/**
 * Generate a unique token for sharing
 */
export function generateShareToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Validate ASCII art frames
 */
export function validateFrames(frames: string[]): boolean {
  if (!Array.isArray(frames) || frames.length === 0) {
    return false;
  }
  
  return frames.every(frame => typeof frame === "string" && frame.length > 0);
}

/**
 * Parse AI response to extract frames
 */
export function parseAIResponse(response: unknown): string[] {
  const r = response as Record<string, unknown> | null | undefined;
  interface ResponseLike {
    frames?: unknown;
    text?: unknown;
    content?: unknown;
  }
  if (!r) {
    return ["ERROR: No response from AI"];
  }

  // Try to parse frames from various response formats
  const framesField = (r as ResponseLike).frames;
  if (Array.isArray(framesField)) {
    return framesField as string[];
  }

  if (typeof framesField === "string") {
    try {
      const parsed = JSON.parse(framesField);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // If not JSON, treat as single frame
      return [framesField];
    }
  }

  // Fallback to text/content fields
  const textField = (r as ResponseLike).text;
  if (typeof textField === "string") {
    return [textField];
  }
  const contentField = (r as ResponseLike).content;
  if (typeof contentField === "string") {
    return [contentField];
  }

  return ["ERROR: Unable to parse AI response"];
}

/**
 * Format artwork metadata for export
 */
export function formatArtworkForExport(artwork: Doc<"artworks">) {
  return {
    id: artwork._id,
    prompt: artwork.prompt,
    frames: artwork.frames,
    metadata: {
      width: artwork.metadata.width,
      height: artwork.metadata.height,
      fps: artwork.metadata.fps,
      frameCount: artwork.frames.length,
      generator: artwork.metadata.generator,
      model: artwork.metadata.model,
    },
    createdAt: artwork._creationTime,
    visibility: artwork.visibility,
    stats: {
      views: artwork.views,
      likes: artwork.likes,
    },
  };
}

/**
 * Check if user owns artwork
 */
export function canUserAccessArtwork(
  artwork: Doc<"artworks">,
  userId: string | null
): boolean {
  // Public artworks are accessible to everyone
  if (artwork.visibility === "public") {
    return true;
  }
  
  // Private artworks only accessible to owner
  if (artwork.visibility === "private") {
    return artwork.userId === userId;
  }
  
  // Unlisted artworks accessible to anyone with the link
  if (artwork.visibility === "unlisted") {
    return true;
  }
  
  return false;
}

/**
 * Generate default ASCII frame
 */
export function generateDefaultFrame(message: string = "ASCII ART"): string {
  const border = "+".padEnd(79, "-") + "+";
  const padding = "|".padEnd(79, " ") + "|";
  const content = `| ${message.padEnd(76, " ")} |`;
  
  return [
    border,
    padding,
    content,
    padding,
    border,
  ].join("\n");
}
