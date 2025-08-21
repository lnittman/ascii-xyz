import { useAtom } from 'jotai';

import { ChatCircleText } from '@phosphor-icons/react';

import { Button } from '@repo/design/components/ui/button';

import { currentProjectAtom } from '@/atoms/project';
import { useModals } from '@/hooks/use-modals';

export function AddInstructions() {
  const [currentProject] = useAtom(currentProjectAtom);
  const { openProjectInstructionsModal } = useModals();

  const handleClick = () => {
    if (currentProject?.id) {
      openProjectInstructionsModal(currentProject.id);
    }
  };

  return (
    <div className="flex flex-col rounded-none border border-border/50 p-6 transition-colors hover:border-border hover:bg-accent/30">
      <div className="mb-2 flex items-center">
        <ChatCircleText
          weight="duotone"
          className="mr-2 h-5 w-5 text-muted-foreground"
        />

        <h3 className="font-medium text-base text-foreground">
          add instructions
        </h3>
      </div>

      <p className="mb-4 text-muted-foreground text-sm">
        customize how the assistant responds in this project.
      </p>

      <Button
        className="w-full rounded-none"
        variant="mono"
        onClick={handleClick}
      >
        set instructions
      </Button>
    </div>
  );
}
