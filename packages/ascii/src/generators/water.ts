export function generateWaterFrames(
  width: number = 80,
  height: number = 30,
  frameCount: number = 30
): string[] {
  const frames: string[] = []
  const waterChars = ['~', '≈', '∿', '-', '_', '˜', '⁓']
  const dropChars = ['·', '•', '◦', '○', '°']
  
  for (let f = 0; f < frameCount; f++) {
    const lines: string[] = []
    const time = (f / frameCount) * Math.PI * 2
    
    for (let y = 0; y < height; y++) {
      let line = ''
      const waveOffset = Math.sin(time + y * 0.3) * 3
      
      for (let x = 0; x < width; x++) {
        const wave1 = Math.sin((x + f * 2) * 0.1 + y * 0.2) * 0.5
        const wave2 = Math.sin((x - f * 1.5) * 0.15 - y * 0.1) * 0.3
        const combined = wave1 + wave2 + waveOffset * 0.1
        
        const rippleX = width / 2 + Math.sin(time) * 10
        const rippleY = height / 2 + Math.cos(time) * 5
        const rippleDist = Math.sqrt(Math.pow(x - rippleX, 2) + Math.pow(y - rippleY, 2))
        const ripple = Math.sin(rippleDist * 0.5 - f * 0.5) * Math.exp(-rippleDist * 0.05)
        
        const intensity = Math.abs(combined + ripple * 0.3)
        
        if (intensity > 0.8) {
          line += dropChars[Math.floor(Math.random() * dropChars.length)]
        } else if (intensity > 0.5) {
          line += waterChars[Math.floor((combined + 1) * waterChars.length / 2) % waterChars.length]
        } else if (intensity > 0.2) {
          line += Math.random() > 0.7 ? '.' : ' '
        } else {
          line += ' '
        }
      }
      lines.push(line)
    }
    
    frames.push(lines.join('\n'))
  }
  
  return frames
}

export function generateRainFrames(
  width: number = 80,
  height: number = 30,
  frameCount: number = 30
): string[] {
  const frames: string[] = []
  const rainChars = ['|', '¦', '⎸', '⎹', '/', '\\', '\'', '`']
  const splashChars = ['˚', '°', '∘', '○', '◦']
  
  interface Drop {
    x: number
    y: number
    speed: number
    char: string
  }
  
  const drops: Drop[] = []
  
  for (let i = 0; i < width * 0.3; i++) {
    drops.push({
      x: Math.floor(Math.random() * width),
      y: Math.floor(Math.random() * height),
      speed: Math.random() * 2 + 1,
      char: rainChars[Math.floor(Math.random() * rainChars.length)]
    })
  }
  
  for (let f = 0; f < frameCount; f++) {
    const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '))
    
    drops.forEach(drop => {
      drop.y += drop.speed
      drop.x += Math.sin(f * 0.1) * 0.3
      
      if (drop.y >= height) {
        const splashX = Math.floor(drop.x)
        if (splashX >= 0 && splashX < width) {
          grid[height - 1][splashX] = splashChars[Math.floor(Math.random() * splashChars.length)]
        }
        
        drop.y = 0
        drop.x = Math.floor(Math.random() * width)
        drop.speed = Math.random() * 2 + 1
        drop.char = rainChars[Math.floor(Math.random() * rainChars.length)]
      }
      
      const y = Math.floor(drop.y)
      const x = Math.floor(drop.x)
      if (y >= 0 && y < height && x >= 0 && x < width) {
        grid[y][x] = drop.char
        
        if (y > 0) {
          const trailY = y - 1
          if (grid[trailY][x] === ' ') {
            grid[trailY][x] = '·'
          }
        }
      }
    })
    
    for (let x = 0; x < width; x++) {
      if (Math.random() > 0.7) {
        grid[height - 1][x] = '~'
      }
    }
    
    frames.push(grid.map(row => row.join('')).join('\n'))
  }
  
  return frames
}