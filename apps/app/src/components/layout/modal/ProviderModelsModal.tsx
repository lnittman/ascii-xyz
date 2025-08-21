'use client';

import { Empty, MagnifyingGlass, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { toast } from '@/components/shared/ui/custom-toast';
import { useModels } from '@/hooks/code/use-models';
import { useToggleModelEnabled } from '@/hooks/settings/mutations';
import { useAISettings } from '@/hooks/settings/use-ai-settings';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';

interface ProviderModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: string | null;
  providerName: string | null;
}

export function ProviderModelsModal({
  isOpen,
  onClose,
  providerId,
  providerName,
}: ProviderModelsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [_isPending, startTransition] = useTransition();
  const [pendingModels, setPendingModels] = useState<Set<string>>(new Set());
  const [lastValidProviderId, setLastValidProviderId] = useState<string | null>(
    null
  );
  const [lastValidProviderName, setLastValidProviderName] = useState<
    string | null
  >(null);
  const { providers, refreshModels } = useModels();
  const { settings, refresh } = useAISettings();
  const { toggleModel } = useToggleModelEnabled();

  // Keep track of the last valid provider info for animation purposes
  useEffect(() => {
    if (providerId && providerName) {
      setLastValidProviderId(providerId);
      setLastValidProviderName(providerName);
    }
  }, [providerId, providerName]);

  // Use current provider info if available, otherwise use last valid for animation
  const currentProviderId = providerId || lastValidProviderId;
  const currentProviderName = providerName || lastValidProviderName;

  // Get the current provider's models
  const currentProvider = providers.find((p) => p.id === currentProviderId);
  const models = currentProvider?.models || [];

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) {
      return models;
    }

    const query = searchQuery.toLowerCase();
    return models.filter(
      (model) =>
        model.id.toLowerCase().includes(query) ||
        model.name?.toLowerCase().includes(query) ||
        model.description?.toLowerCase().includes(query)
    );
  }, [models, searchQuery]);

  // Get enabled models for this provider from the models data
  const enabledModelsForProvider = models
    .filter((m) => m.enabled)
    .map((m) => m.id);
  const enabledCount = enabledModelsForProvider.length;

  const handleToggleModel = async (modelId: string) => {
    if (!currentProviderId) {
      return;
    }

    const isCurrentlyEnabled = enabledModelsForProvider.includes(modelId);
    const newEnabledState = !isCurrentlyEnabled;

    // Add to pending set for individual model feedback
    setPendingModels((prev) => new Set(prev).add(modelId));

    // Show immediate toast feedback
    toast.info(
      newEnabledState ? `enabling ${modelId}...` : `disabling ${modelId}...`
    );

    startTransition(async () => {
      try {
        const result = await toggleModel({
          provider: currentProviderId as
            | 'openai'
            | 'anthropic'
            | 'google'
            | 'openrouter',
          modelId,
          enabled: newEnabledState,
        });

        if (result.success) {
          // Show success toast
          toast.success(
            newEnabledState ? `${modelId} enabled` : `${modelId} disabled`
          );
          // Refresh to get the latest server data
          await Promise.all([refresh(), refreshModels()]);
        } else {
          toast.error(
            `failed to ${newEnabledState ? 'enable' : 'disable'} ${modelId}`
          );
        }
      } catch (_error) {
        toast.error(
          `failed to ${newEnabledState ? 'enable' : 'disable'} ${modelId}`
        );
      } finally {
        // Remove from pending set
        setPendingModels((prev) => {
          const newSet = new Set(prev);
          newSet.delete(modelId);
          return newSet;
        });
      }
    });
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onClose();
  };

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!currentProviderId || !currentProviderName) {
    return null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400]">
          <motion.div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={handleBackdropClick}
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.div
            className="-translate-x-1/2 -translate-y-1/2 fixed top-1/2 left-1/2 h-[600px] w-full max-w-2xl transform rounded-none"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-full flex-col overflow-hidden rounded-none border border-border/50 bg-background shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-background p-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground text-lg">
                    {currentProviderName} models
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {enabledCount}/{models.length} enabled
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-none transition-colors hover:bg-accent/50"
                >
                  <X
                    weight="duotone"
                    className="h-4 w-4 text-muted-foreground"
                  />
                </button>
              </div>

              {/* Fixed Search Bar */}
              <div className="sticky top-0 z-10 border-b bg-background p-4">
                <div className="relative">
                  <MagnifyingGlass className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-none pr-10 pl-10 text-foreground"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSearchQuery('')}
                        className="-translate-y-1/2 absolute top-1/2 right-3 transform text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X weight="duotone" className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Models list with fade gradients */}
              <RelativeScrollFadeContainer className="flex-1">
                <div className="p-4">
                  {filteredModels.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center bg-muted/40">
                        <Empty
                          weight="duotone"
                          className="h-6 w-6 text-muted-foreground"
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {searchQuery
                          ? 'no models found matching your search.'
                          : 'no models available.'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filteredModels.map((model) => {
                        const isEnabled = enabledModelsForProvider.includes(
                          model.id
                        );
                        const isPendingThis = pendingModels.has(model.id);

                        return (
                          <div
                            key={model.id}
                            className={cn(
                              'cursor-pointer rounded-none border border-border p-3 transition-colors hover:bg-accent/30',
                              isEnabled ? 'bg-accent/20' : 'bg-background',
                              isPendingThis ? 'opacity-60' : ''
                            )}
                            onClick={() => handleToggleModel(model.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  'flex h-4 w-4 items-center justify-center rounded-none border border-border transition-colors',
                                  isEnabled
                                    ? 'border-foreground bg-foreground'
                                    : 'bg-background'
                                )}
                              >
                                {isEnabled && (
                                  <div className="h-2 w-2 rounded-none bg-background" />
                                )}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="truncate font-medium text-foreground text-sm">
                                    {model.name || model.id}
                                  </h4>
                                </div>

                                <p className="mt-1 truncate text-muted-foreground text-xs">
                                  {model.id}
                                </p>

                                {model.description && (
                                  <p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
                                    {model.description}
                                  </p>
                                )}

                                {(model.context_length || model.pricing) && (
                                  <div className="mt-2 flex items-center gap-3 text-muted-foreground text-xs">
                                    {model.context_length && (
                                      <span>
                                        {model.context_length.toLocaleString()}{' '}
                                        tokens
                                      </span>
                                    )}
                                    {model.pricing?.input && (
                                      <span>
                                        ${model.pricing.input}/1M tokens
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </RelativeScrollFadeContainer>

              {/* Footer */}
              <div className="flex justify-end border-t bg-background p-4">
                <Button
                  onClick={onClose}
                  variant="default"
                  className="rounded-none"
                >
                  done
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
