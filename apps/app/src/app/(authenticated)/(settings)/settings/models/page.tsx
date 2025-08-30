'use client';

import { useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useUserSettings } from '@/hooks/use-settings';
import { ModelSelectorModal } from '@/components/settings/ModelSelectorModal';
import { 
  selectedModelAtom,
  enabledModelsAtom,
  availableModelsAtom
} from '@/atoms/models';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design/components/ui/card';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Label } from '@repo/design/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@repo/design/components/ui/dialog';
import { Plus, Trash, Check, Brain, Sparkle, CaretRight, Key } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@repo/design/lib/utils';

export const dynamic = 'force-dynamic';

export default function ModelsSettingsPage() {
  const { settings, updateSettings, addApiKey, removeApiKey } = useUserSettings();
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', key: '', provider: 'OpenRouter' });
  
  const selectedModel = useAtomValue(selectedModelAtom);
  const enabledModels = useAtomValue(enabledModelsAtom);
  const availableModels = useAtomValue(availableModelsAtom);

  if (!settings) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-accent rounded w-32"></div>
          <div className="h-20 bg-accent rounded"></div>
        </div>
      </div>
    );
  }

  const handleAddApiKey = async () => {
    if (!newKey.name || !newKey.key) {
      toast.error('Please provide both name and API key');
      return;
    }

    try {
      await addApiKey(newKey);
      toast.success('API key added successfully');
      setNewKey({ name: '', key: '', provider: 'OpenRouter' });
      setIsAddingKey(false);
    } catch (error) {
      toast.error('Failed to add API key');
    }
  };

  const handleRemoveApiKey = async (name: string) => {
    try {
      await removeApiKey(name);
      toast.success('API key removed');
    } catch (error) {
      toast.error('Failed to remove API key');
    }
  };

  return (
    <>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-lg font-medium mb-2">AI Models</h1>
          <p className="text-sm text-muted-foreground">
            Configure AI models for ASCII art generation
          </p>
        </div>

        {/* Current Model */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Active Model
            </CardTitle>
            <CardDescription>
              The model currently used for ASCII generation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className="p-4 border rounded-xl bg-accent/20 cursor-pointer hover:bg-accent/30 transition-colors"
              onClick={() => setIsModelSelectorOpen(true)}
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkle className="w-4 h-4 text-primary" weight="fill" />
                    <span className="font-medium">{selectedModel?.name || 'GPT-4'}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {selectedModel?.description || 'Most capable GPT-4 model'}
                  </p>
                  {selectedModel?.pricing && (
                    <p className="text-xs text-muted-foreground">
                      ${selectedModel.pricing.input}/1M tokens input • ${selectedModel.pricing.output}/1M tokens output
                    </p>
                  )}
                </div>
                <CaretRight className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => setIsModelSelectorOpen(true)}
            >
              <Brain className="w-4 h-4 mr-2" />
              Change Model
            </Button>
          </CardContent>
        </Card>

        {/* Enabled Models Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enabled Models</CardTitle>
            <CardDescription>
              {enabledModels.length} models available for selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {enabledModels.map((model) => (
                <div
                  key={model.id}
                  className={cn(
                    "p-3 border rounded-lg flex items-center justify-between",
                    selectedModel?.id === model.id ? "border-primary bg-primary/5" : ""
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4 text-green-600" />
                    <div>
                      <div className="text-sm font-medium">{model.name}</div>
                      <div className="text-xs text-muted-foreground">{model.id}</div>
                    </div>
                  </div>
                  {selectedModel?.id === model.id && (
                    <span className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded-full">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>

            <Button 
              className="w-full mt-4" 
              variant="outline"
              onClick={() => setIsModelSelectorOpen(true)}
            >
              Manage Models
            </Button>
          </CardContent>
        </Card>

        {/* API Keys Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Key className="w-4 h-4" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage your OpenRouter API keys
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                Add your OpenRouter API key to use AI models
              </p>
              <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
                <Button size="sm" variant="outline" onClick={() => setIsAddingKey(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Key
                </Button>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add API Key</DialogTitle>
                    <DialogDescription>
                      Add your OpenRouter API key for ASCII generation
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">Key Name</Label>
                      <Input
                        id="key-name"
                        placeholder="e.g., My OpenRouter Key"
                        value={newKey.name}
                        onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="api-key">API Key</Label>
                      <Input
                        id="api-key"
                        type="password"
                        placeholder="sk-or-v1-..."
                        value={newKey.key}
                        onChange={(e) => setNewKey({ ...newKey, key: e.target.value })}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddingKey(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddApiKey}>
                      Add Key
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {settings.apiKeys && settings.apiKeys.length > 0 ? (
              <div className="space-y-2">
                {settings.apiKeys.map((key: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-accent rounded">
                        <Check className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{key.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {key.provider} • {key.key.substring(0, 12)}...
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveApiKey(key.name)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed rounded-lg text-center">
                <Key className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  No API keys configured yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Add an OpenRouter API key to start generating ASCII art
                </p>
              </div>
            )}

            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Get your OpenRouter API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline font-medium"
                >
                  openrouter.ai/keys
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Models Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Available Models</CardTitle>
            <CardDescription>
              All models accessible through OpenRouter
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {availableModels.length} models available from top providers
            </p>
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => setIsModelSelectorOpen(true)}
            >
              Browse All Models
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Model Selector Modal */}
      <ModelSelectorModal 
        isOpen={isModelSelectorOpen}
        onClose={() => setIsModelSelectorOpen(false)}
      />
    </>
  );
}