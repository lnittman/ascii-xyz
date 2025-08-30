import type { ForestOptions, LogsOptions, Tree, TreeType, Season, Point3D } from '../engine/types'

const TREE_PATTERNS = {
  pine: [
    '    ▲    ',
    '   ▲▲▲   ',
    '  ▲▲▲▲▲  ',
    ' ▲▲▲▲▲▲▲ ',
    '▲▲▲▲▲▲▲▲▲',
    '    │    '
  ],
  oak: [
    '   ◯◯◯   ',
    ' ◯◉◉◉◉◉◯ ',
    '◯◉●●●●●◉◯',
    ' ◉●●●●●◉ ',
    '   ║║║   '
  ],
  birch: [
    '  ╱╲  ',
    ' ╱╱╲╲ ',
    '╱╱╱╲╲╲',
    '  ┃┃  '
  ],
  willow: [
    '  ∩∩∩  ',
    ' ╱┆┆┆╲ ',
    '╱┆┆┆┆┆╲',
    '┆┆║║║┆┆',
    ' ┆┆┆┆┆ '
  ],
  dead: [
    '  ╱╲  ',
    ' ╱  ╲ ',
    '╱    ╲',
    '  ││  '
  ]
}

const GROUND_PATTERNS = ['_', '▁', '▂', '─', '═', '⎯', '⏤']
const GRASS_PATTERNS = ['ᐛ', 'ᐤ', '⌇', '⁀', '∴', '∵', '⋮', '⋯']
const LOG_PATTERNS = ['═══', '━━━', '▬▬▬', '███', '▓▓▓', '▒▒▒']
const MOSS_PATTERNS = ['·', '∘', '°', '•', '◦', '⁘', '⁙']

function createTree(x: number, y: number, z: number, type: TreeType): Tree {
  const patterns = TREE_PATTERNS[type]
  return {
    position: { x, y, z },
    type,
    height: patterns.length,
    width: patterns[0].length,
    swayOffset: Math.random() * Math.PI * 2,
    swaySpeed: 0.5 + Math.random() * 1.5
  }
}

function generateTreeLayer(
  width: number,
  height: number,
  trees: Tree[],
  time: number,
  windStrength: number = 0.5
): string[][] {
  const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '))
  
  trees.sort((a, b) => b.position.z - a.position.z)
  
  for (const tree of trees) {
    const pattern = TREE_PATTERNS[tree.type]
    const sway = Math.sin(time * tree.swaySpeed + tree.swayOffset) * windStrength
    const xOffset = Math.round(sway * (1 - tree.position.z / 10))
    
    for (let py = 0; py < pattern.length; py++) {
      const row = pattern[py]
      for (let px = 0; px < row.length; px++) {
        const char = row[px]
        if (char !== ' ') {
          const gx = Math.floor(tree.position.x + px + xOffset)
          const gy = Math.floor(tree.position.y + py)
          
          if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
            const opacity = 1 - (tree.position.z / 10) * 0.5
            if (opacity > 0.5 || grid[gy][gx] === ' ') {
              grid[gy][gx] = char
            }
          }
        }
      }
    }
  }
  
  return grid
}

function addGroundLayer(grid: string[][], width: number, height: number, time: number) {
  const groundY = height - 3
  
  for (let y = groundY; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (grid[y][x] === ' ') {
        const wave = Math.sin(x * 0.1 + time) * 0.5 + 0.5
        if (y === groundY) {
          if (Math.random() > 0.7) {
            grid[y][x] = GRASS_PATTERNS[Math.floor(Math.random() * GRASS_PATTERNS.length)]
          }
        } else {
          grid[y][x] = GROUND_PATTERNS[Math.floor(wave * GROUND_PATTERNS.length)]
        }
      }
    }
  }
}

function addLogs(grid: string[][], width: number, height: number, time: number, floating: boolean = false) {
  const logY = floating ? height - 5 - Math.sin(time) * 2 : height - 2
  const logCount = 3 + Math.floor(Math.random() * 3)
  
  for (let i = 0; i < logCount; i++) {
    const logX = Math.floor(Math.random() * (width - 10)) + 5
    const logPattern = LOG_PATTERNS[Math.floor(Math.random() * LOG_PATTERNS.length)]
    const logLength = 8 + Math.floor(Math.random() * 8)
    
    for (let x = 0; x < logLength; x++) {
      const gx = logX + x
      const gy = Math.floor(logY + (floating ? Math.sin(time + i) * 0.5 : 0))
      
      if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
        grid[gy][gx] = logPattern[x % logPattern.length]
        
        if (Math.random() > 0.7) {
          const mossY = gy - 1
          if (mossY >= 0 && grid[mossY][gx] === ' ') {
            grid[mossY][gx] = MOSS_PATTERNS[Math.floor(Math.random() * MOSS_PATTERNS.length)]
          }
        }
      }
    }
  }
}

export function generateForestFrames(
  width: number = 120,
  height: number = 40,
  frameCount: number = 60,
  options: Partial<ForestOptions> = {}
): string[] {
  const {
    treeTypes = ['pine', 'oak', 'birch'],
    windSpeed = 1,
    density = 0.3,
    perspective = true,
    depth = 10
  } = options
  
  const frames: string[] = []
  const trees: Tree[] = []
  const treeCount = Math.floor(width * height * density / 100)
  
  for (let i = 0; i < treeCount; i++) {
    const type = treeTypes[Math.floor(Math.random() * treeTypes.length)] as TreeType
    const x = Math.random() * (width - 10)
    const z = perspective ? Math.random() * depth : 0
    const y = (height * 0.3) + (z / depth) * (height * 0.4) - TREE_PATTERNS[type].length
    
    trees.push(createTree(x, y, z, type))
  }
  
  for (let f = 0; f < frameCount; f++) {
    const time = (f / frameCount) * Math.PI * 2
    const grid = generateTreeLayer(width, height, trees, time * windSpeed, 0.5)
    
    addGroundLayer(grid, width, height, time)
    addLogs(grid, width, height, time, false)
    
    frames.push(grid.map(row => row.join('')).join('\n'))
  }
  
  return frames
}

export function generateLogsFrames(
  width: number = 100,
  height: number = 30,
  frameCount: number = 60,
  options: Partial<LogsOptions> = {}
): string[] {
  const {
    logCount = 12,
    floating = true,
    stacked = false,
    rotation = true,
    moss = true,
    water = false
  } = options
  
  const frames: string[] = []
  
  interface Log {
    x: number
    y: number
    length: number
    pattern: string
    rotationSpeed: number
    floatOffset: number
    stackLevel: number
  }
  
  const logs: Log[] = []
  
  for (let i = 0; i < logCount; i++) {
    logs.push({
      x: Math.random() * (width - 20),
      y: stacked 
        ? height - 2 - Math.floor(i / 4) * 2
        : height - 8 + Math.random() * 6,
      length: 10 + Math.floor(Math.random() * 15),
      pattern: LOG_PATTERNS[Math.floor(Math.random() * LOG_PATTERNS.length)],
      rotationSpeed: 0.5 + Math.random() * 1.5,
      floatOffset: Math.random() * Math.PI * 2,
      stackLevel: Math.floor(i / 4)
    })
  }
  
  for (let f = 0; f < frameCount; f++) {
    const time = (f / frameCount) * Math.PI * 2
    const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '))
    
    if (water) {
      for (let y = height - 6; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const wave = Math.sin(x * 0.1 + time * 2) * 0.5 + Math.sin(y * 0.3 - time) * 0.3
          if (Math.abs(wave) > 0.3) {
            grid[y][x] = '~'
          } else if (Math.abs(wave) > 0.1) {
            grid[y][x] = '≈'
          }
        }
      }
    }
    
    logs.sort((a, b) => b.y - a.y)
    
    for (const log of logs) {
      const floatY = floating 
        ? log.y + Math.sin(time + log.floatOffset) * 2
        : log.y
      
      const angle = rotation ? time * log.rotationSpeed : 0
      const centerX = log.x + log.length / 2
      
      for (let i = 0; i < log.length; i++) {
        const rx = Math.cos(angle) * (i - log.length / 2)
        const ry = Math.sin(angle) * (i - log.length / 2) * 0.3
        
        const gx = Math.floor(centerX + rx)
        const gy = Math.floor(floatY + ry)
        
        if (gx >= 0 && gx < width && gy >= 0 && gy < height) {
          grid[gy][gx] = log.pattern[i % log.pattern.length]
          
          if (moss && Math.random() > 0.8) {
            const mossY = gy - 1
            if (mossY >= 0 && grid[mossY][gx] === ' ') {
              grid[mossY][gx] = MOSS_PATTERNS[Math.floor(Math.random() * MOSS_PATTERNS.length)]
            }
          }
        }
      }
    }
    
    frames.push(grid.map(row => row.join('')).join('\n'))
  }
  
  return frames
}

export function generate3DForestFrames(
  width: number = 120,
  height: number = 40,
  frameCount: number = 60,
  options: Partial<ForestOptions> = {}
): string[] {
  const frames: string[] = []
  const { depth = 20, perspective = true } = options
  
  for (let f = 0; f < frameCount; f++) {
    const time = (f / frameCount) * Math.PI * 2
    const rotation = time * 0.2
    
    const grid: string[][] = Array(height).fill(null).map(() => Array(width).fill(' '))
    
    for (let z = depth; z >= 0; z--) {
      const scale = perspective ? 1 - (z / depth) * 0.7 : 1
      const opacity = 1 - (z / depth) * 0.6
      
      for (let x = -width/2; x < width/2; x += 10) {
        const treeX = x * Math.cos(rotation) - z * Math.sin(rotation)
        const treeZ = x * Math.sin(rotation) + z * Math.cos(rotation)
        
        if (treeZ > 0 && Math.random() > 0.5) {
          const screenX = Math.floor(width/2 + treeX * scale)
          const screenY = Math.floor(height * 0.7 - treeZ * scale * 0.5)
          
          if (screenX >= 0 && screenX < width && screenY >= 0 && screenY < height) {
            const treeChar = opacity > 0.7 ? '▲' : opacity > 0.4 ? '△' : '∙'
            grid[screenY][screenX] = treeChar
          }
        }
      }
    }
    
    frames.push(grid.map(row => row.join('')).join('\n'))
  }
  
  return frames
}