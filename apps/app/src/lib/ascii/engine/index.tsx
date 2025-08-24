'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { AsciiEngineProps, AsciiEngineState, AsciiEngineControls } from './types'

export function AsciiEngine({
  frames,
  fps = 12,
  loop = true,
  reverse = false,
  pingPong = false,
  delay = 0,
  autoPlay = true,
  visibilityOptimized = true,
  className = '',
  style = {},
  onFrame,
  onComplete,
  onClick,
}: AsciiEngineProps) {
  const frameRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const frameIndexRef = useRef(0)
  const directionRef = useRef(1)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentFrame, setCurrentFrame] = useState(0)

  const updateFrame = useCallback(() => {
    if (!frameRef.current || frames.length === 0) return

    frameRef.current.innerHTML = frames[frameIndexRef.current]
    setCurrentFrame(frameIndexRef.current)
    onFrame?.(frameIndexRef.current)

    if (pingPong) {
      frameIndexRef.current += directionRef.current

      if (frameIndexRef.current >= frames.length - 1) {
        frameIndexRef.current = frames.length - 1
        directionRef.current = -1
      } else if (frameIndexRef.current <= 0) {
        frameIndexRef.current = 0
        directionRef.current = 1
        if (!loop) {
          stop()
          onComplete?.()
        }
      }
    } else if (reverse) {
      frameIndexRef.current--
      if (frameIndexRef.current < 0) {
        if (loop) {
          frameIndexRef.current = frames.length - 1
        } else {
          frameIndexRef.current = 0
          stop()
          onComplete?.()
        }
      }
    } else {
      frameIndexRef.current++
      if (frameIndexRef.current >= frames.length) {
        if (loop) {
          frameIndexRef.current = 0
        } else {
          frameIndexRef.current = frames.length - 1
          stop()
          onComplete?.()
        }
      }
    }
  }, [frames, loop, reverse, pingPong, onFrame, onComplete])

  const play = useCallback(() => {
    if (intervalRef.current) return

    setIsPlaying(true)
    intervalRef.current = setInterval(updateFrame, 1000 / fps)
  }, [fps, updateFrame])

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    frameIndexRef.current = reverse ? frames.length - 1 : 0
    directionRef.current = 1
    if (frameRef.current && frames.length > 0) {
      frameRef.current.innerHTML = frames[frameIndexRef.current]
      setCurrentFrame(frameIndexRef.current)
    }
  }, [frames, reverse])

  const togglePlayPause = useCallback(() => {
    if (isPlaying) {
      stop()
    } else {
      play()
    }
  }, [isPlaying, play, stop])

  useEffect(() => {
    if (!(visibilityOptimized && wrapperRef.current)) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && autoPlay) {
            play()
          } else {
            stop()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(wrapperRef.current)

    return () => {
      observer.disconnect()
      stop()
    }
  }, [visibilityOptimized, autoPlay, play, stop])

  useEffect(() => {
    if (frames.length === 0) return

    reset()

    if (autoPlay) {
      const delayTimeout = setTimeout(() => {
        play()
      }, delay)

      return () => {
        clearTimeout(delayTimeout)
        stop()
      }
    }

    return () => stop()
  }, [frames, autoPlay, delay, play, stop, reset])

  const defaultStyle: React.CSSProperties = {
    fontFamily: "'IosevkaTerm-Regular', monospace",
    whiteSpace: 'pre',
    fontSize: '10px',
    lineHeight: '1.2',
    letterSpacing: '0.05em',
    userSelect: 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style,
  }

  return (
    <div
      className={className}
      onClick={onClick || togglePlayPause}
      ref={wrapperRef}
      style={{ position: 'relative', ...defaultStyle }}
    >
      <div ref={frameRef} />
      {!autoPlay && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            display: 'flex',
            gap: '0.5rem',
            opacity: 0.5,
          }}
        >
          <button onClick={togglePlayPause} style={{ padding: '0.25rem' }}>
            {isPlaying ? '⏸' : '▶'}
          </button>
          <button onClick={reset} style={{ padding: '0.25rem' }}>
            ↺
          </button>
        </div>
      )}
    </div>
  )
}

export function useAsciiEngine(props: AsciiEngineProps): AsciiEngineState & AsciiEngineControls {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentFrame, setCurrentFrame] = useState(0)
  const frameIndex = useRef(0)

  const play = () => setIsPlaying(true)
  const pause = () => setIsPlaying(false)
  const stop = () => {
    setIsPlaying(false)
    frameIndex.current = 0
    setCurrentFrame(0)
  }
  const reset = () => {
    frameIndex.current = 0
    setCurrentFrame(0)
  }
  const goToFrame = (index: number) => {
    frameIndex.current = Math.max(0, Math.min(index, props.frames.length - 1))
    setCurrentFrame(frameIndex.current)
  }
  const togglePlayPause = () => setIsPlaying(prev => !prev)

  return {
    isPlaying,
    currentFrame,
    totalFrames: props.frames.length,
    play,
    pause,
    stop,
    reset,
    goToFrame,
    togglePlayPause,
  }
}

export * from './types'