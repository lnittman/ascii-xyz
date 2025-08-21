'use client';

import {
  Check,
  MagnifyingGlass,
  Star,
  Warning,
  X,
} from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { useEffect, useMemo, useState } from 'react';

import { enabledModelsByProviderAtom, toggleModelAtom } from '@/atoms/models';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { type AIModel, useModels } from '@/hooks/code/use-models';
import {
  useAISettings,
  useUpdateAISettings,
} from '@/hooks/settings/use-ai-settings';
import { normalizeEnabledModels } from '@/utils/model-helpers';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';

interface ModelsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ModelCardProps {
  model: AIModel;
  onToggle: (modelId: string, provider: string) => void;
  isDefault?: boolean;
  onSetDefault?: (modelId: string) => void;
}

// Define all possible providers - this should match your API providers
const ALL_PROVIDERS = [
  { id: 'openai', name: 'OpenAI' },
  { id: 'anthropic', name: 'Anthropic' },
  { id: 'google', name: 'Google' },
  { id: 'openrouter', name: 'OpenRouter' },
];

function ModelCard({
  model,
  onToggle,
  isDefault,
  onSetDefault,
}: ModelCardProps) {
  const formatContextLength = (length?: number) => {
    if (!length) {
      return 'Unknown';
    }
    if (length >= 1000000) {
      return `${(length / 1000000).toFixed(1)}M`;
    }
    if (length >= 1000) {
      return `${(length / 1000).toFixed(0)}K`;
    }
    return length.toString();
  };

  const formatPricing = (pricing?: { input: number; output: number }) => {
    if (!pricing) {
      return null;
    }
    return `$${pricing.input}/M in • $${pricing.output}/M out`;
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(model.id, model.provider);
  };

  const handleSetDefault = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (model.enabled && onSetDefault) {
      onSetDefault(model.id);
    }
  };

  return (
    <div
      className={cn(
        'group cursor-pointer rounded-none border border-border p-4 transition-all',
        'hover:border-accent/60 hover:shadow-sm',
        model.enabled
          ? 'border-primary/40 bg-primary/5 shadow-sm'
          : 'hover:bg-muted/30'
      )}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <h3 className="font-medium text-foreground transition-colors group-hover:text-foreground">
              {model.name}
            </h3>
            {isDefault && (
              <Star weight="duotone" className="h-4 w-4 text-orange-500" />
            )}
          </div>

          <div className="mb-2 flex items-center gap-4 text-muted-foreground text-xs">
            <span>Context: {formatContextLength(model.context_length)}</span>
            {model.pricing && <span>{formatPricing(model.pricing)}</span>}
          </div>

          {model.capabilities && model.capabilities.length > 0 && (
            <div className="mb-2 flex flex-wrap items-center gap-1">
              {model.capabilities.map((capability) => (
                <span
                  key={capability}
                  className="rounded-none bg-muted px-2 py-0.5 text-muted-foreground text-xs"
                >
                  {capability}
                </span>
              ))}
            </div>
          )}

          {model.enabled && onSetDefault && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={handleSetDefault}
                className={cn(
                  'rounded-none px-2 py-1 text-xs transition-colors',
                  isDefault
                    ? 'border border-orange-500/20 bg-orange-500/10 text-orange-500'
                    : 'border border-border bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                {isDefault ? 'default model' : 'set as default'}
              </button>
            </div>
          )}
        </div>

        <div className="ml-4 flex-shrink-0">
          <motion.div
            className={cn(
              'h-5 w-5 rounded-none border-2 border-current transition-colors',
              model.enabled
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-muted-foreground/40 group-hover:border-foreground/60'
            )}
            animate={model.enabled ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 0.2 }}
          >
            {model.enabled && (
              <Check weight="bold" className="h-full w-full p-0.5" />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export function ModelsModal({ isOpen, onClose }: ModelsModalProps) {
  const { providers, totalModels, refreshModels } = useModels();
  const { settings, refresh: refreshSettings } = useAISettings();
  const { updateAISettings } = useUpdateAISettings();

  // Helper functions for updating settings
  const updateEnabledModels = async (enabledModels: {
    openai: string[];
    anthropic: string[];
    google: string[];
    openrouter: string[];
  }) => {
    await updateAISettings({ enabledModels });
    await refreshSettings();
    return true;
  };

  const updateDefaultModel = async (defaultModelId: string | undefined) => {
    await updateAISettings({ defaultModelId });
    await refreshSettings();
  };
  const [enabledModelsByProvider, setEnabledModelsByProvider] = useAtom(
    enabledModelsByProviderAtom
  );
  const [, toggleModel] = useAtom(toggleModelAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('');

  // Calculate enabled count from jotai state
  const enabledCount = Object.values(enabledModelsByProvider).flat().length;

  // Debug logging
  useEffect(() => {
    if (isOpen) {
    }
  }, [
    isOpen,
    totalModels,
    enabledCount,
    providers.length,
    settings,
    enabledModelsByProvider,
  ]);

  // Sync jotai state with user settings on load, but avoid redundant updates
  useEffect(() => {
    if (settings?.enabledModels) {
      let validEnabledModels: {
        openai: string[];
        anthropic: string[];
        google: string[];
        openrouter: string[];
      };

      // Handle both old array format and new object format
      if (Array.isArray(settings.enabledModels)) {
        // Legacy format - convert to new format using shared utility
        validEnabledModels = normalizeEnabledModels(settings.enabledModels);
      } else if (typeof settings.enabledModels === 'object') {
        // New format - ensure all provider keys exist
        validEnabledModels = {
          openai: (settings.enabledModels as any).openai || [],
          anthropic: (settings.enabledModels as any).anthropic || [],
          google: (settings.enabledModels as any).google || [],
          openrouter: (settings.enabledModels as any).openrouter || [],
        };
      } else {
        // Fallback to empty structure
        validEnabledModels = {
          openai: [],
          anthropic: [],
          google: [],
          openrouter: [],
        };
      }

      // Only update if there is a real difference to avoid infinite re-renders
      const isDifferent =
        JSON.stringify(validEnabledModels) !==
        JSON.stringify(enabledModelsByProvider);
      if (isDifferent) {
        setEnabledModelsByProvider(validEnabledModels);
      }
    }
  }, [settings?.enabledModels, enabledModelsByProvider]);

  // Handle model toggle with persistence
  const handleModelToggle = async (modelId: string, provider: string) => {
    try {
      // Toggle in jotai state (immediate UI feedback)
      const newState = toggleModel({ modelId, provider });

      // Get updated enabled models
      const updatedEnabledModels = newState
        ? {
            ...enabledModelsByProvider,
            [provider]: [
              ...(enabledModelsByProvider[
                provider as keyof typeof enabledModelsByProvider
              ] || []),
              modelId,
            ],
          }
        : {
            ...enabledModelsByProvider,
            [provider]: (
              enabledModelsByProvider[
                provider as keyof typeof enabledModelsByProvider
              ] || []
            ).filter((id) => id !== modelId),
          };

      // Persist to database
      const success = await updateEnabledModels(updatedEnabledModels);

      if (success) {
        // Refresh the useModels hook to update ModelsTab UI
        refreshModels();
      } else {
        // Revert the toggle if database update fails
        toggleModel({ modelId, provider });
      }

      // If disabling the default model, clear the default
      if (!newState && settings?.defaultModelId === modelId) {
        await updateDefaultModel(undefined);
      }
    } catch (_error) {
      // Revert the toggle if there's an error
      toggleModel({ modelId, provider });
    }
  };

  // Handle setting default model
  const handleSetDefault = async (modelId: string) => {
    await updateDefaultModel(modelId);
  };

  // Check if provider has valid API key
  const hasValidApiKey = (providerId: string) => {
    if (!settings) {
      return false;
    }

    switch (providerId) {
      case 'openai':
        return !!settings.openaiApiKey;
      case 'anthropic':
        return !!settings.anthropicApiKey;
      case 'google':
        return !!settings.googleApiKey;
      case 'openrouter':
        return !!settings.openrouterApiKey;
      default:
        return false;
    }
  };

  // Create enriched providers list that includes all possible providers
  const enrichedProviders = useMemo(() => {
    return ALL_PROVIDERS.map((provider) => {
      const existingProvider = providers.find((p) => p.id === provider.id);
      const hasApiKey = hasValidApiKey(provider.id);

      // Add enabled status from jotai state
      const modelsWithEnabledStatus =
        existingProvider?.models.map((model) => ({
          ...model,
          enabled:
            enabledModelsByProvider[
              provider.id as keyof typeof enabledModelsByProvider
            ]?.includes(model.id) || false,
        })) || [];

      return {
        id: provider.id,
        name: provider.name,
        models: modelsWithEnabledStatus,
        available: existingProvider
          ? existingProvider.models.length > 0
          : false,
        hasApiKey,
      };
    });
  }, [providers, settings, enabledModelsByProvider]);

  // Auto-select the first available provider with API key
  useEffect(() => {
    if (isOpen && !activeTab) {
      const firstAvailableWithKey = enrichedProviders.find(
        (p) => p.available && p.hasApiKey
      );
      if (firstAvailableWithKey) {
        setActiveTab(firstAvailableWithKey.id);
      } else {
        // Fallback to first available provider even without API key
        const firstAvailable = enrichedProviders.find((p) => p.available);
        if (firstAvailable) {
          setActiveTab(firstAvailable.id);
        } else if (enrichedProviders.length > 0) {
          setActiveTab(enrichedProviders[0].id);
        }
      }
    }
  }, [isOpen, enrichedProviders, activeTab]);

  // Filter models by search query
  const filteredProviders = useMemo(() => {
    if (!searchQuery) {
      return enrichedProviders;
    }

    return enrichedProviders.map((provider) => ({
      ...provider,
      models: provider.models.filter(
        (model) =>
          model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          model.id.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }));
  }, [enrichedProviders, searchQuery]);

  // Get current provider data
  const currentProvider = filteredProviders.find((p) => p.id === activeTab);

  // Reset search when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Wrapper function to refresh models when modal closes
  const handleClose = () => {
    // Refresh both models and user settings to ensure ModelsTab UI is updated
    refreshModels();
    refreshSettings();
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50">
        {/* Backdrop with blur - consistent with other modals */}
        <motion.div
          className="fixed inset-0 bg-background/60 backdrop-blur-md"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            handleClose();
          }}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Modal content */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{
              duration: 0.2,
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className="flex h-[85vh] w-full max-w-4xl flex-col rounded-none border border-border bg-background shadow-xl"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-border border-b p-6">
              <div>
                <h2 className="font-semibold text-foreground text-lg">
                  model library
                </h2>
                <p className="text-muted-foreground text-sm">
                  {totalModels > 0
                    ? `${enabledCount} of ${totalModels} models enabled`
                    : 'configure your api keys to see available models'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="group flex h-8 w-8 items-center justify-center rounded-none text-muted-foreground transition-all duration-300 hover:bg-accent/60 hover:text-foreground/75 active:bg-accent active:text-foreground"
                aria-label="Close modal"
              >
                <X weight="duotone" className="h-5 w-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="border-border border-b p-6">
              <div className="relative">
                <MagnifyingGlass className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="search models..."
                  className="rounded-none pl-10 text-foreground placeholder:text-muted-foreground"
                  style={
                    {
                      colorScheme: 'dark light',
                    } as React.CSSProperties
                  }
                />
              </div>
            </div>

            {/* Provider Tabs */}
            <div className="flex overflow-x-auto border-border border-b">
              {enrichedProviders.map((provider) => (
                <button
                  key={provider.id}
                  onClick={() =>
                    provider.available &&
                    provider.hasApiKey &&
                    setActiveTab(provider.id)
                  }
                  disabled={!provider.available || !provider.hasApiKey}
                  className={cn(
                    'relative whitespace-nowrap px-6 py-3 font-medium text-sm transition-colors',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    activeTab === provider.id &&
                      provider.available &&
                      provider.hasApiKey
                      ? 'border-primary border-b-2 bg-primary/5 text-foreground'
                      : provider.available && provider.hasApiKey
                        ? 'text-muted-foreground hover:bg-muted/30 hover:text-foreground'
                        : 'text-muted-foreground'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>{provider.name}</span>
                    <span
                      className={cn(
                        'rounded-none px-2 py-0.5 text-xs',
                        provider.available && provider.hasApiKey
                          ? 'bg-muted text-muted-foreground'
                          : provider.hasApiKey
                            ? 'bg-orange-500/10 text-orange-500'
                            : 'bg-red-500/10 text-red-500'
                      )}
                    >
                      {provider.available && provider.hasApiKey
                        ? provider.models.length
                        : provider.hasApiKey
                          ? 'setup required'
                          : 'no api key'}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Content */}
            <RelativeScrollFadeContainer className="flex-1">
              <div className="p-6">
                {currentProvider ? (
                  currentProvider.available ? (
                    currentProvider.hasApiKey ? (
                      currentProvider.models.length > 0 ? (
                        <div
                          key={`${activeTab}-${searchQuery}`}
                          className="grid gap-4"
                        >
                          {currentProvider.models.map((model) => (
                            <ModelCard
                              key={model.id}
                              model={model}
                              onToggle={handleModelToggle}
                              isDefault={settings?.defaultModelId === model.id}
                              onSetDefault={handleSetDefault}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="flex min-h-[400px] items-center justify-center">
                          <div className="text-center">
                            <MagnifyingGlass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                            <p className="mb-2 text-muted-foreground">
                              no models found
                            </p>
                            <p className="text-muted-foreground text-sm">
                              try adjusting your search or select a different
                              provider
                            </p>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="flex min-h-[400px] items-center justify-center">
                        <div className="max-w-md text-center">
                          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-red-500/10">
                            <Warning
                              weight="duotone"
                              className="h-8 w-8 text-red-500"
                            />
                          </div>
                          <h3 className="mb-2 font-medium text-foreground">
                            api key required
                          </h3>
                          <p className="mb-4 text-muted-foreground text-sm">
                            add your {currentProvider.name} api key in the api
                            keys section to access models from this provider
                          </p>
                          <Button
                            onClick={handleClose}
                            variant="outline"
                            size="sm"
                            className="rounded-none"
                          >
                            configure api key
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="flex min-h-[400px] items-center justify-center">
                      <div className="max-w-md text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-none bg-orange-500/10">
                          <Warning
                            weight="duotone"
                            className="h-8 w-8 text-orange-500"
                          />
                        </div>
                        <h3 className="mb-2 font-medium text-foreground">
                          setup required
                        </h3>
                        <p className="mb-4 text-muted-foreground text-sm">
                          configure your {currentProvider.name} api key in
                          settings to access models from this provider
                        </p>
                        <Button
                          onClick={handleClose}
                          variant="outline"
                          size="sm"
                          className="rounded-none"
                        >
                          go to settings
                        </Button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="flex min-h-[400px] items-center justify-center">
                    <div className="text-center">
                      <MagnifyingGlass className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        select a provider to view models
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </RelativeScrollFadeContainer>

            {/* Footer */}
            <div className="flex items-center justify-between border-border border-t bg-muted/20 p-6">
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4" />
                  <span>click models to enable or disable them</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-orange-500" />
                  <span>set default model for new chats</span>
                </div>
              </div>
              <Button onClick={handleClose} className="rounded-none">
                done
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
