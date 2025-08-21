'use client';

import { LinearModal } from './LinearModal';
import { Check, Settings } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';

interface ViewOptionsModalProps {
  open: boolean;
  onClose: () => void;
}

const viewOptions = [
  { id: 'today', label: 'today', active: true },
  { id: 'week', label: 'week', active: true },
  { id: 'month', label: 'month', active: true },
  { id: 'quarter', label: 'quarter', active: false },
  { id: 'year', label: 'year', active: false },
  { id: 'all', label: 'all time', active: false },
];

export function ViewOptionsModal({ open, onClose }: ViewOptionsModalProps) {
  return (
    <LinearModal open={open} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-sm font-medium text-foreground mb-4">view options</h2>
        
        <div className="space-y-1">
          {viewOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => {
                // Toggle option
                onClose();
              }}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-none duration-0",
                option.active
                  ? "bg-accent"
                  : "hover:bg-accent/50"
              )}
            >
              <span className="text-foreground">{option.label}</span>
              {option.active && (
                <Check className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-border">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-accent/50 transition-none duration-0"
          >
            <Settings className="h-4 w-4" />
            <span className="text-foreground">customize views</span>
          </button>
        </div>
      </div>
    </LinearModal>
  );
}