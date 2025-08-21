'use client';

import { ArrowLeft, Desktop, Info } from '@phosphor-icons/react';
import { useTransitionRouter } from 'next-view-transitions';

import { Button } from '@repo/design/components/ui/button';
import { useToast } from '@repo/design/components/ui/use-toast';

export default function CreateWorkspacePage() {
  const router = useTransitionRouter();
  const { toast } = useToast();

  return (
    <div className="h-full w-full overflow-auto bg-background">
      <div className="max-w-3xl p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/code/settings/workspaces')}
            className="-ml-2 mb-4 rounded-none text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" weight="duotone" />
            back to workspaces
          </Button>

          <h2 className="mb-2 font-semibold text-foreground text-xl">
            create workspace
          </h2>
          <p className="text-muted-foreground text-sm">
            connect a local folder through the arbor daemon
          </p>
        </div>

        {/* Daemon Setup Instructions */}
        <section className="space-y-6">
          <div className="mb-4 flex items-center gap-2">
            <Desktop weight="duotone" className="h-5 w-5" />
            <h3 className="font-medium text-base text-foreground">
              daemon setup
            </h3>
          </div>

          <div className="space-y-4 border-border/20 border-l-2 pl-6">
            <div className="rounded-none border border-border/20 bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <Info
                  weight="duotone"
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-muted-foreground"
                />
                <div className="space-y-2 text-muted-foreground text-xs">
                  <p className="font-medium text-foreground">
                    how to connect a workspace:
                  </p>
                  <ol className="list-inside list-decimal space-y-1">
                    <li>make sure arbor daemon is running on your machine</li>
                    <li>
                      go to settings → daemon tokens and generate a new token
                    </li>
                    <li>in the daemon app, enter your auth token</li>
                    <li>select a local folder to connect</li>
                    <li>click connect in the daemon</li>
                  </ol>
                  <p className="mt-2">
                    the workspace will be created automatically when you connect
                    a folder through the daemon.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                don't have the daemon yet?{' '}
                <a
                  href="/downloads/daemon"
                  className="underline hover:text-foreground"
                >
                  download arbor daemon
                </a>
              </p>

              <p className="text-muted-foreground text-sm">
                need a token?{' '}
                <button
                  onClick={() => router.push('/settings/tokens')}
                  className="underline hover:text-foreground"
                >
                  generate a daemon token
                </button>
              </p>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-12 flex items-center justify-between border-border/20 border-t pt-8">
          <Button
            variant="outline"
            onClick={() => router.push('/code/settings/workspaces')}
            className="rounded-none"
          >
            back to workspaces
          </Button>

          <Button
            onClick={() => router.push('/settings/tokens')}
            className="rounded-none"
          >
            go to daemon tokens
          </Button>
        </div>
      </div>
    </div>
  );
}
