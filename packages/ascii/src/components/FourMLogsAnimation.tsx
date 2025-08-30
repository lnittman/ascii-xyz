'use client'

import { useMemo } from 'react'
import { AsciiEngine } from '../engine'
import { generateFourMLogsFrames } from '../generators/fourm'

export interface FourMLogsAnimationProps {
  width?: number
  height?: number
  frameCount?: number
  fps?: number
  floating?: boolean
  moss?: boolean
  water?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export function FourMLogsAnimation({
  width = 60,
  height = 12,
  frameCount = 60,
  fps = 12,
  floating = true,
  moss = false,
  water = false,
  className = '',
  style = {},
  onClick
}: FourMLogsAnimationProps) {
  const frames = useMemo(() => {
    return generateFourMLogsFrames(width, height, frameCount, {
      floating,
      moss,
      water
    })
  }, [width, height, frameCount, floating, moss, water])
  
  return (
    <AsciiEngine
      frames={frames}
      fps={fps}
      autoPlay={true}
      loop={true}
      className={`ascii-4m-logs ${className}`}
      style={{
        color: 'currentColor',
        opacity: 0.9,
        ...style
      }}
      onClick={onClick}
    />
  )
}