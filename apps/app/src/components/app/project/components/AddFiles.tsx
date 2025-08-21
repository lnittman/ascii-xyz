import { useAtom } from 'jotai';

import { FileArrowUp } from '@phosphor-icons/react';

import { Button } from '@repo/design/components/ui/button';

import { currentProjectAtom } from '@/atoms/project';
import { useModals } from '@/hooks/use-modals';

export function AddFiles() {
  const [currentProject] = useAtom(currentProjectAtom);
  const { openProjectFilesModal } = useModals();

  const handleClick = () => {
    if (currentProject?.id) {
      openProjectFilesModal(currentProject.id);
    }
  };

  return (
    <div className="flex flex-col rounded-none border border-border/50 p-6 transition-colors hover:border-border hover:bg-accent/30">
      <div className="mb-2 flex items-center">
        <FileArrowUp
          weight="duotone"
          className="mr-2 h-5 w-5 text-muted-foreground"
        />

        <h3 className="font-medium text-base text-foreground">add files</h3>
      </div>

      <p className="mb-4 text-muted-foreground text-sm">
        upload files to provide context for your project chats.
      </p>

      <Button
        className="w-full rounded-none"
        variant="mono"
        onClick={handleClick}
      >
        upload files
      </Button>
    </div>
  );
}
