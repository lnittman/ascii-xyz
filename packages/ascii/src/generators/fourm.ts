import type { LogsOptions } from '../engine/types'

// Simple block patterns instead of decorative logs
const BLOCK_PATTERNS = ['█', '▓', '▒', '░', '■', '▄']
const SUBTLE_PATTERNS = ['·', '∘', '°', '•', '◦', '⁘', '⁙']

export function generateFourMLogsFrames(
  width: number = 100,
  height: number = 30,
  frameCount: number = 60,
  options: Partial<LogsOptions> = {}
): string[] {
  const {
    floating = true,
    moss = false,
    water = false
  } = options
  
  const frames: string[] = []
  
  interface Block {
    x: number
    y: number
    char: string
    floatOffset: number
    isPartOf4m: boolean
  }
  
  const blocks: Block[] = []
  
  // Create blocks that form a clear '4' shape
  const fourBlocks: Array<{x: number, y: number}> = []
  
  // '4' shape - more distinct
  const fourStartX = Math.floor(width * 0.3)
  const fourStartY = Math.floor(height * 0.35)
  
  // Vertical stroke of 4
  for (let i = 0; i < 6; i++) {
    fourBlocks.push({ x: fourStartX, y: fourStartY + i })
  }
  
  // Horizontal stroke of 4
  for (let i = 0; i < 5; i++) {
    fourBlocks.push({ x: fourStartX - 2 + i, y: fourStartY + 3 })
  }
  
  // Right vertical of 4
  for (let i = 0; i < 8; i++) {
    fourBlocks.push({ x: fourStartX + 3, y: fourStartY + i })
  }
  
  // Create blocks that form an 'm' shape
  const mBlocks: Array<{x: number, y: number}> = []
  
  const mStartX = Math.floor(width * 0.55)
  const mStartY = Math.floor(height * 0.35)
  
  // Left vertical of m
  for (let i = 0; i < 8; i++) {
    mBlocks.push({ x: mStartX, y: mStartY + i })
  }
  
  // First peak of m
  for (let i = 1; i <= 2; i++) {
    mBlocks.push({ x: mStartX + i, y: mStartY + i })
  }
  
  // Middle vertical of m
  for (let i = 2; i < 8; i++) {
    mBlocks.push({ x: mStartX + 3, y: mStartY + i })
  }
  
  // Second peak of m
  for (let i = 1; i <= 2; i++) {
    mBlocks.push({ x: mStartX + 3 + i, y: mStartY + i })
  }
  
  // Right vertical of m
  for (let i = 2; i < 8; i++) {
    mBlocks.push({ x: mStartX + 6, y: mStartY + i })
  }
  
  // Add the 4m blocks
  [...fourBlocks, ...mBlocks].forEach((pos, i) => {
    blocks.push({
      x: pos.x,
      y: pos.y,
      char: BLOCK_PATTERNS[0], // Use solid block for 4m
      floatOffset: Math.random() * Math.PI * 2,
      isPartOf4m: true
    })
  })
  
  // Add subtle background particles
  for (let i = 0; i < 50; i++) {
    const x = Math.floor(Math.random() * width)
    const y = Math.floor(Math.random() * height)
    
    // Don't place background particles too close to 4m
    const tooClose = blocks.some(b => 
      b.isPartOf4m && 
      Math.abs(b.x - x) < 2 && 
      Math.abs(b.y - y) < 2
    )
    
    if (!tooClose) {
      blocks.push({
        x,
        y,
        char: SUBTLE_PATTERNS[Math.floor(Math.random() * SUBTLE_PATTERNS.length)],
        floatOffset: Math.random() * Math.PI * 2,
        isPartOf4m: false
      })
    }
  }
  
  for (let f = 0; f < frameCount; f++) {
    const time = (f / frameCount) * Math.PI * 2
    const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '))
    
    // Optional water effect at bottom
    if (water) {
      for (let y = height - 3; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const wave = Math.sin(x * 0.1 + time * 2) * 0.5 + Math.sin(y * 0.3 - time) * 0.3
          if (Math.abs(wave) > 0.4) {
            grid[y][x] = '~'
          } else if (Math.abs(wave) > 0.2) {
            grid[y][x] = '≈'
          }
        }
      }
    }
    
    // Draw blocks
    for (const block of blocks) {
      // Less floating for 4m blocks to maintain shape clarity
      const floatAmount = block.isPartOf4m ? 0.2 : 1
      const floatY = floating 
        ? block.y + Math.sin(time * 0.5 + block.floatOffset) * floatAmount
        : block.y
      
      const gx = Math.floor(block.x)
      const gy = Math.floor(floatY)
      
      if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
        // 4m blocks override background
        if (block.isPartOf4m || grid[gy][gx] === ' ') {
          grid[gy][gx] = block.char
        }
      }
    }
    
    frames.push(grid.map(row => row.join('')).join('\n'))
  }
  
  return frames
}