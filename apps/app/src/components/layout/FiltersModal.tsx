'use client';

import { LinearModal } from './LinearModal';
import { cn } from '@repo/design/lib/utils';

interface FiltersModalProps {
  open: boolean;
  onClose: () => void;
}

export function FiltersModal({ open, onClose }: FiltersModalProps) {
  return (
    <LinearModal open={open} onClose={onClose}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-medium text-foreground">filters</h2>
          <button
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground transition-none duration-0"
          >
            clear all
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">repositories</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" defaultChecked />
                <span>arbor-xyz</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" defaultChecked />
                <span>logs-xyz</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" />
                <span>webs-xyz</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">activity type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" defaultChecked />
                <span>commits</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" defaultChecked />
                <span>pull requests</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" />
                <span>issues</span>
              </label>
            </div>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">date range</label>
            <select className="w-full px-3 py-1.5 text-sm text-foreground bg-background border border-border rounded-md">
              <option>last 7 days</option>
              <option>last 30 days</option>
              <option>last 3 months</option>
              <option>all time</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm text-foreground rounded-md hover:bg-accent/50 transition-none duration-0"
          >
            cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-none duration-0"
          >
            apply
          </button>
        </div>
      </div>
    </LinearModal>
  );
}