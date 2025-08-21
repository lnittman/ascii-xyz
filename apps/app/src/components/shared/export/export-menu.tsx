'use client';

import {
  Download,
  File,
  FileCode,
  FileDoc,
  FileText,
} from '@phosphor-icons/react';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@repo/design/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design/components/ui/dropdown-menu';
import { toast } from 'sonner';

export type ExportFormat = 'markdown' | 'html' | 'pdf' | 'raw' | string;

export interface ExportFormatConfig {
  value: ExportFormat;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }>;
  disabled?: boolean;
}

interface ExportMenuProps {
  onExport: (
    format: ExportFormat
  ) => Promise<{ blob: Blob; filename: string } | undefined>;
  formats?: ExportFormatConfig[];
  buttonLabel?: string;
  buttonSize?: 'sm' | 'default' | 'lg';
  buttonVariant?:
    | 'default'
    | 'outline'
    | 'ghost'
    | 'secondary'
    | 'destructive'
    | 'link';
  className?: string;
}

const defaultFormats: ExportFormatConfig[] = [
  { value: 'markdown', label: 'markdown', icon: FileText },
  { value: 'html', label: 'html', icon: FileCode },
  { value: 'pdf', label: 'pdf', icon: File, disabled: true },
  { value: 'raw', label: 'raw file', icon: FileDoc },
];

export function ExportMenu({
  onExport,
  formats = defaultFormats,
  buttonLabel = 'export',
  buttonSize = 'sm',
  buttonVariant = 'outline',
  className,
}: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    const formatConfig = formats.find((f) => f.value === format);

    if (formatConfig?.disabled) {
      toast.info(`${format} export is not available`);
      return;
    }

    setIsExporting(true);

    try {
      const result = await onExport(format);

      if (result?.blob && result.filename) {
        // Download the file
        const url = URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast.success(`downloaded ${result.filename}`);
      }
    } catch (_error) {
      toast.error('failed to export. please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size={buttonSize}
          variant={buttonVariant}
          disabled={isExporting}
          className={className}
        >
          <span className="mr-2">
            <Download size={16} weight="duotone" />
          </span>
          {buttonLabel}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem
            key={format.value}
            onClick={() => handleExport(format.value)}
            disabled={format.disabled}
          >
            <span className="mr-2">
              <format.icon size={16} weight="duotone" />
            </span>
            {format.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
