'use client'

import { useMemo, useState, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { selectedModelIdAtom } from '@/atoms/models'
import { AsciiEngine } from '@/lib/ascii/engine'
import { generateAsciiArt } from './create/actions'
import { saveAsciiArt } from './create/save-actions'
import { useIsMobile } from '@/hooks/useIsMobile'
import { useUser } from '@repo/auth/client'
import { ModelPicker } from '@/components/model-picker'
import { useGeneration } from '@/hooks/use-generation'
import { Id } from '@repo/backend/convex/_generated/dataModel'
import { ThinkingTraces, InlineThinkingTrace } from '@/components/thinking-traces'

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
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeGenerationId, setActiveGenerationId] = useState<Id<"artworkGenerations"> | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const selectedModelId = useAtomValue(selectedModelIdAtom)
  
  // Subscribe to live generation updates
  const liveGeneration = useGeneration(activeGenerationId)

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    
    setIsGenerating(true)
    setActiveGenerationId(null) // Reset active generation
    
    try {
      // Use agent-based generation with world-class prompting
      const result = await generateAsciiArt(prompt, selectedModelId, undefined)
      
      // Set the generation ID for live updates
      if (result.generationId) {
        setActiveGenerationId(result.generationId as Id<"artworkGenerations">)
      }
      
      // Auto-save to gallery
      let savedId = undefined
      try {
        const saveResult = await saveAsciiArt(
          prompt,
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
        generationId: result.generationId as Id<"artworkGenerations">,
        prompt,
        frames: result.frames,
        timestamp: new Date(),
        saved: !!savedId,
        artworkId: savedId
      }
      
      setGenerations(prev => [...prev, generation])
      setCurrentIndex(generations.length) // Set to new generation
      setPrompt('')
    } catch (error) {
      console.error('Failed to generate ASCII art:', error)
    } finally {
      setIsGenerating(false)
      setActiveGenerationId(null) // Clear when done
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
  
  // Use live generation data if available during generation
  const displayGeneration = liveGeneration && activeGenerationId && isGenerating ? {
    ...currentGeneration,
    frames: liveGeneration.frames || [],
    status: liveGeneration.status,
    currentFrame: liveGeneration.currentFrame,
    totalFrames: liveGeneration.totalFrames,
    plan: liveGeneration.plan,
  } : currentGeneration

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 pt-12 pb-40">
        <div className="max-w-3xl mx-auto">
          {/* Prompt bar moved to bottom sticky; see bottom of page */}

          {/* Main content area */}
          <div className="">
            {isGenerating && liveGeneration ? (
              <div className="pt-8">
                <div className="mb-6">
                  <p className="text-sm font-mono text-muted-foreground mb-2">
                    PROMPT:
                  </p>
                  <p className="text-base font-mono">
                    {prompt || liveGeneration.prompt}
                  </p>
                  
                  {/* Progress indicator */}
                  {liveGeneration.status === 'planning' && (
                    <div className="mt-4 text-sm font-mono text-muted-foreground">
                      <InlineThinkingTrace text="Planning animation..." />
                    </div>
                  )}
                  {liveGeneration.status === 'generating' && (
                    <div className="mt-4">
                      <div className="flex items-center gap-3 text-sm font-mono">
                        <span className="text-muted-foreground">Frame</span>
                        <span className="text-foreground">{liveGeneration.currentFrame || 0}</span>
                        <span className="text-muted-foreground">of</span>
                        <span className="text-foreground">{liveGeneration.totalFrames || '?'}</span>
                      </div>
                      <div className="mt-2 w-full bg-muted rounded-full h-1 overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300 ease-out"
                          style={{ 
                            width: `${liveGeneration.totalFrames ? (liveGeneration.currentFrame / liveGeneration.totalFrames) * 100 : 0}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Thinking traces */}
                  {liveGeneration.thinkingTraces && liveGeneration.thinkingTraces.length > 0 && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-md border border-border/50 max-h-32 overflow-y-auto">
                      <ThinkingTraces traces={liveGeneration.thinkingTraces} />
                    </div>
                  )}
                </div>

                <div className="border border-border bg-muted/30 p-6 overflow-auto min-h-[200px]">
                  {liveGeneration.frames && liveGeneration.frames.length > 0 ? (
                    <AsciiEngine
                      frames={liveGeneration.frames}
                      fps={liveGeneration.plan?.fps || 12}
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
                    <div className="text-center text-muted-foreground font-mono text-sm">
                      <div className="text-2xl mb-4 animate-pulse">◌ ◌ ◌</div>
                      {liveGeneration.status === 'planning' ? 'Creating generation plan...' : 'Generating frames...'}
                    </div>
                  )}
                </div>
              </div>
            ) : isGenerating ? (
              <div className="text-center pt-16">
                <div className="text-2xl font-mono text-foreground mb-4 animate-pulse">
                  ◌ ◌ ◌
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  initializing generation...
                </p>
              </div>
            ) : currentGeneration ? (
              <div className="pt-8">
                <div className="mb-6">
                  <p className="text-sm font-mono text-muted-foreground mb-2">
                    PROMPT:
                  </p>
                  <p className="text-base font-mono">
                    {currentGeneration.prompt}
                  </p>
                </div>

                <div className="border border-border bg-muted/30 p-6 overflow-auto">
                  {displayGeneration.frames && displayGeneration.frames.length > 0 && (
                    <AsciiEngine
                      frames={displayGeneration.frames}
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
            ) : (
              <div className="pt-8">
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-[12px] border border-border bg-muted/30 p-6 overflow-hidden">
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
                        opacity: 0.8,
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
          <div className="space-y-3">
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
                placeholder="Describe the ASCII art you want to create..."
                className="w-full min-h-[80px] max-h-[200px] resize-y bg-background border border-border/60 rounded-[12px] px-4 py-3 outline-none text-sm font-mono placeholder:text-muted-foreground/60 focus:border-border"
                disabled={isGenerating}
              />
              {prompt && (
                <button
                  onClick={() => setPrompt('')}
                  className="absolute right-3 top-3 text-lg opacity-60 hover:opacity-100 transition-none"
                  aria-label="Clear"
                >
                  ×
                </button>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-2 rounded-[12px] border border-border/60 bg-background/95 backdrop-blur-sm px-3 py-2">
              {/* Left side - Model picker and tools */}
              <div className="flex items-center gap-2 flex-1">
                <ModelPicker disabled={isGenerating} />
                
                <div className="h-6 w-px bg-border/50" />
                
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
                  className="flex items-center justify-center w-10 h-10 border border-border/50 rounded-[8px] hover:bg-muted/50 hover:border-border transition-colors font-mono text-sm disabled:opacity-50"
                  title="Upload image"
                >
                  □
                </button>
                
                {currentGeneration && (
                  <>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center w-10 h-10 border border-border/50 rounded-[8px] hover:bg-muted/50 hover:border-border transition-colors font-mono text-sm"
                      title="Copy to clipboard"
                    >
                      {isMobile ? '⊡' : 'CPY'}
                    </button>
                    <button
                      onClick={downloadAscii}
                      className="flex items-center justify-center w-10 h-10 border border-border/50 rounded-[8px] hover:bg-muted/50 hover:border-border transition-colors font-mono text-sm"
                      title="Download ASCII"
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
                  className="flex items-center justify-center px-4 h-10 bg-foreground text-background border border-foreground disabled:bg-transparent disabled:text-muted-foreground disabled:border-border transition-colors font-mono text-sm gap-2 rounded-[8px]"
                >
                  {isGenerating ? '◌' : '▶'}
                  {!isMobile && <span>{isGenerating ? 'GENERATING' : 'RUN'}</span>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
