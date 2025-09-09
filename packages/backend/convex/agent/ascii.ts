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

// Generate metadata and plan with world-class XML prompting
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
    
    // World-class XML prompt for metadata generation
    const xmlPrompt = `<ascii_animation_planner>
  <role>You are an expert ASCII animation artist and creative director with deep understanding of:
    - ASCII art aesthetics and character selection
    - Animation principles (timing, easing, motion)
    - Visual storytelling through text characters
    - Technical constraints of terminal-based art
  </role>

  <request>
    <user_prompt>${prompt}</user_prompt>
  </request>

  <task>
    Analyze the user's request and create a comprehensive animation plan.
    Think deeply about the artistic vision, technical execution, and viewer experience.
  </task>

  <analysis_framework>
    <interpretation>
      - What is the user really asking for?
      - What emotions or experiences should this evoke?
      - What's the narrative or visual journey?
    </interpretation>
    
    <subject_analysis>
      - Primary subject and secondary elements
      - Visual hierarchy and focal points
      - Symbolic or literal representation
    </subject_analysis>
    
    <style_selection>
      - Dense (████): Heavy, dramatic, high contrast
      - Sparse (· · ·): Light, minimalist, ethereal
      - Geometric (╱╲╳): Angular, structured, technical
      - Organic (≈~∿): Flowing, natural, curved
      - Mixed: Combination for depth and texture
    </style_selection>
    
    <motion_design>
      - Linear: Constant speed, mechanical
      - Eased: Natural acceleration/deceleration
      - Bouncing: Playful, energetic
      - Flowing: Smooth, continuous
      - Pulsing: Rhythmic, breathing
    </motion_design>
    
    <technical_parameters>
      - Frame count: Balance smoothness vs generation time (10-60)
      - Dimensions: Readable on various screens (40-120w x 20-40h)
      - FPS: Perception of motion (6-24)
      - Character palette: Visual consistency and contrast
    </technical_parameters>
  </analysis_framework>

  <thinking_process>
    For each decision, provide clear reasoning:
    1. "I interpret this as..." (understanding)
    2. "The subject should be..." (visual design)
    3. "The style that best captures..." (aesthetic choice)
    4. "The motion should..." (animation design)
    5. "Technical specs..." (practical constraints)
  </thinking_process>

  <output_specification>
    Return a JSON object with EXACTLY this structure:
    {
      "interpretation": "Clear description of what will be animated",
      "subject": "Main visual element to be depicted",
      "style": "dense|sparse|geometric|organic|mixed",
      "movement": "linear|eased|bouncing|flowing|pulsing|custom",
      "frameCount": <number between 10-60>,
      "width": <number between 40-120>,
      "height": <number between 20-40>,
      "fps": <number between 6-24>,
      "characters": ["array", "of", "ASCII", "characters"],
      "colorHints": "optional color or mood suggestions",
      "thinkingProcess": [
        "Step 1: Understanding...",
        "Step 2: Visual design...",
        "Step 3: Style selection...",
        "Step 4: Motion planning...",
        "Step 5: Technical optimization..."
      ]
    }
  </output_specification>

  <quality_criteria>
    - Creativity: Surprise and delight with unexpected interpretations
    - Coherence: All elements work together harmoniously
    - Feasibility: Achievable within ASCII constraints
    - Impact: Memorable and engaging result
  </quality_criteria>
</ascii_animation_planner>

Generate the animation plan as specified. Return ONLY valid JSON.`;

    // Use Convex action retrier for robustness
    const maxAttempts = 3;
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await generateObject({
          model,
          mode: 'json',
          schema: z.object({
            interpretation: z.string().describe("What the user wants to see"),
            subject: z.string().describe("Main subject of the animation"),
            style: z.enum(["dense", "sparse", "geometric", "organic", "mixed"]),
            movement: z.enum(["linear", "eased", "bouncing", "flowing", "pulsing", "custom"]),
            frameCount: z.number().min(10).max(60).describe("Number of frames"),
            width: z.number().min(40).max(120).describe("Width in characters"),
            height: z.number().min(20).max(40).describe("Height in lines"),
            fps: z.number().min(6).max(24).describe("Frames per second"),
            characters: z.array(z.string()).describe("ASCII characters to use"),
            colorHints: z.string().optional().describe("Optional color suggestions"),
            thinkingProcess: z.array(z.string()).min(5).describe("Step-by-step thought process"),
          }),
          prompt: xmlPrompt,
          temperature: 0.7,
          maxRetries: 3,
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
        
      } catch (error) {
        lastError = error;
        console.error(`Attempt ${attempt}/${maxAttempts} failed:`, error);
        
        if (attempt < maxAttempts) {
          await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
            generationId,
            trace: `Retrying plan generation (attempt ${attempt + 1}/${maxAttempts})...`,
            type: "system",
          });
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }
    
    // All attempts failed - this should never happen with a world-class prompt
    throw new Error(`Failed to generate animation plan after ${maxAttempts} attempts: ${lastError}`);
  },
});

// Generate a single frame with world-class XML prompting
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
    let previousFramesXml = '';
    if (previousFrames.length > 0) {
      previousFramesXml = '<previous_frames>\n';
      previousFrames.forEach((frame, idx) => {
        const frameNum = frameIndex - previousFrames.length + idx + 1;
        previousFramesXml += `  <frame number="${frameNum}">\n${frame}\n  </frame>\n`;
      });
      previousFramesXml += '</previous_frames>\n';
    }
    
    // World-class XML prompt for frame generation
    const framePrompt = `<ascii_frame_generator>
  <role>You are an expert ASCII animator creating frame ${frameIndex + 1} of ${plan.frameCount} in a smooth animation sequence.</role>
  
  <animation_context>
    <interpretation>${plan.interpretation}</interpretation>
    <subject>${plan.subject}</subject>
    <style>${plan.style}</style>
    <movement>${plan.movement}</movement>
    <progress percentage="${Math.round(progress * 100)}">
      ${isFirstFrame ? '<note>FIRST FRAME - Establish starting position</note>' : ''}
      ${isLastFrame ? '<note>LAST FRAME - Complete the animation cycle</note>' : ''}
      ${!isFirstFrame && !isLastFrame ? '<note>MIDDLE FRAME - Maintain smooth motion</note>' : ''}
    </progress>
  </animation_context>
  
  <technical_constraints>
    <dimensions width="${plan.width}" height="${plan.height}"/>
    <character_palette>${plan.characters.join('')}</character_palette>
    <fps>${plan.fps}</fps>
  </technical_constraints>
  
  ${previousFramesXml}
  
  <animation_principles>
    <continuity>Maintain visual coherence with previous frames</continuity>
    <motion_path>Follow the established trajectory</motion_path>
    <timing>Respect the ${plan.movement} movement style</timing>
    <weight>Objects should feel like they have mass</weight>
    <anticipation>Subtle preparation for major movements</anticipation>
  </animation_principles>
  
  <frame_requirements>
    1. Output EXACTLY ${plan.width} characters per line
    2. Output EXACTLY ${plan.height} lines
    3. Use ONLY characters from the palette: ${plan.characters.join('')}
    4. Maintain subject recognizability
    5. Create smooth motion from previous frame
    6. Fill empty space with spaces, not other characters
  </frame_requirements>
  
  <output_format>
    Return ONLY the ASCII art frame.
    No explanations, no markdown, no JSON.
    Just ${plan.height} lines of exactly ${plan.width} characters each.
  </output_format>
</ascii_frame_generator>`;

    // Use Convex action retrier for robustness
    const maxAttempts = 3;
    let lastError: any;
    let validatedFrame: string = '';
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const frameResponse = await generateText({
          model,
          prompt: framePrompt,
          temperature: 0.6, // Lower temperature for more consistent frames
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
        validatedFrame = lines.map(line => {
          if (line.length > plan.width) {
            return line.substring(0, plan.width);
          }
          return line.padEnd(plan.width, ' ');
        }).join('\n');
        
        // Success! Break out of retry loop
        break;
        
      } catch (error) {
        lastError = error;
        console.error(`Frame generation attempt ${attempt}/${maxAttempts} failed:`, error);
        
        if (attempt < maxAttempts) {
          await ctx.runMutation(internal.agent.ascii.addThinkingTrace, {
            generationId,
            trace: `Retrying frame ${frameIndex + 1} (attempt ${attempt + 1}/${maxAttempts})...`,
            type: "system",
            metadata: { frameIndex },
          });
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
        }
      }
    }
    
    if (!validatedFrame) {
      throw new Error(`Failed to generate frame ${frameIndex + 1} after ${maxAttempts} attempts: ${lastError}`);
    }
    
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
      // If no API key provided, try to get from user settings
      let finalApiKey = apiKey;
      if (!finalApiKey && userId) {
        // Get user from Clerk ID
        const user = await ctx.runQuery(internal.functions.queries.users.getUserByClerkId, { clerkId: userId });
        if (user) {
          // Get user's API keys from settings
          const apiKeys = await ctx.runQuery(internal.functions.settings.getUserApiKeys, { userId: user._id });
          
          // Determine which API key to use based on model
          if (modelId?.startsWith('openrouter/')) {
            finalApiKey = apiKeys.openrouterApiKey;
          } else if (modelId?.startsWith('openai/')) {
            finalApiKey = apiKeys.openaiApiKey;
          } else if (modelId?.startsWith('anthropic/')) {
            finalApiKey = apiKeys.anthropicApiKey;
          } else if (modelId?.startsWith('google/')) {
            finalApiKey = apiKeys.googleApiKey;
          } else {
            // Default to OpenRouter
            finalApiKey = apiKeys.openrouterApiKey;
          }
        }
      }
      
      // If still no API key, throw error
      if (!finalApiKey) {
        throw new Error('API key required. Please add your API key in Settings → Models.');
      }
      
      // Step 1: Create thread and generation record
      const { threadId, generationId } = await ctx.runAction(internal.agent.ascii.createGenerationThread, {
        prompt,
        userId,
        modelId,
      });

      // Step 2: Generate metadata and plan with world-class agent
      // This will retry up to 3 times internally, so it should never fail
      const plan = await ctx.runAction(internal.agent.ascii.generateMetadata, {
        threadId,
        prompt,
        apiKey: finalApiKey,
        modelId,
      });

      // Step 3: Generate frames iteratively with the same thread
      const frames: string[] = [];
      
      for (let i = 0; i < plan.frameCount; i++) {
        console.log(`Generating frame ${i + 1}/${plan.frameCount} with agent...`);
        
        // generateFrame also has internal retry logic, so it should rarely fail
        const frame = await ctx.runAction(internal.agent.ascii.generateFrame, {
          threadId,
          frameIndex: i,
          plan,
          previousFrames: frames.slice(-3), // Last 3 frames for context
          apiKey: finalApiKey,
          modelId,
        });
        
        frames.push(frame);
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