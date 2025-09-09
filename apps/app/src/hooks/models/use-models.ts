"use client";

import { useEffect, useMemo, useState } from "react";
import { useAISettings } from "@/hooks/settings/use-ai-settings";
import { useAction } from "convex/react";
import { api } from "@repo/backend/convex/_generated/api";

export interface AIModel {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google' | 'openrouter';
  description?: string;
  context_length?: number;
  enabled?: boolean;
  pricing?: {
    input?: number;
    output?: number;
    prompt?: number;
    completion?: number;
  };
}

interface Provider {
  id: 'openai' | 'anthropic' | 'google' | 'openrouter';
  name: string;
  models: AIModel[];
}

export function useModels() {
  const { settings } = useAISettings();
  const enabled = (settings?.enabledModels || {}) as Record<string, string[]>;
  const listOpenRouter = useAction(api.functions.models.listOpenRouter);
  const listOpenAI = useAction(api.functions.models.listOpenAI);
  const listAnthropic = useAction(api.functions.models.listAnthropic);
  const listGoogle = useAction(api.functions.models.listGoogle);

  const [loading, setLoading] = useState<boolean>(true);
  const [orModels, setOrModels] = useState<AIModel[]>([]);
  const [oaModels, setOaModels] = useState<AIModel[]>([]);
  const [anModels, setAnModels] = useState<AIModel[]>([]);
  const [goModels, setGoModels] = useState<AIModel[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const [orRes, oaRes, anRes, goRes] = await Promise.allSettled([
        listOpenRouter({}),
        listOpenAI({}).catch(() => null),
        listAnthropic({}).catch(() => null),
        listGoogle({}).catch(() => null),
      ]);
      const raw = (orRes.status === 'fulfilled' && (orRes.value as any)?.models) || [];
      const mapped: AIModel[] = (raw as any[]).map((m: any) => ({
        id: m.id,
        name: m.name || m.id,
        provider: "openrouter",
        description: m.description,
        context_length: m.context_length,
        pricing: {
          prompt: m?.pricing?.prompt,
          completion: m?.pricing?.completion,
        },
      }));
      setOrModels(mapped);

      // OpenAI provider-native
      if (oaRes.status === 'fulfilled' && (oaRes.value as any)?.models) {
        const arr = (oaRes.value as any).models as any[];
        setOaModels(
          arr.map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'openai',
          }))
        );
      } else setOaModels([]);

      // Anthropic provider-native
      if (anRes.status === 'fulfilled' && (anRes.value as any)?.models) {
        const arr = (anRes.value as any).models as any[];
        setAnModels(
          arr.map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'anthropic',
          }))
        );
      } else setAnModels([]);

      // Google provider-native
      if (goRes.status === 'fulfilled' && (goRes.value as any)?.models) {
        const arr = (goRes.value as any).models as any[];
        setGoModels(
          arr.map((m: any) => ({
            id: m.id,
            name: m.name || m.id,
            provider: 'google',
          }))
        );
      } else setGoModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const providers = useMemo<Provider[]>(() => {
    const enrichWithEnabled = (models: AIModel[], providerId: string) =>
      models.map((m) => ({
        ...m,
        enabled: enabled[providerId]?.includes(m.id) || false,
      }));

    return [
      { id: 'openai' as const, name: 'OpenAI', models: enrichWithEnabled(oaModels, 'openai') },
      { id: 'anthropic' as const, name: 'Anthropic', models: enrichWithEnabled(anModels, 'anthropic') },
      { id: 'google' as const, name: 'Google', models: enrichWithEnabled(goModels, 'google') },
      { id: 'openrouter' as const, name: 'OpenRouter', models: enrichWithEnabled(orModels, 'openrouter') },
    ];
  }, [oaModels, anModels, goModels, orModels, enabled]);

  const allModels = useMemo(() => {
    return providers.flatMap((p) => p.models);
  }, [providers]);

  const enabledModels = useMemo(() => {
    return allModels.filter((m) => m.enabled);
  }, [allModels]);

  return {
    providers,
    allModels,
    enabledModels,
    isLoading: loading,
    refreshModels: load,
  };
}