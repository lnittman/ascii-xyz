'use server'

import { api } from '@repo/backend/convex/_generated/api';
import { fetchAction } from 'convex/nextjs';
import { auth } from '@clerk/nextjs/server';

export async function generateAsciiArt(prompt: string, modelId?: string, apiKey?: string) {
  try {
    // Get the current user ID (optional)
    const { userId } = await auth();
    
    // Call the Convex action to generate ASCII art
    // This will throw an error if no API key is available
    const result = await fetchAction(api.ascii.actions.generate, {
      prompt,
      userId: userId || undefined,
      modelId: modelId || undefined, // Selected model from jotai atom
      apiKey: apiKey || undefined // Can be provided by user or from env
    });
    
    return result;
  } catch (error: any) {
    console.error('Error generating ASCII art:', error);
    
    // If it's an API key error, throw it to the UI
    if (error.message?.includes('API key required')) {
      throw new Error('API key required. Please add your OpenAI API key in settings.');
    }
    
    // For other errors, throw a generic message
    throw new Error(error.message || 'Failed to generate ASCII art. Please try again.');
  }
}

export async function generateVariation(originalFrames: string[], variationPrompt: string, apiKey?: string) {
  try {
    const { userId } = await auth();
    
    const result = await fetchAction(api.ascii.actions.generateVariation, {
      originalFrames,
      variationPrompt,
      userId: userId || undefined,
      apiKey: apiKey || undefined
    });
    
    return result;
  } catch (error: any) {
    console.error('Error generating variation:', error);
    
    if (error.message?.includes('API key required')) {
      throw new Error('API key required. Please add your OpenAI API key in settings.');
    }
    
    throw new Error(error.message || 'Failed to generate variation.');
  }
}

export async function enhanceAsciiArt(
  frames: string[], 
  enhancementType: 'double-resolution' | 'add-detail' | 'smooth-animation' | 'stylize',
  apiKey?: string
) {
  try {
    const result = await fetchAction(api.ascii.actions.enhance, {
      frames,
      enhancementType,
      apiKey: apiKey || undefined
    });
    
    return result;
  } catch (error: any) {
    console.error('Error enhancing ASCII art:', error);
    
    if (error.message?.includes('API key required')) {
      throw new Error('API key required. Please add your OpenAI API key in settings.');
    }
    
    throw new Error(error.message || 'Failed to enhance ASCII art.');
  }
}