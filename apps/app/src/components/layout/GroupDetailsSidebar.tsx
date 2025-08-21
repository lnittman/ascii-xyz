'use client';

import { Xmark, List, AppleShortcuts, Dashboard } from 'iconoir-react';
import { cn } from '@repo/design/lib/utils';

interface GroupDetailsSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function GroupDetailsSidebar({ open, onClose }: GroupDetailsSidebarProps) {
  return (
    <div
      className={cn(
        'absolute top-0 right-0 h-full w-64 bg-background border-l border-border transform transition-transform duration-200',
        open ? 'translate-x-0' : 'translate-x-full'
      )}
    >
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">group details</h2>
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
          <h3 className="text-xs text-muted-foreground mb-3">layout</h3>
          <div className="grid grid-cols-3 gap-1">
            <button className="p-2 rounded-md bg-accent/50 border border-border flex items-center justify-center">
              <List className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-md hover:bg-accent/50 border border-transparent hover:border-border transition-all duration-out-150 hover:duration-0 flex items-center justify-center">
              <AppleShortcuts className="h-4 w-4" />
            </button>
            <button className="p-2 rounded-md hover:bg-accent/50 border border-transparent hover:border-border transition-all duration-out-150 hover:duration-0 flex items-center justify-center">
              <Dashboard className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="text-xs text-muted-foreground mb-3">filters</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors duration-out-150 hover:duration-0">
              <input type="checkbox" className="rounded border-border" defaultChecked />
              <span className="text-sm text-foreground">show commits</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors duration-out-150 hover:duration-0">
              <input type="checkbox" className="rounded border-border" defaultChecked />
              <span className="text-sm text-foreground">show pull requests</span>
            </label>
            <label className="flex items-center gap-2 p-2 rounded-md hover:bg-accent/50 transition-colors duration-out-150 hover:duration-0">
              <input type="checkbox" className="rounded border-border" defaultChecked />
              <span className="text-sm text-foreground">show reviews</span>
            </label>
          </div>
        </div>
        
        <div>
          <h3 className="text-xs text-muted-foreground mb-3">time range</h3>
          <select className="w-full p-2 rounded-md border border-border bg-background text-sm text-foreground">
            <option>last 7 days</option>
            <option>last 30 days</option>
            <option>last 3 months</option>
            <option>all time</option>
          </select>
        </div>
        
        <div>
          <h3 className="text-xs text-muted-foreground mb-3">grouping</h3>
          <select className="w-full p-2 rounded-md border border-border bg-background text-sm text-foreground">
            <option>by day</option>
            <option>by week</option>
            <option>by repository</option>
            <option>by type</option>
          </select>
        </div>
      </div>
    </div>
  );
}