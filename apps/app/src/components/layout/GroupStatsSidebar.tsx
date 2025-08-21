'use client';

import { Xmark } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';

interface GroupStatsSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function GroupStatsSidebar({ open, onClose }: GroupStatsSidebarProps) {
  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full w-80 bg-background border-l border-border transform transition-transform duration-200',
        open ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">group stats</h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors duration-out-150 hover:duration-0"
          >
            <Xmark className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="p-4 space-y-6">
        <div>
          <h3 className="text-xs text-muted-foreground mb-3">activity overview</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">commits today</span>
              <span className="text-sm font-medium">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">pull requests</span>
              <span className="text-sm font-medium">3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">reviews</span>
              <span className="text-sm font-medium">7</span>
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xs text-muted-foreground mb-3">productivity trends</h3>
          <div className="space-y-2">
            <div className="h-32 bg-accent/20 rounded-md flex items-center justify-center text-xs text-muted-foreground">
              chart placeholder
            </div>
          </div>
        </div>
        
        <div>
          <h3 className="text-xs text-muted-foreground mb-3">top repositories</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors duration-out-150 hover:duration-0">
              <span className="text-sm">logs-xyz</span>
              <span className="text-xs text-muted-foreground">24 commits</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-md hover:bg-accent/50 transition-colors duration-out-150 hover:duration-0">
              <span className="text-sm">arbor-xyz</span>
              <span className="text-xs text-muted-foreground">18 commits</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}