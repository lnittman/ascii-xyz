'use client';

import {
  Download,
  File,
  FileCode,
  FileDoc,
  FileText,
} from '@phosphor-icons/react';
import { useState } from 'react';

import { Button } from '@repo/design/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@repo/design/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface OutputExportMenuProps {
  outputId: string;
}

type ExportFormat = 'markdown' | 'html' | 'pdf' | 'raw';

const exportFormats: {
  value: ExportFormat;
  label: string;
  icon: React.ComponentType<{
    size?: number;
    weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
  }>;
}[] = [
  { value: 'markdown', label: 'markdown', icon: FileText },
  { value: 'html', label: 'html', icon: FileCode },
  { value: 'pdf', label: 'pdf (coming soon)', icon: File },
  { value: 'raw', label: 'raw file', icon: FileDoc },
];

export function OutputExportMenu({ outputId }: OutputExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    if (format === 'pdf') {
      toast.info('pdf export is coming soon');
      return;
    }

    setIsExporting(true);

    try {
      const response = await fetch(
        `/api/outputs/${outputId}/export?format=${format}`
      );

      if (!response.ok) {
        throw new Error('export failed');
      }

      // Get filename from content-disposition header
      const contentDisposition = response.headers.get('content-disposition');
      const filename =
        contentDisposition?.split('filename=')[1]?.replace(/"/g, '') ||
        `output.${format}`;

      // Download the file
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success(`downloaded ${filename}`);
    } catch (_error) {
      toast.error('failed to export output. please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" disabled={isExporting}>
          <span className="mr-2">
            <Download size={16} weight="duotone" />
          </span>
          export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {exportFormats.map((format) => (
          <DropdownMenuItem
            key={format.value}
            onClick={() => handleExport(format.value)}
            disabled={format.value === 'pdf'}
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
