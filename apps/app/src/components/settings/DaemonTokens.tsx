'use client';

import { Copy, Eye, EyeSlash, Plus } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import { useState } from 'react';
import { toast } from 'sonner';

export function DaemonTokens() {
  const [token, setToken] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const generateToken = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/auth/daemon-token', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('failed to generate token');
      }

      const data = await response.json();
      setToken(data.data.token);
      setShowToken(true);
    } catch (_error) {
      toast.error('failed to generate token');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToken = () => {
    if (token) {
      navigator.clipboard.writeText(token);
      toast.success('token copied to clipboard');
    }
  };

  return (
    <div className="space-y-4">
      {token ? (
        <div className="space-y-4">
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">daemon auth token</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? (
                    <EyeSlash weight="duotone" size={16} />
                  ) : (
                    <Eye weight="duotone" size={16} />
                  )}
                </Button>
                <Button variant="ghost" size="sm" onClick={copyToken}>
                  <Copy weight="duotone" size={16} />
                </Button>
              </div>
            </div>

            <div className="rounded bg-muted p-3 font-mono text-sm">
              {showToken ? token : '•'.repeat(40)}
            </div>

            <p className="text-muted-foreground text-xs">
              this token expires in 1 hour. use it to connect your daemon to
              arbor.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950">
            <h3 className="mb-1 font-medium text-amber-800 text-sm dark:text-amber-200">
              important
            </h3>
            <p className="text-amber-700 text-sm dark:text-amber-300">
              keep this token secret. anyone with this token can connect to your
              workspaces.
            </p>
          </div>

          <div className="border-t pt-4">
            <Button
              onClick={() => {
                setToken(null);
                setShowToken(false);
              }}
              variant="outline"
              size="sm"
            >
              generate new token
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4 rounded-lg border p-6 text-center">
          <p className="text-muted-foreground text-sm">
            generate a token to connect your local arbor daemon
          </p>
          <Button onClick={generateToken} disabled={isGenerating}>
            <Plus weight="duotone" size={16} className="mr-2" />
            {isGenerating ? 'generating...' : 'generate token'}
          </Button>
        </div>
      )}
    </div>
  );
}
