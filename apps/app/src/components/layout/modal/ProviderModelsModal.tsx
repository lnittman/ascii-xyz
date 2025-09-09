'use client';

import { MagnifyingGlass, X } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import { useEffect, useMemo, useState, useTransition } from 'react';

import { toast } from '@repo/design/components/ui/use-toast';
import { useModels } from '@/hooks/models/use-models';
import { useToggleModelEnabled } from '@/hooks/settings/mutations';
import { useAISettings } from '@/hooks/settings/use-ai-settings';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';
import { Switch } from '@repo/design/components/ui/switch';

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
  const { providers, refreshModels, isLoading } = useModels();
  const { settings, refresh } = useAISettings();
  const { toggleModel } = useToggleModelEnabled();

  // Use current provider info if available, otherwise use last valid for animation
  const currentProviderId = providerId || lastValidProviderId;
  const currentProviderName = providerName || lastValidProviderName;

  // Get the current provider's models
  const currentProvider = providers.find((p) => p.id === currentProviderId);
  const models = currentProvider?.models || [];

  // Keep track of the last valid provider info for animation purposes
  useEffect(() => {
    if (providerId && providerName) {
      setLastValidProviderId(providerId);
      setLastValidProviderName(providerName);
    }
  }, [providerId, providerName]);

  // Refresh models when modal opens if they're not loaded
  useEffect(() => {
    if (isOpen && currentProviderId && models.length === 0 && !isLoading) {
      refreshModels();
    }
  }, [isOpen, currentProviderId, models.length, isLoading, refreshModels]);

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
    toast({
      description: newEnabledState ? `Enabling ${modelId}...` : `Disabling ${modelId}...`,
    });

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
          toast({
            description: newEnabledState ? `${modelId} enabled` : `${modelId} disabled`,
          });
          // Refresh to get the latest server data
          await Promise.all([refresh(), refreshModels()]);
        } else {
          toast({
            description: `Failed to ${newEnabledState ? 'enable' : 'disable'} ${modelId}`,
            variant: 'destructive',
          });
        }
      } catch (_error) {
        toast({
          description: `Failed to ${newEnabledState ? 'enable' : 'disable'} ${modelId}`,
          variant: 'destructive',
        });
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
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl"
          >
            <div className="bg-background border border-border rounded-lg shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {currentProviderName} Models
                  </h2>
                  <span className="text-sm text-muted-foreground">
                    {enabledCount} of {models.length} enabled
                  </span>
                </div>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-border">
                <div className="relative">
                  <MagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Models List */}
              <div className="max-h-[400px] overflow-y-auto p-4">
                {isLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Loading models...
                  </div>
                ) : filteredModels.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery
                      ? `No models matching "${searchQuery}"`
                      : 'No models available'}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredModels.map((model) => {
                      const isEnabled = enabledModelsForProvider.includes(
                        model.id
                      );
                      const isPending = pendingModels.has(model.id);

                      return (
                        <div
                          key={model.id}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg border border-border',
                            'hover:bg-accent/5 transition-colors',
                            isPending && 'opacity-50'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {model.name || model.id}
                              </span>
                              {model.context_length && (
                                <span className="text-xs text-muted-foreground">
                                  {Math.floor(model.context_length / 1000)}k
                                </span>
                              )}
                            </div>
                            {model.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                                {model.description}
                              </p>
                            )}
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handleToggleModel(model.id)}
                            disabled={isPending}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-2 p-4 border-t border-border">
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}