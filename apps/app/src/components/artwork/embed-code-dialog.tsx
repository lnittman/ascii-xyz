'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, Code } from '@phosphor-icons/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@repo/design/components/ui/button';
import { Label } from '@repo/design/components/ui/label';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';
import { generateEmbedCode, EMBED_DEFAULTS } from '@/lib/embed';

interface EmbedCodeDialogProps {
  shareCode: string;
  title?: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

type Theme = 'light' | 'dark';

export function EmbedCodeDialog({
  shareCode,
  title = 'ASCII Art',
  trigger,
  open: controlledOpen,
  onOpenChange,
}: EmbedCodeDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [width, setWidth] = useState(EMBED_DEFAULTS.width);
  const [height, setHeight] = useState(EMBED_DEFAULTS.height);
  const [theme, setTheme] = useState<Theme>(EMBED_DEFAULTS.theme);
  const [autoplay, setAutoplay] = useState(EMBED_DEFAULTS.autoplay);
  const [loop, setLoop] = useState(EMBED_DEFAULTS.loop);

  const isOpen = controlledOpen ?? internalOpen;
  const setIsOpen = onOpenChange ?? setInternalOpen;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ascii.xyz';

  const embedCode = generateEmbedCode({
    baseUrl,
    shareCode,
    width,
    height,
    title,
    theme,
    autoplay,
    loop,
  });

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      toast.success('Embed code copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  // Reset copied state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>}

      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild>
              <motion.div
                className="fixed inset-0 bg-black/50 z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            </Dialog.Overlay>

            <Dialog.Content asChild>
              <motion.div
                className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-background p-6 shadow-lg"
                initial={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
                animate={{ opacity: 1, scale: 1, y: '-50%', x: '-50%' }}
                exit={{ opacity: 0, scale: 0.95, y: '-48%', x: '-50%' }}
                transition={{ duration: 0.15 }}
              >
                <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
                  <Code className="h-5 w-5" weight="bold" />
                  Embed Code
                </Dialog.Title>

                <Dialog.Description className="text-sm text-muted-foreground mt-1">
                  Copy the embed code to add this artwork to your website.
                </Dialog.Description>

                <div className="mt-6 space-y-4">
                  {/* Size Options */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">Width</Label>
                      <Input
                        id="width"
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value) || 640)}
                        min={200}
                        max={1920}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <Input
                        id="height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 480)}
                        min={150}
                        max={1080}
                      />
                    </div>
                  </div>

                  {/* Theme Toggle */}
                  <div className="space-y-2">
                    <Label>Theme</Label>
                    <div className="flex gap-2">
                      <Button
                        variant={theme === 'dark' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('dark')}
                      >
                        Dark
                      </Button>
                      <Button
                        variant={theme === 'light' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTheme('light')}
                      >
                        Light
                      </Button>
                    </div>
                  </div>

                  {/* Animation Options */}
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoplay}
                        onChange={(e) => setAutoplay(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Autoplay</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={loop}
                        onChange={(e) => setLoop(e.target.checked)}
                        className="rounded border-border"
                      />
                      <span className="text-sm">Loop</span>
                    </label>
                  </div>

                  {/* Code Preview */}
                  <div className="space-y-2">
                    <Label>Embed Code</Label>
                    <div className="relative">
                      <pre className="p-3 rounded-md bg-muted text-xs overflow-x-auto font-mono">
                        {embedCode}
                      </pre>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-7 w-7"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                  <Dialog.Close asChild>
                    <Button variant="outline">Close</Button>
                  </Dialog.Close>
                  <Button onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Code
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
