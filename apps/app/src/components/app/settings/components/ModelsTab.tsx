"use client";

import React, { useEffect, useState } from 'react';
import { Eye, EyeSlash, CaretRight } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { Input } from '@repo/design/components/ui/input';
import { cn } from '@repo/design/lib/utils';

import { useModels } from '@/hooks/models/use-models';
import { useAISettings } from '@/hooks/settings/use-ai-settings';
import { useUpdateSettings } from '@/hooks/settings/mutations';
import { useModals } from '@/hooks/use-modals';

type VerifyStatus = 'idle' | 'success' | 'error';

interface ProviderRowProps {
  providerId: 'openai' | 'anthropic' | 'google' | 'openrouter';
  providerName: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onVerify: () => Promise<void> | void;
  isVerifying: boolean;
  verificationStatus: VerifyStatus;
  enabledCount: number;
  totalModels: number;
  hasModelsLoaded: boolean;
  isLoading: boolean;
  onOpenModels: () => void;
}

function ProviderRow({
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

  const getStatusColor = () => {
    if (isVerifying) return 'bg-muted-foreground';
    switch (verificationStatus) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500/70';
      default:
        return 'bg-red-500/70';
    }
  };

  const canOpenModels = verificationStatus === 'success' && hasModelsLoaded;

  return (
    <div className="space-y-3 p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full transition-all duration-300', getStatusColor())} />
          <label className="text-sm font-medium text-foreground">{providerName}</label>
        </div>
        <div className="flex items-center gap-3">
          <div className="min-w-[90px] h-7 flex items-center justify-end">
            <Button
              onClick={onOpenModels}
              disabled={!canOpenModels}
              variant="ghost"
              size="sm"
              className={cn(
                'rounded-md text-xs h-7 px-1 flex items-center gap-1 transition-all duration-300',
                verificationStatus === 'success' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none',
                verificationStatus === 'success' && !canOpenModels && 'opacity-50 cursor-not-allowed',
                verificationStatus === 'success' && canOpenModels && 'hover:bg-accent/20 cursor-pointer'
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
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="rounded-md"
          />
        </div>

        <Button
          type="button"
          onClick={() => setShowKey(!showKey)}
          variant="outline"
          size="sm"
          className="rounded-md h-9 w-9 p-0 flex items-center justify-center"
        >
          <div className="relative w-4 h-4">
            <EyeSlash weight="duotone" className={cn('h-4 w-4 absolute top-0 left-0 transition-opacity duration-200', showKey ? 'opacity-100' : 'opacity-0')} />
            <Eye weight="duotone" className={cn('h-4 w-4 absolute top-0 left-0 transition-opacity duration-200', showKey ? 'opacity-0' : 'opacity-100')} />
          </div>
        </Button>

        <Button onClick={() => void onVerify()} disabled={!value.trim() || isVerifying} variant="outline" size="sm" className="rounded-md min-w-[80px] h-9">
          {isVerifying ? 'verifying…' : 'verify'}
        </Button>
      </div>
    </div>
  );
}

export function ModelsTab() {
  const { providers, isLoading } = useModels();
  const { settings } = useAISettings();
  const update = useUpdateSettings();
  const { openProviderModelsModal } = useModals();

  // API key states (hydrate from settings)
  const [openaiKey, setOpenaiKey] = useState(settings?.openaiApiKey || '');
  const [anthropicKey, setAnthropicKey] = useState(settings?.anthropicApiKey || '');
  const [googleKey, setGoogleKey] = useState(settings?.googleApiKey || '');
  const [openrouterKey, setOpenrouterKey] = useState(settings?.openrouterApiKey || '');

  // Verification states (persisted for UX only)
  const [openaiVerifying, setOpenaiVerifying] = useState(false);
  const [anthropicVerifying, setAnthropicVerifying] = useState(false);
  const [googleVerifying, setGoogleVerifying] = useState(false);
  const [openrouterVerifying, setOpenrouterVerifying] = useState(false);

  const [openaiStatus, setOpenaiStatus] = useState<VerifyStatus>('idle');
  const [anthropicStatus, setAnthropicStatus] = useState<VerifyStatus>('idle');
  const [googleStatus, setGoogleStatus] = useState<VerifyStatus>('idle');
  const [openrouterStatus, setOpenrouterStatus] = useState<VerifyStatus>('idle');

  // Load verification status from localStorage
  useEffect(() => {
    const load = (p: string) => (localStorage.getItem(`api-key-status-${p}`) === 'success' ? 'success' : 'idle') as VerifyStatus;
    setOpenaiStatus(load('openai'));
    setAnthropicStatus(load('anthropic'));
    setGoogleStatus(load('google'));
    setOpenrouterStatus(load('openrouter'));
  }, []);

  // Reflect settings into local inputs and statuses
  useEffect(() => {
    if (!settings) return;
    setOpenaiKey(settings.openaiApiKey || '');
    setAnthropicKey(settings.anthropicApiKey || '');
    setGoogleKey(settings.googleApiKey || '');
    setOpenrouterKey(settings.openrouterApiKey || '');

    if (settings.openaiApiKey) setOpenaiStatus('success');
    if (settings.anthropicApiKey) setAnthropicStatus('success');
    if (settings.googleApiKey) setGoogleStatus('success');
    if (settings.openrouterApiKey) setOpenrouterStatus('success');
  }, [settings?.openaiApiKey, settings?.anthropicApiKey, settings?.googleApiKey, settings?.openrouterApiKey]);

  // Save helpers
  const updateApiKey = async (provider: string, apiKey: string) => {
    await update({ [`${provider}ApiKey`]: apiKey } as any);
  };

  // "Verify" helpers (UI/UX parity); treat non-empty as success and persist
  const makeVerify = (
    provider: 'openai' | 'anthropic' | 'google' | 'openrouter',
    key: string,
    setVerifying: (v: boolean) => void,
    setStatus: (s: VerifyStatus) => void
  ) => async () => {
    setVerifying(true);
    setStatus('idle');
    try {
      const isValid = key.trim().length > 0; // placeholder verification
      setStatus(isValid ? 'success' : 'error');
      if (isValid) {
        await updateApiKey(provider, key);
        localStorage.setItem(`api-key-status-${provider}`, 'success');
      } else {
        localStorage.removeItem(`api-key-status-${provider}`);
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenModels = (providerId: 'openai' | 'anthropic' | 'google' | 'openrouter', providerName: string) => {
    openProviderModelsModal(providerId, providerName);
  };

  const providerConfigs = [
    {
      id: 'openai' as const,
      name: 'OpenAI',
      label: 'OpenAI API Key',
      placeholder: 'sk-...',
      value: openaiKey,
      onChange: setOpenaiKey,
      onVerify: makeVerify('openai', openaiKey, setOpenaiVerifying, setOpenaiStatus),
      isVerifying: openaiVerifying,
      verificationStatus: openaiStatus,
    },
    {
      id: 'anthropic' as const,
      name: 'Anthropic',
      label: 'Anthropic API Key',
      placeholder: 'sk-ant-...',
      value: anthropicKey,
      onChange: setAnthropicKey,
      onVerify: makeVerify('anthropic', anthropicKey, setAnthropicVerifying, setAnthropicStatus),
      isVerifying: anthropicVerifying,
      verificationStatus: anthropicStatus,
    },
    {
      id: 'google' as const,
      name: 'Google',
      label: 'Google API Key',
      placeholder: 'AIza...',
      value: googleKey,
      onChange: setGoogleKey,
      onVerify: makeVerify('google', googleKey, setGoogleVerifying, setGoogleStatus),
      isVerifying: googleVerifying,
      verificationStatus: googleStatus,
    },
    {
      id: 'openrouter' as const,
      name: 'OpenRouter',
      label: 'OpenRouter API Key',
      placeholder: 'sk-or-...',
      value: openrouterKey,
      onChange: setOpenrouterKey,
      onVerify: makeVerify('openrouter', openrouterKey, setOpenrouterVerifying, setOpenrouterStatus),
      isVerifying: openrouterVerifying,
      verificationStatus: openrouterStatus,
    },
  ];

  return (
    <div className="space-y-4">
      {providerConfigs.map((config) => {
        const providerData = providers.find((p) => p.id === config.id);
        const enabledForProvider = (settings?.enabledModels?.[config.id] as string[] | undefined) || [];
        const enabledCount = enabledForProvider.length;
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
            isLoading={isLoading}
            onOpenModels={() => handleOpenModels(config.id, config.name)}
          />
        );
      })}
    </div>
  );
}