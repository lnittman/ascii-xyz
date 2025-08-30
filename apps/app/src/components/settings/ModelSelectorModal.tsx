'use client';

import { MagnifyingGlass, X, CheckCircle, Circle } from '@phosphor-icons/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';

import {
  availableModelsAtom,
  enabledModelsByProviderAtom,
  selectedModelIdAtom,
  toggleModelAtom,
  type AIModel,
} from '@/atoms/models';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';
import { ScrollArea } from '@repo/design/components/ui/scroll-area';

interface ModelSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModelSelectorModal({ isOpen, onClose }: ModelSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const availableModels = useAtomValue(availableModelsAtom);
  const [enabledModels] = useAtom(enabledModelsByProviderAtom);
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  const toggleModel = useSetAtom(toggleModelAtom);

  // Filter models based on search query
  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableModels;
    }

    const query = searchQuery.toLowerCase();
    return availableModels.filter(
      (model) =>
        model.id.toLowerCase().includes(query) ||
        model.name.toLowerCase().includes(query) ||
        model.description?.toLowerCase().includes(query)
    );
  }, [availableModels, searchQuery]);

  const enabledCount = enabledModels.openrouter?.length || 0;

  const handleToggleModel = (model: AIModel) => {
    const isEnabled = enabledModels.openrouter?.includes(model.id) || false;
    
    // Don't allow disabling the selected model
    if (isEnabled && selectedModelId === model.id) {
      toast.error('Cannot disable the currently selected model');
      return;
    }

    toggleModel(model.id);
    toast.success(
      isEnabled ? `${model.name} disabled` : `${model.name} enabled`
    );
  };

  const handleSelectModel = (model: AIModel) => {
    const isEnabled = enabledModels.openrouter?.includes(model.id) || false;
    
    if (!isEnabled) {
      // Enable the model first
      toggleModel(model.id);
      toast.success(`${model.name} enabled`);
    }
    
    setSelectedModelId(model.id);
    toast.success(`${model.name} selected as default`);
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
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
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl transform"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
              {/* Header */}
              <div className="flex items-center justify-between border-b bg-background px-6 py-4">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium text-foreground text-lg">
                    AI Models
                  </h3>
                  <span className="text-muted-foreground text-sm">
                    {enabledCount} enabled
                  </span>
                </div>

                <button
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent/50"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="sticky top-0 z-10 border-b bg-background px-6 py-4">
                <div className="relative">
                  <MagnifyingGlass className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search models..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  <AnimatePresence>
                    {searchQuery && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={() => setSearchQuery('')}
                        className="absolute top-1/2 right-3 -translate-y-1/2 transform text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Models list */}
              <ScrollArea className="flex-1 px-6 py-4">
                {filteredModels.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-muted-foreground text-sm">
                      {searchQuery
                        ? 'No models found matching your search.'
                        : 'No models available.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredModels.map((model) => {
                      const isEnabled = enabledModels.openrouter?.includes(model.id) || false;
                      const isSelected = selectedModelId === model.id;

                      return (
                        <div
                          key={model.id}
                          className={cn(
                            'rounded-xl border border-border p-4 transition-all',
                            isSelected
                              ? 'border-primary bg-primary/5'
                              : isEnabled
                              ? 'bg-accent/20 hover:bg-accent/30'
                              : 'bg-background hover:bg-accent/10'
                          )}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-foreground text-sm">
                                  {model.name}
                                </h4>
                                {isSelected && (
                                  <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-muted-foreground text-xs">
                                {model.id}
                              </p>

                              {model.description && (
                                <p className="mt-2 text-muted-foreground text-sm">
                                  {model.description}
                                </p>
                              )}

                              {(model.context_length || model.pricing) && (
                                <div className="mt-3 flex items-center gap-4 text-muted-foreground text-xs">
                                  {model.context_length && (
                                    <span>
                                      {model.context_length.toLocaleString()} tokens
                                    </span>
                                  )}
                                  {model.pricing?.input && (
                                    <span>
                                      ${model.pricing.input}/1M in • ${model.pricing.output}/1M out
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant={isSelected ? 'default' : 'outline'}
                                onClick={() => handleSelectModel(model)}
                                className="text-xs"
                              >
                                {isSelected ? 'Selected' : 'Select'}
                              </Button>
                              
                              <button
                                onClick={() => handleToggleModel(model)}
                                className={cn(
                                  'flex h-8 w-8 items-center justify-center rounded-lg transition-colors',
                                  isEnabled
                                    ? 'text-primary hover:bg-primary/10'
                                    : 'text-muted-foreground hover:bg-accent'
                                )}
                                disabled={isSelected && isEnabled}
                              >
                                {isEnabled ? (
                                  <CheckCircle weight="fill" className="h-5 w-5" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {/* Footer */}
              <div className="flex justify-end border-t bg-background px-6 py-4">
                <Button onClick={onClose} variant="default">
                  Done
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}