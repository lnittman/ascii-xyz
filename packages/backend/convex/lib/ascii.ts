/**
 * ASCII Art Helper Functions
 * Utility functions for ASCII art operations
 */

import type { Id } from "../_generated/dataModel";

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
export function parseAIResponse(response: any): string[] {
  if (!response) {
    return ["ERROR: No response from AI"];
  }

  // Try to parse frames from various response formats
  if (Array.isArray(response.frames)) {
    return response.frames;
  }

  if (typeof response.frames === "string") {
    try {
      const parsed = JSON.parse(response.frames);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // If not JSON, treat as single frame
      return [response.frames];
    }
  }

  // Fallback to text/content fields
  if (response.text) {
    return [response.text];
  }
  
  if (response.content) {
    return [response.content];
  }

  return ["ERROR: Unable to parse AI response"];
}

/**
 * Format artwork metadata for export
 */
export function formatArtworkForExport(artwork: any) {
  return {
    id: artwork._id,
    prompt: artwork.prompt,
    frames: artwork.frames,
    metadata: {
      width: artwork.width,
      height: artwork.height,
      fps: artwork.fps,
      frameCount: artwork.frameCount,
      generator: artwork.generator,
      model: artwork.model,
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
  artwork: any,
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