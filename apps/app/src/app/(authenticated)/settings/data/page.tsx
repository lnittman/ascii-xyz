'use client';

import { useState } from 'react';
import { Button } from '@repo/design/components/ui/button';
import { Switch } from '@repo/design/components/ui/switch';
import { Label } from '@repo/design/components/ui/label';
import { 
  Database,
  Download,
  Upload,
  Trash,
  HardDrives,
  Warning,
  Archive,
  CloudArrowDown,
  CloudArrowUp,
  FileText
} from '@phosphor-icons/react';
import { cn } from '@repo/design/lib/utils';
import { motion } from 'framer-motion';

interface StorageStats {
  totalArtworks: number;
  totalFrames: number;
  storageUsed: string;
  lastBackup: string;
}

export default function DataSettingsPage() {
  const [autoSave, setAutoSave] = useState(true);
  const [autoBackup, setAutoBackup] = useState(false);
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Mock data - would come from API
  const stats: StorageStats = {
    totalArtworks: 42,
    totalFrames: 1337,
    storageUsed: '12.3 MB',
    lastBackup: '2 DAYS AGO',
  };

  const handleExportData = async () => {
    setIsExporting(true);
    // Simulate export
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsExporting(false);
    // Trigger download
    console.log('Exporting data...');
  };

  const handleImportData = async () => {
    setIsImporting(true);
    // Simulate import
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsImporting(false);
    console.log('Importing data...');
  };

  const handleClearCache = () => {
    if (confirm('ARE YOU SURE YOU WANT TO CLEAR THE CACHE? THIS ACTION CANNOT BE UNDONE.')) {
      console.log('Clearing cache...');
    }
  };

  const handleDeleteAllData = () => {
    if (confirm('ARE YOU SURE YOU WANT TO DELETE ALL YOUR DATA? THIS ACTION IS PERMANENT AND CANNOT BE UNDONE.')) {
      console.log('Deleting all data...');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-mono text-lg font-semibold uppercase tracking-wider">
          DATA & STORAGE
        </h2>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          MANAGE YOUR ASCII ARTWORKS AND STORAGE PREFERENCES
        </p>
      </div>

      {/* Storage Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'TOTAL ARTWORKS', value: stats.totalArtworks, icon: FileText },
          { label: 'TOTAL FRAMES', value: stats.totalFrames, icon: Archive },
          { label: 'STORAGE USED', value: stats.storageUsed, icon: HardDrives },
          { label: 'LAST BACKUP', value: stats.lastBackup, icon: CloudArrowUp },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-md border border-border/50 p-4"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Storage Settings */}
      <div className="space-y-4">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          STORAGE PREFERENCES
        </h3>
        
        <div className="space-y-3">
          {/* Auto-save */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="auto-save"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  AUTO-SAVE GENERATIONS
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  AUTOMATICALLY SAVE ALL GENERATED ASCII ART
                </p>
              </div>
            </div>
            <Switch
              id="auto-save"
              checked={autoSave}
              onCheckedChange={setAutoSave}
            />
          </div>

          {/* Auto-backup */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <CloudArrowUp className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="auto-backup"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  AUTOMATIC BACKUPS
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  DAILY BACKUP TO CLOUD STORAGE
                </p>
              </div>
            </div>
            <Switch
              id="auto-backup"
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
            />
          </div>

          {/* Compression */}
          <div className="flex items-center justify-between rounded-md border border-border/50 p-4">
            <div className="flex items-center gap-3">
              <Archive className="h-4 w-4 text-muted-foreground" />
              <div>
                <Label
                  htmlFor="compression"
                  className="font-mono text-xs uppercase tracking-wider"
                >
                  FRAME COMPRESSION
                </Label>
                <p className="font-mono text-[10px] text-muted-foreground">
                  COMPRESS ASCII FRAMES TO SAVE SPACE
                </p>
              </div>
            </div>
            <Switch
              id="compression"
              checked={compressionEnabled}
              onCheckedChange={setCompressionEnabled}
            />
          </div>
        </div>
      </div>

      {/* Import/Export */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <h3 className="font-mono text-sm font-semibold uppercase tracking-wider">
          IMPORT & EXPORT
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Button
            variant="outline"
            onClick={handleExportData}
            disabled={isExporting}
            className="justify-start font-mono text-xs uppercase tracking-wider"
          >
            {isExporting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2"
              >
                <Download className="h-4 w-4" />
              </motion.div>
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            {isExporting ? 'EXPORTING...' : 'EXPORT ALL DATA'}
          </Button>

          <Button
            variant="outline"
            onClick={handleImportData}
            disabled={isImporting}
            className="justify-start font-mono text-xs uppercase tracking-wider"
          >
            {isImporting ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="mr-2"
              >
                <Upload className="h-4 w-4" />
              </motion.div>
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            {isImporting ? 'IMPORTING...' : 'IMPORT DATA'}
          </Button>
        </div>

        <p className="font-mono text-[10px] text-muted-foreground">
          EXPORT YOUR DATA AS JSON FILES OR IMPORT FROM PREVIOUS BACKUPS
        </p>
      </div>

      {/* Danger Zone */}
      <div className="space-y-4 border-t border-border/50 pt-8">
        <div className="flex items-center gap-2">
          <Warning className="h-4 w-4 text-red-500" />
          <h3 className="font-mono text-sm font-semibold uppercase tracking-wider text-red-500">
            DANGER ZONE
          </h3>
        </div>
        
        <div className="space-y-3">
          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-wider">
                  CLEAR CACHE
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  REMOVE TEMPORARY FILES AND CACHED DATA
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearCache}
                className="border-red-500/50 font-mono text-xs uppercase tracking-wider text-red-500 hover:bg-red-500/10"
              >
                CLEAR
              </Button>
            </div>
          </div>

          <div className="rounded-md border border-red-500/20 bg-red-500/5 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-mono text-xs font-medium uppercase tracking-wider">
                  DELETE ALL DATA
                </p>
                <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                  PERMANENTLY DELETE ALL YOUR ASCII ARTWORKS
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDeleteAllData}
                className="border-red-500/50 font-mono text-xs uppercase tracking-wider text-red-500 hover:bg-red-500/10"
              >
                <Trash className="mr-2 h-3 w-3" />
                DELETE
              </Button>
            </div>
          </div>
        </div>

        <p className="flex items-start gap-2 font-mono text-[10px] text-red-500/70">
          <Warning className="mt-0.5 h-3 w-3" />
          <span>
            THESE ACTIONS ARE PERMANENT AND CANNOT BE UNDONE. 
            MAKE SURE TO EXPORT YOUR DATA BEFORE PROCEEDING.
          </span>
        </p>
      </div>
    </div>
  );
}