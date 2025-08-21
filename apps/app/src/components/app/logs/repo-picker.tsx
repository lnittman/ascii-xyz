import { GitBranch } from '@phosphor-icons/react';
import { Button } from '@repo/design/components/ui/button';

interface RepoPickerProps {
  selectedRepo: string | null;
  onRepoSelect: (repo: string | null) => void;
}

export function RepoPicker({ selectedRepo, onRepoSelect }: RepoPickerProps) {
  const repos = ['arbor-xyz', 'logs-xyz', 'webs-xyz']; // Mock repos
  
  return (
    <div className="flex gap-2">
      <Button
        variant={selectedRepo === null ? 'default' : 'outline'}
        onClick={() => onRepoSelect(null)}
        className="rounded-none"
        size="sm"
      >
        All Repos
      </Button>
      {repos.map((repo) => (
        <Button
          key={repo}
          variant={selectedRepo === repo ? 'default' : 'outline'}
          onClick={() => onRepoSelect(repo)}
          className="rounded-none"
          size="sm"
        >
          <GitBranch className="mr-1 h-3 w-3" weight="duotone" />
          {repo}
        </Button>
      ))}
    </div>
  );
}