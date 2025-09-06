'use server'

import { api } from '@repo/backend/convex/_generated/api';
import { fetchMutation } from 'convex/nextjs';
import { auth } from '@clerk/nextjs/server';

export async function saveAsciiArt(
  prompt: string,
  frames: string[],
  metadata: any,
  visibility: 'public' | 'private' | 'unlisted' = 'private'
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('User must be authenticated to save artwork');
    }
    
    // Save to Convex
    const artworkId = await fetchMutation(api.functions.mutations.ascii.save, {
      userId,
      prompt,
      frames,
      metadata: {
        width: metadata.width || 80,
        height: metadata.height || 24,
        frameCount: metadata.frameCount || frames.length,
        fps: metadata.fps || 12,
        interpretation: metadata.interpretation || prompt,
        style: metadata.style || 'default',
        movement: metadata.movement || 'static',
        characters: metadata.characters || [],
        colorHints: metadata.colorHints,
        metadata: metadata.metadata,
        generatedAt: metadata.generatedAt || new Date().toISOString(),
        model: metadata.model || 'unknown',
      },
      visibility,
    });
    
    return { id: artworkId, success: true };
  } catch (error: any) {
    console.error('Error saving ASCII art:', error);
    throw new Error(error.message || 'Failed to save artwork');
  }
}

export async function saveRemixedArt(
  sourceArtworkId: string,
  prompt: string,
  frames: string[],
  metadata: any,
  remixType: string,
  visibility: 'public' | 'private' | 'unlisted' = 'private'
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('User must be authenticated to save artwork');
    }
    
    // Save remix with source tracking
    const artworkId = await fetchMutation(api.functions.mutations.remix.saveRemix, {
      userId,
      sourceArtworkId: sourceArtworkId as any, // Cast to Id type
      prompt,
      frames,
      metadata: {
        width: metadata.width || 80,
        height: metadata.height || 24,
        frameCount: metadata.frameCount || frames.length,
        fps: metadata.fps || 12,
        interpretation: metadata.interpretation || prompt,
        style: metadata.style || 'default',
        movement: metadata.movement || 'static',
        characters: metadata.characters || [],
        colorHints: metadata.colorHints,
        model: metadata.model || 'unknown',
        remixType,
      },
      visibility,
    });
    
    return { id: artworkId, success: true };
  } catch (error: any) {
    console.error('Error saving remixed art:', error);
    throw new Error(error.message || 'Failed to save remix');
  }
}

export async function saveCombinedArt(
  sourceArtworkIds: string[],
  prompt: string,
  frames: string[],
  metadata: any,
  combinationType: string,
  blendRatio?: number,
  visibility: 'public' | 'private' | 'unlisted' = 'private'
) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      throw new Error('User must be authenticated to save artwork');
    }
    
    // Save combination with source tracking
    const artworkId = await fetchMutation(api.functions.mutations.remix.saveCombination, {
      userId,
      sourceArtworkIds: sourceArtworkIds as any[], // Cast to Id[] type
      prompt,
      frames,
      metadata: {
        width: metadata.width || 80,
        height: metadata.height || 24,
        frameCount: metadata.frameCount || frames.length,
        fps: metadata.fps || 12,
        interpretation: metadata.interpretation || prompt,
        style: metadata.style || 'default',
        movement: metadata.movement || 'static',
        characters: metadata.characters || [],
        model: metadata.model || 'unknown',
        combinationType,
        blendRatio,
      },
      visibility,
    });
    
    return { id: artworkId, success: true };
  } catch (error: any) {
    console.error('Error saving combined art:', error);
    throw new Error(error.message || 'Failed to save combination');
  }
}