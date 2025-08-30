export interface AsciiEngineProps {
  frames: string[]
  fps?: number
  loop?: boolean
  reverse?: boolean
  pingPong?: boolean
  delay?: number
  autoPlay?: boolean
  visibilityOptimized?: boolean
  className?: string
  style?: React.CSSProperties
  onFrame?: (index: number) => void
  onComplete?: () => void
  onClick?: () => void
}

export interface AsciiEngineState {
  isPlaying: boolean
  currentFrame: number
  totalFrames: number
}

export interface AsciiEngineControls {
  play: () => void
  pause: () => void
  stop: () => void
  reset: () => void
  goToFrame: (index: number) => void
  togglePlayPause: () => void
}

export interface GeneratorOptions {
  width: number
  height: number
  frameCount: number
}

export interface ForestOptions extends GeneratorOptions {
  treeTypes?: TreeType[]
  windSpeed?: number
  density?: number
  perspective?: boolean
  depth?: number
  season?: Season
}

export interface LogsOptions {
  width: number
  height: number
  frameCount: number
  logCount?: number
  floating?: boolean
  stacked?: boolean
  rotation?: boolean
  moss?: boolean
  water?: boolean
}

export enum TreeType {
  PINE = 'pine',
  OAK = 'oak',
  BIRCH = 'birch',
  WILLOW = 'willow',
  DEAD = 'dead'
}

export enum Season {
  SPRING = 'spring',
  SUMMER = 'summer',
  AUTUMN = 'autumn',
  WINTER = 'winter'
}

export interface ForestChars {
  trunk: string[]
  branches: string[]
  leaves: string[]
  ground: string[]
  logs: string[]
  moss: string[]
  snow?: string[]
  flowers?: string[]
}

export interface Point3D {
  x: number
  y: number
  z: number
}

export interface Tree {
  position: Point3D
  type: TreeType
  height: number
  width: number
  swayOffset: number
  swaySpeed: number
}