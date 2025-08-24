'use client'

import { useMemo } from 'react'
import { AsciiEngine } from '../engine'
import { generateLogsFrames } from '../generators'

export interface LogsAnimationProps {
  width?: number
  height?: number
  frameCount?: number
  fps?: number
  logCount?: number
  floating?: boolean
  stacked?: boolean
  rotation?: boolean
  moss?: boolean
  water?: boolean
  className?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export function LogsAnimation({
  width = 100,
  height = 30,
  frameCount = 60,
  fps = 15,
  logCount = 12,
  floating = true,
  stacked = false,
  rotation = true,
  moss = true,
  water = false,
  className = '',
  style = {},
  onClick
}: LogsAnimationProps) {
  const frames = useMemo(() => {
    return generateLogsFrames(width, height, frameCount, {
      logCount,
      floating,
      stacked,
      rotation,
      moss,
      water
    })
  }, [width, height, frameCount, logCount, floating, stacked, rotation, moss, water])
  
  return (
    <AsciiEngine
      frames={frames}
      fps={fps}
      autoPlay={true}
      loop={true}
      className={`ascii-logs ${className}`}
      style={{
        color: 'rgb(146 64 14)', // brown-700
        textShadow: '0 0 8px rgb(146 64 14 / 0.15)',
        ...style
      }}
      onClick={onClick}
    />
  )
}