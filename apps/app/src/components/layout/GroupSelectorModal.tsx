'use client';

import { LinearModal } from './LinearModal';
import { cn } from '@repo/design/lib/utils';
import { Check } from 'iconoir-react';

interface GroupSelectorModalProps {
  open: boolean;
  onClose: () => void;
  currentGroup: any;
  groups: any[];
  onSelectGroup: (group: any) => void;
}

export function GroupSelectorModal({ 
  open, 
  onClose, 
  currentGroup, 
  groups, 
  onSelectGroup 
}: GroupSelectorModalProps) {
  const handleSelect = (group: any) => {
    onSelectGroup(group);
    onClose();
  };

  return (
    <LinearModal open={open} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-sm font-medium text-foreground mb-4">select workspace</h2>
        
        <div className="space-y-1">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => handleSelect(group)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-none duration-0",
                currentGroup.id === group.id
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-3">
                <group.icon className="h-3.5 w-3.5" />
                <span>{group.name}</span>
              </div>
              {currentGroup.id === group.id && (
                <Check className="h-3.5 w-3.5" />
              )}
            </button>
          ))}
        </div>
      </div>
    </LinearModal>
  );
}