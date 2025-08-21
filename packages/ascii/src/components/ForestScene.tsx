'use client'

import { useMemo } from 'react'
import { AsciiEngine } from '../engine'
import { generateForestFrames, generate3DForestFrames } from '../generators'
import { TreeType } from '../engine/types'

export interface ForestSceneProps {
  width?: number
  height?: number
  frameCount?: number
  fps?: number
  animated?: boolean
  windEffect?: boolean
  perspective?: '2d' | '3d'
  treeTypes?: TreeType[]
  density?: number
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export function ForestScene({
  width = 120,
  height = 40,
  frameCount = 60,
  fps = 18,
  animated = true,
  windEffect = true,
  perspective = '2d',
  treeTypes = [TreeType.PINE, TreeType.OAK, TreeType.BIRCH],
  density = 0.3,
  className = '',
  style = {},
  onClick
}: ForestSceneProps) {
  const frames = useMemo(() => {
    const generator = perspective === '3d' ? generate3DForestFrames : generateForestFrames
    return generator(width, height, frameCount, {
      treeTypes,
      windSpeed: windEffect ? 1 : 0,
      density,
      perspective: perspective === '3d'
    })
  }, [width, height, frameCount, perspective, treeTypes, density, windEffect])
  
  return (
    <AsciiEngine
      frames={frames}
      fps={fps}
      autoPlay={animated}
      loop={true}
      className={`ascii-forest ${className}`}
      style={{
        color: 'rgb(34 197 94 / 0.15)',
        textShadow: '0 0 10px rgb(34 197 94 / 0.1)',
        ...style
      }}
      onClick={onClick}
    />
  )
}