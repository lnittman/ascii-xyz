'use client';

import { useState, useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedModelIdAtom } from '@/atoms/models';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { Label } from '@repo/design/components/ui/label';
import { Switch } from '@repo/design/components/ui/switch';
import { 
  Info,
  Key,
  Check,
  X,
  CaretRight,
  Eye,
  EyeSlash,
  CircleNotch
} from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@repo/backend/convex/_generated/api';
import { toast } from 'sonner';

// Available models configuration (should match backend)
const AVAILABLE_MODELS = [
  {
    id: 'openrouter/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    description: 'Best for creative ASCII art',
    recommended: true,
  },
  {
    id: 'openrouter/gpt-4o',
    name: 'GPT-4o',
    provider: 'openrouter',
    description: 'Latest multimodal model',
  },
  {
    id: 'openrouter/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openrouter',
    description: 'Fast with 128k context',
  },
  {
    id: 'openrouter/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'openrouter',
    description: 'Most capable Claude',
  },
  {
    id: 'openrouter/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    description: 'Fast and efficient',
  },
  {
    id: 'openrouter/gemini-pro',
    name: 'Gemini Pro',
    provider: 'openrouter',
    description: 'Google\'s advanced model',
  },
  {
    id: 'openrouter/llama-3.1-405b',
    name: 'Llama 3.1 405B',
    provider: 'openrouter',
    description: 'Open source powerhouse',
  },
  {
    id: 'openrouter/mixtral-8x22b',
    name: 'Mixtral 8x22B',
    provider: 'openrouter',
    description: 'Efficient MoE model',
  },
];

type ProviderStatus = 'idle' | 'verifying' | 'success' | 'error';

export default function ModelsSettingsPage() {
  const [selectedModelId, setSelectedModelId] = useAtom(selectedModelIdAtom);
  
  // Fetch user settings
  const settings = useQuery(api.functions.settings.get);
  const updateSettings = useMutation(api.functions.settings.update);
  const toggleModel = useMutation(api.functions.settings.toggleModel);
  const verifyApiKey = useMutation(api.functions.settings.verifyApiKey);
  
  // Local state for API keys (before saving)
  const [openrouterKey, setOpenrouterKey] = useState('');
  const [showOpenrouterKey, setShowOpenrouterKey] = useState(false);
  const [openrouterStatus, setOpenrouterStatus] = useState<ProviderStatus>('idle');
  
  // Initialize local state from settings
  useEffect(() => {
    if (settings) {
      setOpenrouterKey(settings.openrouterApiKey || '');
      if (settings.openrouterApiKey) {
        setOpenrouterStatus('success');
      }
    }
  }, [settings]);

  const handleSaveOpenRouterKey = async () => {
    if (!openrouterKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setOpenrouterStatus('verifying');
    
    try {
      // Verify the key
      await verifyApiKey({
        provider: 'openrouter',
        apiKey: openrouterKey
      });
      
      // Save to settings
      await updateSettings({
        openrouterApiKey: openrouterKey
      });
      
      setOpenrouterStatus('success');
      toast.success('API key saved successfully');
    } catch (error) {
      setOpenrouterStatus('error');
      toast.error('Failed to verify API key');
    }
  };

  const handleToggleModel = async (modelId: string, enabled: boolean) => {
    try {
      await toggleModel({
        provider: 'openrouter',
        modelId,
        enabled
      });
      toast.success(enabled ? 'Model enabled' : 'Model disabled');
    } catch (error) {
      toast.error('Failed to update model');
    }
  };

  const handleSelectDefaultModel = async (modelId: string) => {
    setSelectedModelId(modelId);
    try {
      await updateSettings({
        defaultModelId: modelId
      });
      toast.success('Default model updated');
    } catch (error) {
      toast.error('Failed to update default model');
    }
  };

  // Get enabled models from settings
  const enabledModels = settings?.enabledModels?.openrouter || [];
  const hasApiKey = !!settings?.openrouterApiKey;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-mono text-lg font-semibold uppercase tracking-wider">
          AI MODELS
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          CONFIGURE YOUR AI MODEL PREFERENCES AND API KEYS
        </p>
      </div>

      {/* OpenRouter API Key Configuration */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Key className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
            OPENROUTER API KEY
          </h3>
          {openrouterStatus === 'success' && (
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-green-600 dark:text-green-400">
                VERIFIED
              </span>
            </div>
          )}
        </div>

        <div className="rounded-md border border-border/50 p-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="openrouter-key"
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground"
              >
                API KEY
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="openrouter-key"
                    type={showOpenrouterKey ? 'text' : 'password'}
                    value={openrouterKey}
                    onChange={(e) => setOpenrouterKey(e.target.value)}
                    placeholder="sk-or-v1-..."
                    className="pr-10 font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowOpenrouterKey(!showOpenrouterKey)}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
                  >
                    {showOpenrouterKey ? (
                      <EyeSlash className="h-3 w-3" />
                    ) : (
                      <Eye className="h-3 w-3" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={handleSaveOpenRouterKey}
                  disabled={openrouterStatus === 'verifying' || !openrouterKey.trim()}
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  {openrouterStatus === 'verifying' ? (
                    <>
                      <CircleNotch className="mr-2 h-3 w-3 animate-spin" />
                      VERIFYING
                    </>
                  ) : (
                    'SAVE'
                  )}
                </Button>
              </div>
              <p className="flex items-start gap-2 font-mono text-[10px] text-muted-foreground">
                <Info className="mt-0.5 h-3 w-3" />
                <span>
                  GET YOUR API KEY FROM{' '}
                  <a
                    href="https://openrouter.ai/keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-foreground"
                  >
                    OPENROUTER.AI/KEYS
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-4">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          AVAILABLE MODELS
        </h3>
        
        {!hasApiKey && (
          <div className="rounded-md border border-yellow-500/20 bg-yellow-500/5 p-4">
            <p className="font-mono text-xs text-yellow-600 dark:text-yellow-400">
              ADD YOUR OPENROUTER API KEY TO ENABLE MODEL SELECTION
            </p>
          </div>
        )}

        <div className="space-y-2">
          {AVAILABLE_MODELS.map((model) => {
            const isEnabled = enabledModels.includes(model.id);
            const isDefault = selectedModelId === model.id || (!selectedModelId && model.recommended);
            
            return (
              <div
                key={model.id}
                className={cn(
                  'flex items-center justify-between rounded-md border p-4',
                  'transition-all duration-200',
                  isDefault
                    ? 'border-foreground bg-muted/50'
                    : 'border-border/50 hover:border-border',
                  !hasApiKey && 'opacity-50 pointer-events-none'
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Enable/Disable Switch */}
                  <div className="pt-0.5">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => handleToggleModel(model.id, checked)}
                      disabled={!hasApiKey}
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-medium">
                        {model.name}
                      </span>
                      {model.recommended && (
                        <span className="rounded-sm bg-green-500/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-green-600 dark:text-green-400">
                          RECOMMENDED
                        </span>
                      )}
                      {isDefault && (
                        <span className="rounded-sm bg-foreground/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider">
                          DEFAULT
                        </span>
                      )}
                    </div>
                    <p className="mt-1 font-mono text-xs text-muted-foreground">
                      {model.description}
                    </p>
                  </div>
                </div>

                {isEnabled && !isDefault && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectDefaultModel(model.id)}
                    className="font-mono text-[10px] uppercase tracking-wider"
                  >
                    SET DEFAULT
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Usage Information */}
      <div className="rounded-md border border-border/50 bg-muted/30 p-4">
        <div className="flex gap-3">
          <Info className="mt-1 h-4 w-4 text-muted-foreground" />
          <div className="space-y-2 font-mono text-xs text-muted-foreground">
            <p className="uppercase tracking-wider">USAGE INFORMATION</p>
            <ul className="space-y-1 text-[10px]">
              <li className="flex items-start gap-2">
                <CaretRight className="mt-0.5 h-3 w-3" />
                <span>ASCII-XYZ IS BYOK (BRING YOUR OWN KEY)</span>
              </li>
              <li className="flex items-start gap-2">
                <CaretRight className="mt-0.5 h-3 w-3" />
                <span>YOUR API KEY IS STORED SECURELY AND NEVER SHARED</span>
              </li>
              <li className="flex items-start gap-2">
                <CaretRight className="mt-0.5 h-3 w-3" />
                <span>ENABLE ONLY THE MODELS YOU WANT TO USE</span>
              </li>
              <li className="flex items-start gap-2">
                <CaretRight className="mt-0.5 h-3 w-3" />
                <span>EACH MODEL HAS DIFFERENT PRICING ON OPENROUTER</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}