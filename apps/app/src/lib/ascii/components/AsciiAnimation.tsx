'use client'

import { AsciiEngine } from '../engine'
import type { AsciiEngineProps } from '../engine/types'

export interface AsciiAnimationProps extends AsciiEngineProps {
  theme?: 'forest' | 'logs' | 'water' | 'fire' | 'matrix' | 'custom'
}

const THEME_STYLES = {
  forest: {
    color: 'rgb(34 197 94 / 0.15)',
    textShadow: '0 0 10px rgb(34 197 94 / 0.1)'
  },
  logs: {
    color: 'rgb(180 83 9 / 0.15)',
    textShadow: '0 0 8px rgb(180 83 9 / 0.1)'
  },
  water: {
    color: 'rgb(59 130 246 / 0.15)',
    textShadow: '0 0 12px rgb(59 130 246 / 0.1)'
  },
  fire: {
    color: 'rgb(239 68 68 / 0.15)',
    textShadow: '0 0 15px rgb(239 68 68 / 0.2)'
  },
  matrix: {
    color: 'rgb(34 197 94 / 0.2)',
    textShadow: '0 0 5px rgb(34 197 94 / 0.3)'
  },
  custom: {}
}

export function AsciiAnimation({
  theme = 'custom',
  style = {},
  className = '',
  ...props
}: AsciiAnimationProps) {
  const themeStyle = THEME_STYLES[theme]
  
  return (
    <AsciiEngine
      className={`ascii-animation ascii-${theme} ${className}`}
      style={{
        ...themeStyle,
        ...style
      }}
      {...props}
    />
  )
}