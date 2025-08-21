'use client';

import { CircleNotch, GithubLogo } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/design/components/ui/dialog';
import { Input } from '@repo/design/components/ui/input';
import { Label } from '@repo/design/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/design/components/ui/select';
import { useToast } from '@repo/design/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  url: string;
  private: boolean;
}

interface GithubConnectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GithubConnectModal({
  open,
  onOpenChange,
}: GithubConnectModalProps) {
  const [installationId, setInstallationId] = useState<string>('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  // check for installation id in url params
  useEffect(() => {
    if (open) {
      const params = new URLSearchParams(window.location.search);
      const githubInstallation = params.get('github_installation');
      if (githubInstallation) {
        setInstallationId(githubInstallation);
        // clean up url
        params.delete('github_installation');
        const newUrl = params.toString()
          ? `${window.location.pathname}?${params}`
          : window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [open]);

  // fetch repositories when installation id is provided
  useEffect(() => {
    if (installationId) {
      fetchRepositories();
    }
  }, [installationId]);

  const fetchRepositories = async () => {
    setLoadingRepos(true);
    try {
      const response = await fetch(
        `/api/github/installations/${installationId}/repositories`
      );
      const data = await response.json();

      if (data.success) {
        setRepositories(data.data);
      } else {
        toast({
          title: 'error',
          description: 'failed to fetch repositories',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'error',
        description: 'failed to fetch repositories',
        variant: 'destructive',
      });
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleConnect = async () => {
    if (!selectedRepo) {
      return;
    }

    const [owner, repo] = selectedRepo.split('/');
    setLoading(true);

    try {
      const response = await fetch('/api/github/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          installationId,
          owner,
          repo,
          name: workspaceName || repo,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'success',
          description: 'github repository connected',
        });
        onOpenChange(false);
        router.refresh();
      } else {
        toast({
          title: 'error',
          description: data.message || 'failed to connect repository',
          variant: 'destructive',
        });
      }
    } catch (_error) {
      toast({
        title: 'error',
        description: 'failed to connect repository',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const openInstallPage = async () => {
    const response = await fetch('/api/github/installations');
    const data = await response.json();

    if (data.success && data.data.installUrl) {
      window.open(data.data.installUrl, '_blank');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GithubLogo weight="duotone" className="h-5 w-5" />
            connect github repository
          </DialogTitle>
          <DialogDescription>
            connect a github repository to create a new code workspace
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="installation">installation id</Label>
            <div className="flex gap-2">
              <Input
                id="installation"
                placeholder="enter github app installation id"
                value={installationId}
                onChange={(e) => setInstallationId(e.target.value)}
              />
              <Button variant="outline" size="sm" onClick={openInstallPage}>
                install app
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              install the github app first, then enter the installation id
            </p>
          </div>

          {repositories.length > 0 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="repository">repository</Label>
                <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                  <SelectTrigger>
                    <SelectValue placeholder="select a repository" />
                  </SelectTrigger>
                  <SelectContent>
                    {repositories.map((repo) => (
                      <SelectItem
                        key={repo.id}
                        value={`${repo.owner}/${repo.name}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs">
                            {repo.fullName}
                          </span>
                          {repo.private && (
                            <span className="text-muted-foreground text-xs">
                              (private)
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">workspace name (optional)</Label>
                <Input
                  id="name"
                  placeholder="leave empty to use repository name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                />
              </div>
            </>
          )}

          {loadingRepos && (
            <div className="flex items-center justify-center py-8">
              <CircleNotch
                weight="duotone"
                className="h-6 w-6 animate-spin text-muted-foreground"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            cancel
          </Button>
          <Button onClick={handleConnect} disabled={!selectedRepo || loading}>
            {loading && (
              <CircleNotch
                weight="duotone"
                className="mr-2 h-4 w-4 animate-spin"
              />
            )}
            connect repository
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
