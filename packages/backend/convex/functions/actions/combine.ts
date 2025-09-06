import { action } from "../../_generated/server";
import { v } from "convex/values";
import { generateText } from 'ai';
import { getAsciiModel, DEFAULT_MODEL } from "../../lib/ai";

// Combine two ASCII artworks into one
export const combine = action({
  args: {
    artwork1: v.object({
      frames: v.array(v.string()),
      metadata: v.object({
        width: v.number(),
        height: v.number(),
        fps: v.number(),
      }),
    }),
    artwork2: v.object({
      frames: v.array(v.string()),
      metadata: v.object({
        width: v.number(),
        height: v.number(),
        fps: v.number(),
      }),
    }),
    combinationType: v.union(
      v.literal("blend"),      // Overlay/merge frames
      v.literal("sequence"),   // Play one after another
      v.literal("interleave"), // Alternate frames
      v.literal("split"),      // Side by side or top/bottom
    ),
    prompt: v.string(), // Instructions for combination
    apiKey: v.optional(v.string()),
    userId: v.optional(v.string()),
    modelId: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const selectedModel = args.modelId || DEFAULT_MODEL;
    const model = getAsciiModel(selectedModel, args.apiKey);

    try {
      // Different combination strategies
      let combinedFrames: string[] = [];
      let width: number;
      let height: number;
      let fps: number;

      switch (args.combinationType) {
        case "sequence": {
          // Simply concatenate the frame arrays
          combinedFrames = [...args.artwork1.frames, ...args.artwork2.frames];
          width = Math.max(args.artwork1.metadata.width, args.artwork2.metadata.width);
          height = Math.max(args.artwork1.metadata.height, args.artwork2.metadata.height);
          fps = args.artwork1.metadata.fps; // Use first artwork's FPS
          break;
        }

        case "interleave": {
          // Alternate frames from each artwork
          const maxLength = Math.max(args.artwork1.frames.length, args.artwork2.frames.length);
          for (let i = 0; i < maxLength; i++) {
            if (i < args.artwork1.frames.length) {
              combinedFrames.push(args.artwork1.frames[i]);
            }
            if (i < args.artwork2.frames.length) {
              combinedFrames.push(args.artwork2.frames[i]);
            }
          }
          width = Math.max(args.artwork1.metadata.width, args.artwork2.metadata.width);
          height = Math.max(args.artwork1.metadata.height, args.artwork2.metadata.height);
          fps = Math.max(args.artwork1.metadata.fps, args.artwork2.metadata.fps);
          break;
        }

        case "split": {
          // Side by side or top/bottom based on dimensions
          const isHorizontal = args.artwork1.metadata.width + args.artwork2.metadata.width < 120;
          
          if (isHorizontal) {
            // Side by side
            width = args.artwork1.metadata.width + args.artwork2.metadata.width + 2; // +2 for separator
            height = Math.max(args.artwork1.metadata.height, args.artwork2.metadata.height);
          } else {
            // Top/bottom
            width = Math.max(args.artwork1.metadata.width, args.artwork2.metadata.width);
            height = args.artwork1.metadata.height + args.artwork2.metadata.height + 1; // +1 for separator
          }
          fps = args.artwork1.metadata.fps;

          // Create split frames
          const frameCount = Math.max(args.artwork1.frames.length, args.artwork2.frames.length);
          for (let i = 0; i < frameCount; i++) {
            const frame1 = args.artwork1.frames[i % args.artwork1.frames.length];
            const frame2 = args.artwork2.frames[i % args.artwork2.frames.length];
            
            let combinedFrame = '';
            if (isHorizontal) {
              // Combine side by side
              const lines1 = frame1.split('\n');
              const lines2 = frame2.split('\n');
              for (let j = 0; j < height; j++) {
                const line1 = lines1[j] || ' '.repeat(args.artwork1.metadata.width);
                const line2 = lines2[j] || ' '.repeat(args.artwork2.metadata.width);
                combinedFrame += line1 + ' | ' + line2 + '\n';
              }
            } else {
              // Combine top/bottom
              combinedFrame = frame1 + '\n' + '─'.repeat(width) + '\n' + frame2;
            }
            combinedFrames.push(combinedFrame);
          }
          break;
        }

        case "blend":
        default: {
          // Use AI to intelligently blend the frames
          const response = await generateText({
            model,
            prompt: `You are combining two ASCII animations into one blended animation.

Artwork 1 (${args.artwork1.frames.length} frames, ${args.artwork1.metadata.width}x${args.artwork1.metadata.height}):
First frame:
${args.artwork1.frames[0]}

Artwork 2 (${args.artwork2.frames.length} frames, ${args.artwork2.metadata.width}x${args.artwork2.metadata.height}):
First frame:
${args.artwork2.frames[0]}

Combination instructions: "${args.prompt}"

Create a blended animation that:
1. Intelligently merges visual elements from both artworks
2. Creates ${Math.max(args.artwork1.frames.length, args.artwork2.frames.length)} frames
3. Each frame should be ${Math.max(args.artwork1.metadata.width, args.artwork2.metadata.width)} characters wide
4. Each frame should be ${Math.max(args.artwork1.metadata.height, args.artwork2.metadata.height)} lines tall
5. Maintains smooth animation flow
6. Follows the user's combination instructions

Return ONLY a JSON array of frame strings, where each frame contains newlines between rows.`,
            temperature: 0.8,
            maxRetries: 2,
          });

          try {
            combinedFrames = JSON.parse(response.text);
            width = Math.max(args.artwork1.metadata.width, args.artwork2.metadata.width);
            height = Math.max(args.artwork1.metadata.height, args.artwork2.metadata.height);
            fps = Math.round((args.artwork1.metadata.fps + args.artwork2.metadata.fps) / 2);
          } catch (error) {
            throw new Error("Failed to parse blended frames from AI");
          }
        }
      }

      return {
        frames: combinedFrames,
        metadata: {
          width,
          height,
          fps,
          frameCount: combinedFrames.length,
          combinationType: args.combinationType,
          prompt: args.prompt,
          generatedAt: new Date().toISOString(),
          model: selectedModel,
          userId: args.userId,
        }
      };

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to combine ASCII artworks';
      throw new Error(message);
    }
  },
});