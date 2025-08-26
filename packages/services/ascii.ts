// Temporarily disabled for build compatibility
// import { generateText } from 'ai';
// import { createOpenRouter } from '@openrouter/ai-sdk-provider';

// ASCII generation patterns
function generateMatrixRainFrames(width: number, height: number, frameCount: number): string[] {
  const frames: string[] = [];
  const chars = '01アイウエオカキクケコサシスセソタチツテト';
  
  for (let f = 0; f < frameCount; f++) {
    let frame = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const rand = Math.random();
        if (rand < 0.05) {
          frame += chars[Math.floor(Math.random() * chars.length)];
        } else if (rand < 0.1) {
          frame += '░';
        } else if (rand < 0.15) {
          frame += '▒';
        } else {
          frame += ' ';
        }
      }
      frame += '\n';
    }
    frames.push(frame.trim());
  }
  
  return frames;
}

function generateWaveFrames(width: number, height: number, frameCount: number): string[] {
  const frames: string[] = [];
  
  for (let f = 0; f < frameCount; f++) {
    let frame = '';
    const offset = (f / frameCount) * Math.PI * 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const wave = Math.sin((x / width) * Math.PI * 4 + offset) * (height / 2) + (height / 2);
        const dist = Math.abs(y - wave);
        
        if (dist < 1) frame += '█';
        else if (dist < 2) frame += '▓';
        else if (dist < 3) frame += '▒';
        else if (dist < 4) frame += '░';
        else frame += ' ';
      }
      frame += '\n';
    }
    frames.push(frame.trim());
  }
  
  return frames;
}

function generateDataFlowFrames(width: number, height: number, frameCount: number): string[] {
  const frames: string[] = [];
  const chars = '▁▂▃▄▅▆▇█';
  
  for (let f = 0; f < frameCount; f++) {
    let frame = '';
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const flow = (x + f * 2) % chars.length;
        const intensity = Math.random() > 0.7 ? flow : 0;
        frame += chars[intensity];
      }
      frame += '\n';
    }
    frames.push(frame.trim());
  }
  
  return frames;
}

function generatePulseFrames(width: number, height: number, frameCount: number): string[] {
  const frames: string[] = [];
  
  for (let f = 0; f < frameCount; f++) {
    let frame = '';
    const pulse = Math.sin((f / frameCount) * Math.PI * 2) * 0.5 + 0.5;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const centerX = width / 2;
        const centerY = height / 2;
        const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
        const maxDist = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
        const normalized = dist / maxDist;
        
        if (normalized < pulse * 0.3) frame += '█';
        else if (normalized < pulse * 0.5) frame += '▓';
        else if (normalized < pulse * 0.7) frame += '▒';
        else if (normalized < pulse * 0.9) frame += '░';
        else frame += ' ';
      }
      frame += '\n';
    }
    frames.push(frame.trim());
  }
  
  return frames;
}

export async function generateAsciiArt(prompt: string, apiKey?: string) {
  try {
    // Temporarily use pattern matching without AI to fix build
    // TODO: Fix OpenRouter integration with proper AI SDK v5 compatibility
    
    // Analyze prompt to determine best animation type
    const lowerPrompt = prompt.toLowerCase();
    let type = 'matrix';
    
    if (lowerPrompt.includes('wave') || lowerPrompt.includes('ocean') || lowerPrompt.includes('water')) {
      type = 'wave';
    } else if (lowerPrompt.includes('data') || lowerPrompt.includes('flow') || lowerPrompt.includes('stream')) {
      type = 'dataflow';
    } else if (lowerPrompt.includes('pulse') || lowerPrompt.includes('heart') || lowerPrompt.includes('beat')) {
      type = 'pulse';
    }
    
    const config = {
      type,
      frameCount: 30,
      width: 80,
      height: 24,
      characters: ['0', '1', '░', '▒', '▓'],
      description: prompt
    };
    
    /* Disabled AI generation until SDK compatibility is fixed
    const openRouterKey = apiKey || process.env.OPENROUTER_API_KEY;
    if (!openRouterKey) {
      throw new Error('OpenRouter API key is required');
    }

    const openrouter = createOpenRouter({ 
      apiKey: openRouterKey,
    });

    const { text } = await generateText({
      model: openrouter('anthropic/claude-3.5-sonnet'),
      prompt: `You are an ASCII art expert. Based on this prompt, describe what ASCII animation to create. Be specific about:
1. Animation type (matrix, wave, dataflow, pulse, dots, custom pattern)
2. Frame count (10-60 frames)
3. Dimensions (width: 40-120, height: 20-40)
4. Character set to use
5. Animation speed

Prompt: ${prompt}

Respond in JSON format:
{
  "type": "matrix|wave|dataflow|pulse|custom",
  "frameCount": number,
  "width": number,
  "height": number,
  "characters": string[],
  "description": "brief description"
}`,
      temperature: 0.7,
      maxTokens: 500,
    });
    const config = JSON.parse(text);
    */
    
    // Generate frames based on type
    let frames: string[] = [];
    
    switch (config.type) {
      case 'matrix':
        frames = generateMatrixRainFrames(config.width, config.height, config.frameCount);
        break;
      case 'wave':
        frames = generateWaveFrames(config.width, config.height, config.frameCount);
        break;
      case 'dataflow':
        frames = generateDataFlowFrames(config.width, config.height, config.frameCount);
        break;
      case 'pulse':
        frames = generatePulseFrames(config.width, config.height, config.frameCount);
        break;
      default:
        // For custom patterns, fall back to matrix for now
        frames = generateMatrixRainFrames(config.width, config.height, config.frameCount);
    }

    return {
      frames,
      config,
    };
  } catch (error) {
    console.error('Error generating ASCII art:', error);
    // Fallback to a simple pattern
    return {
      frames: generateMatrixRainFrames(60, 20, 30),
      config: {
        type: 'matrix',
        frameCount: 30,
        width: 60,
        height: 20,
        description: 'Matrix rain animation'
      }
    };
  }
}