'use client';

import { useState } from 'react';
import { useUserSettings } from '@/hooks/use-settings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/design/components/ui/card';
import { Label } from '@repo/design/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/design/components/ui/select';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@repo/design/components/ui/dialog';
import { Plus, Trash, Check, Info } from '@phosphor-icons/react';
import { toast } from 'sonner';

// Import available models from backend
const AVAILABLE_MODELS = {
  'openrouter/gpt-4': {
    provider: 'OpenRouter',
    model: 'openai/gpt-4',
    name: 'GPT-4',
    description: 'Most capable GPT-4 model'
  },
  'openrouter/gpt-4-turbo': {
    provider: 'OpenRouter',
    model: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    description: 'Fast GPT-4 with 128k context'
  },
  'openrouter/gpt-4o': {
    provider: 'OpenRouter',
    model: 'openai/gpt-4o',
    name: 'GPT-4o',
    description: 'Latest multimodal GPT-4'
  },
  'openrouter/gpt-4o-mini': {
    provider: 'OpenRouter',
    model: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    description: 'Small, fast GPT-4o model'
  },
  'openrouter/claude-3.5-sonnet': {
    provider: 'OpenRouter',
    model: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    description: 'Best for creative tasks'
  },
  'openrouter/claude-3-opus': {
    provider: 'OpenRouter',
    model: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    description: 'Most capable Claude model'
  },
  'openrouter/claude-3-haiku': {
    provider: 'OpenRouter',
    model: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    description: 'Fast, affordable Claude'
  },
  'openrouter/gemini-pro': {
    provider: 'OpenRouter',
    model: 'google/gemini-pro',
    name: 'Gemini Pro',
    description: 'Google\'s advanced model'
  },
  'openrouter/llama-3.1-405b': {
    provider: 'OpenRouter',
    model: 'meta-llama/llama-3.1-405b-instruct',
    name: 'Llama 3.1 405B',
    description: 'Open source powerhouse'
  },
  'openrouter/mixtral-8x22b': {
    provider: 'OpenRouter',
    model: 'mistralai/mixtral-8x22b-instruct',
    name: 'Mixtral 8x22B',
    description: 'Efficient MoE model'
  },
};

export const dynamic = 'force-dynamic';

export default function ModelsSettingsPage() {
  const { settings, updateSettings, addApiKey, removeApiKey } = useUserSettings();
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [newKey, setNewKey] = useState({ name: '', key: '', provider: 'OpenRouter' });

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
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-lg font-medium mb-2">Model Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure AI models and API keys for ASCII art generation.
        </p>
      </div>

      {/* Default Model Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Default Model</CardTitle>
          <CardDescription>
            Choose your preferred AI model for ASCII generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select 
              value={settings.preferredModel || 'openrouter/gpt-4'} 
              onValueChange={(value) => updateSettings({ preferredModel: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AVAILABLE_MODELS).map(([key, model]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">({model.provider})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {settings.preferredModel && AVAILABLE_MODELS[settings.preferredModel as keyof typeof AVAILABLE_MODELS] && (
            <div className="p-3 bg-accent/50 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {AVAILABLE_MODELS[settings.preferredModel as keyof typeof AVAILABLE_MODELS].name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {AVAILABLE_MODELS[settings.preferredModel as keyof typeof AVAILABLE_MODELS].description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* API Keys Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">API Keys</CardTitle>
          <CardDescription>
            Manage your API keys for different providers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Add your OpenRouter API key to use AI models
            </p>
            <Dialog open={isAddingKey} onOpenChange={setIsAddingKey}>
              <DialogTrigger asChild>
                <Button size="sm" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add API Key</DialogTitle>
                  <DialogDescription>
                    Add your API key to use AI models for ASCII generation
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
                  <div className="space-y-2">
                    <Label htmlFor="provider">Provider</Label>
                    <Select
                      value={newKey.provider}
                      onValueChange={(value) => setNewKey({ ...newKey, provider: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OpenRouter">OpenRouter</SelectItem>
                        <SelectItem value="OpenAI" disabled>OpenAI (Coming Soon)</SelectItem>
                        <SelectItem value="Anthropic" disabled>Anthropic (Coming Soon)</SelectItem>
                      </SelectContent>
                    </Select>
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

      {/* Model Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Available Models</CardTitle>
          <CardDescription>
            Compare different AI models for ASCII generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(AVAILABLE_MODELS).map(([key, model]) => (
              <div 
                key={key} 
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  settings.preferredModel === key 
                    ? 'border-primary bg-primary/5' 
                    : 'hover:bg-accent/50'
                }`}
                onClick={() => updateSettings({ preferredModel: key })}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{model.name}</span>
                      {settings.preferredModel === key && (
                        <span className="text-xs px-2 py-0.5 bg-primary text-primary-foreground rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{model.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{model.provider}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}