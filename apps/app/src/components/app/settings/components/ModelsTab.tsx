'use client';

import {
  ArrowClockwise,
  CaretRight,
  Eye,
  EyeSlash,
} from '@phosphor-icons/react';
import { useAtom } from 'jotai';
import { useEffect, useState } from 'react';

import {
  mobileProviderModelsModalOpenAtom,
  mobileProviderModelsModalStateAtom,
} from '@/atoms/mobile-menus';
import { useModels } from '@/hooks/code/use-models';
import {
  useAISettings,
  useUpdateAISettings,
} from '@/hooks/settings/use-ai-settings';
// Server action will be imported dynamically to avoid SSR issues
import { useModals } from '@/hooks/use-modals';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { useIsMobile } from '@repo/design/hooks/use-is-mobile';
import { cn } from '@repo/design/lib/utils';

interface ProviderRowProps {
  providerId: string;
  providerName: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onVerify: () => void;
  isVerifying: boolean;
  verificationStatus: 'idle' | 'success' | 'error';
  enabledCount: number;
  totalModels: number;
  hasModelsLoaded: boolean;
  isLoading: boolean;
  onOpenModels: () => void;
}

function ProviderRow({
  providerId,
  providerName,
  label,
  placeholder,
  value,
  onChange,
  onVerify,
  isVerifying,
  verificationStatus,
  enabledCount,
  totalModels,
  hasModelsLoaded,
  isLoading,
  onOpenModels,
}: ProviderRowProps) {
  const [showKey, setShowKey] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  const getStatusIndicatorColor = () => {
    if (isVerifying) {
      return 'bg-muted-foreground'; // Grey while verifying
    }
    switch (verificationStatus) {
      case 'success':
        return 'bg-green-500'; // Green when verified
      case 'error':
        return 'bg-red-500/70'; // Subtle red when invalid
      default:
        return 'bg-red-500/70'; // Subtle red by default (no key)
    }
  };

  const canOpenModels = verificationStatus === 'success' && hasModelsLoaded;

  return (
    <div className="space-y-3 rounded-none border border-border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Status indicator */}
          <div
            className={cn(
              'h-2 w-2 rounded-none transition-all duration-300',
              getStatusIndicatorColor()
            )}
          />
          <label className="font-medium text-foreground text-sm">
            {providerName}
          </label>
        </div>
        <div className="flex items-center gap-3">
          {/* Reserve space for models button to prevent layout shift */}
          <div className="flex h-7 min-w-[90px] items-center justify-end">
            <Button
              onClick={onOpenModels}
              disabled={!canOpenModels}
              variant="ghost"
              size="sm"
              className={cn(
                'flex h-7 items-center gap-1 rounded-none px-1 text-xs transition-all duration-300',
                verificationStatus === 'success'
                  ? 'translate-x-0 opacity-100'
                  : 'pointer-events-none translate-x-2 opacity-0',
                verificationStatus === 'success' &&
                  !canOpenModels &&
                  'cursor-not-allowed opacity-50',
                verificationStatus === 'success' &&
                  canOpenModels &&
                  'cursor-pointer hover:bg-accent/20'
              )}
            >
              {hasModelsLoaded ? (
                <>
                  <span>
                    {enabledCount}/{totalModels}
                  </span>
                  <CaretRight weight="duotone" className="h-3 w-3" />
                </>
              ) : isLoading ? (
                <>
                  <span>loading...</span>
                  <div className="h-3 w-2" />
                </>
              ) : (
                <>
                  <span>n/a</span>
                  <div className="h-3 w-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            type={showKey ? 'text' : 'password'}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="h-9 rounded-none text-foreground placeholder:text-muted-foreground"
            style={
              {
                colorScheme: 'dark light',
              } as React.CSSProperties
            }
          />
        </div>

        <Button
          type="button"
          onClick={() => setShowKey(!showKey)}
          variant="outline"
          size="sm"
          className="flex h-9 w-9 items-center justify-center rounded-none p-0"
        >
          <div className="relative h-4 w-4">
            <EyeSlash
              weight="duotone"
              className={cn(
                'absolute top-0 left-0 h-4 w-4 transition-opacity duration-200',
                showKey ? 'opacity-100' : 'opacity-0'
              )}
            />
            <Eye
              weight="duotone"
              className={cn(
                'absolute top-0 left-0 h-4 w-4 transition-opacity duration-200',
                showKey ? 'opacity-0' : 'opacity-100'
              )}
            />
          </div>
        </Button>

        <Button
          onClick={onVerify}
          disabled={!value.trim() || isVerifying}
          variant="outline"
          size="sm"
          className="h-9 min-w-[80px] rounded-none"
        >
          {isVerifying ? (
            <ArrowClockwise className="h-4 w-4 animate-spin" />
          ) : (
            'verify'
          )}
        </Button>
      </div>
    </div>
  );
}

import type { AISettings } from '@repo/database/types';

interface ModelsTabProps {
  initialSettings?: AISettings;
}

export function ModelsTab({ initialSettings }: ModelsTabProps) {
  const { isMobile } = useIsMobile();
  const { providers, isLoading, error, refreshModels } = useModels();

  const {
    settings,
    isLoading: settingsLoading,
    refresh: refreshSettings,
  } = useAISettings(initialSettings);

  const { updateAISettings, isUpdating } = useUpdateAISettings();

  const { openProviderModelsModal } = useModals();
  const [, _setMobileProviderModelsModalOpen] = useAtom(
    mobileProviderModelsModalOpenAtom
  );
  const [, _setMobileProviderModelsModalState] = useAtom(
    mobileProviderModelsModalStateAtom
  );

  // API key states - initialize from settings or empty strings
  const [openaiKey, setOpenaiKey] = useState(settings?.openaiApiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(
    settings?.anthropicApiKey || ''
  );
  const [googleKey, setGoogleKey] = useState(settings?.googleApiKey || '');
  const [openrouterKey, setOpenrouterKey] = useState(
    settings?.openrouterApiKey || ''
  );

  // Verification states
  const [openaiVerifying, setOpenaiVerifying] = useState(false);
  const [anthropicVerifying, setAnthropicVerifying] = useState(false);
  const [googleVerifying, setGoogleVerifying] = useState(false);
  const [openrouterVerifying, setOpenrouterVerifying] = useState(false);

  const [openaiStatus, setOpenaiStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [anthropicStatus, setAnthropicStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [googleStatus, setGoogleStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');
  const [openrouterStatus, setOpenrouterStatus] = useState<
    'idle' | 'success' | 'error'
  >('idle');

  // Load verification states from localStorage on mount
  useEffect(() => {
    const loadVerificationStatus = (provider: string) => {
      const stored = localStorage.getItem(`api-key-status-${provider}`);
      return stored === 'success' ? 'success' : 'idle';
    };

    setOpenaiStatus(
      loadVerificationStatus('openai') as 'idle' | 'success' | 'error'
    );
    setAnthropicStatus(
      loadVerificationStatus('anthropic') as 'idle' | 'success' | 'error'
    );
    setGoogleStatus(
      loadVerificationStatus('google') as 'idle' | 'success' | 'error'
    );
    setOpenrouterStatus(
      loadVerificationStatus('openrouter') as 'idle' | 'success' | 'error'
    );
  }, []);

  // Check verification status based on API keys and trigger model refresh
  useEffect(() => {
    if (settings) {
      let shouldRefreshModels = false;

      // If we have an API key and no stored status, auto-mark as success
      if (settings.openaiApiKey && openaiStatus === 'idle') {
        setOpenaiStatus('success');
        localStorage.setItem('api-key-status-openai', 'success');
        shouldRefreshModels = true;
      }
      if (settings.anthropicApiKey && anthropicStatus === 'idle') {
        setAnthropicStatus('success');
        localStorage.setItem('api-key-status-anthropic', 'success');
        shouldRefreshModels = true;
      }
      if (settings.googleApiKey && googleStatus === 'idle') {
        setGoogleStatus('success');
        localStorage.setItem('api-key-status-google', 'success');
        shouldRefreshModels = true;
      }
      if (settings.openrouterApiKey && openrouterStatus === 'idle') {
        setOpenrouterStatus('success');
        localStorage.setItem('api-key-status-openrouter', 'success');
        shouldRefreshModels = true;
      }

      // Clear status if API key is removed
      if (!settings.openaiApiKey && openaiStatus === 'success') {
        setOpenaiStatus('idle');
        localStorage.removeItem('api-key-status-openai');
      }
      if (!settings.anthropicApiKey && anthropicStatus === 'success') {
        setAnthropicStatus('idle');
        localStorage.removeItem('api-key-status-anthropic');
      }
      if (!settings.googleApiKey && googleStatus === 'success') {
        setGoogleStatus('idle');
        localStorage.removeItem('api-key-status-google');
      }
      if (!settings.openrouterApiKey && openrouterStatus === 'success') {
        setOpenrouterStatus('idle');
        localStorage.removeItem('api-key-status-openrouter');
      }

      // Refresh models if we detected new API keys
      if (shouldRefreshModels) {
        refreshModels();
      }
    }
  }, [
    settings?.openaiApiKey,
    settings?.anthropicApiKey,
    settings?.googleApiKey,
    settings?.openrouterApiKey,
    openaiStatus,
    anthropicStatus,
    googleStatus,
    openrouterStatus,
  ]);

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setOpenaiKey(settings.openaiApiKey || '');
      setAnthropicKey(settings.anthropicApiKey || '');
      setGoogleKey(settings.googleApiKey || '');
      setOpenrouterKey(settings.openrouterApiKey || '');
    }
  }, [
    settings?.openaiApiKey,
    settings?.anthropicApiKey,
    settings?.googleApiKey,
    settings?.openrouterApiKey,
    settingsLoading,
  ]);

  // Helper functions for updating API keys
  const updateApiKey = async (provider: string, apiKey: string) => {
    const updateData: any = {};
    if (provider === 'openai') {
      updateData.openaiApiKey = apiKey;
    }
    if (provider === 'anthropic') {
      updateData.anthropicApiKey = apiKey;
    }
    if (provider === 'google') {
      updateData.googleApiKey = apiKey;
    }
    if (provider === 'openrouter') {
      updateData.openrouterApiKey = apiKey;
    }

    await updateAISettings(updateData);
    await refreshSettings();
  };

  const _updateDefaultModel = async (defaultModelId: string | undefined) => {
    await updateAISettings({ defaultModelId });
    await refreshSettings();
  };

  const verifyApiKey = async (provider: string, apiKey: string) => {
    try {
      // Dynamically import server action to avoid SSR issues
      const { verifyApiKey: verify } = await import('@/utils/verify-api-key');
      return await verify(provider, apiKey);
    } catch (_error) {
      return false;
    }
  };

  const handleVerifyOpenAI = async () => {
    setOpenaiVerifying(true);
    setOpenaiStatus('idle');

    const isValid = await verifyApiKey('openai', openaiKey);
    const status = isValid ? 'success' : 'error';
    setOpenaiStatus(status);

    if (isValid) {
      await updateApiKey('openai', openaiKey);
      localStorage.setItem('api-key-status-openai', 'success');
      refreshModels();
    } else {
      localStorage.removeItem('api-key-status-openai');
    }

    setOpenaiVerifying(false);
  };

  const handleVerifyAnthropic = async () => {
    setAnthropicVerifying(true);
    setAnthropicStatus('idle');

    const isValid = await verifyApiKey('anthropic', anthropicKey);
    const status = isValid ? 'success' : 'error';
    setAnthropicStatus(status);

    if (isValid) {
      await updateApiKey('anthropic', anthropicKey);
      localStorage.setItem('api-key-status-anthropic', 'success');
      refreshModels();
    } else {
      localStorage.removeItem('api-key-status-anthropic');
    }

    setAnthropicVerifying(false);
  };

  const handleVerifyGoogle = async () => {
    setGoogleVerifying(true);
    setGoogleStatus('idle');

    const isValid = await verifyApiKey('google', googleKey);
    const status = isValid ? 'success' : 'error';
    setGoogleStatus(status);

    if (isValid) {
      await updateApiKey('google', googleKey);
      localStorage.setItem('api-key-status-google', 'success');
      refreshModels();
    } else {
      localStorage.removeItem('api-key-status-google');
    }

    setGoogleVerifying(false);
  };

  const handleVerifyOpenRouter = async () => {
    setOpenrouterVerifying(true);
    setOpenrouterStatus('idle');

    const isValid = await verifyApiKey('openrouter', openrouterKey);
    const status = isValid ? 'success' : 'error';
    setOpenrouterStatus(status);

    if (isValid) {
      await updateApiKey('openrouter', openrouterKey);
      localStorage.setItem('api-key-status-openrouter', 'success');
      refreshModels();
    } else {
      localStorage.removeItem('api-key-status-openrouter');
    }

    setOpenrouterVerifying(false);
  };

  const handleOpenModels = (providerId: string, providerName: string) => {
    openProviderModelsModal(providerId, providerName);
  };

  // Create provider configurations
  const providerConfigs = [
    {
      id: 'openai',
      name: 'OpenAI',
      label: 'OpenAI API Key',
      placeholder: 'sk-...',
      value: openaiKey,
      onChange: setOpenaiKey,
      onVerify: handleVerifyOpenAI,
      isVerifying: openaiVerifying,
      verificationStatus: openaiStatus,
    },
    {
      id: 'anthropic',
      name: 'Anthropic',
      label: 'Anthropic API Key',
      placeholder: 'sk-ant-...',
      value: anthropicKey,
      onChange: setAnthropicKey,
      onVerify: handleVerifyAnthropic,
      isVerifying: anthropicVerifying,
      verificationStatus: anthropicStatus,
    },
    {
      id: 'google',
      name: 'Google',
      label: 'Google API Key',
      placeholder: 'AIza...',
      value: googleKey,
      onChange: setGoogleKey,
      onVerify: handleVerifyGoogle,
      isVerifying: googleVerifying,
      verificationStatus: googleStatus,
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      label: 'OpenRouter API Key',
      placeholder: 'sk-or-...',
      value: openrouterKey,
      onChange: setOpenrouterKey,
      onVerify: handleVerifyOpenRouter,
      isVerifying: openrouterVerifying,
      verificationStatus: openrouterStatus,
    },
  ];

  return (
    <div className="space-y-4">
      {providerConfigs.map((config) => {
        const providerData = providers.find((p) => p.id === config.id);
        // Count enabled models from the provider data
        const enabledCount =
          providerData?.models.filter((m) => m.enabled).length || 0;
        const totalModels = providerData?.models.length || 0;
        const hasModelsLoaded = Boolean(providerData && totalModels > 0);

        return (
          <ProviderRow
            key={config.id}
            providerId={config.id}
            providerName={config.name}
            label={config.label}
            placeholder={config.placeholder}
            value={config.value}
            onChange={config.onChange}
            onVerify={config.onVerify}
            isVerifying={config.isVerifying}
            verificationStatus={config.verificationStatus}
            enabledCount={enabledCount}
            totalModels={totalModels}
            hasModelsLoaded={hasModelsLoaded}
            isLoading={isLoading || false}
            onOpenModels={() => handleOpenModels(config.id, config.name)}
          />
        );
      })}

      {error && (
        <div className="py-4 text-center text-red-500 text-sm">
          Error loading models. Please check your API keys and try again.
        </div>
      )}
    </div>
  );
}
