import { action } from "../../_generated/server";
import { v } from "convex/values";
import { generateText } from 'ai';
import { getAsciiModel, DEFAULT_MODEL } from "../../lib/ai";

// Pure AI-driven ASCII generation
export const generate = action({
  args: {
    prompt: v.string(),
    apiKey: v.optional(v.string()),
    userId: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (_ctx, { prompt, apiKey, userId, modelId }) => {
    // Use provided model or default
    const selectedModel = modelId || DEFAULT_MODEL;

    try {
      const model = getAsciiModel(selectedModel, apiKey);
      
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
        throw new Error("Failed to create generation plan. Please try again.");
      }

      // Step 2: AI generates the actual ASCII frames based on the plan
      const framesResponse = await generateText({
        model,
        prompt: `You are creating ASCII art animation frames. Follow this exact plan:

${JSON.stringify(plan, null, 2)}

Generate exactly ${plan.frameCount} frames of ASCII art.
Each frame must be:
- Exactly ${plan.width} characters wide
- Exactly ${plan.height} lines tall
- Use only these characters: ${plan.characters.join('')}
- Follow the movement pattern: ${plan.movement}
- Maintain consistent style: ${plan.style}

Create smooth animation transitions between frames.
Think about physics, motion, and visual continuity.

Output format:
Return a JSON array where each element is a complete frame as a single string.
Each frame string should contain newlines (\\n) between rows.

Example structure:
[
  "first frame line 1\\nfirst frame line 2\\n...",
  "second frame line 1\\nsecond frame line 2\\n...",
  ...
]

Generate the frames now:`,
        temperature: 0.8,
        maxRetries: 2,
      });

      // Parse the frames
      let frames;
      try {
        frames = JSON.parse(framesResponse.text);
        
        if (!Array.isArray(frames) || frames.length === 0) {
          throw new Error("Invalid frames format");
        }

        // Validate frame dimensions
        frames = frames.map(frame => {
          const lines = frame.split('\n').filter((line: string) => line.length > 0);
          
          // Ensure correct height
          while (lines.length < plan.height) {
            lines.push(' '.repeat(plan.width));
          }
          if (lines.length > plan.height) {
            lines.splice(plan.height);
          }

          // Ensure correct width
          return lines.map((line: string) => {
            if (line.length > plan.width) {
              return line.substring(0, plan.width);
            }
            return line.padEnd(plan.width, ' ');
          }).join('\n');
        });

      } catch (_error) {
        throw new Error("Failed to generate valid frames. Please try again.");
      }

      // Return the complete result
      return {
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
  },
  handler: async (ctx, { frames, enhancementType, apiKey }) => {
    const key = apiKey || process.env.OPENAI_API_KEY;
    
    if (!key) {
      throw new Error("API key required for enhancement.");
    }

    const model = getAsciiModel(key);
    
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
