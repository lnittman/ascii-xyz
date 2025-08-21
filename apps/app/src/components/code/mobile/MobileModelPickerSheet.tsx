'use client';

import {
  mobileModelPickerHandlersAtom,
  mobileModelPickerOpenAtom,
} from '@/atoms/mobile-menus';
import { selectedModelIdAtom } from '@/atoms/models';
import { RelativeScrollFadeContainer } from '@/components/shared/relative-scroll-fade-container';
import { MobileSheet } from '@/components/shared/ui/mobile-sheet';
import { useModels } from '@/hooks/code/use-models';
import { Check, Empty, Gear, MagnifyingGlass, X } from '@phosphor-icons/react';
import { Input } from '@repo/design/components/ui/input';
import { AnimatePresence, motion } from 'framer-motion';
import Fuse from 'fuse.js';
import { useAtom } from 'jotai';
import { useTransitionRouter } from 'next-view-transitions';
import type React from 'react';
import { useMemo, useState } from 'react';

const MenuItem = ({
  children,
  onClick,
  isSelected = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  isSelected?: boolean;
}) => (
  <div className="px-3 py-1">
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-none px-3 py-3 text-left text-foreground text-sm transition-colors hover:bg-accent"
    >
      <div className="flex-1">{children}</div>
      {isSelected && (
        <Check
          weight="duotone"
          className="h-5 w-5 flex-shrink-0 text-green-500"
        />
      )}
    </button>
  </div>
);

export function MobileModelPickerSheet() {
  const [isOpen, setIsOpen] = useAtom(mobileModelPickerOpenAtom);
  const [handlers] = useAtom(mobileModelPickerHandlersAtom);
  const [globalSelectedModelId, setGlobalSelectedModelId] =
    useAtom(selectedModelIdAtom);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useTransitionRouter();
  const { enabledModels, hasEnabledModels } = useModels();

  // Use global atom value if no handler selectedModelId is provided
  const activeSelectedModelId =
    handlers.selectedModelId ?? globalSelectedModelId;

  const handleClose = () => {
    setIsOpen(false);
    setSearchQuery('');
  };

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

  const handleModelSelect = (modelId: string) => {
    // Update the global atom
    setGlobalSelectedModelId(modelId);
    // Also call the optional handler callback for backward compatibility
    handlers.onModelChange?.(modelId);
    handleClose();
  };

  const handleOpenModelSettings = () => {
    handleClose();
    router.push('/settings/models');
  };

  return (
    <MobileSheet
      isOpen={isOpen}
      onClose={handleClose}
      title="select model"
      contentHeight="fill"
      position="bottom"
    >
      <div className="flex h-full flex-col">
        {/* Search Input */}
        <div className="flex-shrink-0 border-border/50 border-b p-6">
          <div className="relative">
            <MagnifyingGlass
              weight="duotone"
              className="-translate-y-1/2 absolute top-1/2 left-3 h-4 w-4 transform text-muted-foreground"
            />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search..."
              className="h-10 rounded-none pr-10 pl-10 text-foreground text-sm placeholder:text-muted-foreground"
            />
            <AnimatePresence>
              {searchQuery && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setSearchQuery('')}
                  className="-translate-y-1/2 absolute top-1/2 right-3 flex h-4 w-4 transform items-center justify-center rounded-none transition-colors hover:bg-accent/50"
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

        {/* Models List with fade gradients */}
        <RelativeScrollFadeContainer
          className="flex-1"
          contentClassName="flex flex-col"
        >
          {hasEnabledModels && Object.keys(modelsByProvider).length > 0 ? (
            <div>
              {Object.entries(modelsByProvider).map(([provider, models]) => (
                <div key={provider}>
                  {/* Sticky Provider Header */}
                  <div className="sticky top-0 z-10 mb-1 flex h-8 items-center border-border/30 border-b bg-background/95 px-6 backdrop-blur-sm">
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
                    <MenuItem
                      key={model.id}
                      onClick={() => handleModelSelect(model.id)}
                      isSelected={model.id === activeSelectedModelId}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {model.id}
                        </span>
                      </div>
                    </MenuItem>
                  ))}
                </div>
              ))}
            </div>
          ) : hasEnabledModels && searchQuery ? (
            <div className="flex flex-1 flex-col items-center justify-center">
              <motion.div
                className="flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.3 } }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                  <Empty
                    weight="duotone"
                    className="h-6 w-6 text-muted-foreground"
                  />
                </div>
                <p className="mb-2 text-muted-foreground text-sm">
                  No models found
                </p>
                <p className="text-muted-foreground text-xs">
                  Try a different search term
                </p>
              </motion.div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center">
              <motion.div
                className="flex flex-col items-center justify-center text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ opacity: { duration: 0.3 } }}
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-none bg-muted/40">
                  <Empty
                    weight="duotone"
                    className="h-6 w-6 text-muted-foreground"
                  />
                </div>
                <p className="text-muted-foreground text-sm">
                  {hasEnabledModels ? '' : 'No models configured'}
                </p>
              </motion.div>
            </div>
          )}
        </RelativeScrollFadeContainer>

        {/* Settings Button */}
        <div className="flex-shrink-0 border-border/50 border-t py-2">
          <MenuItem onClick={handleOpenModelSettings}>
            <div className="flex items-center gap-3">
              <Gear className="h-5 w-5 flex-shrink-0" />
              <span>
                {hasEnabledModels ? 'manage models' : 'configure models'}
              </span>
            </div>
          </MenuItem>
        </div>
      </div>
    </MobileSheet>
  );
}
