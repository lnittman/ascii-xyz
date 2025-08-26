'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MagicWand, Settings, Eye, EyeClosed } from 'iconoir-react';

// Prevent static generation for this page as it uses Convex
export const dynamic = 'force-dynamic';
import Link from 'next/link';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Textarea } from '@repo/design/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design/components/ui/select';
import { Switch } from '@repo/design/components/ui/switch';
import { Label } from '@repo/design/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/design/components/ui/card';
import { useCreateArtwork } from '@/hooks/use-ascii';

export default function GenerateAsciiPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [visibility, setVisibility] = useState<'public' | 'private'>('private');
  
  // Advanced settings
  const [width, setWidth] = useState(80);
  const [height, setHeight] = useState(24);
  const [style, setStyle] = useState('default');
  const [model, setModel] = useState('gpt-4');
  const [frames, setFrames] = useState(1);
  const [fps, setFps] = useState(10);
  
  const createArtwork = useCreateArtwork();
  
  // Call the API to generate ASCII art
  const generateAsciiArt = async (prompt: string) => {
    const response = await fetch('/api/ascii/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate ASCII art');
    }
    
    const result = await response.json();
    return result.data.frames;
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      const generatedFrames = await generateAsciiArt(prompt);
      
      const artworkId = await createArtwork({
        prompt,
        frames: generatedFrames,
        metadata: {
          width,
          height,
          fps,
          generator: 'ascii-ai-v1',
          model,
          style,
        },
        visibility,
      });
      
      router.push(`/art/${artworkId}`);
    } catch (error) {
      console.error('Generation failed:', error);
      // Handle error (show toast, etc.)
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="border-b border-border px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <h1 className="text-lg font-medium">Generate ASCII Art</h1>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <Settings className="h-4 w-4 mr-1" />
            Advanced
          </Button>
        </div>
      </div>

      <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Prompt Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Describe Your ASCII Art</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="A majestic mountain landscape with snow peaks and pine trees..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[100px]"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="visibility">Visibility:</Label>
                  <Select value={visibility} onValueChange={(value: 'public' | 'private') => setVisibility(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="private">
                        <div className="flex items-center gap-2">
                          <EyeClosed className="h-4 w-4" />
                          Private
                        </div>
                      </SelectItem>
                      <SelectItem value="public">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          Public
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating}
                  className="min-w-32"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <MagicWand className="h-4 w-4 mr-1" />
                      Generate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          {showAdvanced && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Advanced Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      type="number"
                      value={width}
                      onChange={(e) => setWidth(Number(e.target.value))}
                      min="20"
                      max="120"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      type="number"
                      value={height}
                      onChange={(e) => setHeight(Number(e.target.value))}
                      min="10"
                      max="50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">AI Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      <SelectItem value="claude-3">Claude 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="style">Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                      <SelectItem value="retro">Retro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {frames > 1 && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frames">Animation Frames</Label>
                      <Input
                        id="frames"
                        type="number"
                        value={frames}
                        onChange={(e) => setFrames(Number(e.target.value))}
                        min="1"
                        max="30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fps">FPS</Label>
                      <Input
                        id="fps"
                        type="number"
                        value={fps}
                        onChange={(e) => setFps(Number(e.target.value))}
                        min="1"
                        max="30"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Example Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  "A serene mountain landscape with snow-capped peaks",
                  "A vintage car driving through a desert",
                  "A cozy cabin in a pine forest",
                  "A lighthouse on a rocky coastline",
                  "A steam locomotive crossing a bridge"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    className="text-left text-sm text-muted-foreground hover:text-foreground transition-colors block w-full p-2 rounded hover:bg-accent"
                  >
                    "{example}"
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}