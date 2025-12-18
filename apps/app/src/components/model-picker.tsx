'use client';

import {
  CaretDown,
  CaretUp,
  Check,
  Gear,
  MagnifyingGlass,
  X,
  Warning,
} from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { selectedModelIdAtom } from '@/atoms/models';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';
import { useQuery } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { useModels, useDefaultModel } from '@/hooks/use-ascii';
import type { Doc } from '@repo/backend/convex/_generated/dataModel';

// Adapter type for backward compatibility
interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  description: string;
  contextWindow?: number;
  recommended?: boolean;
}

// Convert Convex model to ModelConfig format
function toModelConfig(model: Doc<'models'>): ModelConfig {
  return {
    id: model.modelId,
    name: model.name,
    provider: model.provider,
    description: model.description,
    contextWindow: model.contextWindow,
    recommended: model.isDefault,
  };
}

interface ModelPickerProps {
  disabled?: boolean;
  onModelChange?: (modelId: string) => void;
}

export function ModelPicker({
  disabled = false,
  onModelChange,
}: ModelPickerProps) {
  const [globalSelectedModelId, setGlobalSelectedModelId] = useAtom(selectedModelIdAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Fetch user settings to get enabled models
  const settings = useQuery(api.functions.settings.get);
  const enabledModelIds = settings?.enabledModels?.openrouter || [];
  const hasApiKey = !!settings?.openrouterApiKey;

  // Fetch models from Convex
  const modelsState = useModels();
  const defaultModelState = useDefaultModel();

  // Get available models from Convex, filtered by user settings
  const availableModels = useMemo((): ModelConfig[] => {
    // Still loading
    if (modelsState.status === 'loading') {
      return [];
    }

    const allModels = modelsState.data ?? [];
    const defaultModel = defaultModelState.status === 'ready' ? defaultModelState.data : null;
    const defaultModelId = defaultModel?.modelId;

    if (!hasApiKey || enabledModelIds.length === 0) {
      // If no API key or no enabled models, show default model only
      if (defaultModel) {
        return [toModelConfig(defaultModel)];
      }
      // Fallback to first model if no default
      const first = allModels[0];
      return first ? [toModelConfig(first)] : [];
    }

    // Filter to user-enabled models
    return allModels
      .filter(model => enabledModelIds.includes(model.modelId))
      .map(toModelConfig);
  }, [modelsState, defaultModelState, hasApiKey, enabledModelIds]);

  const selectedModel = availableModels.find(
    (model) => model.id === globalSelectedModelId
  ) || availableModels[0];

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  // Clear search when menu closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Filter models based on search
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableModels;
    }
    
    const query = searchQuery.toLowerCase();
    return availableModels.filter(
      model => 
        model.name.toLowerCase().includes(query) ||
        model.provider.toLowerCase().includes(query) ||
        model.description.toLowerCase().includes(query)
    );
  }, [searchQuery, availableModels]);

  // Group filtered models by provider
  const modelsByProvider = useMemo(() => {
    return filteredModels.reduce(
      (acc, model) => {
        if (!acc[model.provider]) {
          acc[model.provider] = [];
        }
        acc[model.provider].push(model);
        return acc;
      },
      {} as Record<string, typeof filteredModels>
    );
  }, [filteredModels]);

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    setGlobalSelectedModelId(modelId);
    onModelChange?.(modelId);
    setIsOpen(false);
  };

  const handleOpenModelSettings = () => {
    setIsOpen(false);
    router.push('/settings/models');
  };

  const displayText = selectedModel ? selectedModel.name : 'select model';

  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'relative flex h-10 w-48 select-none items-center gap-2 overflow-hidden',
            'rounded-md border border-border/50 px-3 py-2',
            'font-mono text-xs uppercase tracking-wider',
            'transition-all duration-200',
            'hover:border-border hover:bg-muted/50',
            isOpen && 'border-border bg-muted/50',
            disabled && 'pointer-events-none opacity-50'
          )}
          disabled={disabled}
        >
          {/* Model name */}
          <div className="relative flex-1 overflow-hidden">
            <span className={cn(
              'block whitespace-nowrap text-left',
              selectedModel ? 'text-foreground' : 'text-muted-foreground'
            )}>
              {displayText}
            </span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="up"
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 180 }}
                exit={{ opacity: 0, rotate: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CaretUp className="h-3 w-3 text-muted-foreground" />
              </motion.div>
            ) : (
              <motion.div
                key="down"
                initial={{ opacity: 0, rotate: 0 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.15 }}
              >
                <CaretDown className="h-3 w-3 text-muted-foreground" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </DropdownMenuPrimitive.Trigger>

      <AnimatePresence>
        {isOpen && (
          <DropdownMenuPrimitive.Portal forceMount>
            <DropdownMenuPrimitive.Content
              asChild
              side="bottom"
              align="start"
              alignOffset={0}
              sideOffset={4}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
              }}
            >
              <motion.div
                className="z-[500] flex w-80 flex-col overflow-hidden rounded-md border border-border bg-background shadow-lg"
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                {/* Search Input */}
                <div className="border-b border-border/50 p-3">
                  <div className="relative">
                    <MagnifyingGlass
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="SEARCH MODELS..."
                      className="h-9 pl-10 pr-10 font-mono text-xs uppercase tracking-wider placeholder:text-muted-foreground/60"
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          onClick={() => setSearchQuery('')}
                          className="absolute right-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded-sm transition-colors hover:bg-muted"
                        >
                          <X className="h-3 w-3 text-muted-foreground" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* No API Key Warning */}
                {!hasApiKey && (
                  <div className="border-b border-border/50 p-3">
                    <div className="flex items-center gap-2 rounded-sm bg-yellow-500/10 p-2">
                      <Warning className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <p className="font-mono text-[10px] font-medium uppercase tracking-wider text-yellow-600 dark:text-yellow-400">
                          NO API KEY CONFIGURED
                        </p>
                        <p className="font-mono text-[10px] text-muted-foreground">
                          ADD YOUR KEY IN SETTINGS TO ENABLE ALL MODELS
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Models List */}
                <div className="max-h-64 overflow-y-auto">
                  {Object.keys(modelsByProvider).length > 0 ? (
                    <div>
                      {Object.entries(modelsByProvider).map(
                        ([provider, models]) => (
                          <div key={provider}>
                            {/* Provider Header */}
                            <div className="sticky top-0 z-10 border-b border-border/30 bg-background/95 px-3 py-2 backdrop-blur-sm">
                              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                                {provider}
                              </h3>
                            </div>
                            {models.map((model) => (
                              <DropdownMenuPrimitive.Item
                                key={model.id}
                                className={cn(
                                  'group relative mx-1 flex cursor-pointer select-none items-center rounded-sm px-3 py-2.5',
                                  'text-sm outline-none transition-colors',
                                  'hover:bg-muted hover:text-foreground',
                                  'focus:bg-muted focus:text-foreground'
                                )}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  handleModelSelect(model.id);
                                }}
                              >
                                <div className="flex w-full items-center justify-between gap-2">
                                  <div className="flex-1">
                                    <div className="font-mono text-xs font-medium">
                                      {model.name}
                                    </div>
                                    <div className="font-mono text-[10px] text-muted-foreground">
                                      {model.description}
                                    </div>
                                  </div>

                                  {/* Check icon */}
                                  <AnimatePresence>
                                    {model.id === globalSelectedModelId && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                      >
                                        <Check className="h-4 w-4 text-green-500" />
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              </DropdownMenuPrimitive.Item>
                            ))}
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center">
                      <p className="font-mono text-xs text-muted-foreground">
                        NO MODELS FOUND
                      </p>
                    </div>
                  )}
                </div>

                {/* Settings Option */}
                <div className="border-t border-border/50 p-1">
                  <DropdownMenuPrimitive.Item
                    className={cn(
                      'mx-1 flex cursor-pointer select-none items-center rounded-sm px-3 py-2.5',
                      'text-sm outline-none transition-colors',
                      'hover:bg-muted hover:text-foreground',
                      'focus:bg-muted focus:text-foreground'
                    )}
                    onSelect={handleOpenModelSettings}
                  >
                    <div className="flex items-center gap-3">
                      <Gear className="h-4 w-4" />
                      <span className="font-mono text-xs uppercase tracking-wider">
                        Manage Models
                      </span>
                    </div>
                  </DropdownMenuPrimitive.Item>
                </div>
              </motion.div>
            </DropdownMenuPrimitive.Content>
          </DropdownMenuPrimitive.Portal>
        )}
      </AnimatePresence>
    </DropdownMenuPrimitive.Root>
  );
}