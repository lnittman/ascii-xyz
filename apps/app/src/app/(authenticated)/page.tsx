'use client'

import { useState, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { selectedModelIdAtom } from '@/atoms/models'
import { AsciiEngine } from '@/lib/ascii/engine'
import { generateAsciiArt } from './create/actions'
import { ArtsyAscii } from '@/components/shared/artsy-ascii'
import { useIsMobile } from '@/hooks/useIsMobile'

interface AsciiGeneration {
  id: string
  prompt: string
  frames: string[]
  timestamp: Date
}

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [generations, setGenerations] = useState<AsciiGeneration[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useIsMobile()
  const selectedModelId = useAtomValue(selectedModelIdAtom)

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    
    setIsGenerating(true)
    try {
      const result = await generateAsciiArt(prompt, selectedModelId)
      
      const generation: AsciiGeneration = {
        id: crypto.randomUUID(),
        prompt,
        frames: result.frames,
        timestamp: new Date()
      }
      
      setGenerations(prev => [...prev, generation])
      setCurrentIndex(generations.length) // Set to new generation
      setPrompt('')
    } catch (error) {
      console.error('Failed to generate ASCII art:', error)
    } finally {
      setIsGenerating(false)
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

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <div className="px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-10">
            <h1 className="text-3xl font-mono font-medium tracking-tight text-foreground">generate ascii</h1>
            <p className="text-sm text-muted-foreground mt-1">Transform your ideas into ASCII art</p>
          </div>
          {/* Prompt bar moved to bottom sticky; see bottom of page */}

          {/* Main content area */}
          <div className="">
            {isGenerating ? (
              <div className="text-center pt-16">
                <div className="text-2xl font-mono text-foreground mb-4">
                  ◌ ◌ ◌
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  generating ascii art...
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
                  {currentGeneration.frames && currentGeneration.frames.length > 0 && (
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
            ) : (
              <div className="pt-16">
                <div className="mx-auto max-w-2xl">
                  <div className="rounded-[12px] border border-border bg-muted/30 p-6">
                    <ArtsyAscii />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom-aligned composer (no suggestions row) */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-border/60 bg-background/95 backdrop-blur-sm">
        <div className="mx-auto max-w-3xl px-6 py-3">
          {/* Input row */}
          <div className="flex items-center gap-2">
            {/* Left controls */}
            <div className="flex gap-2">
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

            {/* Text input */}
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleGenerate()
                  }
                }}
                placeholder="Describe the ASCII art you want to create..."
                className="w-full bg-background border border-border/60 rounded-[8px] px-4 h-12 outline-none text-sm font-mono placeholder:text-muted-foreground/60"
                disabled={isGenerating}
              />
              {prompt && (
                <button
                  onClick={() => setPrompt('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg opacity-60 hover:opacity-100 transition-none"
                  aria-label="Clear"
                >
                  ×
                </button>
              )}
            </div>

            {/* Run button and index */}
            <div className="flex items-center gap-2">
              {generations.length > 0 && (
                <span className="text-xs text-muted-foreground font-mono mr-1">
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
  )
}
