'use client'

import { useState, useRef } from 'react'
import { AsciiEngine } from '@/lib/ascii/engine'
import { generateAsciiArt } from './actions'
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

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    
    setIsGenerating(true)
    try {
      const result = await generateAsciiArt(prompt)
      
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
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-mono font-bold tracking-tight text-foreground">generate ascii</h1>
          </div>
          
          {/* Prompt bar */}
          <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6">
            {/* Full width input */}
            <div className="flex items-center border border-border px-3 h-10 bg-transparent relative mb-3">
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
                placeholder="describe the ascii art you want to create..."
                className="w-full bg-transparent border-none outline-none text-sm font-mono"
                disabled={isGenerating}
              />
              {prompt && (
                <button
                  onClick={() => setPrompt('')}
                  className="absolute right-2 text-lg opacity-70 hover:opacity-100"
                >
                  ×
                </button>
              )}
            </div>

            {/* Control row */}
            <div className="flex justify-between items-center gap-2">
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
                  className="flex items-center justify-center w-10 h-8 border border-border hover:bg-muted transition-colors font-mono text-sm disabled:opacity-50"
                  title="Upload image"
                >
                  □
                </button>

                {currentGeneration && (
                  <>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center justify-center w-10 h-8 border border-border hover:bg-muted transition-colors font-mono text-sm"
                      title="Copy to clipboard"
                    >
                      {isMobile ? '⊡' : 'CPY'}
                    </button>

                    <button
                      onClick={downloadAscii}
                      className="flex items-center justify-center w-10 h-8 border border-border hover:bg-muted transition-colors font-mono text-sm"
                      title="Download ASCII"
                    >
                      {isMobile ? '↓' : 'DL'}
                    </button>
                  </>
                )}

                {generations.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : generations.length - 1))}
                      disabled={generations.length === 0}
                      className="flex items-center justify-center w-10 h-8 border border-border hover:bg-muted transition-colors font-mono text-sm"
                      title="Previous"
                    >
                      ←
                    </button>

                    <button
                      onClick={() => setCurrentIndex((prev) => (prev < generations.length - 1 ? prev + 1 : 0))}
                      disabled={generations.length === 0}
                      className="flex items-center justify-center w-10 h-8 border border-border hover:bg-muted transition-colors font-mono text-sm"
                      title="Next"
                    >
                      →
                    </button>
                  </>
                )}

                {generations.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="flex items-center justify-center w-10 h-8 border border-border hover:bg-muted transition-colors font-mono text-sm"
                    title="Clear history"
                  >
                    {isMobile ? '○' : 'CLR'}
                  </button>
                )}
              </div>

              {/* Right controls */}
              <div className="flex gap-2 items-center">
                {generations.length > 0 && (
                  <span className="text-xs text-muted-foreground font-mono mr-2">
                    {currentIndex + 1}/{generations.length}
                  </span>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="flex items-center justify-center px-4 h-8 bg-foreground text-background border border-foreground disabled:bg-transparent disabled:text-muted-foreground disabled:border-border transition-colors font-mono text-sm gap-2"
                >
                  {isGenerating ? '◌' : '▶'}
                  {!isMobile && <span>{isGenerating ? 'GENERATING' : 'RUN'}</span>}
                </button>
              </div>
            </div>
          </div>

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
                <div className="text-center max-w-2xl mx-auto">
                  <h2 className="text-2xl font-mono mb-4">
                    ASCII ART GENERATOR
                  </h2>
                  <p className="text-sm text-muted-foreground font-mono leading-relaxed mb-8">
                    Create unique ASCII animations with AI. Describe what you want to see, 
                    upload an image, or try one of the examples below.
                  </p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={() => {
                        setPrompt('Matrix rain effect with falling green characters')
                        inputRef.current?.focus()
                      }}
                      className="px-4 py-2 text-xs border border-border bg-transparent hover:bg-muted transition-colors font-mono"
                    >
                      MATRIX RAIN
                    </button>
                    <button
                      onClick={() => {
                        setPrompt('Ocean waves crashing on a beach')
                        inputRef.current?.focus()
                      }}
                      className="px-4 py-2 text-xs border border-border bg-transparent hover:bg-muted transition-colors font-mono"
                    >
                      OCEAN WAVES
                    </button>
                    <button
                      onClick={() => {
                        setPrompt('Fire flames dancing and flickering')
                        inputRef.current?.focus()
                      }}
                      className="px-4 py-2 text-xs border border-border bg-transparent hover:bg-muted transition-colors font-mono"
                    >
                      FIRE DANCE
                    </button>
                    <button
                      onClick={() => {
                        setPrompt('Geometric patterns pulsing and morphing')
                        inputRef.current?.focus()
                      }}
                      className="px-4 py-2 text-xs border border-border bg-transparent hover:bg-muted transition-colors font-mono"
                    >
                      GEOMETRY
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}