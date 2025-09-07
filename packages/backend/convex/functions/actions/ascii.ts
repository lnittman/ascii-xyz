import { action, internalAction } from "../../_generated/server";
import { v } from "convex/values";
import { generateText } from 'ai';
import { getAsciiModel, DEFAULT_MODEL } from "../../lib/ai";
import { internal } from "../../_generated/api";

// Pure AI-driven ASCII generation with live progress updates
export const generate = action({
  args: {
    prompt: v.string(),
    apiKey: v.optional(v.string()),
    userId: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (ctx, { prompt, apiKey, userId, modelId }): Promise<any> => {
    // Use provided model or default
    const selectedModel = modelId || DEFAULT_MODEL;

    // Create a generation record to track progress
    const generationId = await ctx.runMutation(internal.functions.mutations.generations.createGeneration, {
      userId,
      prompt,
      modelId: selectedModel,
      status: 'planning',
    });

    try {
      // Get user's API key from settings if not provided
      let userApiKey = apiKey;
      if (!userApiKey && userId) {
        try {
          // Get user from database
          const user = await ctx.runQuery(internal.functions.users.getByClerkId, { 
            clerkId: userId 
          });
          
          if (user) {
            const keys = await ctx.runQuery(internal.functions.settings.getUserApiKeys, { 
              userId: user._id 
            });
            // Use OpenRouter key by default, or specific provider key based on model
            userApiKey = keys?.openrouterApiKey || keys?.openaiApiKey || keys?.anthropicApiKey;
          } else {
            console.log('User not found in database, will use server key if available');
          }
        } catch (error) {
          console.log('Could not fetch user API key:', error);
          // Continue without user key - will fall back to server key
        }
      }

      // If still no API key, it will fall back to server environment key in getAsciiModel
      const model = getAsciiModel(selectedModel, userApiKey);
      
      // Step 1: AI analyzes the prompt and creates a generation plan
      const planResponse = await generateText({
        model,
        prompt: `You are an ASCII art expert. Analyze this prompt and create a detailed plan for ASCII animation.

User Prompt: "${prompt}"

Create a JSON plan with:
{
  "interpretation": "what the user wants to see",
  "style": "the ASCII art style (dense, sparse, geometric, organic, etc)",
  "movement": "how things should animate",
  "frameCount": number between 10-60,
  "width": number between 40-120,
  "height": number between 20-40,
  "fps": frames per second (6-24),
  "characters": ["array", "of", "ASCII", "characters", "to", "use"],
  "colorHints": "optional color suggestions if applicable",
  "metadata": {
    "mood": "the feeling/emotion",
    "complexity": "simple|moderate|complex",
    "dynamism": "static|slow|medium|fast"
  }
}

Be creative and contextually aware. If they ask for "ocean waves", plan for flowing horizontal movements. 
If they ask for "matrix rain", plan for vertical cascading characters. 
If they ask for "heartbeat", plan for pulsing expansion/contraction.

Respond with ONLY valid JSON.`,
        temperature: 0.7,
        maxRetries: 2,
      });

      // Parse the generation plan
      type GenerationPlan = {
        interpretation: string;
        style: string;
        movement: string;
        frameCount: number;
        width: number;
        height: number;
        fps: number;
        characters: string[];
        colorHints?: string;
        metadata?: Record<string, unknown>;
      };
      let plan: GenerationPlan;
      try {
        plan = JSON.parse(planResponse.text) as GenerationPlan;
      } catch (_error) {
        await ctx.runMutation(internal.functions.mutations.generations.updateGeneration, {
          generationId,
          status: 'failed',
          error: 'Failed to create generation plan',
        });
        throw new Error("Failed to create generation plan. Please try again.");
      }

      // Update generation with plan and start generating
      await ctx.runMutation(internal.functions.mutations.generations.updateGeneration, {
        generationId,
        status: 'generating',
        plan,
        totalFrames: plan.frameCount,
      })

      // Step 2: Generate frames one by one with snowballed context
      console.log(`Generating ${plan.frameCount} frames with workflow...`);
      
      const frames: string[] = [];
      
      // Generate frames sequentially with context
      for (let i = 0; i < plan.frameCount; i++) {
        console.log(`Generating frame ${i + 1}/${plan.frameCount}...`);
        
        try {
          // Generate a single frame with context from previous frames
          const frame = await ctx.runAction(internal.functions.actions.ascii.generateSingleFrame, {
            plan,
            frameIndex: i,
            previousFrames: frames.slice(-3), // Use last 3 frames as context
            apiKey: userApiKey,
            modelId: selectedModel,
          });
          
          frames.push(frame);
          
          // Update generation with new frame
          await ctx.runMutation(internal.functions.mutations.generations.updateGenerationFrame, {
            generationId,
            frame,
            frameIndex: i,
          });
        } catch (error) {
          console.error(`Failed to generate frame ${i + 1}:`, error);
          // If frame generation fails, try once more with a simpler prompt
          try {
            const fallbackFrame = await ctx.runAction(internal.functions.actions.ascii.generateSingleFrame, {
              plan: {
                ...plan,
                interpretation: `Frame ${i + 1} of ${plan.interpretation}`,
              },
              frameIndex: i,
              previousFrames: frames.slice(-1), // Use only last frame for fallback
              apiKey: userApiKey,
              modelId: selectedModel,
            });
            frames.push(fallbackFrame);
          } catch (fallbackError) {
            console.error(`Fallback generation also failed for frame ${i + 1}:`, fallbackError);
            // Add a placeholder frame to maintain count
            const placeholderFrame = Array(plan.height)
              .fill(null)
              .map(() => ' '.repeat(plan.width))
              .join('\n');
            frames.push(placeholderFrame);
          }
        }
      }
      
      console.log(`Successfully generated ${frames.length} frames`);

      // Mark generation as completed
      await ctx.runMutation(internal.functions.mutations.generations.updateGeneration, {
        generationId,
        status: 'completed',
        completedAt: new Date().toISOString(),
      });

      // Return the complete result with generation ID
      return {
        generationId,
        frames,
        metadata: {
          prompt,
          ...plan,
          generatedAt: new Date().toISOString(),
          model: selectedModel,
          userId,
        }
      };

      } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to generate ASCII art';
      
      // Update generation status to failed
      await ctx.runMutation(internal.functions.mutations.generations.updateGeneration, {
        generationId,
        status: 'failed',
        error: message,
      });
      
      throw new Error(message);
    }
  },
});

// Generate variations of existing ASCII art
export const generateVariation = action({
  args: {
    originalFrames: v.array(v.string()),
    variationPrompt: v.string(),
    apiKey: v.optional(v.string()),
    userId: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (_ctx, { originalFrames, variationPrompt, apiKey, userId, modelId }) => {
    // Use provided model or default
    const selectedModel = modelId || DEFAULT_MODEL;

    try {
      const model = getAsciiModel(selectedModel, apiKey);
      
      // Analyze original and create variation
      const response = await generateText({
        model,
        prompt: `You are modifying existing ASCII art based on a new request.

Original frames (first 3 for context):
${originalFrames.slice(0, 3).map((f, i) => `Frame ${i + 1}:\n${f}`).join('\n\n')}

Total frame count: ${originalFrames.length}

Modification request: "${variationPrompt}"

Create a variation that:
1. Maintains the same dimensions as the original
2. Keeps the same frame count
3. Applies the requested changes while preserving recognizable elements
4. Ensures smooth animation

Return a JSON array of all ${originalFrames.length} modified frames.`,
        temperature: 0.8,
        maxRetries: 2,
      });

      const frames = JSON.parse(response.text);
      
      return {
        frames,
        metadata: {
          prompt: variationPrompt,
          originalFrameCount: originalFrames.length,
          generatedAt: new Date().toISOString(),
          model: selectedModel,
          userId,
        }
      };
    } catch (error: unknown) {
      console.error('Variation generation error:', error);
      const message = error instanceof Error ? error.message : 'Failed to generate variation';
      throw new Error(message);
    }
  },
});

// Upscale/enhance existing ASCII art
// Internal action to generate a single frame with context
export const generateSingleFrame = internalAction({
  args: {
    plan: v.object({
      interpretation: v.string(),
      style: v.string(),
      movement: v.any(), // Changed to v.any() to accept both string and object
      frameCount: v.number(),
      width: v.number(),
      height: v.number(),
      fps: v.number(),
      characters: v.array(v.string()),
      colorHints: v.optional(v.any()), // Changed to v.any() to accept both string and object
      metadata: v.optional(v.any()),
    }),
    frameIndex: v.number(),
    previousFrames: v.array(v.string()),
    apiKey: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (_ctx, { plan, frameIndex, previousFrames, apiKey, modelId }) => {
    const model = getAsciiModel(modelId || DEFAULT_MODEL, apiKey);
    
    // Calculate animation progress
    const progress = frameIndex / (plan.frameCount - 1);
    const isFirstFrame = frameIndex === 0;
    const isLastFrame = frameIndex === plan.frameCount - 1;
    
    // Build context from previous frames
    let contextPrompt = '';
    if (previousFrames.length > 0) {
      contextPrompt = `Previous frames for context (maintain continuity):\n`;
      previousFrames.forEach((frame, idx) => {
        const frameNum = frameIndex - previousFrames.length + idx + 1;
        contextPrompt += `\nFrame ${frameNum}:\n${frame}\n`;
      });
    }
    
    // Generate the frame
    const response = await generateText({
      model,
      prompt: `You are generating frame ${frameIndex + 1} of ${plan.frameCount} for an ASCII animation.

Animation Details:
- Subject: ${plan.interpretation}
- Style: ${plan.style}
- Movement: ${typeof plan.movement === 'string' ? plan.movement : JSON.stringify(plan.movement)}
- Dimensions: ${plan.width}x${plan.height} characters
- Characters to use: ${plan.characters.join('')}
- Animation progress: ${Math.round(progress * 100)}%
${plan.colorHints ? `- Color hints: ${typeof plan.colorHints === 'string' ? plan.colorHints : JSON.stringify(plan.colorHints)}` : ''}

${contextPrompt}

Instructions:
1. Generate ONLY frame ${frameIndex + 1}
2. The frame must be EXACTLY ${plan.width} characters wide and ${plan.height} lines tall
3. Use ONLY these characters: ${plan.characters.join('')}
4. ${isFirstFrame ? 'This is the FIRST frame - establish the starting position' : ''}
5. ${isLastFrame ? 'This is the LAST frame - complete the animation cycle' : ''}
6. ${!isFirstFrame && !isLastFrame ? `Continue the ${typeof plan.movement === 'string' ? plan.movement : 'animation'} movement smoothly from the previous frame` : ''}
7. Maintain the ${plan.style} style throughout

Think step by step:
1. What should be happening at ${Math.round(progress * 100)}% through the animation?
2. How does this frame connect to the previous frame?
3. What subtle changes create smooth motion?

Return ONLY the ASCII art frame as plain text (no JSON, no markdown, no explanation).
Each line must be exactly ${plan.width} characters (use spaces for empty areas).
The frame must have exactly ${plan.height} lines.`,
      temperature: 0.7,
      maxRetries: 2,
    });
    
    // Process and validate the frame
    let frame = response.text.trim();
    
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
    
    return validatedFrame;
  },
});

export const enhance = action({
  args: {
    frames: v.array(v.string()),
    enhancementType: v.union(
      v.literal("double-resolution"),
      v.literal("add-detail"),
      v.literal("smooth-animation"),
      v.literal("stylize")
    ),
    apiKey: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (_ctx, { frames, enhancementType, apiKey, modelId }) => {
    // Match other actions: prefer provided model, else default; prefer user key, else OPENROUTER_API_KEY (handled in getAsciiModel)
    const selectedModel = modelId || DEFAULT_MODEL;
    const model = getAsciiModel(selectedModel, apiKey);
    
    const enhancementPrompts = {
      "double-resolution": "Double the resolution while maintaining the essence",
      "add-detail": "Add more detail and texture to the ASCII art",
      "smooth-animation": "Add intermediate frames for smoother animation",
      "stylize": "Apply a more artistic and refined ASCII style"
    };

    const response = await generateText({
      model,
      prompt: `Enhance these ASCII art frames.

Enhancement type: ${enhancementType}
Instruction: ${enhancementPrompts[enhancementType]}

Original frames to enhance:
${frames.slice(0, 2).join('\n---\n')}

Return enhanced frames as a JSON array.`,
      temperature: 0.7,
      maxRetries: 2,
    });

    return {
      frames: JSON.parse(response.text),
      enhancementType,
    };
  },
});
