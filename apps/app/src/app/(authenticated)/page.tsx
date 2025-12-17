'use client'

import { useMemo, useState, useRef, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { selectedModelIdAtom } from '@/atoms/models'
import { AsciiEngine } from '@/lib/ascii/engine'
import { generateAsciiArt } from './create/actions'
import { saveAsciiArt } from './create/save-actions'
import { useIsMobile } from '@/hooks/useIsMobile'
import { ModelPicker } from '@/components/model-picker'
import { useGeneration } from '@/hooks/use-generation'
import { Id } from '@repo/backend/convex/_generated/dataModel'
import { ThinkingTraces, InlineThinkingTrace } from '@/components/thinking-traces'
import { useGenerationMachine, type ThinkingTrace } from '@/hooks/use-generation-machine'

interface AsciiGeneration {
  id: string
  generationId?: Id<"artworkGenerations">
  prompt: string
  frames: string[]
  timestamp: Date
  saved?: boolean
  artworkId?: string
}

export default function GeneratePage() {
  // Generate a subtle starfield animation for the idle hero
  const starsFrames = useMemo(() => {
    function gen(width: number, height: number, frames: number, density = 0.02) {
      const out: string[] = []
      for (let f = 0; f < frames; f++) {
        let frame = ''
        for (let y = 0; y < height; y++) {
          let row = ''
          for (let x = 0; x < width; x++) {
            // Random twinkle based on frame, position
            const r = Math.random() + (Math.sin((x + f) * 0.37) + Math.cos((y - f) * 0.23)) * 0.15
            row += r < density ? (r < density * 0.4 ? '✦' : '*') : ' '
          }
          frame += row + (y < height - 1 ? '\n' : '')
        }
        out.push(frame)
      }
      return out
    }
    // tuned for ~max-w-2xl card
    return gen(64, 16, 64, 0.015)
  }, [])
  const [prompt, setPrompt] = useState('')
  const [generations, setGenerations] = useState<AsciiGeneration[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const selectedModelId = useAtomValue(selectedModelIdAtom)

  // Generation state machine
  const genMachine = useGenerationMachine()

  // Get generation ID for live updates (from state machine if in planning/generating)
  const activeGenerationId =
    genMachine.state.status === 'planning' || genMachine.state.status === 'generating'
      ? genMachine.state.generationId
      : null

  // Subscribe to live generation updates
  const liveGeneration = useGeneration(activeGenerationId)

  // Sync live generation data with state machine
  useEffect(() => {
    if (!liveGeneration) return

    // Update state machine based on Convex data
    if (liveGeneration.status === 'planning' && genMachine.state.status === 'planning') {
      // Already in planning, nothing to do
    } else if (liveGeneration.status === 'generating') {
      // Transition to generating if we have a plan
      if (genMachine.state.status === 'planning' && liveGeneration.totalFrames) {
        // Cast thinkingTraces to our type (matches backend schema)
        const traces = liveGeneration.thinkingTraces as ThinkingTrace[] | undefined
        genMachine.setPlanReady(
          { fps: liveGeneration.plan?.fps },
          liveGeneration.totalFrames,
          traces
        )
      }
      // Update frames if already generating
      if (genMachine.state.status === 'generating' && liveGeneration.frames) {
        genMachine.updateFrames(
          liveGeneration.frames[liveGeneration.frames.length - 1] || '',
          liveGeneration.currentFrame || 0,
          liveGeneration.frames
        )
      }
    } else if (liveGeneration.status === 'completed' && genMachine.state.status === 'generating') {
      // Generation completed
      genMachine.complete()
    } else if (liveGeneration.status === 'failed' && genMachine.isActive) {
      // Generation failed
      genMachine.setError(liveGeneration.error || 'Generation failed')
    }
  }, [liveGeneration, genMachine])

  // Computed values for easier rendering
  const isGenerating = genMachine.isActive

  const handleGenerate = async () => {
    if (!prompt.trim() || !genMachine.canStart) return

    const currentPrompt = prompt
    genMachine.start(currentPrompt)

    try {
      // Use agent-based generation with world-class prompting
      const result = await generateAsciiArt(currentPrompt, selectedModelId, undefined)

      // Set the generation ID for live updates
      if (result.generationId) {
        genMachine.setGenerationId(result.generationId as Id<'artworkGenerations'>)
      }

      // Auto-save to gallery
      let savedId = undefined
      try {
        const saveResult = await saveAsciiArt(
          currentPrompt,
          result.frames,
          result.metadata,
          'private' // Default to private
        )
        savedId = saveResult?.id
      } catch (saveError) {
        console.error('Failed to save artwork:', saveError)
        // Continue even if save fails
      }

      const generation: AsciiGeneration = {
        id: crypto.randomUUID(),
        generationId: result.generationId as Id<'artworkGenerations'>,
        prompt: currentPrompt,
        frames: result.frames,
        timestamp: new Date(),
        saved: !!savedId,
        artworkId: savedId,
      }

      setGenerations((prev) => [...prev, generation])
      setCurrentIndex(generations.length) // Set to new generation
      setPrompt('')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed'
      console.error('Failed to generate ASCII art:', error)
      genMachine.setError(errorMessage)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = async () => {
      setPrompt(`Convert this image to ASCII art: ${file.name}`)
      inputRef.current?.focus()
    }
    reader.readAsDataURL(file)
  }

  const copyToClipboard = () => {
    const current = generations[currentIndex]
    if (current && current.frames.length > 0) {
      navigator.clipboard.writeText(current.frames[0])
    }
  }

  const downloadAscii = () => {
    const current = generations[currentIndex]
    if (current && current.frames.length > 0) {
      const blob = new Blob([current.frames[0]], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ascii-${current.id}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  const clearHistory = () => {
    setGenerations([])
    setCurrentIndex(0)
  }

  const currentGeneration = generations[currentIndex] || null

  // Get frames from state machine when generating, otherwise from history
  const displayFrames =
    genMachine.state.status === 'generating'
      ? genMachine.state.frames
      : genMachine.state.status === 'completed'
        ? genMachine.state.frames
        : currentGeneration?.frames || []

  const displayFps =
    genMachine.state.status === 'generating' || genMachine.state.status === 'completed'
      ? genMachine.state.plan?.fps || 12
      : 12

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 pt-12 pb-40">
        <div className="max-w-3xl mx-auto">
          {/* Prompt bar moved to bottom sticky; see bottom of page */}

          {/* Main content area - state machine driven rendering */}
          <div className="">
            {/* Error state */}
            {genMachine.state.status === 'error' && (
              <div className="pt-8">
                <div className="mb-4">
                  <p className="text-xs font-mono text-muted-foreground mb-1">PROMPT:</p>
                  <p className="text-sm font-mono">{genMachine.state.prompt}</p>
                </div>
                <div className="border border-destructive/50 bg-destructive/10 p-4 rounded-sm">
                  <div className="text-center">
                    <div className="text-xl mb-3 text-destructive">✗</div>
                    <p className="text-xs font-mono text-destructive mb-3">
                      {genMachine.state.error}
                    </p>
                    <button
                      onClick={() => {
                        if (genMachine.state.status === 'error') {
                          setPrompt(genMachine.state.prompt)
                        }
                        genMachine.reset()
                      }}
                      className="px-3 py-1.5 text-xs font-mono border border-border rounded-sm hover:bg-muted/50 transition-colors duration-0 cursor-default"
                      aria-label="Retry generation"
                    >
                      try again
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Initializing state */}
            {genMachine.state.status === 'initializing' && (
              <div className="text-center pt-16">
                <div className="text-2xl font-mono text-foreground mb-4 animate-pulse">
                  ◌ ◌ ◌
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  initializing generation...
                </p>
              </div>
            )}

            {/* Planning state */}
            {genMachine.state.status === 'planning' && (
              <div className="pt-8">
                <div className="mb-4">
                  <p className="text-xs font-mono text-muted-foreground mb-1">PROMPT:</p>
                  <p className="text-sm font-mono">{genMachine.state.prompt}</p>
                  <div className="mt-3 text-xs font-mono text-muted-foreground">
                    <InlineThinkingTrace text="planning animation..." />
                  </div>
                  {genMachine.state.thinkingTraces && genMachine.state.thinkingTraces.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-sm border border-border/50 max-h-32 overflow-y-auto">
                      <ThinkingTraces traces={genMachine.state.thinkingTraces} />
                    </div>
                  )}
                </div>
                <div className="border border-border bg-muted/30 rounded-sm p-4 overflow-auto min-h-[200px]">
                  <div className="text-center text-muted-foreground font-mono text-xs">
                    <div className="text-xl mb-3 animate-pulse">◌ ◌ ◌</div>
                    creating generation plan...
                  </div>
                </div>
              </div>
            )}

            {/* Generating state */}
            {genMachine.state.status === 'generating' && (
              <div className="pt-8">
                <div className="mb-4">
                  <p className="text-xs font-mono text-muted-foreground mb-1">PROMPT:</p>
                  <p className="text-sm font-mono">{genMachine.state.prompt}</p>
                  <div className="mt-3">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-muted-foreground">frame</span>
                      <span className="text-foreground">{genMachine.state.currentFrame}</span>
                      <span className="text-muted-foreground">/</span>
                      <span className="text-foreground">{genMachine.state.totalFrames}</span>
                    </div>
                    <div className="mt-2 w-full bg-muted rounded-sm h-1 overflow-hidden">
                      <div
                        className="h-full bg-foreground"
                        style={{ width: `${genMachine.progress || 0}%` }}
                      />
                    </div>
                  </div>
                  {genMachine.state.thinkingTraces && genMachine.state.thinkingTraces.length > 0 && (
                    <div className="mt-3 p-3 bg-muted/30 rounded-sm border border-border/50 max-h-32 overflow-y-auto">
                      <ThinkingTraces traces={genMachine.state.thinkingTraces} />
                    </div>
                  )}
                </div>
                <div className="border border-border bg-muted/30 rounded-sm p-4 overflow-auto min-h-[200px]">
                  {genMachine.state.frames.length > 0 ? (
                    <AsciiEngine
                      frames={genMachine.state.frames}
                      fps={genMachine.state.plan?.fps || 12}
                      loop={true}
                      autoPlay={true}
                      style={{
                        fontSize: '12px',
                        lineHeight: '14px',
                        color: 'hsl(var(--foreground))',
                        fontFamily: 'monospace',
                      }}
                    />
                  ) : (
                    <div className="text-center text-muted-foreground font-mono text-xs">
                      <div className="text-xl mb-3 animate-pulse">◌ ◌ ◌</div>
                      generating frames...
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Completed state (show most recent result) */}
            {genMachine.state.status === 'completed' && (
              <div className="pt-8">
                <div className="mb-4">
                  <p className="text-xs font-mono text-muted-foreground mb-1">PROMPT:</p>
                  <p className="text-sm font-mono">{genMachine.state.prompt}</p>
                </div>
                <div className="border border-border bg-muted/30 rounded-sm p-4 overflow-auto">
                  {genMachine.state.frames.length > 0 && (
                    <AsciiEngine
                      frames={genMachine.state.frames}
                      fps={displayFps}
                      loop={true}
                      autoPlay={true}
                      style={{
                        fontSize: '12px',
                        lineHeight: '14px',
                        color: 'hsl(var(--foreground))',
                        fontFamily: 'monospace',
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Idle state with history */}
            {genMachine.state.status === 'idle' && currentGeneration && (
              <div className="pt-8">
                <div className="mb-4">
                  <p className="text-xs font-mono text-muted-foreground mb-1">PROMPT:</p>
                  <p className="text-sm font-mono">{currentGeneration.prompt}</p>
                </div>
                <div className="border border-border bg-muted/30 rounded-sm p-4 overflow-auto">
                  {currentGeneration.frames.length > 0 && (
                    <AsciiEngine
                      frames={currentGeneration.frames}
                      fps={12}
                      loop={true}
                      autoPlay={true}
                      style={{
                        fontSize: '12px',
                        lineHeight: '14px',
                        color: 'hsl(var(--foreground))',
                        fontFamily: 'monospace',
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Idle state without history - show starfield */}
            {genMachine.state.status === 'idle' && !currentGeneration && (
              <div className="pt-8">
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-sm border border-border bg-muted/30 p-4 overflow-hidden">
                    <AsciiEngine
                      frames={starsFrames}
                      fps={10}
                      loop
                      autoPlay
                      style={{
                        fontSize: '12px',
                        lineHeight: '14px',
                        color: 'hsl(var(--foreground))',
                        fontFamily: 'monospace',
                        opacity: 0.7,
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom-aligned composer with full-width prompt */}
      <div className="fixed bottom-6 left-0 right-0 z-40">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-2">
            {/* Prompt Input - Full Width */}
            <div className="relative">
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                placeholder="describe the ASCII art you want to create..."
                className="w-full min-h-[80px] max-h-[200px] resize-y bg-background border border-border/50 rounded-sm px-3 py-2.5 outline-none text-sm font-mono placeholder:text-muted-foreground/60 focus:border-border transition-colors duration-0"
                disabled={isGenerating}
              />
              {prompt && (
                <button
                  onClick={() => setPrompt('')}
                  className="absolute right-2.5 top-2.5 w-5 h-5 flex items-center justify-center text-sm text-muted-foreground hover:text-foreground rounded-sm cursor-default transition-colors duration-0"
                  aria-label="Clear prompt"
                >
                  ×
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2 rounded-sm border border-border/50 bg-background px-2.5 py-1.5">
              {/* Left side - Model picker and tools */}
              <div className="flex items-center gap-1.5 flex-1">
                <ModelPicker disabled={isGenerating} />

                <div className="h-5 w-px bg-border/50" />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isGenerating}
                  className="flex items-center justify-center w-8 h-8 border border-border/50 rounded-sm hover:bg-muted/50 hover:border-border transition-colors duration-0 font-mono text-xs disabled:opacity-50 cursor-default"
                  title="Upload image"
                  aria-label="Upload image for ASCII conversion"
                >
                  □
                </button>

                {currentGeneration && (
                  <>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center w-8 h-8 border border-border/50 rounded-sm hover:bg-muted/50 hover:border-border transition-colors duration-0 font-mono text-xs cursor-default"
                      title="Copy to clipboard"
                      aria-label="Copy ASCII art to clipboard"
                    >
                      {isMobile ? '⊡' : 'CPY'}
                    </button>
                    <button
                      onClick={downloadAscii}
                      className="flex items-center justify-center w-8 h-8 border border-border/50 rounded-sm hover:bg-muted/50 hover:border-border transition-colors duration-0 font-mono text-xs cursor-default"
                      title="Download ASCII"
                      aria-label="Download ASCII art as text file"
                    >
                      {isMobile ? '↓' : 'DL'}
                    </button>
                  </>
                )}
              </div>

              {/* Right side - Submit button */}
              <div className="flex items-center gap-2">
                {generations.length > 0 && (
                  <span className="text-xs text-muted-foreground font-mono">
                    {currentIndex + 1}/{generations.length}
                  </span>
                )}
                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex items-center justify-center px-3 h-8 bg-foreground text-background border border-foreground disabled:bg-transparent disabled:text-muted-foreground disabled:border-border transition-colors duration-0 font-mono text-xs gap-1.5 rounded-sm cursor-default"
                  aria-label={isGenerating ? 'Generating ASCII art' : 'Generate ASCII art'}
                >
                  {isGenerating ? '◌' : '▶'}
                  {!isMobile && <span>{isGenerating ? 'generating' : 'run'}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
