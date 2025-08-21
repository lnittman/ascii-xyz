'use client';

import { LinearModal } from './LinearModal';
import { cn } from '@repo/design/lib/utils';

interface NewViewModalProps {
  open: boolean;
  onClose: () => void;
}

export function NewViewModal({ open, onClose }: NewViewModalProps) {
  return (
    <LinearModal open={open} onClose={onClose}>
      <div className="p-4">
        <h2 className="text-sm font-medium text-foreground mb-4">create new view</h2>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">name</label>
            <input
              type="text"
              className="w-full px-3 py-1.5 text-sm text-foreground bg-background border border-border rounded-md focus:outline-none focus:border-primary"
              placeholder="e.g. last 90 days"
            />
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">time range</label>
            <select className="w-full px-3 py-1.5 text-sm text-foreground bg-background border border-border rounded-md">
              <option>last 7 days</option>
              <option>last 30 days</option>
              <option>last 90 days</option>
              <option>last 6 months</option>
              <option>last year</option>
              <option>all time</option>
              <option>custom range</option>
            </select>
          </div>
          
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">filters</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" />
                <span>only commits</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" />
                <span>only pull requests</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" className="rounded border-border" />
                <span>specific repositories</span>
              </label>
            </div>
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
            create view
          </button>
        </div>
      </div>
    </LinearModal>
  );
}