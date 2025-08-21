'use client';

import {
  mobileProviderModelsModalOpenAtom,
  mobileProviderModelsModalStateAtom,
} from '@/atoms/mobile-menus';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { toast } from '@/components/shared/ui/custom-toast';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useModels } from '@/hooks/code/use-models';
import { useToggleModelEnabled } from '@/hooks/settings/mutations';
import { useAISettings } from '@/hooks/settings/use-ai-settings';
import {
  getEnabledModelsForProvider,
  toggleModelInProvider,
} from '@/utils/model-helpers';
import { ArrowLeft, Empty, MagnifyingGlass, X } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useMemo, useState, useTransition } from 'react';

export function MobileProviderModelsSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileProviderModelsModalOpenAtom);
  const [modalState] = useAtom(mobileProviderModelsModalStateAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [_isPending, startTransition] = useTransition();
  const [pendingModels, setPendingModels] = useState<Set<string>>(new Set());

  const { providers, refreshModels } = useModels();
  const { settings, refresh } = useAISettings();
  const { toggleModel } = useToggleModelEnabled();

  // Get the current provider's models
  const currentProvider = providers.find((p) => p.id === modalState.providerId);
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

  // Get enabled models for this provider using shared utility
  const enabledModelsForProvider = getEnabledModelsForProvider(
    settings?.enabledModels,
    modalState.providerId
  );

  const enabledCount = enabledModelsForProvider.length;

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleToggleModel = async (modelId: string) => {
    if (!modalState.providerId) {
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

    // Optimistic update - update local state immediately
    const optimisticData = toggleModelInProvider(
      settings?.enabledModels,
      modalState.providerId,
      modelId,
      newEnabledState
    );

    startTransition(async () => {
      try {
        // Optimistically update the cache first
        const optimisticSettings = settings
          ? { ...settings, enabledModels: optimisticData }
          : undefined;
        if (optimisticSettings) {
          await refresh(
            { success: true, data: optimisticSettings },
            { revalidate: false }
          );
        }

        // Then perform the actual update
        try {
          const result = await toggleModel({
            provider: modalState.providerId as
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
            await refresh();
          } else {
            toast.error(
              `failed to ${newEnabledState ? 'enable' : 'disable'} ${modelId}`
            );
            // Rollback by refreshing from server
            await refresh();
          }
        } catch (_error) {
          toast.error(
            `failed to ${newEnabledState ? 'enable' : 'disable'} ${modelId}`
          );
          // Rollback by refreshing from server
          await refresh();
        }

        // Refresh models to sync any server-side changes
        await refreshModels();
      } catch (_error) {
        toast.error(
          `error ${newEnabledState ? 'enabling' : 'disabling'} ${modelId}`
        );
        // Rollback by refreshing from server
        await refresh();
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

  const title = (
    <div className="flex items-center gap-3">
      <button
        onClick={handleClose}
        className="flex h-8 w-8 items-center justify-center rounded-none border border-border bg-muted/20 text-muted-foreground transition-all duration-200 hover:border-foreground/20 hover:bg-muted/40 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20"
        aria-label="Close"
      >
        <ArrowLeft className="h-4 w-4" weight="duotone" />
      </button>
      <div className="flex flex-col">
        <span>{modalState.providerName} models</span>
        <span className="font-normal text-muted-foreground text-xs">
          {enabledCount}/{models.length} enabled
        </span>
      </div>
    </div>
  );

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      contentHeight="full"
    >
      <div className="flex h-full flex-col">
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
          <div className="p-4 pb-20">
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
              <div className="space-y-3">
                {filteredModels.map((model) => {
                  const isEnabled = enabledModelsForProvider.includes(model.id);
                  const isPendingThis = pendingModels.has(model.id);

                  return (
                    <div
                      key={model.id}
                      className={cn(
                        'cursor-pointer rounded-none border border-border p-4 transition-colors',
                        isEnabled
                          ? 'border-accent bg-accent/20'
                          : 'bg-background hover:bg-accent/10',
                        isPendingThis ? 'opacity-60' : ''
                      )}
                      onClick={() => handleToggleModel(model.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            'mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-none border border-border transition-colors',
                            isEnabled
                              ? 'border-foreground bg-foreground'
                              : 'bg-background'
                          )}
                        >
                          {isEnabled && (
                            <div className="h-2.5 w-2.5 rounded-none bg-background" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-foreground text-sm">
                            {model.name || model.id}
                          </h4>

                          <p className="mt-1 text-muted-foreground text-xs">
                            {model.id}
                          </p>

                          {model.description && (
                            <p className="mt-2 line-clamp-3 text-muted-foreground text-xs">
                              {model.description}
                            </p>
                          )}

                          {(model.context_length || model.pricing) && (
                            <div className="mt-3 flex flex-col gap-1 text-muted-foreground text-xs">
                              {model.context_length && (
                                <span>
                                  context:{' '}
                                  {model.context_length.toLocaleString()} tokens
                                </span>
                              )}
                              {model.pricing?.input && (
                                <span>
                                  pricing: ${model.pricing.input}/1M tokens
                                  input
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
        <div className="absolute right-0 bottom-0 left-0 border-t bg-background p-4">
          <Button
            onClick={handleClose}
            variant="default"
            className="w-full rounded-none"
          >
            done
          </Button>
        </div>
      </div>
    </MobileSheet>
  );
}
