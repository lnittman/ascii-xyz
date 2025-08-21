export class LLMProviderService {
  async verifyApiKey(provider: string, apiKey: string): Promise<boolean> {
    switch (provider.toLowerCase()) {
      case 'openai':
        return this.verifyOpenAI(apiKey);
      case 'anthropic':
        return this.verifyAnthropic(apiKey);
      case 'google':
        return this.verifyGoogle(apiKey);
      case 'openrouter':
        return this.verifyOpenRouter(apiKey);
      default:
        return false;
    }
  }

  private async verifyOpenAI(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async verifyAnthropic(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  private async verifyGoogle(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      return res.ok;
    } catch {
      return false;
    }
  }

  private async verifyOpenRouter(apiKey: string): Promise<boolean> {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/auth/key', {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL || 'https://localhost:3000',
          'X-Title': 'Arbor Models',
        },
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const llmProviderService = new LLMProviderService();
