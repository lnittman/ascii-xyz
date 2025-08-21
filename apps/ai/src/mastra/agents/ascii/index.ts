import { Agent } from '@mastra/core';
import { z } from 'zod';
import path from 'path';
import fs from 'fs';

const loadInstructions = () => {
  const instructionsPath = path.join(__dirname, 'instructions.xml');
  return fs.readFileSync(instructionsPath, 'utf-8');
};

export const asciiGenerationAgent = new Agent({
  name: 'ascii-generator',
  description: 'Generates ASCII art animations from text prompts',
  instructions: loadInstructions(),
  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'none',
  },
  tools: {},
});

export const asciiModificationAgent = new Agent({
  name: 'ascii-modifier',
  description: 'Modifies existing ASCII art based on new prompts',
  instructions: `
    ${loadInstructions()}
    
    When given existing ASCII art frames and a modification prompt:
    1. Analyze the existing art style, density, and animation pattern
    2. Apply the requested modifications while preserving the original essence
    3. Maintain frame dimensions and animation smoothness
    4. Return the modified frames in the same JSON array format
  `,
  model: {
    provider: 'ANTHROPIC',
    name: 'claude-3-5-sonnet-20241022',
    toolChoice: 'none',
  },
  tools: {},
});

export const generateAsciiFrames = async (
  prompt: string,
  options?: {
    width?: number;
    height?: number;
    frameCount?: number;
    existingFrames?: string[];
  }
) => {
  const width = options?.width || 80;
  const height = options?.height || 24;
  const frameCount = options?.frameCount || 6;
  
  const agent = options?.existingFrames 
    ? asciiModificationAgent 
    : asciiGenerationAgent;
  
  const systemPrompt = options?.existingFrames
    ? `Existing frames: ${JSON.stringify(options.existingFrames)}\n\nModification request: ${prompt}`
    : `Generate ${frameCount} frames of ASCII art animation.\nDimensions: ${width} characters wide, ${height} lines tall.\nPrompt: ${prompt}`;
  
  try {
    const response = await agent.generate(systemPrompt);
    
    // Parse the JSON response
    const frames = JSON.parse(response.text);
    
    if (!Array.isArray(frames)) {
      throw new Error('Invalid response format: expected JSON array');
    }
    
    return {
      frames,
      metadata: {
        width,
        height,
        frameCount: frames.length,
        prompt,
        model: agent.model.name,
        generator: agent.name,
      }
    };
  } catch (error) {
    console.error('ASCII generation error:', error);
    throw new Error(`Failed to generate ASCII art: ${error.message}`);
  }
};

// Schema for validating ASCII generation requests
export const asciiGenerationSchema = z.object({
  prompt: z.string().min(1).max(1000),
  width: z.number().int().min(20).max(200).optional(),
  height: z.number().int().min(10).max(100).optional(),
  frameCount: z.number().int().min(1).max(60).optional(),
  parentId: z.string().uuid().optional(),
});

export type AsciiGenerationRequest = z.infer<typeof asciiGenerationSchema>;