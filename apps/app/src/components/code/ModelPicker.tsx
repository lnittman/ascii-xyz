'use client';

import {
  CaretDown,
  CaretUp,
  Check,
  Empty,
  Gear,
  MagnifyingGlass,
  X,
} from '@phosphor-icons/react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';
import { useEffect, useMemo, useRef, useState } from 'react';

import {
  mobileModelPickerHandlersAtom,
  mobileModelPickerOpenAtom,
} from '@/atoms/mobile-menus';
import { selectedModelIdAtom } from '@/atoms/models';
import { initialUserAtom } from '@/atoms/user';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { useModels } from '@/hooks/code/use-models';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

interface ModelPickerProps {
  disabled?: boolean;
  selectedModelId?: string;
  onModelChange?: (modelId: string) => void;
}

export function ModelPicker({
  disabled = false,
  selectedModelId,
  onModelChange,
}: ModelPickerProps) {
  const { isMobile } = useIsMobile();
  const [, setMobileModelPickerOpen] = useAtom(mobileModelPickerOpenAtom);
  const [, setMobileModelPickerHandlers] = useAtom(
    mobileModelPickerHandlersAtom
  );
  const [globalSelectedModelId, setGlobalSelectedModelId] =
    useAtom(selectedModelIdAtom);
  const [initialUser] = useAtom(initialUserAtom);
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useTransitionRouter();
  const { enabledModels, isLoading, hasEnabledModels } = useModels();

  // Streaming animation state for model name changes
  const [displayedText, setDisplayedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [_targetText, setTargetText] = useState('');
  const prevSelectedModelRef = useRef<string | null>(null);

  // Use global atom value if no prop is provided
  const activeSelectedModelId = selectedModelId ?? globalSelectedModelId;
  const selectedModel = enabledModels.find(
    (model) => model.id === activeSelectedModelId
  );

  // Display text based on state
  const getDisplayText = () => {
    if (!hasEnabledModels) {
      return 'no models configured';
    }
    if (selectedModel) {
      const providerName =
        selectedModel.provider === 'openrouter'
          ? 'OpenRouter'
          : selectedModel.provider === 'openai'
            ? 'OpenAI'
            : selectedModel.provider === 'anthropic'
              ? 'Anthropic'
              : selectedModel.provider === 'google'
                ? 'Google'
                : selectedModel.provider;
      return `${selectedModel.name} (${providerName})`;
    }
    return 'select model';
  };

  // Set handlers for mobile sheet when component mounts or handlers change
  useEffect(() => {
    setMobileModelPickerHandlers({
      selectedModelId: activeSelectedModelId,
      onModelChange,
    });
  }, [activeSelectedModelId, onModelChange, setMobileModelPickerHandlers]);

  // Focus search input when menu opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Small delay to ensure the input is rendered
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

  // Streaming animation effect for model name changes
  useEffect(() => {
    const currentText = getDisplayText();

    // If this is the first render or no change, set immediately
    if (
      !prevSelectedModelRef.current ||
      prevSelectedModelRef.current === (activeSelectedModelId || null)
    ) {
      setDisplayedText(currentText);
      setTargetText(currentText);
      prevSelectedModelRef.current = activeSelectedModelId || null;
      return;
    }

    // Model changed - start streaming animation
    setTargetText(currentText);
    setIsStreaming(true);

    // Clear current text and start revealing new text character by character
    setDisplayedText('');

    let currentIndex = 0;
    const streamInterval = setInterval(() => {
      if (currentIndex < currentText.length) {
        // Reveal one more character
        setDisplayedText(currentText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        // Animation complete
        setDisplayedText(currentText);
        setIsStreaming(false);
        clearInterval(streamInterval);
      }
    }, 30); // 30ms per character for smooth reveal

    prevSelectedModelRef.current = activeSelectedModelId || null;

    return () => clearInterval(streamInterval);
  }, [activeSelectedModelId, selectedModel, hasEnabledModels]);

  // Setup Fuse.js for fuzzy search
  const fuse = useMemo(() => {
    if (!hasEnabledModels) {
      return null;
    }

    return new Fuse(enabledModels, {
      keys: ['name', 'id', 'provider'],
      threshold: 0.3,
      includeScore: true,
    });
  }, [enabledModels, hasEnabledModels]);

  // Filter models based on search
  const filteredModels = useMemo(() => {
    if (!hasEnabledModels) {
      return [];
    }
    if (!searchQuery.trim()) {
      return enabledModels;
    }
    if (!fuse) {
      return [];
    }

    const results = fuse.search(searchQuery);
    return results.map((result) => result.item);
  }, [enabledModels, searchQuery, fuse, hasEnabledModels]);

  // Group filtered models by provider
  const modelsByProvider = useMemo(() => {
    if (!filteredModels.length) {
      return {};
    }

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

  // Handle opening model settings
  const handleOpenModelSettings = () => {
    setIsOpen(false);
    router.push('/settings/models');
  };

  // Handle model selection
  const handleModelSelect = (modelId: string) => {
    // Update the global atom
    setGlobalSelectedModelId(modelId);
    // Also call the optional prop callback for backward compatibility
    onModelChange?.(modelId);
    // Close the dropdown when selecting a model
    setIsOpen(false);
  };

  const handleOpenMobileModelPicker = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMobileModelPickerOpen(true);
  };

  // Show loading state only if we don't have any models at all
  if (isLoading && !enabledModels.length) {
    return (
      <div className="flex items-center px-2 py-1 text-muted-foreground text-xs">
        loading models...
      </div>
    );
  }

  const staticDisplayText = getDisplayText();
  const displayText = isStreaming
    ? displayedText
    : displayedText || staticDisplayText; // Use streamed text during animation
  const hasValidSelection = !!selectedModel && hasEnabledModels;
  // Only show attention state if we truly don't have any model selection AND models are fully loaded
  // Never show attention if: we're loading, we have an activeSelectedModelId, we have a user activeModel from server, or we don't have enabled models yet
  const needsAttention =
    hasEnabledModels &&
    !isLoading &&
    !activeSelectedModelId &&
    !selectedModel &&
    !initialUser?.activeModel;

  // --- Conditional Rendering Logic ---
  if (isMobile) {
    return (
      <Button
        variant="ghost"
        className={cn(
          'relative flex h-8 w-48 select-none items-center gap-2 overflow-hidden rounded-md rounded-none border px-2 py-1 transition-all',
          disabled && 'pointer-events-none opacity-50',
          // Normal state styling
          hasEnabledModels &&
            selectedModel &&
            'border-accent/40 hover:border-accent/60 hover:bg-accent/40 hover:text-accent-foreground',
          // Orange/warning state styling
          (!hasEnabledModels || needsAttention) &&
            'border-orange-500/50 bg-orange-500/5 hover:border-orange-500/70 hover:bg-orange-500/10'
        )}
        disabled={disabled}
        onClick={handleOpenMobileModelPicker}
      >
        {/* Model name with fade transition and gradient truncation */}
        <div className="relative flex-1 overflow-hidden">
          <span
            className={cn(
              'block whitespace-nowrap pr-2 text-left font-mono text-xs',
              hasValidSelection ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {displayText}
          </span>

          {/* Gradient fade mask for long names */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              maskImage: 'linear-gradient(to left, transparent, black 1.5rem)',
              WebkitMaskImage:
                'linear-gradient(to left, transparent, black 1.5rem)',
            }}
          />
        </div>

        <CaretDown
          weight="duotone"
          className="h-3 w-3 flex-shrink-0 text-muted-foreground"
        />
      </Button>
    );
  }

  // --- Desktop Dropdown (existing logic) ---
  return (
    <DropdownMenuPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuPrimitive.Trigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'relative flex h-8 w-48 select-none items-center gap-2 overflow-hidden rounded-md rounded-none border px-2 py-1 transition-all',
            disabled && 'pointer-events-none opacity-50',
            // Normal state styling
            hasEnabledModels &&
              selectedModel &&
              !isOpen &&
              'border-accent/40 hover:border-accent/60 hover:bg-accent/40 hover:text-accent-foreground',
            // Open state styling (maintains hover appearance)
            isOpen &&
              hasEnabledModels &&
              selectedModel &&
              'border-accent/60 bg-accent/40 text-accent-foreground',
            isOpen &&
              (!hasEnabledModels || needsAttention) &&
              'border-orange-500/70 bg-orange-500/10',
            // Orange/warning state styling
            (!hasEnabledModels || needsAttention) &&
              !isOpen &&
              'border-orange-500/50 bg-orange-500/5 hover:border-orange-500/70 hover:bg-orange-500/10'
          )}
          disabled={disabled}
        >
          {/* Model name with streaming animation */}
          <div className="relative flex-1 overflow-hidden">
            <span
              className={cn(
                'block whitespace-nowrap pr-2 text-left font-mono text-xs',
                hasValidSelection ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {displayText}
            </span>

            {/* Gradient fade mask for long names */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                maskImage:
                  'linear-gradient(to left, transparent, black 1.5rem)',
                WebkitMaskImage:
                  'linear-gradient(to left, transparent, black 1.5rem)',
              }}
            />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="up"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CaretUp
                  weight="duotone"
                  className="h-3 w-3 flex-shrink-0 text-muted-foreground"
                />
              </motion.div>
            ) : (
              <motion.div
                key="down"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <CaretDown
                  weight="duotone"
                  className="h-3 w-3 flex-shrink-0 text-muted-foreground"
                />
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
              sideOffset={8}
              onCloseAutoFocus={(event) => {
                event.preventDefault();
              }}
            >
              <motion.div
                className="z-[500] flex w-80 flex-col overflow-hidden rounded-none border border-border/20 bg-popover/95 shadow-md backdrop-blur-sm"
                initial={{ opacity: 0, y: -4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.95 }}
                transition={{
                  duration: 0.2,
                  ease: [0.32, 0.72, 0, 1],
                }}
              >
                {/* Search Input */}
                <div className="relative border-border/50 border-b px-3 py-3">
                  <div className="relative">
                    <MagnifyingGlass
                      weight="duotone"
                      className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground"
                    />
                    <Input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="search models..."
                      className="h-9 rounded-none pr-10 pl-10 text-foreground text-sm placeholder:text-muted-foreground"
                    />
                    <AnimatePresence>
                      {searchQuery && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          onClick={() => setSearchQuery('')}
                          className="-translate-y-1/2 absolute top-1/2 right-3 flex h-4 w-4 transform items-center justify-center rounded-sm transition-colors hover:bg-accent/50"
                        >
                          <X
                            weight="duotone"
                            className="h-3 w-3 text-muted-foreground"
                          />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Models List - Fixed height scrollable area with fade gradients */}
                <RelativeScrollFadeContainer
                  className="h-64"
                  fadeColor="var(--popover)"
                >
                  {hasEnabledModels &&
                  Object.keys(modelsByProvider).length > 0 ? (
                    <div>
                      {Object.entries(modelsByProvider).map(
                        ([provider, models], _groupIndex) => (
                          <div key={provider}>
                            {/* Sticky Provider Header */}
                            <div className="sticky top-0 z-10 mb-1 flex h-6 items-center border-border/30 border-b bg-popover/95 px-3 backdrop-blur-sm">
                              <h3 className="font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                                {provider === 'openrouter'
                                  ? 'OpenRouter'
                                  : provider === 'openai'
                                    ? 'OpenAI'
                                    : provider === 'anthropic'
                                      ? 'Anthropic'
                                      : provider === 'google'
                                        ? 'Google'
                                        : provider}
                              </h3>
                            </div>
                            {models.map((model) => (
                              <DropdownMenuPrimitive.Item
                                key={model.id}
                                className={cn(
                                  'group relative mx-1 flex cursor-pointer select-none items-center rounded-none px-3 py-2 text-foreground text-sm outline-none transition-colors',
                                  'hover:bg-accent hover:text-accent-foreground',
                                  'focus:bg-accent focus:text-accent-foreground',
                                  'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                                )}
                                onSelect={(e) => {
                                  e.preventDefault(); // Prevent default dropdown close behavior
                                  handleModelSelect(model.id);
                                }}
                              >
                                <div className="flex w-full items-center justify-between gap-2">
                                  {/* Model name only (provider shown in section header) */}
                                  <div className="relative mr-2 flex-1 overflow-hidden">
                                    <span className="whitespace-nowrap pr-8 font-medium">
                                      {model.name}
                                    </span>
                                    {/* Use mask for gradient fade instead of overlay */}
                                    <div
                                      className="pointer-events-none absolute inset-0"
                                      style={{
                                        maskImage:
                                          'linear-gradient(to left, transparent, black 2rem)',
                                        WebkitMaskImage:
                                          'linear-gradient(to left, transparent, black 2rem)',
                                      }}
                                    />
                                  </div>

                                  {/* Check icon on the right with fade animation */}
                                  <AnimatePresence>
                                    {model.id === activeSelectedModelId && (
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex-shrink-0"
                                      >
                                        <Check
                                          weight="duotone"
                                          className="h-4 w-4 text-green-500"
                                        />
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
                  ) : hasEnabledModels && searchQuery ? (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center px-3 py-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                          <Empty
                            weight="duotone"
                            className="h-6 w-6 text-muted-foreground"
                          />
                        </div>
                        <p className="text-muted-foreground text-sm">
                          no models found
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center px-3 py-8">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                          <Empty
                            weight="duotone"
                            className="h-6 w-6 text-muted-foreground"
                          />
                        </div>
                        <p className="text-muted-foreground text-sm">
                          no models configured
                        </p>
                      </div>
                    </div>
                  )}
                </RelativeScrollFadeContainer>

                {/* Sticky Settings Option at bottom */}
                <div className="border-border/50 border-t py-1">
                  <DropdownMenuPrimitive.Item
                    className={cn(
                      'relative mx-1 flex cursor-pointer select-none items-center rounded-none px-3 py-2 text-foreground text-sm outline-none transition-colors',
                      'focus:bg-accent focus:text-accent-foreground',
                      'data-[disabled]:pointer-events-none data-[disabled]:opacity-50'
                    )}
                    onSelect={handleOpenModelSettings}
                  >
                    <div className="flex items-center gap-3">
                      <Gear
                        weight="duotone"
                        className="h-4 w-4 flex-shrink-0"
                      />
                      <span>
                        {hasEnabledModels
                          ? 'manage models'
                          : 'configure models'}
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
