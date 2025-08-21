'use client';

import { useState } from 'react';
import { LinearModal } from './LinearModal';
import { cn } from '@repo/design/lib/utils';
import { Search } from 'iconoir-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface GroupMenuModalProps {
  open: boolean;
  onClose: () => void;
  currentGroup: any;
  groups: any[];
  onSelectGroup: (group: any) => void;
}

export function GroupMenuModal({ 
  open, 
  onClose, 
  currentGroup, 
  groups, 
  onSelectGroup 
}: GroupMenuModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSelectGroup = (group: any) => {
    onSelectGroup(group);
    onClose();
  };

  const handleSettings = () => {
    router.push('/settings');
    onClose();
  };

  const handleLogout = () => {
    // TODO: Implement logout
    console.log('Logout');
    onClose();
  };

  const filteredGroups = groups.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <LinearModal open={open} onClose={onClose}>
      <div className="p-0">
        {/* Search Bar */}
        <div className="p-4 border-b border-border">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search..."
              className="w-full pl-9 pr-3 py-2 text-sm text-foreground bg-background border border-border rounded-md focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>
        </div>

        {/* Options List */}
        <div className="py-2">
          {/* Settings */}
          <button
            onClick={handleSettings}
            className="w-full px-4 py-2 text-sm text-foreground text-left hover:bg-accent/50 transition-none duration-0"
          >
            settings
          </button>

          {/* Switch Group */}
          {filteredGroups.length > 0 && (
            <>
              <div className="px-4 py-1">
                <div className="text-xs text-muted-foreground">switch group</div>
              </div>
              {filteredGroups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleSelectGroup(group)}
                  className={cn(
                    "w-full px-4 py-2 text-sm text-left transition-none duration-0",
                    currentGroup.id === group.id
                      ? "bg-accent text-foreground"
                      : "text-foreground hover:bg-accent/50"
                  )}
                >
                  {group.name}
                </button>
              ))}
            </>
          )}

          {/* Divider */}
          <div className="my-2 border-t border-border" />

          {/* Log Out */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-foreground text-left hover:bg-accent/50 transition-none duration-0"
          >
            log out
          </button>
        </div>
      </div>
    </LinearModal>
  );
}