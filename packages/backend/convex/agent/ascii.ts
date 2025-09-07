import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action, internalAction, internalMutation } from "../_generated/server";
import { getAsciiModel, DEFAULT_MODEL } from "../lib/ai";
import { Id } from "../_generated/dataModel";
import { generateObject, generateText } from 'ai';
import { z } from 'zod';

// Create a new generation thread with metadata
export const createGenerationThread = internalAction({
  args: {
    prompt: v.string(),
    userId: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { prompt, userId, modelId }): Promise<{ threadId: Id<"artworkGenerations">; generationId: Id<"artworkGenerations"> }> => {
    // Create generation record
    const generationId = await ctx.runMutation(internal.functions.mutations.generations.createGeneration, {
      userId,
      prompt,
      modelId: modelId || DEFAULT_MODEL,
      status: 'planning',
    });

    // Create thread ID (we'll use the generation ID as thread ID for simplicity)
    const threadId = generationId;

    // Store initial thinking trace
    await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
      generationId,
      trace: "Initializing ASCII generation...",
      type: "system",
    });

    return { threadId, generationId };
  },
});

// Generate metadata and plan
export const generateMetadata = internalAction({
  args: {
    threadId: v.id("artworkGenerations"),
    prompt: v.string(),
    apiKey: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { threadId, prompt, apiKey, modelId }) => {
    const generationId = threadId; // Using same ID for simplicity
    
    // Add thinking trace
    await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
      generationId,
      trace: "Analyzing prompt and creating animation plan...",
      type: "planning",
    });

    const model = getAsciiModel(modelId || DEFAULT_MODEL, apiKey);
    
    // Generate metadata and plan
    const response = await generateObject({
      model,
      schema: z.object({
        interpretation: z.string().describe("What the user wants to see"),
        subject: z.string().describe("Main subject of the animation"),
        style: z.string().describe("ASCII art style (dense, sparse, geometric, etc)"),
        movement: z.string().describe("How things should animate"),
        frameCount: z.number().min(10).max(60).describe("Number of frames"),
        width: z.number().min(40).max(120).describe("Width in characters"),
        height: z.number().min(20).max(40).describe("Height in lines"),
        fps: z.number().min(6).max(24).describe("Frames per second"),
        characters: z.array(z.string()).describe("ASCII characters to use"),
        colorHints: z.string().optional().describe("Optional color suggestions"),
        thinkingProcess: z.array(z.string()).describe("Step-by-step thought process"),
      }),
      prompt: `Analyze this ASCII animation request and create a detailed plan.

User Request: "${prompt}"

Think through:
1. What is the main subject and how should it look?
2. What style of ASCII art fits best?
3. How should the animation move?
4. What frame count and dimensions work best?
5. Which ASCII characters create the best effect?

Be creative and contextually aware. Provide your thinking process step by step.`,
    });

    const plan = response.object;

    // Store thinking traces
    for (const thought of plan.thinkingProcess) {
      await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
        generationId,
        trace: thought,
        type: "planning",
      });
    }

    // Update generation with plan
    await ctx.runMutation(internal.functions.mutations.generations.updateGeneration, {
      generationId,
      status: 'generating',
      plan: {
        interpretation: plan.interpretation,
        style: plan.style,
        movement: plan.movement,
        frameCount: plan.frameCount,
        width: plan.width,
        height: plan.height,
        fps: plan.fps,
        characters: plan.characters,
        colorHints: plan.colorHints,
        metadata: { subject: plan.subject },
      },
      totalFrames: plan.frameCount,
    });

    return plan;
  },
});

// Generate a single frame with thread context
export const generateFrame = internalAction({
  args: {
    threadId: v.id("artworkGenerations"),
    frameIndex: v.number(),
    plan: v.object({
      interpretation: v.string(),
      subject: v.string(),
      style: v.string(),
      movement: v.string(),
      frameCount: v.number(),
      width: v.number(),
      height: v.number(),
      fps: v.number(),
      characters: v.array(v.string()),
      colorHints: v.optional(v.string()),
    }),
    previousFrames: v.array(v.string()),
    apiKey: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { threadId, frameIndex, plan, previousFrames, apiKey, modelId }) => {
    const generationId = threadId;
    
    // Add thinking trace for this frame
    await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
      generationId,
      trace: `Generating frame ${frameIndex + 1}/${plan.frameCount}...`,
      type: "frame",
      metadata: { frameIndex },
    });

    const model = getAsciiModel(modelId || DEFAULT_MODEL, apiKey);
    
    // Calculate animation progress
    const progress = frameIndex / (plan.frameCount - 1);
    const isFirstFrame = frameIndex === 0;
    const isLastFrame = frameIndex === plan.frameCount - 1;
    
    // Build context from previous frames
    let contextPrompt = '';
    if (previousFrames.length > 0) {
      contextPrompt = `Previous frames for continuity:\n`;
      previousFrames.forEach((frame, idx) => {
        const frameNum = frameIndex - previousFrames.length + idx + 1;
        contextPrompt += `\nFrame ${frameNum}:\n${frame}\n`;
      });
    }
    
    // Generate thinking trace for frame logic
    const thinkingResponse = await generateText({
      model,
      prompt: `You're generating frame ${frameIndex + 1} of ${plan.frameCount} for an ASCII animation.

Subject: ${plan.subject}
Style: ${plan.style}
Movement: ${plan.movement}
Progress: ${Math.round(progress * 100)}%

${contextPrompt}

Think through:
1. Where should the subject be positioned at this point in the animation?
2. What changes from the previous frame?
3. How to maintain smooth motion?

Provide brief thinking in 1-2 sentences.`,
      temperature: 0.7,
    });

    // Store frame thinking
    await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
      generationId,
      trace: thinkingResponse.text,
      type: "frame",
      metadata: { frameIndex },
    });
    
    // Generate the actual frame
    const frameResponse = await generateText({
      model,
      prompt: `Generate frame ${frameIndex + 1} of ${plan.frameCount}.

Animation: ${plan.interpretation}
Style: ${plan.style}
Movement: ${plan.movement}
Dimensions: ${plan.width}x${plan.height} characters
Characters: ${plan.characters.join('')}
Progress: ${Math.round(progress * 100)}%

${contextPrompt}

${isFirstFrame ? 'This is the FIRST frame - establish starting position' : ''}
${isLastFrame ? 'This is the LAST frame - complete the animation cycle' : ''}
${!isFirstFrame && !isLastFrame ? 'Continue smooth motion from previous frame' : ''}

Based on thinking: ${thinkingResponse.text}

Return ONLY the ASCII art frame (no JSON, no markdown, no explanation).
Each line must be exactly ${plan.width} characters (use spaces for empty areas).
The frame must have exactly ${plan.height} lines.`,
      temperature: 0.7,
      maxRetries: 2,
    });
    
    // Process and validate the frame
    let frame = frameResponse.text.trim();
    
    // Remove any markdown code blocks if present
    if (frame.includes('```')) {
      const match = frame.match(/```[\s\S]*?\n([\s\S]*?)```/);
      if (match) {
        frame = match[1].trim();
      }
    }
    
    // Ensure correct dimensions
    const lines = frame.split('\n');
    
    // Pad or trim to correct height
    while (lines.length < plan.height) {
      lines.push(' '.repeat(plan.width));
    }
    if (lines.length > plan.height) {
      lines.splice(plan.height);
    }
    
    // Ensure each line is correct width
    const validatedFrame = lines.map(line => {
      if (line.length > plan.width) {
        return line.substring(0, plan.width);
      }
      return line.padEnd(plan.width, ' ');
    }).join('\n');
    
    // Update generation with new frame
    await ctx.runMutation(internal.functions.mutations.generations.updateGenerationFrame, {
      generationId,
      frame: validatedFrame,
      frameIndex,
    });
    
    return validatedFrame;
  },
});

// Store thinking traces for UI display
export const addThinkingTrace = internalMutation({
  args: {
    generationId: v.id("artworkGenerations"),
    trace: v.string(),
    type: v.union(v.literal("system"), v.literal("planning"), v.literal("frame")),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, { generationId, trace, type, metadata }) => {
    const generation = await ctx.db.get(generationId);
    if (!generation) return;
    
    // Store traces in a new field (we'll add this to schema)
    const traces = generation.thinkingTraces || [];
    traces.push({
      trace,
      type,
      metadata,
      timestamp: Date.now(),
    });
    
    await ctx.db.patch(generationId, {
      thinkingTraces: traces as any,
    });
  },
});

// Main generation action using the agent pattern
export const generateWithAgent = action({
  args: {
    prompt: v.string(),
    apiKey: v.optional(v.string()),
    userId: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { prompt, apiKey, userId, modelId }): Promise<any> => {
    try {
      // Step 1: Create thread and generation record
      const { threadId, generationId } = await ctx.runAction(internal.agent.ascii.createGenerationThread, {
        prompt,
        userId,
        modelId,
      });

      // Step 2: Generate metadata and plan
      const plan = await ctx.runAction(internal.agent.ascii.generateMetadata, {
        threadId,
        prompt,
        apiKey,
        modelId,
      });

      // Step 3: Generate frames iteratively with the same thread
      const frames: string[] = [];
      
      for (let i = 0; i < plan.frameCount; i++) {
        console.log(`Generating frame ${i + 1}/${plan.frameCount} with agent...`);
        
        try {
          const frame = await ctx.runAction(internal.agent.ascii.generateFrame, {
            threadId,
            frameIndex: i,
            plan,
            previousFrames: frames.slice(-3), // Last 3 frames for context
            apiKey,
            modelId,
          });
          
          frames.push(frame);
        } catch (error) {
          console.error(`Failed to generate frame ${i + 1}:`, error);
          // Add error trace
          await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
            generationId,
            trace: `Error generating frame ${i + 1}: ${error}`,
            type: "system",
          });
          
          // Add placeholder frame
          const placeholderFrame = Array(plan.height)
            .fill(null)
            .map(() => ' '.repeat(plan.width))
            .join('\n');
          frames.push(placeholderFrame);
        }
      }

      // Step 4: Mark as completed
      await ctx.runMutation(internal.functions.mutations.generations.updateGeneration, {
        generationId,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      // Return complete result
      return {
        generationId,
        threadId,
        frames,
        metadata: {
          prompt,
          ...plan,
          generatedAt: new Date().toISOString(),
          model: modelId || DEFAULT_MODEL,
          userId,
        }
      };

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate ASCII art';
      throw new Error(message);
    }
  },
});