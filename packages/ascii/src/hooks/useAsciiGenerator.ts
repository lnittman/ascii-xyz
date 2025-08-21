import { useMemo } from 'react'
import { generateForestFrames, generateLogsFrames, generateWaterFrames, generateRainFrames } from '../generators'
import type { ForestOptions, LogsOptions } from '../engine/types'

export type GeneratorType = 'forest' | 'logs' | 'water' | 'rain'

export interface UseAsciiGeneratorOptions {
  type: GeneratorType
  width?: number
  height?: number
  frameCount?: number
  options?: Partial<ForestOptions | LogsOptions>
}

export function useAsciiGenerator({
  type,
  width = 80,
  height = 30,
  frameCount = 30,
  options = {}
}: UseAsciiGeneratorOptions): string[] {
  return useMemo(() => {
    switch (type) {
      case 'forest':
        return generateForestFrames(width, height, frameCount, options)
      case 'logs':
        return generateLogsFrames(width, height, frameCount, options)
      case 'water':
        return generateWaterFrames(width, height, frameCount)
      case 'rain':
        return generateRainFrames(width, height, frameCount)
      default:
        return []
    }
  }, [type, width, height, frameCount, options])
}

export function useForestGenerator(options: Partial<ForestOptions> = {}) {
  const { width = 120, height = 40, frameCount = 60, ...rest } = options
  return useAsciiGenerator({
    type: 'forest',
    width,
    height,
    frameCount,
    options: rest
  })
}

export function useLogsGenerator(options: Partial<LogsOptions> = {}) {
  const { width = 100, height = 30, frameCount = 60, ...rest } = options
  return useAsciiGenerator({
    type: 'logs',
    width,
    height,
    frameCount,
    options: rest
  })
}